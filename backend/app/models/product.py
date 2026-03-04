"""Product and Category models."""

import uuid
from datetime import datetime, timezone
import enum

from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MaterialUnit(str, enum.Enum):
    KG = "kg"
    BAG = "bag"
    PIECE = "piece"
    CUBIC_FT = "cubic_ft"
    CUBIC_M = "cubic_m"
    TON = "ton"
    LOAD = "load"
    SQFT = "sqft"
    LITER = "liter"
    BUNDLE = "bundle"
    BOX = "box"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    icon_url: Mapped[str] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    products = relationship("Product", back_populates="category")
    children = relationship("Category", backref="parent", remote_side="Category.id")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("suppliers.id"), index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), index=True
    )
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    brand: Mapped[str] = mapped_column(String(100), nullable=True)
    unit: Mapped[MaterialUnit] = mapped_column(SAEnum(MaterialUnit))
    price: Mapped[float] = mapped_column(Float)
    mrp: Mapped[float] = mapped_column(Float, nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    min_order_quantity: Mapped[int] = mapped_column(Integer, default=1)
    max_order_quantity: Mapped[int] = mapped_column(Integer, nullable=True)
    images: Mapped[dict] = mapped_column(JSONB, default=list)
    specifications: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product {self.name} @ ₹{self.price}/{self.unit.value}>"
