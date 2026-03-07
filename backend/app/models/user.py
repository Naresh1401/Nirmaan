"""User model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    SUPPLIER = "supplier"
    DELIVERY_PARTNER = "delivery_partner"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), default=UserRole.CUSTOMER
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    supplier = relationship("Supplier", back_populates="user", uselist=False)
    delivery_partner = relationship("DeliveryPartner", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="reviewer")
    premium_membership = relationship("PremiumMembership", back_populates="user", uselist=False)

    def __repr__(self) -> str:
        return f"<User {self.full_name} ({self.role.value})>"
