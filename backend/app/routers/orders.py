"""Order management endpoints."""

import random
import string
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, OrderPriority
from app.models.product import Product
from app.models.supplier import Supplier
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse

router = APIRouter()


def generate_order_number() -> str:
    """Generate unique order number like NRM-2026-A3X7K."""
    year = datetime.now().year
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"NRM-{year}-{suffix}"


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new order.

    Handles multi-supplier splitting automatically:
    - Groups items by supplier
    - Assigns sub-order numbers per supplier
    - Calculates delivery fees and platform commission
    """
    # Validate products and calculate totals
    order_items = []
    subtotal = 0.0
    supplier_groups: dict[UUID, list] = {}

    for item_data in data.items:
        result = await db.execute(
            select(Product).where(
                Product.id == item_data.product_id, Product.is_active
            )
        )
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item_data.product_id} not found",
            )

        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock_quantity}",
            )

        if item_data.quantity < product.min_order_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum order for {product.name} is {product.min_order_quantity}",
            )

        item_total = product.price * item_data.quantity
        subtotal += item_total

        # Group by supplier for sub-order splitting
        if product.supplier_id not in supplier_groups:
            supplier_groups[product.supplier_id] = []
        supplier_groups[product.supplier_id].append(
            (product, item_data.quantity, item_total)
        )

    # Calculate fees
    delivery_fee = _calculate_delivery_fee(subtotal, data.priority)
    platform_fee = round(subtotal * 0.035, 2)  # 3.5% commission
    total_amount = subtotal + delivery_fee + platform_fee

    # Create order
    order = Order(
        order_number=generate_order_number(),
        customer_id=current_user["user_id"],
        delivery_address=data.delivery_address,
        delivery_city=data.delivery_city,
        delivery_pincode=data.delivery_pincode,
        delivery_lat=data.delivery_lat,
        delivery_lng=data.delivery_lng,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        platform_fee=platform_fee,
        total_amount=total_amount,
        priority=OrderPriority(data.priority),
        scheduled_date=data.scheduled_date,
        payment_method=data.payment_method,
        notes=data.notes,
    )
    db.add(order)
    await db.flush()

    # Create order items with sub-order numbers
    sub_order_idx = 1
    for supplier_id, items in supplier_groups.items():
        sub_order_num = f"{order.order_number}-S{sub_order_idx}"
        for product, quantity, total_price in items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                supplier_id=supplier_id,
                quantity=quantity,
                unit_price=product.price,
                total_price=total_price,
                sub_order_number=sub_order_num,
            )
            db.add(order_item)

            # Reduce stock
            product.stock_quantity -= quantity

        sub_order_idx += 1

    await db.flush()

    # Reload with items
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    order = result.scalar_one()
    return OrderResponse.model_validate(order)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List orders for the current user."""
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_id == current_user["user_id"])
    )

    if status:
        query = query.where(Order.status == OrderStatus(status))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Order.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size)

    result = await db.execute(query)
    orders = result.scalars().unique().all()

    return OrderListResponse(
        orders=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get order details."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify ownership or admin
    if (
        str(order.customer_id) != current_user["user_id"]
        and current_user["role"] != "admin"
    ):
        raise HTTPException(status_code=403, detail="Not authorized")

    return OrderResponse.model_validate(order)


@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel an order (only if status is PENDING or CONFIRMED)."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if str(order.customer_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order in {order.status.value} status",
        )

    # Restore stock
    for item in order.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one()
        product.stock_quantity += item.quantity

    order.status = OrderStatus.CANCELLED
    return {"message": "Order cancelled successfully", "order_number": order.order_number}


def _calculate_delivery_fee(subtotal: float, priority: str) -> float:
    """Calculate delivery fee based on order value and priority."""
    if subtotal < 5000:
        base_fee = 300.0
    elif subtotal < 25000:
        base_fee = 600.0
    elif subtotal < 100000:
        base_fee = 1000.0
    else:
        base_fee = 1500.0

    surcharge = {
        "standard": 0,
        "express": 500,
        "urgent": 1000,
        "scheduled": 0,
    }
    return base_fee + surcharge.get(priority, 0)
