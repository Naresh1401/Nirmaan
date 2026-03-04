"""Order and OrderItem models."""

import uuid
from datetime import datetime, timezone
import enum

from sqlalchemy import (
    String, DateTime, Float, Integer, ForeignKey, Text,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    PARTIALLY_SHIPPED = "partially_shipped"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    REFUNDED = "refunded"
    FAILED = "failed"


class OrderPriority(str, enum.Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    URGENT = "urgent"
    SCHEDULED = "scheduled"


class OrderItemStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_number: Mapped[str] = mapped_column(
        String(20), unique=True, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus), default=OrderStatus.PENDING
    )
    delivery_address: Mapped[str] = mapped_column(String(500))
    delivery_city: Mapped[str] = mapped_column(String(100))
    delivery_pincode: Mapped[str] = mapped_column(String(10))
    delivery_lat: Mapped[float] = mapped_column(Float, nullable=True)
    delivery_lng: Mapped[float] = mapped_column(Float, nullable=True)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    delivery_fee: Mapped[float] = mapped_column(Float, default=0.0)
    platform_fee: Mapped[float] = mapped_column(Float, default=0.0)
    discount: Mapped[float] = mapped_column(Float, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    payment_status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus), default=PaymentStatus.PENDING
    )
    payment_method: Mapped[str] = mapped_column(String(50), nullable=True)
    payment_id: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[OrderPriority] = mapped_column(
        SAEnum(OrderPriority), default=OrderPriority.STANDARD
    )
    scheduled_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)
    reviews = relationship("Review", back_populates="order")

    def __repr__(self) -> str:
        return f"<Order {self.order_number} — ₹{self.total_amount}>"


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id")
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id")
    )
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Float)
    total_price: Mapped[float] = mapped_column(Float)
    status: Mapped[OrderItemStatus] = mapped_column(
        SAEnum(OrderItemStatus), default=OrderItemStatus.PENDING
    )
    sub_order_number: Mapped[str] = mapped_column(String(25), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    supplier = relationship("Supplier", back_populates="order_items")
