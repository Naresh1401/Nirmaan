"""Premium membership and loyalty models."""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, ForeignKey
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MembershipTier(str, enum.Enum):
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


TIER_PRICING = {
    MembershipTier.FREE: 0,
    MembershipTier.SILVER: 999,      # ₹999/month
    MembershipTier.GOLD: 2499,       # ₹2,499/month
    MembershipTier.PLATINUM: 4999,   # ₹4,999/month
}

TIER_BENEFITS = {
    MembershipTier.FREE: {
        "label": "Free",
        "ai_queries_per_day": 5,
        "discount_pct": 0,
        "priority_support": False,
        "advanced_ai": False,
        "project_marketplace": False,
        "workforce_hiring": False,
        "equipment_rental": False,
        "design_studio": False,
        "digital_twin": False,
        "carbon_tracking": False,
        "loyalty_multiplier": 1,
    },
    MembershipTier.SILVER: {
        "label": "Silver",
        "ai_queries_per_day": 50,
        "discount_pct": 5,
        "priority_support": True,
        "advanced_ai": True,
        "project_marketplace": True,
        "workforce_hiring": True,
        "equipment_rental": True,
        "design_studio": False,
        "digital_twin": False,
        "carbon_tracking": False,
        "loyalty_multiplier": 2,
    },
    MembershipTier.GOLD: {
        "label": "Gold",
        "ai_queries_per_day": 200,
        "discount_pct": 10,
        "priority_support": True,
        "advanced_ai": True,
        "project_marketplace": True,
        "workforce_hiring": True,
        "equipment_rental": True,
        "design_studio": True,
        "digital_twin": False,
        "carbon_tracking": True,
        "loyalty_multiplier": 3,
    },
    MembershipTier.PLATINUM: {
        "label": "Platinum",
        "ai_queries_per_day": -1,   # unlimited
        "discount_pct": 15,
        "priority_support": True,
        "advanced_ai": True,
        "project_marketplace": True,
        "workforce_hiring": True,
        "equipment_rental": True,
        "design_studio": True,
        "digital_twin": True,
        "carbon_tracking": True,
        "loyalty_multiplier": 5,
    },
}


class PremiumMembership(Base):
    """Tracks user premium subscription."""

    __tablename__ = "premium_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True
    )
    tier: Mapped[MembershipTier] = mapped_column(
        SAEnum(MembershipTier), default=MembershipTier.FREE
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    total_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    total_points_redeemed: Mapped[int] = mapped_column(Integer, default=0)
    ai_queries_today: Mapped[int] = mapped_column(Integer, default=0)
    ai_queries_reset_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="premium_membership")


class LoyaltyTransaction(Base):
    """Loyalty points transaction log."""

    __tablename__ = "loyalty_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)  # positive = earned, negative = redeemed
    description: Mapped[str] = mapped_column(String(255))
    reference_type: Mapped[str] = mapped_column(String(50), nullable=True)  # order, referral, bonus, etc.
    reference_id: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
