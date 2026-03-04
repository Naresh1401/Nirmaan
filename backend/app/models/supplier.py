"""Supplier model."""

import uuid
from datetime import datetime, timezone
import enum

from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"
    ENTERPRISE = "enterprise"


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True
    )
    business_name: Mapped[str] = mapped_column(String(255))
    gst_number: Mapped[str] = mapped_column(String(20), nullable=True)
    pan_number: Mapped[str] = mapped_column(String(12), nullable=True)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    address: Mapped[str] = mapped_column(String(500))
    city: Mapped[str] = mapped_column(String(100), index=True)
    state: Mapped[str] = mapped_column(String(100))
    pincode: Mapped[str] = mapped_column(String(10))
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_orders: Mapped[int] = mapped_column(Integer, default=0)
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        SAEnum(SubscriptionTier), default=SubscriptionTier.FREE
    )
    delivery_radius_km: Mapped[int] = mapped_column(Integer, default=25)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="supplier")
    products = relationship("Product", back_populates="supplier", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="supplier")

    def __repr__(self) -> str:
        return f"<Supplier {self.business_name}>"
