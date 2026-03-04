"""Order schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_length=1)
    delivery_address: str = Field(..., max_length=500)
    delivery_city: str = Field(..., max_length=100)
    delivery_pincode: str = Field(..., pattern=r"^\d{6}$")
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    notes: Optional[str] = None
    priority: str = Field(default="standard")
    scheduled_date: Optional[datetime] = None
    payment_method: str = Field(default="razorpay")


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    supplier_id: UUID
    quantity: int
    unit_price: float
    total_price: float
    status: str
    sub_order_number: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    customer_id: UUID
    status: str
    delivery_address: str
    delivery_city: str
    subtotal: float
    delivery_fee: float
    platform_fee: float
    discount: float
    total_amount: float
    payment_status: str
    payment_method: Optional[str] = None
    priority: str
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
    page: int
    page_size: int
