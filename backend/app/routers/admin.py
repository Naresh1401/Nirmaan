"""Admin endpoints for platform management."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.models.order import Order, OrderStatus
from app.models.delivery import DeliveryPartner
from app.schemas.supplier import SupplierResponse

router = APIRouter()


def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency that requires admin role."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/dashboard")
async def admin_dashboard(
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide analytics dashboard."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_suppliers = (
        await db.execute(select(func.count(Supplier.id)))
    ).scalar() or 0
    verified_suppliers = (
        await db.execute(
            select(func.count(Supplier.id)).where(Supplier.is_verified)
        )
    ).scalar() or 0
    total_drivers = (
        await db.execute(select(func.count(DeliveryPartner.id)))
    ).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_gmv = (
        await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.status != OrderStatus.CANCELLED
            )
        )
    ).scalar() or 0

    # Orders by status
    status_counts = {}
    for status in OrderStatus:
        count = (
            await db.execute(
                select(func.count(Order.id)).where(Order.status == status)
            )
        ).scalar() or 0
        status_counts[status.value] = count

    return {
        "users": total_users,
        "suppliers": {
            "total": total_suppliers,
            "verified": verified_suppliers,
            "pending": total_suppliers - verified_suppliers,
        },
        "delivery_partners": total_drivers,
        "orders": {
            "total": total_orders,
            "by_status": status_counts,
        },
        "gmv": total_gmv,
    }


@router.get("/suppliers/pending", response_model=list[SupplierResponse])
async def get_pending_suppliers(
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List suppliers pending verification."""
    result = await db.execute(
        select(Supplier)
        .where(Supplier.is_verified == False)
        .order_by(Supplier.created_at.desc())
    )
    suppliers = result.scalars().all()
    return [SupplierResponse.model_validate(s) for s in suppliers]


@router.put("/suppliers/{supplier_id}/verify")
async def verify_supplier(
    supplier_id: str,
    approved: bool = True,
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject supplier verification."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    supplier.is_verified = approved
    return {
        "supplier_id": str(supplier.id),
        "business_name": supplier.business_name,
        "is_verified": supplier.is_verified,
    }


@router.get("/orders/overview")
async def orders_overview(
    days: int = Query(30, ge=1, le=365),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Order analytics for the last N days."""
    from datetime import datetime, timedelta, timezone

    since = datetime.now(timezone.utc) - timedelta(days=days)

    total = (
        await db.execute(
            select(func.count(Order.id)).where(Order.created_at >= since)
        )
    ).scalar() or 0

    revenue = (
        await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.created_at >= since,
                Order.status != OrderStatus.CANCELLED,
            )
        )
    ).scalar() or 0

    avg_order_value = (
        await db.execute(
            select(func.avg(Order.total_amount)).where(
                Order.created_at >= since,
                Order.status != OrderStatus.CANCELLED,
            )
        )
    ).scalar() or 0

    return {
        "period_days": days,
        "total_orders": total,
        "total_revenue": round(revenue, 2),
        "average_order_value": round(avg_order_value, 2),
    }
