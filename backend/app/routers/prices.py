"""Price history and transparency API router."""

from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.inventory import PriceHistory
from app.models.product import Product

router = APIRouter()


@router.get("/product/{product_id}")
async def get_price_history(
    product_id: UUID,
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Get price history for a product over specified days."""
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(PriceHistory)
        .where(PriceHistory.product_id == product_id, PriceHistory.recorded_at >= since)
        .order_by(PriceHistory.recorded_at.asc())
    )
    history = result.scalars().all()

    # Also get current price
    product = await db.get(Product, product_id)
    current_price = product.price if product else 0

    return {
        "product_id": str(product_id),
        "current_price": current_price,
        "period_days": days,
        "history": [
            {
                "date": h.recorded_at.isoformat(),
                "old_price": h.old_price,
                "new_price": h.new_price,
                "change_pct": round(((h.new_price - h.old_price) / h.old_price) * 100, 1) if h.old_price > 0 else 0,
            }
            for h in history
        ],
        "trend": _calculate_trend(history, current_price),
    }


@router.get("/trends")
async def get_market_trends(
    db: AsyncSession = Depends(get_db),
):
    """Get overall market price trends."""
    # Get average prices by category from products
    result = await db.execute(
        select(
            Product.name,
            func.avg(Product.price).label("avg_price"),
            func.min(Product.price).label("min_price"),
            func.max(Product.price).label("max_price"),
            func.count(Product.id).label("supplier_count"),
        )
        .where(Product.is_active == True)
        .group_by(Product.name)
        .order_by(func.count(Product.id).desc())
        .limit(20)
    )
    trends = result.all()

    return {
        "market_trends": [
            {
                "product": t.name,
                "avg_price": round(float(t.avg_price), 2),
                "min_price": float(t.min_price),
                "max_price": float(t.max_price),
                "supplier_count": t.supplier_count,
                "spread_pct": round(((t.max_price - t.min_price) / t.avg_price) * 100, 1) if t.avg_price > 0 else 0,
            }
            for t in trends
        ],
    }


def _calculate_trend(history, current_price):
    """Calculate price trend direction."""
    if not history:
        return {"direction": "stable", "change_pct": 0}
    first_price = history[0].old_price
    if first_price == 0:
        return {"direction": "stable", "change_pct": 0}
    change_pct = round(((current_price - first_price) / first_price) * 100, 1)
    if change_pct > 2:
        direction = "up"
    elif change_pct < -2:
        direction = "down"
    else:
        direction = "stable"
    return {"direction": direction, "change_pct": change_pct}
