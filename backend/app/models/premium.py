"""Premium membership, loyalty, and referral models."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum as SAEnum, Float, ForeignKey,
    Integer, String, Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ── Enumerations ─────────────────────────────────────────────────────

class MembershipTier(str, enum.Enum):
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class MembershipStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"


class LoyaltyTransactionType(str, enum.Enum):
    EARNED = "earned"
    REDEEMED = "redeemed"
    EXPIRED = "expired"
    BONUS = "bonus"


class LoyaltySource(str, enum.Enum):
    ORDER = "order"
    REFERRAL = "referral"
    REVIEW = "review"
    SIGNUP_BONUS = "signup_bonus"
    TIER_UPGRADE = "tier_upgrade"


# ── Membership plans config (used by routers) ────────────────────────

MEMBERSHIP_PLANS = {
    "silver": {
        "monthly": 499,
        "quarterly": 1299,
        "yearly": 4499,
        "benefits": {
            "discount_percent": 5,
            "free_delivery_threshold": 3000,
            "loyalty_multiplier": 1.5,
            "priority_support": True,
            "credit_limit_boost": 25,
            "exclusive_deals": True,
            "ai_queries_per_day": 25,
        },
    },
    "gold": {
        "monthly": 999,
        "quarterly": 2499,
        "yearly": 8999,
        "benefits": {
            "discount_percent": 10,
            "free_delivery_threshold": 0,
            "loyalty_multiplier": 2.0,
            "priority_support": True,
            "dedicated_account_manager": True,
            "credit_limit_boost": 50,
            "exclusive_deals": True,
            "early_access": True,
            "ai_queries_per_day": 100,
            "bulk_pricing_access": True,
        },
    },
    "platinum": {
        "monthly": 2499,
        "quarterly": 6499,
        "yearly": 21999,
        "benefits": {
            "discount_percent": 15,
            "free_delivery_threshold": 0,
            "loyalty_multiplier": 3.0,
            "priority_support": True,
            "dedicated_account_manager": True,
            "credit_limit_boost": 100,
            "exclusive_deals": True,
            "early_access": True,
            "ai_queries_per_day": -1,
            "bulk_pricing_access": True,
            "infrastructure_project_support": True,
            "government_tender_access": True,
            "custom_reports": True,
        },
    },
}


# ── Models ───────────────────────────────────────────────────────────

class PremiumMembership(Base):
    """Premium membership subscription record."""

    __tablename__ = "premium_memberships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    tier: Mapped[MembershipTier] = mapped_column(
        SAEnum(MembershipTier), default=MembershipTier.FREE
    )
    status: Mapped[MembershipStatus] = mapped_column(
        SAEnum(MembershipStatus), default=MembershipStatus.ACTIVE
    )
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True)
    amount_paid: Mapped[float] = mapped_column(Float, default=0.0)
    payment_id: Mapped[str] = mapped_column(String(100), nullable=True)
    billing_cycle: Mapped[str] = mapped_column(String(20), default="monthly")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="premium_membership")


class LoyaltyPoints(Base):
    """Loyalty points account per user."""

    __tablename__ = "loyalty_points"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True
    )
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    redeemed_points: Mapped[int] = mapped_column(Integer, default=0)
    available_points: Mapped[int] = mapped_column(Integer, default=0)
    tier_bonus_multiplier: Mapped[float] = mapped_column(Float, default=1.0)
    last_earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="loyalty_points")
    transactions = relationship("LoyaltyTransaction", back_populates="loyalty_account")


class LoyaltyTransaction(Base):
    """Individual loyalty point transaction."""

    __tablename__ = "loyalty_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    loyalty_account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("loyalty_points.id"), nullable=False, index=True
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    transaction_type: Mapped[LoyaltyTransactionType] = mapped_column(
        SAEnum(LoyaltyTransactionType), nullable=False
    )
    source: Mapped[LoyaltySource] = mapped_column(
        SAEnum(LoyaltySource), nullable=False
    )
    reference_id: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    loyalty_account = relationship("LoyaltyPoints", back_populates="transactions")


class PremiumBenefit(Base):
    """Per-tier benefit catalogue entry."""

    __tablename__ = "premium_benefits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tier: Mapped[MembershipTier] = mapped_column(SAEnum(MembershipTier), nullable=False)
    benefit_name: Mapped[str] = mapped_column(String(100), nullable=False)
    benefit_description: Mapped[str] = mapped_column(Text, nullable=True)
    benefit_category: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # discount / delivery / support / feature / loyalty
    value: Mapped[str] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ReferralCode(Base):
    """User referral code record."""

    __tablename__ = "referral_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    uses_count: Mapped[int] = mapped_column(Integer, default=0)
    max_uses: Mapped[int] = mapped_column(Integer, default=50)
    reward_points: Mapped[int] = mapped_column(Integer, default=200)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="referral_code")
