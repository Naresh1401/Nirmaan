"""Premium membership & loyalty points API."""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.premium import (
    PremiumMembership,
    LoyaltyTransaction,
    MembershipTier,
    TIER_PRICING,
    TIER_BENEFITS,
    FEATURE_GROUPS,
)

router = APIRouter(prefix="/api/v1/premium", tags=["Premium"])

POINTS_PER_RUPEE = 1          # 1 point per ₹1 spent on orders
POINTS_TO_RUPEE = 100         # 100 points = ₹1 discount


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_or_create_membership(user_id: str, db: AsyncSession) -> PremiumMembership:
    result = await db.execute(
        select(PremiumMembership).where(PremiumMembership.user_id == user_id)
    )
    membership = result.scalar_one_or_none()
    if not membership:
        membership = PremiumMembership(user_id=user_id, tier=MembershipTier.FREE)
        db.add(membership)
        await db.commit()
        await db.refresh(membership)
    return membership


async def _get_user(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Schemas ──────────────────────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    tier: MembershipTier
    billing_cycle: str = "monthly"  # "monthly" or "annual"
    payment_reference: Optional[str] = None


class RedeemPointsRequest(BaseModel):
    points: int


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/tiers")
async def list_tiers():
    """Return all membership tiers with pricing, benefits, and feature groups."""
    tiers = []
    for tier in MembershipTier:
        benefits = TIER_BENEFITS[tier]
        pricing = TIER_PRICING[tier]
        tiers.append({
            "tier": tier.value,
            "label": benefits["label"],
            "tagline": benefits["tagline"],
            "pricing": pricing,
            "benefits": benefits,
        })

    return {
        "tiers": tiers,
        "feature_groups": {
            group: [{"key": key, "label": label} for key, label in features]
            for group, features in FEATURE_GROUPS.items()
        },
    }


@router.get("/status")
async def get_my_membership(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's membership status and loyalty points."""
    membership = await _get_or_create_membership(current_user["user_id"], db)

    # Reset daily AI query counter if needed
    now = datetime.now(timezone.utc)
    reset_date = membership.ai_queries_reset_date
    if reset_date.tzinfo is None:
        reset_date = reset_date.replace(tzinfo=timezone.utc)
    if (now - reset_date).days >= 1:
        membership.ai_queries_today = 0
        membership.ai_queries_reset_date = now
        await db.commit()
        await db.refresh(membership)

    # Check expiry
    is_active = membership.is_active
    if membership.expires_at:
        expires = membership.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < now:
            membership.tier = MembershipTier.FREE
            membership.is_active = False
            membership.expires_at = None
            await db.commit()
            await db.refresh(membership)
            is_active = False

    # Admins get full enterprise access
    is_admin = current_user.get("role") == "admin"
    effective_tier = MembershipTier.ENTERPRISE if is_admin else membership.tier

    benefits = TIER_BENEFITS[effective_tier]
    remaining_queries = (
        -1 if is_admin
        else benefits["ai_queries_per_day"] - membership.ai_queries_today
        if benefits["ai_queries_per_day"] != -1
        else -1  # unlimited
    )

    return {
        "tier": effective_tier.value,
        "label": benefits["label"],
        "is_active": True if is_admin else is_active,
        "loyalty_points": membership.loyalty_points,
        "total_earned": membership.total_points_earned,
        "total_redeemed": membership.total_points_redeemed,
        "points_value_inr": round(membership.loyalty_points / POINTS_TO_RUPEE, 2),
        "expires_at": membership.expires_at.isoformat() if membership.expires_at else None,
        "benefits": benefits,
        "remaining_ai_queries_today": remaining_queries,
        "pricing": TIER_PRICING[effective_tier],
    }


@router.get("/check-feature")
async def check_feature(
    feature: str = Query(..., description="Feature key to check access for"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if the current user's tier has access to a specific feature."""
    is_admin = current_user.get("role") == "admin"
    membership = await _get_or_create_membership(current_user["user_id"], db)
    effective_tier = MembershipTier.ENTERPRISE if is_admin else membership.tier
    benefits = TIER_BENEFITS[effective_tier]

    has_access = True if is_admin else benefits.get(feature, False)

    # Find minimum tier that unlocks this feature
    min_tier = None
    for tier in MembershipTier:
        if TIER_BENEFITS[tier].get(feature, False):
            min_tier = tier.value
            break

    return {
        "feature": feature,
        "has_access": bool(has_access),
        "current_tier": effective_tier.value,
        "minimum_tier": min_tier,
    }


@router.post("/subscribe")
async def subscribe(
    req: SubscribeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upgrade or change membership tier (payment assumed verified)."""
    if req.tier == MembershipTier.FREE:
        raise HTTPException(status_code=400, detail="Use /cancel to downgrade to Free")

    pricing = TIER_PRICING[req.tier]
    cycle = req.billing_cycle if req.billing_cycle in ("monthly", "annual") else "monthly"
    price = pricing[cycle]

    if price > 0 and not req.payment_reference:
        raise HTTPException(
            status_code=400,
            detail="payment_reference is required for paid tiers",
        )

    membership = await _get_or_create_membership(current_user["user_id"], db)

    now = datetime.now(timezone.utc)
    membership.tier = req.tier
    membership.is_active = True
    membership.started_at = now
    membership.expires_at = now + (timedelta(days=365) if cycle == "annual" else timedelta(days=30))

    # Award join/upgrade loyalty bonus
    bonus_map = {
        MembershipTier.SILVER: 500,
        MembershipTier.GOLD: 1500,
        MembershipTier.PLATINUM: 5000,
        MembershipTier.ENTERPRISE: 15000,
    }
    bonus = bonus_map.get(req.tier, 0)
    if bonus:
        membership.loyalty_points += bonus
        membership.total_points_earned += bonus
        txn = LoyaltyTransaction(
            user_id=current_user["user_id"],
            points=bonus,
            description=f"Welcome bonus for {TIER_BENEFITS[req.tier]['label']} membership",
            reference_type="membership_bonus",
            reference_id=str(membership.id),
        )
        db.add(txn)

    await db.commit()
    await db.refresh(membership)

    return {
        "message": f"Successfully subscribed to {TIER_BENEFITS[req.tier]['label']} plan ({cycle})",
        "tier": membership.tier.value,
        "billing_cycle": cycle,
        "price_paid": price,
        "expires_at": membership.expires_at.isoformat(),
        "loyalty_bonus_awarded": bonus,
        "benefits": TIER_BENEFITS[req.tier],
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel subscription and revert to Free tier."""
    membership = await _get_or_create_membership(current_user["user_id"], db)
    membership.tier = MembershipTier.FREE
    membership.is_active = True
    membership.expires_at = None
    await db.commit()
    return {"message": "Subscription cancelled. You are now on the Free plan."}


@router.get("/loyalty/history")
async def loyalty_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get loyalty transaction history."""
    result = await db.execute(
        select(LoyaltyTransaction)
        .where(LoyaltyTransaction.user_id == current_user["user_id"])
        .order_by(LoyaltyTransaction.created_at.desc())
        .limit(50)
    )
    txns = result.scalars().all()
    return {
        "transactions": [
            {
                "id": str(t.id),
                "points": t.points,
                "description": t.description,
                "reference_type": t.reference_type,
                "created_at": t.created_at.isoformat(),
            }
            for t in txns
        ]
    }


@router.post("/loyalty/redeem")
async def redeem_points(
    req: RedeemPointsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Redeem loyalty points for discount credits."""
    if req.points <= 0:
        raise HTTPException(status_code=400, detail="Points must be positive")

    membership = await _get_or_create_membership(current_user["user_id"], db)

    if membership.loyalty_points < req.points:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. You have {membership.loyalty_points} points.",
        )

    discount_inr = round(req.points / POINTS_TO_RUPEE, 2)
    membership.loyalty_points -= req.points
    membership.total_points_redeemed += req.points

    txn = LoyaltyTransaction(
        user_id=current_user["user_id"],
        points=-req.points,
        description=f"Redeemed {req.points} points for ₹{discount_inr} discount",
        reference_type="redemption",
    )
    db.add(txn)
    await db.commit()

    return {
        "message": f"Redeemed {req.points} points",
        "discount_inr": discount_inr,
        "remaining_points": membership.loyalty_points,
    }


@router.post("/loyalty/earn")
async def earn_points(
    order_value_inr: float,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Award loyalty points for an order (called internally or by order router)."""
    membership = await _get_or_create_membership(current_user["user_id"], db)
    multiplier = TIER_BENEFITS[membership.tier]["loyalty_multiplier"]
    points = int(order_value_inr * POINTS_PER_RUPEE * multiplier)

    membership.loyalty_points += points
    membership.total_points_earned += points

    txn = LoyaltyTransaction(
        user_id=current_user["user_id"],
        points=points,
        description=f"Earned {points} pts for ₹{order_value_inr:.0f} order (×{multiplier} multiplier)",
        reference_type="order",
    )
    db.add(txn)
    await db.commit()

    return {"points_earned": points, "total_points": membership.loyalty_points}
