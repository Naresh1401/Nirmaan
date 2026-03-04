"""Delivery schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DeliveryPartnerCreate(BaseModel):
    vehicle_type: str
    vehicle_number: str = Field(..., max_length=20)
    vehicle_capacity_kg: int = Field(default=1000, ge=100)
    license_number: str = Field(..., max_length=20)
    city: str = Field(..., max_length=100)


class DeliveryPartnerResponse(BaseModel):
    id: UUID
    user_id: UUID
    vehicle_type: str
    vehicle_number: str
    vehicle_capacity_kg: int
    is_available: bool
    is_verified: bool
    rating: float
    total_deliveries: int
    completion_rate: float
    city: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DeliveryResponse(BaseModel):
    id: UUID
    order_id: UUID
    partner_id: Optional[UUID] = None
    status: str
    pickup_locations: list
    delivery_location: dict
    estimated_pickup_time: Optional[datetime] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_pickup_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    distance_km: Optional[float] = None
    delivery_fee: float
    created_at: datetime

    model_config = {"from_attributes": True}


class LocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class DeliveryStatusUpdate(BaseModel):
    status: str
    photo_url: Optional[str] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None
