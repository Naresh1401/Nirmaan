"""Premium membership, loyalty, and referral router."""

import random
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db as get_session
from app.core.security import get_current_user
from app.models.premium import (
    LoyaltyPoints,
    LoyaltySource,
    LoyaltyTransaction,
    LoyaltyTransactionType,
    MEMBERSHIP_PLANS,
    MembershipStatus,
    MembershipTier,
    PremiumMembership,
    ReferralCode,
)
from app.models.user import User

router = APIRouter()

# ── Pydantic Schemas ─────────────────────────────────────────────────


class SubscribeRequest(BaseModel):
    tier: str = Field(..., pattern="^(silver|gold|platinum)$")
    billing_cycle: str = Field(..., pattern="^(monthly|quarterly|yearly)$")


class MembershipResponse(BaseModel):
    id: str
    tier: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    auto_renew: bool
    amount_paid: float
    billing_cycle: str

    class Config:
        from_attributes = True


class LoyaltyBalanceResponse(BaseModel):
    total_points: int
    redeemed_points: int
    available_points: int
    tier_bonus_multiplier: float
    monetary_value: float  # available_points / 100 in INR


class LoyaltyTransactionResponse(BaseModel):
    id: str
    points: int
    transaction_type: str
    source: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RedeemRequest(BaseModel):
    points: int = Field(..., gt=0)
    order_id: Optional[str] = None


class EarnRequest(BaseModel):
    order_id: str
    order_amount: float = Field(..., gt=0)


class ApplyReferralRequest(BaseModel):
    code: str


class ReferralStatsResponse(BaseModel):
    code: str
    uses_count: int
    max_uses: int
    reward_points: int
    is_active: bool


# ── Helpers ──────────────────────────────────────────────────────────

def _generate_referral_code(full_name: str) -> str:
    """Generate a unique-ish referral code from user name."""
    prefix = "".join(c for c in full_name.upper() if c.isalpha())[:4].ljust(4, "X")
    suffix = "".join(random.choices(string.digits, k=6))
    return f"{prefix}{suffix}"


async def _get_or_create_loyalty(user_id: UUID, db: AsyncSession) -> LoyaltyPoints:
    result = await db.execute(
        select(LoyaltyPoints).where(LoyaltyPoints.user_id == user_id)
    )
    lp = result.scalar_one_or_none()
    if not lp:
        lp = LoyaltyPoints(user_id=user_id)
        db.add(lp)
        await db.flush()
    return lp


def _billing_delta(billing_cycle: str) -> timedelta:
    return {"monthly": timedelta(days=30), "quarterly": timedelta(days=90), "yearly": timedelta(days=365)}.get(
        billing_cycle, timedelta(days=30)
    )


# ── Subscription ─────────────────────────────────────────────────────

@router.post("/subscribe", response_model=dict)
async def subscribe(
    body: SubscribeRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Subscribe to a premium plan."""
    user_id = UUID(user["user_id"])

    plan = MEMBERSHIP_PLANS.get(body.tier)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid tier")

    amount = plan[body.billing_cycle]

    # Cancel any existing active membership
    result = await db.execute(
        select(PremiumMembership).where(
            PremiumMembership.user_id == user_id,
            PremiumMembership.status == MembershipStatus.ACTIVE,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.status = MembershipStatus.CANCELLED

    now = datetime.now(timezone.utc)
    membership = PremiumMembership(
        user_id=user_id,
        tier=MembershipTier(body.tier),
        status=MembershipStatus.ACTIVE,
        start_date=now,
        end_date=now + _billing_delta(body.billing_cycle),
        amount_paid=float(amount),
        billing_cycle=body.billing_cycle,
    )
    db.add(membership)

    # Update User.membership_tier
    user_result = await db.execute(select(User).where(User.id == user_id))
    db_user = user_result.scalar_one_or_none()
    if db_user:
        db_user.membership_tier = body.tier

    # Grant signup bonus loyalty points (500)
    lp = await _get_or_create_loyalty(user_id, db)
    tier_multiplier = plan["benefits"].get("loyalty_multiplier", 1.0)
    bonus = 500
    lp.total_points += bonus
    lp.available_points += bonus
    lp.tier_bonus_multiplier = tier_multiplier
    lp.last_earned_at = now
    txn = LoyaltyTransaction(
        loyalty_account_id=lp.id,
        points=bonus,
        transaction_type=LoyaltyTransactionType.BONUS,
        source=LoyaltySource.SIGNUP_BONUS,
        description=f"Welcome bonus for {body.tier.capitalize()} membership",
    )
    db.add(txn)

    await db.commit()
    return {
        "message": f"Successfully subscribed to {body.tier.capitalize()} plan",
        "tier": body.tier,
        "billing_cycle": body.billing_cycle,
        "amount_paid": amount,
        "valid_until": membership.end_date.isoformat(),
        "signup_bonus_points": bonus,
    }


@router.get("/membership", response_model=dict)
async def get_membership(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get current membership details."""
    user_id = UUID(user["user_id"])
    result = await db.execute(
        select(PremiumMembership).where(
            PremiumMembership.user_id == user_id,
            PremiumMembership.status == MembershipStatus.ACTIVE,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        return {"tier": "free", "status": "no_membership", "is_premium": False}

    # Auto-expire check
    if membership.end_date and membership.end_date < datetime.now(timezone.utc):
        membership.status = MembershipStatus.EXPIRED
        db_user_res = await db.execute(select(User).where(User.id == user_id))
        db_user = db_user_res.scalar_one_or_none()
        if db_user:
            db_user.membership_tier = "free"
        await db.commit()
        return {"tier": "free", "status": "expired", "is_premium": False}

    return {
        "id": str(membership.id),
        "tier": membership.tier.value,
        "status": membership.status.value,
        "start_date": membership.start_date.isoformat(),
        "end_date": membership.end_date.isoformat() if membership.end_date else None,
        "auto_renew": membership.auto_renew,
        "amount_paid": membership.amount_paid,
        "billing_cycle": membership.billing_cycle,
        "is_premium": True,
        "benefits": MEMBERSHIP_PLANS.get(membership.tier.value, {}).get("benefits", {}),
    }


@router.put("/membership/renew", response_model=dict)
async def renew_membership(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Renew current membership for the same billing cycle."""
    user_id = UUID(user["user_id"])
    result = await db.execute(
        select(PremiumMembership).where(PremiumMembership.user_id == user_id)
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="No membership found")

    now = datetime.now(timezone.utc)
    delta = _billing_delta(membership.billing_cycle)
    membership.start_date = now
    membership.end_date = now + delta
    membership.status = MembershipStatus.ACTIVE
    await db.commit()
    return {
        "message": "Membership renewed",
        "valid_until": membership.end_date.isoformat(),
    }


@router.delete("/membership/cancel", response_model=dict)
async def cancel_membership(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Cancel current membership."""
    user_id = UUID(user["user_id"])
    result = await db.execute(
        select(PremiumMembership).where(
            PremiumMembership.user_id == user_id,
            PremiumMembership.status == MembershipStatus.ACTIVE,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="No active membership found")

    membership.status = MembershipStatus.CANCELLED
    db_user_res = await db.execute(select(User).where(User.id == user_id))
    db_user = db_user_res.scalar_one_or_none()
    if db_user:
        db_user.membership_tier = "free"
    await db.commit()
    return {"message": "Membership cancelled. Access continues until end_date."}


@router.get("/plans", response_model=dict)
async def list_plans():
    """Return all available premium plans with pricing."""
    return {"plans": MEMBERSHIP_PLANS}


@router.get("/benefits", response_model=dict)
async def get_benefits(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get benefits for user's current tier."""
    user_id = UUID(user["user_id"])
    user_result = await db.execute(select(User).where(User.id == user_id))
    db_user = user_result.scalar_one_or_none()
    tier = getattr(db_user, "membership_tier", "free") if db_user else "free"
    benefits = MEMBERSHIP_PLANS.get(tier, {}).get("benefits", {})
    return {"tier": tier, "benefits": benefits}


# ── Loyalty ──────────────────────────────────────────────────────────

@router.post("/loyalty/earn", response_model=dict)
async def earn_loyalty_points(
    body: EarnRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Earn loyalty points after an order (called internally or by order system)."""
    user_id = UUID(user["user_id"])
    user_result = await db.execute(select(User).where(User.id == user_id))
    db_user = user_result.scalar_one_or_none()
    tier = getattr(db_user, "membership_tier", "free") if db_user else "free"
    multiplier = MEMBERSHIP_PLANS.get(tier, {}).get("benefits", {}).get("loyalty_multiplier", 1.0)

    base_points = int(body.order_amount / 100)  # 1 point per ₹100
    points = int(base_points * multiplier)
    if points <= 0:
        return {"message": "No points earned", "points": 0}

    now = datetime.now(timezone.utc)
    lp = await _get_or_create_loyalty(user_id, db)
    lp.total_points += points
    lp.available_points += points
    lp.last_earned_at = now
    txn = LoyaltyTransaction(
        loyalty_account_id=lp.id,
        points=points,
        transaction_type=LoyaltyTransactionType.EARNED,
        source=LoyaltySource.ORDER,
        reference_id=body.order_id,
        description=f"Earned {points} pts on order ₹{body.order_amount:.0f} ({multiplier}x)",
    )
    db.add(txn)
    await db.commit()
    return {"message": f"Earned {points} loyalty points", "points": points, "total_available": lp.available_points}


@router.post("/loyalty/redeem", response_model=dict)
async def redeem_loyalty_points(
    body: RedeemRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Redeem loyalty points. 1 point = ₹0.01 (100 points = ₹1)."""
    user_id = UUID(user["user_id"])
    lp_result = await db.execute(
        select(LoyaltyPoints).where(LoyaltyPoints.user_id == user_id)
    )
    lp = lp_result.scalar_one_or_none()
    if not lp or lp.available_points < body.points:
        raise HTTPException(status_code=400, detail="Insufficient loyalty points")

    monetary_value = body.points / 100  # 100 points = ₹1
    lp.available_points -= body.points
    lp.redeemed_points += body.points
    txn = LoyaltyTransaction(
        loyalty_account_id=lp.id,
        points=-body.points,
        transaction_type=LoyaltyTransactionType.REDEEMED,
        source=LoyaltySource.ORDER,
        reference_id=body.order_id,
        description=f"Redeemed {body.points} pts for ₹{monetary_value:.2f} discount",
    )
    db.add(txn)
    await db.commit()
    return {
        "message": f"Redeemed {body.points} points",
        "discount_amount": monetary_value,
        "remaining_points": lp.available_points,
    }


@router.get("/loyalty/balance", response_model=LoyaltyBalanceResponse)
async def get_loyalty_balance(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get loyalty point balance."""
    user_id = UUID(user["user_id"])
    lp = await _get_or_create_loyalty(user_id, db)
    await db.commit()
    return LoyaltyBalanceResponse(
        total_points=lp.total_points,
        redeemed_points=lp.redeemed_points,
        available_points=lp.available_points,
        tier_bonus_multiplier=lp.tier_bonus_multiplier,
        monetary_value=lp.available_points / 100,
    )


@router.get("/loyalty/history", response_model=List[LoyaltyTransactionResponse])
async def get_loyalty_history(
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get loyalty transaction history."""
    user_id = UUID(user["user_id"])
    lp_result = await db.execute(
        select(LoyaltyPoints).where(LoyaltyPoints.user_id == user_id)
    )
    lp = lp_result.scalar_one_or_none()
    if not lp:
        return []
    txn_result = await db.execute(
        select(LoyaltyTransaction)
        .where(LoyaltyTransaction.loyalty_account_id == lp.id)
        .order_by(LoyaltyTransaction.created_at.desc())
        .limit(limit)
    )
    txns = txn_result.scalars().all()
    return [
        LoyaltyTransactionResponse(
            id=str(t.id),
            points=t.points,
            transaction_type=t.transaction_type.value,
            source=t.source.value,
            description=t.description,
            created_at=t.created_at,
        )
        for t in txns
    ]


# ── Referral ─────────────────────────────────────────────────────────

@router.post("/referral/generate", response_model=ReferralStatsResponse)
async def generate_referral_code(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Generate or return existing referral code for the user."""
    user_id = UUID(user["user_id"])

    # Return existing code if present
    ref_result = await db.execute(
        select(ReferralCode).where(ReferralCode.user_id == user_id)
    )
    ref = ref_result.scalar_one_or_none()
    if ref:
        return ReferralStatsResponse(
            code=ref.code,
            uses_count=ref.uses_count,
            max_uses=ref.max_uses,
            reward_points=ref.reward_points,
            is_active=ref.is_active,
        )

    user_result = await db.execute(select(User).where(User.id == user_id))
    db_user = user_result.scalar_one_or_none()
    full_name = db_user.full_name if db_user else "USER"
    code = _generate_referral_code(full_name)
    ref = ReferralCode(user_id=user_id, code=code)
    db.add(ref)
    await db.commit()
    return ReferralStatsResponse(
        code=ref.code,
        uses_count=ref.uses_count,
        max_uses=ref.max_uses,
        reward_points=ref.reward_points,
        is_active=ref.is_active,
    )


@router.post("/referral/apply", response_model=dict)
async def apply_referral_code(
    body: ApplyReferralRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Apply a referral code during signup / first subscription."""
    user_id = UUID(user["user_id"])

    ref_result = await db.execute(
        select(ReferralCode).where(
            ReferralCode.code == body.code.upper(),
            ReferralCode.is_active.is_(True),
        )
    )
    ref = ref_result.scalar_one_or_none()
    if not ref:
        raise HTTPException(status_code=404, detail="Invalid or expired referral code")

    if str(ref.user_id) == str(user_id):
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")

    if ref.uses_count >= ref.max_uses:
        raise HTTPException(status_code=400, detail="Referral code has reached its usage limit")

    reward = ref.reward_points
    now = datetime.now(timezone.utc)

    # Award points to the new user
    lp_new = await _get_or_create_loyalty(user_id, db)
    lp_new.total_points += reward
    lp_new.available_points += reward
    lp_new.last_earned_at = now
    db.add(LoyaltyTransaction(
        loyalty_account_id=lp_new.id,
        points=reward,
        transaction_type=LoyaltyTransactionType.BONUS,
        source=LoyaltySource.REFERRAL,
        reference_id=str(ref.id),
        description=f"Referral bonus from code {ref.code}",
    ))

    # Award points to referrer
    lp_ref = await _get_or_create_loyalty(ref.user_id, db)
    lp_ref.total_points += reward
    lp_ref.available_points += reward
    lp_ref.last_earned_at = now
    db.add(LoyaltyTransaction(
        loyalty_account_id=lp_ref.id,
        points=reward,
        transaction_type=LoyaltyTransactionType.BONUS,
        source=LoyaltySource.REFERRAL,
        reference_id=str(user_id),
        description=f"Referral reward — {reward} pts",
    ))

    ref.uses_count += 1
    await db.commit()
    return {
        "message": f"Referral code applied. You earned {reward} loyalty points!",
        "points_earned": reward,
    }


@router.get("/referral/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get referral statistics for the current user."""
    user_id = UUID(user["user_id"])
    ref_result = await db.execute(
        select(ReferralCode).where(ReferralCode.user_id == user_id)
    )
    ref = ref_result.scalar_one_or_none()
    if not ref:
        raise HTTPException(status_code=404, detail="No referral code yet. Generate one first.")
    return ReferralStatsResponse(
        code=ref.code,
        uses_count=ref.uses_count,
        max_uses=ref.max_uses,
        reward_points=ref.reward_points,
        is_active=ref.is_active,
    )
