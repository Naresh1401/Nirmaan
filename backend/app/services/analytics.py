"""
Prediction & forecasting engine for admin analytics.
Uses simple statistical models: moving averages, exponential smoothing,
linear regression for demand, revenue, stockout, and delivery delay prediction.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.delivery import Delivery
from app.models.supplier import Supplier
from app.models.admin import SystemAlert


# ── Moving Average ──────────────────────────────────────

def simple_moving_average(values: list[float], window: int = 7) -> float:
    """Simple moving average of last `window` values."""
    if not values:
        return 0.0
    data = values[-window:]
    return sum(data) / len(data) if data else 0.0


def exponential_moving_average(values: list[float], alpha: float = 0.3) -> float:
    """Exponential moving average — recent values weighted more."""
    if not values:
        return 0.0
    ema = values[0]
    for v in values[1:]:
        ema = alpha * v + (1 - alpha) * ema
    return ema


def linear_trend(values: list[float]) -> tuple[float, float]:
    """Simple linear regression. Returns (slope, intercept)."""
    n = len(values)
    if n < 2:
        return (0.0, values[0] if values else 0.0)
    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n
    num = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
    den = sum((i - x_mean) ** 2 for i in range(n))
    slope = num / den if den != 0 else 0
    intercept = y_mean - slope * x_mean
    return (slope, intercept)


def forecast_next(values: list[float], periods: int = 7) -> list[float]:
    """Forecast next N periods using linear trend + EMA blend."""
    if not values:
        return [0.0] * periods
    slope, intercept = linear_trend(values)
    ema_last = exponential_moving_average(values)
    n = len(values)
    forecasts = []
    for i in range(periods):
        trend_val = slope * (n + i) + intercept
        # Blend: 60% trend, 40% EMA
        blended = 0.6 * trend_val + 0.4 * ema_last
        forecasts.append(max(0.0, round(blended, 2)))
    return forecasts


def confidence_bounds(values: list[float], forecasts: list[float], confidence: float = 0.95) -> list[tuple]:
    """Simple confidence interval using std deviation of residuals."""
    if len(values) < 3:
        margin = max(abs(v) * 0.2 for v in values) if values else 0
        return [(max(0, f - margin), f + margin) for f in forecasts]
    
    slope, intercept = linear_trend(values)
    residuals = [values[i] - (slope * i + intercept) for i in range(len(values))]
    std = math.sqrt(sum(r ** 2 for r in residuals) / (len(residuals) - 2)) if len(residuals) > 2 else 0
    
    z = 1.96 if confidence >= 0.95 else 1.645
    bounds = []
    for f in forecasts:
        lower = max(0, round(f - z * std, 2))
        upper = round(f + z * std, 2)
        bounds.append((lower, upper))
    return bounds


# ── Revenue Forecast ────────────────────────────────────

async def forecast_revenue(db: AsyncSession, lookback_days: int = 90, forecast_days: int = 30):
    """Forecast daily revenue for the next N days."""
    since = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    
    result = await db.execute(
        text("""
            SELECT DATE(created_at) as day, COALESCE(SUM(total_amount), 0) as revenue
            FROM orders
            WHERE created_at >= :since AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY day
        """),
        {"since": since},
    )
    rows = result.fetchall()
    
    daily_revenue = [float(r[1]) for r in rows]
    dates = [r[0] for r in rows]
    
    # Fill gaps with 0
    if dates:
        filled = []
        current = dates[0]
        rev_map = dict(zip(dates, daily_revenue))
        while current <= (dates[-1] if dates else current):
            filled.append(rev_map.get(current, 0.0))
            current += timedelta(days=1)
        daily_revenue = filled
    
    forecasts = forecast_next(daily_revenue, forecast_days)
    bounds = confidence_bounds(daily_revenue, forecasts)
    
    today = datetime.now(timezone.utc).date()
    forecast_data = []
    for i, (f, (lo, hi)) in enumerate(zip(forecasts, bounds)):
        forecast_data.append({
            "date": (today + timedelta(days=i + 1)).isoformat(),
            "predicted_revenue": f,
            "lower_bound": lo,
            "upper_bound": hi,
        })
    
    return {
        "model": "linear_trend_ema_blend",
        "lookback_days": lookback_days,
        "forecast_days": forecast_days,
        "total_predicted": round(sum(forecasts), 2),
        "avg_daily_predicted": round(sum(forecasts) / len(forecasts), 2) if forecasts else 0,
        "historical_avg": round(sum(daily_revenue) / len(daily_revenue), 2) if daily_revenue else 0,
        "trend": "up" if forecasts and forecasts[-1] > forecasts[0] else "down",
        "daily_forecasts": forecast_data,
    }


# ── Demand Forecast (per product) ──────────────────────

async def forecast_product_demand(
    db: AsyncSession,
    product_id: UUID,
    lookback_days: int = 90,
    forecast_days: int = 30,
):
    """Forecast demand (units sold) for a specific product."""
    since = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    
    result = await db.execute(
        text("""
            SELECT DATE(o.created_at) as day, COALESCE(SUM(oi.quantity), 0) as qty
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE oi.product_id = :pid AND o.created_at >= :since AND o.status != 'cancelled'
            GROUP BY DATE(o.created_at)
            ORDER BY day
        """),
        {"pid": str(product_id), "since": since},
    )
    rows = result.fetchall()
    
    daily_qty = [float(r[1]) for r in rows]
    
    forecasts = forecast_next(daily_qty, forecast_days)
    bounds = confidence_bounds(daily_qty, forecasts)
    
    return {
        "product_id": str(product_id),
        "model": "linear_trend_ema_blend",
        "total_predicted_units": round(sum(forecasts)),
        "avg_daily_units": round(sum(forecasts) / len(forecasts), 1) if forecasts else 0,
        "historical_avg": round(sum(daily_qty) / len(daily_qty), 1) if daily_qty else 0,
        "daily_forecasts": [
            {
                "day": i + 1, "predicted_units": f,
                "lower_bound": lo, "upper_bound": hi,
            }
            for i, (f, (lo, hi)) in enumerate(zip(forecasts, bounds))
        ],
    }


# ── Stockout Prediction ────────────────────────────────

async def predict_stockouts(db: AsyncSession, lookback_days: int = 30):
    """Predict which products will run out of stock and when."""
    since = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    
    # Get all active products with stock
    products_result = await db.execute(
        select(Product).where(Product.is_active == True)
    )
    products = products_result.scalars().all()
    
    at_risk = []
    for product in products:
        # Get daily sales over lookback period
        result = await db.execute(
            text("""
                SELECT COALESCE(SUM(oi.quantity), 0) as total_sold
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE oi.product_id = :pid AND o.created_at >= :since AND o.status != 'cancelled'
            """),
            {"pid": str(product.id), "since": since},
        )
        total_sold = float(result.scalar() or 0)
        avg_daily = total_sold / lookback_days if lookback_days > 0 else 0
        
        if avg_daily > 0:
            days_until_stockout = product.stock_quantity / avg_daily
        else:
            days_until_stockout = float("inf")
        
        if days_until_stockout <= 30:  # At risk within 30 days
            at_risk.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "brand": product.brand,
                "current_stock": product.stock_quantity,
                "avg_daily_sales": round(avg_daily, 1),
                "days_until_stockout": round(days_until_stockout, 1),
                "predicted_stockout_date": (
                    datetime.now(timezone.utc) + timedelta(days=days_until_stockout)
                ).date().isoformat(),
                "risk_level": "critical" if days_until_stockout <= 7 else "high" if days_until_stockout <= 14 else "medium",
                "recommended_reorder_qty": round(avg_daily * 30),  # 30-day buffer
            })
    
    at_risk.sort(key=lambda x: x["days_until_stockout"])
    
    return {
        "total_at_risk": len(at_risk),
        "critical": len([x for x in at_risk if x["risk_level"] == "critical"]),
        "high": len([x for x in at_risk if x["risk_level"] == "high"]),
        "medium": len([x for x in at_risk if x["risk_level"] == "medium"]),
        "products": at_risk[:50],
    }


# ── Delivery Delay Prediction ──────────────────────────

async def predict_delivery_delays(db: AsyncSession, lookback_days: int = 60):
    """Analyze delivery performance and predict delays."""
    since = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    
    result = await db.execute(
        text("""
            SELECT
                d.id,
                EXTRACT(EPOCH FROM (d.actual_delivery_time - d.created_at)) / 3600 as actual_hours,
                EXTRACT(EPOCH FROM (d.estimated_delivery_time - d.created_at)) / 3600 as estimated_hours,
                d.distance_km
            FROM deliveries d
            WHERE d.actual_delivery_time IS NOT NULL
                AND d.created_at >= :since
        """),
        {"since": since},
    )
    rows = result.fetchall()
    
    if not rows:
        return {
            "total_analyzed": 0,
            "avg_delay_hours": 0,
            "on_time_rate": 100,
            "delayed_deliveries": 0,
        }
    
    delays = []
    on_time = 0
    for row in rows:
        actual = float(row[1]) if row[1] else 0
        estimated = float(row[2]) if row[2] else 0
        delay = actual - estimated
        delays.append(delay)
        if delay <= 0:
            on_time += 1
    
    avg_delay = sum(delays) / len(delays) if delays else 0
    on_time_pct = (on_time / len(rows) * 100) if rows else 100
    delayed = len([d for d in delays if d > 0])
    
    # Pending deliveries risk analysis
    pending_result = await db.execute(
        select(Delivery).where(Delivery.status.in_(["assigned", "picked_up", "in_transit"]))
    )
    pending = pending_result.scalars().all()
    
    at_risk_deliveries = []
    for d in pending:
        if d.estimated_delivery_time:
            remaining_hours = (d.estimated_delivery_time - datetime.now(timezone.utc)).total_seconds() / 3600
            risk = "low"
            if remaining_hours < 0:
                risk = "overdue"
            elif remaining_hours < 2:
                risk = "high"
            elif remaining_hours < 6:
                risk = "medium"
            
            if risk != "low":
                at_risk_deliveries.append({
                    "delivery_id": str(d.id),
                    "order_id": str(d.order_id),
                    "status": d.status.value,
                    "remaining_hours": round(remaining_hours, 1),
                    "risk_level": risk,
                })
    
    return {
        "period_days": lookback_days,
        "total_analyzed": len(rows),
        "avg_delay_hours": round(avg_delay, 1),
        "on_time_rate": round(on_time_pct, 1),
        "delayed_deliveries": delayed,
        "at_risk_pending": at_risk_deliveries[:20],
    }


# ── Customer Insights ──────────────────────────────────

async def customer_insights(db: AsyncSession, days: int = 90):
    """Customer behavior analytics."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Top customers by revenue
    top_result = await db.execute(
        text("""
            SELECT u.id, u.full_name, u.phone,
                   COUNT(o.id) as order_count,
                   COALESCE(SUM(o.total_amount), 0) as total_spent,
                   MAX(o.created_at) as last_order
            FROM users u
            JOIN orders o ON o.customer_id = u.id
            WHERE o.created_at >= :since AND o.status != 'cancelled'
            GROUP BY u.id, u.full_name, u.phone
            ORDER BY total_spent DESC
            LIMIT 20
        """),
        {"since": since},
    )
    top_customers = [
        {
            "user_id": str(r[0]), "name": r[1], "phone": r[2],
            "orders": int(r[3]), "total_spent": round(float(r[4]), 2),
            "last_order": r[5].isoformat() if r[5] else None,
        }
        for r in top_result.fetchall()
    ]
    
    # Repeat vs one-time
    repeat_result = await db.execute(
        text("""
            SELECT
                COUNT(*) FILTER (WHERE order_count > 1) as repeat_customers,
                COUNT(*) FILTER (WHERE order_count = 1) as one_time_customers
            FROM (
                SELECT customer_id, COUNT(*) as order_count
                FROM orders
                WHERE created_at >= :since AND status != 'cancelled'
                GROUP BY customer_id
            ) sub
        """),
        {"since": since},
    )
    row = repeat_result.fetchone()
    repeat = int(row[0]) if row else 0
    one_time = int(row[1]) if row else 0
    
    return {
        "period_days": days,
        "top_customers": top_customers,
        "repeat_customers": repeat,
        "one_time_customers": one_time,
        "repeat_rate": round((repeat / (repeat + one_time) * 100) if (repeat + one_time) > 0 else 0, 1),
    }


# ── Recommendations Engine ─────────────────────────────

async def generate_recommendations(db: AsyncSession) -> list[dict]:
    """
    Generate actionable recommendations based on current platform data.
    Returns a list of recommendation dicts.
    """
    recs = []
    now = datetime.now(timezone.utc)
    
    # 1. Low stock alerts
    low_stock_result = await db.execute(
        select(func.count(Product.id)).where(
            Product.is_active == True, Product.stock_quantity <= 5
        )
    )
    low_stock_count = low_stock_result.scalar() or 0
    if low_stock_count > 0:
        recs.append({
            "type": "inventory",
            "severity": "high",
            "title": f"{low_stock_count} products critically low on stock",
            "description": "Products with ≤5 units remaining. Contact suppliers to restock.",
            "action": "View low-stock products",
            "action_url": "/admin/inventory?filter=low-stock",
        })
    
    # 2. Pending supplier verifications
    pending = (await db.execute(
        select(func.count(Supplier.id)).where(Supplier.is_verified == False)
    )).scalar() or 0
    if pending > 0:
        recs.append({
            "type": "suppliers",
            "severity": "medium",
            "title": f"{pending} suppliers awaiting verification",
            "description": "Unverified suppliers cannot sell. Review pending KYC approvals.",
            "action": "Review pending suppliers",
            "action_url": "/admin/suppliers?filter=pending",
        })
    
    # 3. Stale orders (processing > 48h)
    stale = (await db.execute(
        select(func.count(Order.id)).where(
            Order.status == OrderStatus.PROCESSING,
            Order.updated_at <= now - timedelta(hours=48),
        )
    )).scalar() or 0
    if stale > 0:
        recs.append({
            "type": "orders",
            "severity": "high",
            "title": f"{stale} orders stuck in processing > 48hrs",
            "description": "Orders that haven't progressed may need manual intervention.",
            "action": "View stale orders",
            "action_url": "/admin/orders?status=processing",
        })
    
    # 4. Revenue trend
    rev_7d = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= now - timedelta(days=7),
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    rev_prev_7d = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= now - timedelta(days=14),
            Order.created_at < now - timedelta(days=7),
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    
    if rev_prev_7d > 0:
        change = ((rev_7d - rev_prev_7d) / rev_prev_7d) * 100
        if change < -10:
            recs.append({
                "type": "revenue",
                "severity": "high",
                "title": f"Revenue down {abs(round(change, 1))}% WoW",
                "description": f"₹{round(rev_7d, 2):,} this week vs ₹{round(rev_prev_7d, 2):,} last week.",
                "action": "View analytics",
                "action_url": "/admin/analytics",
            })
        elif change > 20:
            recs.append({
                "type": "revenue",
                "severity": "info",
                "title": f"Revenue up {round(change, 1)}% WoW 🎉",
                "description": f"₹{round(rev_7d, 2):,} this week — growth accelerating.",
                "action": "View analytics",
                "action_url": "/admin/analytics",
            })
    
    # 5. Unread alerts
    unread = (await db.execute(
        select(func.count(SystemAlert.id)).where(SystemAlert.is_read == False)
    )).scalar() or 0
    if unread > 0:
        recs.append({
            "type": "system",
            "severity": "medium" if unread < 10 else "high",
            "title": f"{unread} unread system alerts",
            "description": "Review system notifications for potential issues.",
            "action": "View alerts",
            "action_url": "/admin/security",
        })
    
    return recs
