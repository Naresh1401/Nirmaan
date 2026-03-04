"""Inventory management router — stock levels, alerts, logs."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.inventory import InventoryLog, PriceHistory
from app.models.product import Product

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


# ── Schemas ──────────────────────────────────────────────

class InventoryLogResponse(BaseModel):
    id: str
    product_id: str
    previous_quantity: int
    new_quantity: int
    change_type: str
    reference_id: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


class PriceHistoryResponse(BaseModel):
    id: str
    product_id: str
    old_price: float
    new_price: float
    change_reason: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


class StockUpdateRequest(BaseModel):
    product_id: str
    new_quantity: int = Field(..., ge=0)
    change_type: str = "adjustment"
    reference_id: Optional[str] = None


class PriceUpdateRequest(BaseModel):
    product_id: str
    new_price: float = Field(..., gt=0)
    change_reason: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────

@router.get("/logs", response_model=list[InventoryLogResponse])
async def get_inventory_logs(
    product_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get inventory change logs. Optionally filter by product."""
    query = select(InventoryLog).order_by(InventoryLog.recorded_at.desc()).limit(limit)
    if product_id:
        query = query.where(InventoryLog.product_id == product_id)

    result = await db.execute(query)
    logs = result.scalars().all()
    return [
        InventoryLogResponse(
            id=str(l.id),
            product_id=str(l.product_id),
            previous_quantity=l.previous_quantity,
            new_quantity=l.new_quantity,
            change_type=l.change_type,
            reference_id=l.reference_id,
            recorded_at=l.recorded_at,
        )
        for l in logs
    ]


@router.get("/price-history/{product_id}", response_model=list[PriceHistoryResponse])
async def get_price_history(
    product_id: str,
    limit: int = Query(30, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get price history for a product."""
    result = await db.execute(
        select(PriceHistory)
        .where(PriceHistory.product_id == product_id)
        .order_by(PriceHistory.recorded_at.desc())
        .limit(limit)
    )
    entries = result.scalars().all()
    return [
        PriceHistoryResponse(
            id=str(e.id),
            product_id=str(e.product_id),
            old_price=e.old_price,
            new_price=e.new_price,
            change_reason=e.change_reason,
            recorded_at=e.recorded_at,
        )
        for e in entries
    ]


@router.post("/update-stock", response_model=dict)
async def update_stock(
    body: StockUpdateRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Update product stock level (supplier only)."""
    if user.get("role") not in ("supplier", "admin"):
        raise HTTPException(status_code=403, detail="Only suppliers and admins can update stock.")

    result = await db.execute(
        select(Product).where(Product.id == body.product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    old_qty = product.stock_quantity if hasattr(product, 'stock_quantity') else 0
    log = InventoryLog(
        product_id=product.id,
        supplier_id=product.supplier_id,
        previous_quantity=old_qty,
        new_quantity=body.new_quantity,
        change_type=body.change_type,
        reference_id=body.reference_id,
    )
    if hasattr(product, 'stock_quantity'):
        product.stock_quantity = body.new_quantity
    db.add(log)
    await db.commit()

    return {
        "message": "Stock updated",
        "product_id": body.product_id,
        "previous_quantity": old_qty,
        "new_quantity": body.new_quantity,
    }


@router.post("/update-price", response_model=dict)
async def update_price(
    body: PriceUpdateRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Update product price (supplier only)."""
    if user.get("role") not in ("supplier", "admin"):
        raise HTTPException(status_code=403, detail="Only suppliers and admins can update prices.")

    result = await db.execute(
        select(Product).where(Product.id == body.product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    old_price = product.price
    price_log = PriceHistory(
        product_id=product.id,
        supplier_id=product.supplier_id,
        old_price=old_price,
        new_price=body.new_price,
        change_reason=body.change_reason,
    )
    product.price = body.new_price
    db.add(price_log)
    await db.commit()

    return {
        "message": "Price updated",
        "product_id": body.product_id,
        "old_price": old_price,
        "new_price": body.new_price,
    }
