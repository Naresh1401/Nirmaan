"""Delivery and DeliveryPartner models."""

import uuid
from datetime import datetime, timezone
import enum

from sqlalchemy import (
    String, Boolean, DateTime, Float, Integer, ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VehicleType(str, enum.Enum):
    AUTO = "auto"
    MINI_TRUCK = "mini_truck"
    LCV = "lcv"
    TRUCK = "truck"
    TRACTOR = "tractor"
    TIPPER = "tipper"
    FLATBED = "flatbed"


class DeliveryStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    ACCEPTED = "accepted"
    AT_PICKUP = "at_pickup"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    AT_DELIVERY = "at_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"


class DeliveryPartner(Base):
    __tablename__ = "delivery_partners"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True
    )
    vehicle_type: Mapped[VehicleType] = mapped_column(SAEnum(VehicleType))
    vehicle_number: Mapped[str] = mapped_column(String(20))
    vehicle_capacity_kg: Mapped[int] = mapped_column(Integer, default=1000)
    license_number: Mapped[str] = mapped_column(String(20))
    is_available: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    current_lat: Mapped[float] = mapped_column(Float, nullable=True)
    current_lng: Mapped[float] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_deliveries: Mapped[int] = mapped_column(Integer, default=0)
    completion_rate: Mapped[float] = mapped_column(Float, default=100.0)
    city: Mapped[str] = mapped_column(String(100), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="delivery_partner")
    deliveries = relationship("Delivery", back_populates="partner")

    def __repr__(self) -> str:
        return f"<DeliveryPartner {self.vehicle_type.value} — {self.vehicle_number}>"


class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), index=True
    )
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("delivery_partners.id"), nullable=True
    )
    status: Mapped[DeliveryStatus] = mapped_column(
        SAEnum(DeliveryStatus), default=DeliveryStatus.ASSIGNED
    )
    pickup_locations: Mapped[dict] = mapped_column(JSONB, default=list)
    delivery_location: Mapped[dict] = mapped_column(JSONB, default=dict)
    estimated_pickup_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    estimated_delivery_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    actual_pickup_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    actual_delivery_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    pickup_photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    delivery_photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    weight_at_pickup_kg: Mapped[float] = mapped_column(Float, nullable=True)
    weight_at_delivery_kg: Mapped[float] = mapped_column(Float, nullable=True)
    distance_km: Mapped[float] = mapped_column(Float, nullable=True)
    delivery_fee: Mapped[float] = mapped_column(Float, default=0.0)
    driver_payout: Mapped[float] = mapped_column(Float, default=0.0)
    route_polyline: Mapped[str] = mapped_column(String(5000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    order = relationship("Order", back_populates="delivery")
    partner = relationship("DeliveryPartner", back_populates="deliveries")
