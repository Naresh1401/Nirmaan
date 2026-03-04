"""Supplier schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SupplierCreate(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=255)
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    description: Optional[str] = None
    address: str = Field(..., max_length=500)
    city: str = Field(..., max_length=100)
    state: str = Field(default="Telangana", max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    delivery_radius_km: int = Field(default=25, ge=1, le=100)


class SupplierUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    delivery_radius_km: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SupplierResponse(BaseModel):
    id: UUID
    user_id: UUID
    business_name: str
    gst_number: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_verified: bool
    rating: float
    total_orders: int
    subscription_tier: str
    delivery_radius_km: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SupplierListResponse(BaseModel):
    suppliers: list[SupplierResponse]
    total: int
    page: int
    page_size: int
