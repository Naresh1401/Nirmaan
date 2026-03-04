"""Delivery management endpoints."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.delivery import DeliveryPartner, Delivery, DeliveryStatus, VehicleType
from app.models.order import Order, OrderStatus
from app.schemas.delivery import (
    DeliveryPartnerCreate,
    DeliveryPartnerResponse,
    DeliveryResponse,
    LocationUpdate,
    DeliveryStatusUpdate,
)

router = APIRouter()


# ── Delivery Partner Management ────────────────────────────


@router.post("/partners/register", response_model=DeliveryPartnerResponse, status_code=201)
async def register_delivery_partner(
    data: DeliveryPartnerCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register as a delivery partner."""
    user_id = current_user["user_id"]

    existing = await db.execute(
        select(DeliveryPartner).where(DeliveryPartner.user_id == user_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already registered as delivery partner")

    partner = DeliveryPartner(
        user_id=user_id,
        vehicle_type=VehicleType(data.vehicle_type),
        vehicle_number=data.vehicle_number,
        vehicle_capacity_kg=data.vehicle_capacity_kg,
        license_number=data.license_number,
        city=data.city,
    )
    db.add(partner)
    await db.flush()
    return DeliveryPartnerResponse.model_validate(partner)


@router.put("/partners/availability")
async def toggle_availability(
    is_available: bool,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle delivery partner availability (go online/offline)."""
    result = await db.execute(
        select(DeliveryPartner).where(
            DeliveryPartner.user_id == current_user["user_id"]
        )
    )
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner profile not found")

    partner.is_available = is_available
    return {"is_available": partner.is_available}


@router.put("/partners/location")
async def update_location(
    location: LocationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update delivery partner's current GPS location."""
    result = await db.execute(
        select(DeliveryPartner).where(
            DeliveryPartner.user_id == current_user["user_id"]
        )
    )
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Delivery partner profile not found")

    partner.current_lat = location.latitude
    partner.current_lng = location.longitude
    return {"status": "location updated"}


# ── Delivery Tracking ─────────────────────────────────────


@router.get("/active", response_model=list[DeliveryResponse])
async def get_active_deliveries(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get active deliveries for the current delivery partner."""
    result = await db.execute(
        select(DeliveryPartner).where(
            DeliveryPartner.user_id == current_user["user_id"]
        )
    )
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Not a delivery partner")

    deliveries_result = await db.execute(
        select(Delivery).where(
            Delivery.partner_id == partner.id,
            Delivery.status.notin_([DeliveryStatus.DELIVERED, DeliveryStatus.FAILED]),
        )
    )
    deliveries = deliveries_result.scalars().all()
    return [DeliveryResponse.model_validate(d) for d in deliveries]


@router.put("/{delivery_id}/status", response_model=DeliveryResponse)
async def update_delivery_status(
    delivery_id: UUID,
    data: DeliveryStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update delivery status (pickup, in-transit, delivered, etc.)."""
    result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    new_status = DeliveryStatus(data.status)
    delivery.status = new_status
    now = datetime.now(timezone.utc)

    if new_status == DeliveryStatus.PICKED_UP:
        delivery.actual_pickup_time = now
        if data.photo_url:
            delivery.pickup_photo_url = data.photo_url
        if data.weight_kg:
            delivery.weight_at_pickup_kg = data.weight_kg

        # Update order status
        order = await db.execute(select(Order).where(Order.id == delivery.order_id))
        order = order.scalar_one()
        order.status = OrderStatus.IN_TRANSIT

    elif new_status == DeliveryStatus.DELIVERED:
        delivery.actual_delivery_time = now
        if data.photo_url:
            delivery.delivery_photo_url = data.photo_url
        if data.weight_kg:
            delivery.weight_at_delivery_kg = data.weight_kg

        # Update order status
        order = await db.execute(select(Order).where(Order.id == delivery.order_id))
        order = order.scalar_one()
        order.status = OrderStatus.DELIVERED

        # Update partner stats
        partner = await db.execute(
            select(DeliveryPartner).where(DeliveryPartner.id == delivery.partner_id)
        )
        partner = partner.scalar_one()
        partner.total_deliveries += 1

    await db.flush()
    return DeliveryResponse.model_validate(delivery)


@router.get("/{delivery_id}/tracking")
async def track_delivery(
    delivery_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get real-time tracking info for a delivery."""
    result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    partner = None
    if delivery.partner_id:
        p_result = await db.execute(
            select(DeliveryPartner).where(DeliveryPartner.id == delivery.partner_id)
        )
        partner = p_result.scalar_one_or_none()

    return {
        "delivery_id": str(delivery.id),
        "status": delivery.status.value,
        "driver_location": {
            "lat": partner.current_lat if partner else None,
            "lng": partner.current_lng if partner else None,
        },
        "estimated_delivery_time": delivery.estimated_delivery_time,
        "pickup_locations": delivery.pickup_locations,
        "delivery_location": delivery.delivery_location,
    }
