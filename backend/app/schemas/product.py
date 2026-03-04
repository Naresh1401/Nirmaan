"""Product schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    category_id: UUID
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    brand: Optional[str] = None
    unit: str  # kg, bag, piece, etc.
    price: float = Field(..., gt=0)
    mrp: Optional[float] = None
    stock_quantity: int = Field(default=0, ge=0)
    min_order_quantity: int = Field(default=1, ge=1)
    max_order_quantity: Optional[int] = None
    images: list[str] = Field(default_factory=list)
    specifications: dict = Field(default_factory=dict)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_order_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    images: Optional[list[str]] = None
    specifications: Optional[dict] = None


class ProductResponse(BaseModel):
    id: UUID
    supplier_id: UUID
    category_id: UUID
    name: str
    description: Optional[str] = None
    brand: Optional[str] = None
    unit: str
    price: float
    mrp: Optional[float] = None
    stock_quantity: int
    min_order_quantity: int
    max_order_quantity: Optional[int] = None
    images: list
    specifications: dict
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int
    page: int
    page_size: int


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    sort_order: int

    model_config = {"from_attributes": True}
