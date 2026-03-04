"""Supplier management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierListResponse,
)

router = APIRouter()


@router.get("", response_model=SupplierListResponse)
async def list_suppliers(
    city: str = Query(None, description="Filter by city"),
    verified: bool = Query(None, description="Filter by verified status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all suppliers with optional filters."""
    query = select(Supplier)

    if city:
        query = query.where(Supplier.city.ilike(f"%{city}%"))
    if verified is not None:
        query = query.where(Supplier.is_verified == verified)

    # Count total
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate
    query = query.order_by(Supplier.rating.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size)

    result = await db.execute(query)
    suppliers = result.scalars().all()

    return SupplierListResponse(
        suppliers=[SupplierResponse.model_validate(s) for s in suppliers],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get supplier details by ID."""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse.model_validate(supplier)


@router.post("/register", response_model=SupplierResponse, status_code=201)
async def register_supplier(
    data: SupplierCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register as a supplier (authenticated user)."""
    user_id = current_user["user_id"]

    # Check if already a supplier
    existing = await db.execute(
        select(Supplier).where(Supplier.user_id == user_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409, detail="User is already registered as a supplier"
        )

    supplier = Supplier(
        user_id=user_id,
        business_name=data.business_name,
        gst_number=data.gst_number,
        pan_number=data.pan_number,
        description=data.description,
        address=data.address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        latitude=data.latitude,
        longitude=data.longitude,
        delivery_radius_km=data.delivery_radius_km,
    )
    db.add(supplier)
    await db.flush()

    # Update user role
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
    user.role = "supplier"

    return SupplierResponse.model_validate(supplier)


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: UUID,
    data: SupplierUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update supplier information."""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    if str(supplier.user_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(supplier, key, value)

    await db.flush()
    return SupplierResponse.model_validate(supplier)


@router.put("/{supplier_id}/inventory")
async def update_inventory(
    supplier_id: UUID,
    inventory: list[dict],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk update product stock for a supplier."""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    if str(supplier.user_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    from app.models.product import Product

    updated = 0
    for item in inventory:
        product_result = await db.execute(
            select(Product).where(
                Product.id == item["product_id"],
                Product.supplier_id == supplier_id,
            )
        )
        product = product_result.scalar_one_or_none()
        if product:
            product.stock_quantity = item["stock_quantity"]
            if "price" in item:
                product.price = item["price"]
            updated += 1

    return {"updated": updated, "total": len(inventory)}
