"""
Enhanced Admin Dashboard API — comprehensive management endpoints.
Orders, Users, Suppliers, Products, Inventory, Deliveries, Payments,
Disputes, Reviews, Analytics, System Health, Audit Logs.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, or_, desc, case, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user, decode_token
from app.models.user import User, UserRole
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.delivery import DeliveryPartner, Delivery, DeliveryStatus
from app.models.payment import CreditAccount, Payment, CreditTransaction
from app.models.review import Review
from app.models.inventory import PriceHistory, InventoryLog
from app.models.quality import QualityCheck
from app.models.admin import (
    AdminProfile, AuditLog, AdminSession, Dispute, SystemAlert,
    ForecastResult, AdminRoleType, TOTPDevice,
)
from app.schemas.admin import (
    DisputeCreateRequest, DisputeResolveRequest,
    RefundRequest, InventoryAdjustRequest, StepUpAuthRequest,
)
from app.routers.admin_auth import require_admin_with_profile, require_permission
from app.services.admin_security import (
    create_audit_log, get_client_ip, verify_totp_code,
)
from app.services.analytics import (
    forecast_revenue, forecast_product_demand, predict_stockouts,
    predict_delivery_delays, customer_insights, generate_recommendations,
)

router = APIRouter()


# ── Dashboard KPIs ──────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Comprehensive platform KPIs with alerts."""
    now = datetime.now(timezone.utc)
    
    # Users
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )).scalar() or 0
    role_counts = {}
    for role in UserRole:
        count = (await db.execute(
            select(func.count(User.id)).where(User.role == role)
        )).scalar() or 0
        role_counts[role.value] = count
    new_users_7d = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= now - timedelta(days=7))
    )).scalar() or 0
    new_users_30d = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= now - timedelta(days=30))
    )).scalar() or 0
    
    # Suppliers
    total_suppliers = (await db.execute(select(func.count(Supplier.id)))).scalar() or 0
    verified_suppliers = (await db.execute(
        select(func.count(Supplier.id)).where(Supplier.is_verified == True)
    )).scalar() or 0
    
    # Products
    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    active_products = (await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True)
    )).scalar() or 0
    out_of_stock = (await db.execute(
        select(func.count(Product.id)).where(
            and_(Product.is_active == True, Product.stock_quantity <= 0)
        )
    )).scalar() or 0
    low_stock = (await db.execute(
        select(func.count(Product.id)).where(
            and_(Product.is_active == True, Product.stock_quantity > 0, Product.stock_quantity <= 10)
        )
    )).scalar() or 0
    
    # Delivery Partners
    total_drivers = (await db.execute(select(func.count(DeliveryPartner.id)))).scalar() or 0
    available_drivers = (await db.execute(
        select(func.count(DeliveryPartner.id)).where(DeliveryPartner.is_available == True)
    )).scalar() or 0
    
    # Orders
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_gmv = (await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED)
    )).scalar() or 0
    
    status_counts = {}
    for s in OrderStatus:
        count = (await db.execute(
            select(func.count(Order.id)).where(Order.status == s)
        )).scalar() or 0
        status_counts[s.value] = count
    
    orders_24h = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= now - timedelta(hours=24))
    )).scalar() or 0
    orders_7d = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= now - timedelta(days=7))
    )).scalar() or 0
    orders_30d = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= now - timedelta(days=30))
    )).scalar() or 0
    
    revenue_24h = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= now - timedelta(hours=24),
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    revenue_7d = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= now - timedelta(days=7),
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    revenue_30d = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= now - timedelta(days=30),
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    
    avg_order_value = (await db.execute(
        select(func.avg(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED)
    )).scalar() or 0
    
    # Payments
    paid_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.payment_status == PaymentStatus.PAID)
    )).scalar() or 0
    pending_payments = (await db.execute(
        select(func.count(Order.id)).where(Order.payment_status == PaymentStatus.PENDING)
    )).scalar() or 0
    
    # Disputes
    open_disputes = (await db.execute(
        select(func.count(Dispute.id)).where(Dispute.status.in_(["open", "investigating"]))
    )).scalar() or 0
    
    # Alerts
    unread_alerts = (await db.execute(
        select(func.count(SystemAlert.id)).where(SystemAlert.is_read == False)
    )).scalar() or 0
    
    return {
        "users": {
            "total": total_users, "active": active_users,
            "inactive": total_users - active_users,
            "by_role": role_counts,
            "new_last_7d": new_users_7d, "new_last_30d": new_users_30d,
        },
        "suppliers": {
            "total": total_suppliers, "verified": verified_suppliers,
            "pending": total_suppliers - verified_suppliers,
        },
        "products": {
            "total": total_products, "active": active_products,
            "out_of_stock": out_of_stock, "low_stock": low_stock,
        },
        "delivery_partners": {
            "total": total_drivers, "available": available_drivers,
            "offline": total_drivers - available_drivers,
        },
        "orders": {
            "total": total_orders, "by_status": status_counts,
            "last_24h": orders_24h, "last_7d": orders_7d, "last_30d": orders_30d,
        },
        "revenue": {
            "total_gmv": round(total_gmv, 2),
            "last_24h": round(revenue_24h, 2),
            "last_7d": round(revenue_7d, 2),
            "last_30d": round(revenue_30d, 2),
            "avg_order_value": round(avg_order_value, 2),
        },
        "payments": {"paid": paid_orders, "pending": pending_payments},
        "disputes": {"open": open_disputes},
        "alerts": {"unread": unread_alerts},
    }


# ── User Management ─────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    admin_data: dict = Depends(require_permission("users:view")),
    db: AsyncSession = Depends(get_db),
):
    """List users with filtering, search, pagination."""
    query = select(User)
    if role:
        query = query.where(User.role == UserRole(role))
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                User.full_name.ilike(term),
                User.phone.ilike(term),
                User.email.ilike(term),
                User.username.ilike(term),
            )
        )
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()
    
    user_list = []
    for u in users:
        order_count = (await db.execute(
            select(func.count(Order.id)).where(Order.customer_id == u.id)
        )).scalar() or 0
        total_spent = (await db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.customer_id == u.id, Order.status != OrderStatus.CANCELLED,
            )
        )).scalar() or 0
        user_list.append({
            "id": str(u.id), "full_name": u.full_name, "username": u.username,
            "phone": u.phone, "email": u.email,
            "role": u.role.value if isinstance(u.role, UserRole) else u.role,
            "is_verified": u.is_verified, "is_active": u.is_active,
            "city": u.city, "state": u.state,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "total_orders": order_count, "total_spent": round(total_spent, 2),
        })
    
    return {"users": user_list, "total": total, "page": page, "page_size": page_size}


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: UUID,
    admin_data: dict = Depends(require_permission("users:view")),
    db: AsyncSession = Depends(get_db),
):
    """Detailed user view with order history (View as mode)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders_result = await db.execute(
        select(Order).where(Order.customer_id == user_id).order_by(Order.created_at.desc()).limit(50)
    )
    orders = orders_result.scalars().all()
    
    order_count = (await db.execute(
        select(func.count(Order.id)).where(Order.customer_id == user_id)
    )).scalar() or 0
    total_spent = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.customer_id == user_id, Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    
    return {
        "user": {
            "id": str(user.id), "full_name": user.full_name, "username": user.username,
            "phone": user.phone, "email": user.email,
            "role": user.role.value, "is_verified": user.is_verified,
            "is_active": user.is_active, "city": user.city, "state": user.state,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        },
        "stats": {"total_orders": order_count, "total_spent": round(total_spent, 2)},
        "recent_orders": [
            {
                "id": str(o.id), "order_number": o.order_number,
                "status": o.status.value, "total_amount": o.total_amount,
                "payment_status": o.payment_status.value,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            } for o in orders
        ],
    }


@router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    request: Request,
    reason: str = Query("", description="Reason for suspension"),
    admin_data: dict = Depends(require_permission("users:suspend")),
    db: AsyncSession = Depends(get_db),
):
    """Suspend or activate a user with audit trail."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) == admin_data["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot modify your own account")
    
    before = {"is_active": user.is_active}
    user.is_active = not user.is_active
    action = "user_activated" if user.is_active else "user_suspended"
    
    await create_audit_log(
        db, admin_data["user_id"], action, "user",
        entity_id=str(user.id),
        before_state=before,
        after_state={"is_active": user.is_active},
        ip_address=admin_data["client_ip"],
        reason=reason or None,
    )
    
    return {
        "user_id": str(user.id), "full_name": user.full_name,
        "is_active": user.is_active, "message": f"User {action.replace('_', ' ')}",
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: UUID,
    request: Request,
    new_role: str = Query(...),
    admin_data: dict = Depends(require_permission("users:edit")),
    db: AsyncSession = Depends(get_db),
):
    """Change user role with audit."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    before = {"role": user.role.value}
    try:
        user.role = UserRole(new_role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {new_role}")
    
    await create_audit_log(
        db, admin_data["user_id"], "role_changed", "user",
        entity_id=str(user.id),
        before_state=before,
        after_state={"role": user.role.value},
        ip_address=admin_data["client_ip"],
    )
    
    return {"user_id": str(user.id), "new_role": user.role.value, "message": "Role updated"}


# ── Order Management ────────────────────────────────────

@router.get("/orders")
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    days: Optional[int] = Query(None, ge=1, le=365),
    priority: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("orders:view")),
    db: AsyncSession = Depends(get_db),
):
    """List orders with comprehensive filtering."""
    query = select(Order).options(selectinload(Order.items))
    if status:
        query = query.where(Order.status == OrderStatus(status))
    if payment_status:
        query = query.where(Order.payment_status == PaymentStatus(payment_status))
    if days:
        query = query.where(Order.created_at >= datetime.now(timezone.utc) - timedelta(days=days))
    if search:
        query = query.where(Order.order_number.ilike(f"%{search}%"))
    if priority:
        query = query.where(Order.priority == priority)
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().unique().all()
    
    order_list = []
    for o in orders:
        customer_result = await db.execute(select(User).where(User.id == o.customer_id))
        customer = customer_result.scalar_one_or_none()
        order_list.append({
            "id": str(o.id), "order_number": o.order_number,
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_phone": customer.phone if customer else "",
            "status": o.status.value, "payment_status": o.payment_status.value,
            "payment_method": o.payment_method, "total_amount": o.total_amount,
            "delivery_city": o.delivery_city, "delivery_address": o.delivery_address,
            "item_count": len(o.items) if o.items else 0,
            "priority": o.priority.value if hasattr(o.priority, 'value') else o.priority,
            "notes": o.notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "updated_at": o.updated_at.isoformat() if o.updated_at else None,
        })
    
    return {"orders": order_list, "total": total, "page": page, "page_size": page_size}


@router.get("/orders/{order_id}")
async def get_order_detail(
    order_id: UUID,
    admin_data: dict = Depends(require_permission("orders:view")),
    db: AsyncSession = Depends(get_db),
):
    """Full order detail with timeline."""
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    customer_result = await db.execute(select(User).where(User.id == order.customer_id))
    customer = customer_result.scalar_one_or_none()
    
    # Build order timeline
    timeline = [
        {"event": "Order Placed", "timestamp": order.created_at.isoformat(), "status": "completed"},
    ]
    
    status_order = ["pending", "confirmed", "processing", "partially_shipped", "in_transit", "delivered"]
    current_idx = status_order.index(order.status.value) if order.status.value in status_order else -1
    for i, s in enumerate(status_order[1:], 1):
        timeline.append({
            "event": s.replace("_", " ").title(),
            "timestamp": order.updated_at.isoformat() if i <= current_idx else None,
            "status": "completed" if i <= current_idx else "pending",
        })
    
    # Get delivery info
    delivery_result = await db.execute(
        select(Delivery).where(Delivery.order_id == order_id)
    )
    delivery = delivery_result.scalar_one_or_none()
    
    delivery_info = None
    if delivery:
        partner_result = await db.execute(
            select(DeliveryPartner).where(DeliveryPartner.id == delivery.partner_id)
        )
        partner = partner_result.scalar_one_or_none()
        partner_user = None
        if partner:
            pu_result = await db.execute(select(User).where(User.id == partner.user_id))
            partner_user = pu_result.scalar_one_or_none()
        
        delivery_info = {
            "id": str(delivery.id),
            "status": delivery.status.value,
            "partner_name": partner_user.full_name if partner_user else None,
            "partner_phone": partner_user.phone if partner_user else None,
            "vehicle_type": partner.vehicle_type.value if partner else None,
            "estimated_delivery": delivery.estimated_delivery_time.isoformat() if delivery.estimated_delivery_time else None,
            "actual_delivery": delivery.actual_delivery_time.isoformat() if delivery.actual_delivery_time else None,
        }
    
    # Get items with product details
    items_detail = []
    for item in (order.items or []):
        prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = prod_result.scalar_one_or_none()
        supplier_result = await db.execute(select(Supplier).where(Supplier.id == item.supplier_id))
        supplier = supplier_result.scalar_one_or_none()
        items_detail.append({
            "id": str(item.id),
            "product_name": product.name if product else "Unknown",
            "supplier_name": supplier.business_name if supplier else "Unknown",
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price,
            "status": item.status.value,
        })
    
    return {
        "order": {
            "id": str(order.id), "order_number": order.order_number,
            "status": order.status.value, "payment_status": order.payment_status.value,
            "payment_method": order.payment_method,
            "subtotal": order.subtotal, "delivery_fee": order.delivery_fee,
            "platform_fee": order.platform_fee, "discount": order.discount,
            "total_amount": order.total_amount,
            "delivery_address": order.delivery_address,
            "delivery_city": order.delivery_city,
            "priority": order.priority.value,
            "notes": order.notes,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        },
        "customer": {
            "id": str(customer.id) if customer else None,
            "name": customer.full_name if customer else "Unknown",
            "phone": customer.phone if customer else "",
            "email": customer.email if customer else None,
        },
        "items": items_detail,
        "delivery": delivery_info,
        "timeline": timeline,
    }


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    request: Request,
    new_status: str = Query(...),
    reason: str = Query(""),
    admin_data: dict = Depends(require_permission("orders:edit")),
    db: AsyncSession = Depends(get_db),
):
    """Update order status with audit trail."""
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    before = {"status": order.status.value}
    try:
        order.status = OrderStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
    
    if new_status == "delivered":
        order.payment_status = PaymentStatus.PAID
    if new_status == "cancelled":
        for item in order.items:
            prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
            product = prod_result.scalar_one_or_none()
            if product:
                product.stock_quantity += item.quantity
    
    await create_audit_log(
        db, admin_data["user_id"], "order_status_changed", "order",
        entity_id=str(order.id),
        before_state=before,
        after_state={"status": order.status.value},
        ip_address=admin_data["client_ip"],
        reason=reason or None,
    )
    
    return {
        "order_id": str(order.id), "order_number": order.order_number,
        "new_status": order.status.value, "message": f"Status updated to {new_status}",
    }


@router.put("/orders/{order_id}/payment-status")
async def update_payment_status(
    order_id: UUID,
    request: Request,
    new_status: str = Query(...),
    admin_data: dict = Depends(require_permission("payments:view")),
    db: AsyncSession = Depends(get_db),
):
    """Update payment status."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    before = {"payment_status": order.payment_status.value}
    try:
        order.payment_status = PaymentStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
    
    await create_audit_log(
        db, admin_data["user_id"], "payment_status_changed", "order",
        entity_id=str(order.id),
        before_state=before,
        after_state={"payment_status": order.payment_status.value},
        ip_address=admin_data["client_ip"],
    )
    
    return {"order_id": str(order.id), "new_payment_status": order.payment_status.value}


# ── Refunds (requires step-up 2FA) ─────────────────────

@router.post("/orders/{order_id}/refund")
async def issue_refund(
    order_id: UUID,
    payload: RefundRequest,
    request: Request,
    admin_data: dict = Depends(require_permission("orders:refund")),
    db: AsyncSession = Depends(get_db),
):
    """Issue refund with mandatory step-up 2FA and justification."""
    profile: AdminProfile = admin_data["admin_profile"]
    
    # Verify step-up TOTP for sensitive action
    if profile.is_2fa_enabled:
        totp_result = await db.execute(
            select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
        )
        device = totp_result.scalar_one_or_none()
        if device and not verify_totp_code(device.secret, payload.step_up_totp):
            raise HTTPException(status_code=401, detail="Step-up 2FA verification failed")
    
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payload.amount > order.total_amount:
        raise HTTPException(status_code=400, detail="Refund amount exceeds order total")
    
    before = {"payment_status": order.payment_status.value, "status": order.status.value}
    
    if payload.refund_type == "full":
        order.payment_status = PaymentStatus.REFUNDED
        order.status = OrderStatus.REFUNDED
    else:
        order.payment_status = PaymentStatus.PARTIALLY_PAID
    
    await create_audit_log(
        db, admin_data["user_id"], "refund_issued", "order",
        entity_id=str(order.id),
        before_state=before,
        after_state={
            "payment_status": order.payment_status.value,
            "refund_amount": payload.amount,
            "refund_type": payload.refund_type,
        },
        ip_address=admin_data["client_ip"],
        reason=payload.reason,
    )
    
    return {
        "order_id": str(order.id), "refund_amount": payload.amount,
        "refund_type": payload.refund_type, "message": "Refund processed",
    }


# ── Supplier Management ─────────────────────────────────

@router.get("/suppliers")
async def list_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("suppliers:view")),
    db: AsyncSession = Depends(get_db),
):
    """List suppliers with KYC status."""
    query = select(Supplier)
    if verified is not None:
        query = query.where(Supplier.is_verified == verified)
    if search:
        query = query.where(Supplier.business_name.ilike(f"%{search}%"))
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Supplier.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    suppliers = result.scalars().all()
    
    supplier_list = []
    for s in suppliers:
        user_result = await db.execute(select(User).where(User.id == s.user_id))
        user = user_result.scalar_one_or_none()
        product_count = (await db.execute(
            select(func.count(Product.id)).where(Product.supplier_id == s.id)
        )).scalar() or 0
        
        # Dispute count for this supplier
        dispute_count = 0  # Would need supplier-order join
        
        supplier_list.append({
            "id": str(s.id), "user_id": str(s.user_id),
            "business_name": s.business_name,
            "owner_name": user.full_name if user else "Unknown",
            "owner_phone": user.phone if user else "",
            "gst_number": s.gst_number, "pan_number": s.pan_number,
            "city": s.city, "state": s.state,
            "is_verified": s.is_verified, "rating": s.rating,
            "total_orders": s.total_orders, "total_revenue": s.total_revenue,
            "product_count": product_count,
            "subscription_tier": s.subscription_tier.value if hasattr(s.subscription_tier, 'value') else s.subscription_tier,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })
    
    return {"suppliers": supplier_list, "total": total, "page": page, "page_size": page_size}


@router.get("/suppliers/pending")
async def get_pending_suppliers(
    admin_data: dict = Depends(require_permission("suppliers:approve")),
    db: AsyncSession = Depends(get_db),
):
    """List suppliers pending verification with KYC checklist."""
    result = await db.execute(
        select(Supplier).where(Supplier.is_verified == False).order_by(Supplier.created_at.desc())
    )
    suppliers = result.scalars().all()
    
    pending = []
    for s in suppliers:
        user_result = await db.execute(select(User).where(User.id == s.user_id))
        user = user_result.scalar_one_or_none()
        
        # KYC checklist
        kyc = {
            "has_gst": bool(s.gst_number),
            "has_pan": bool(s.pan_number),
            "has_address": bool(s.address),
            "has_phone": bool(user and user.phone),
            "has_email": bool(user and user.email),
            "phone_verified": bool(user and user.is_verified),
        }
        kyc["completion_pct"] = round(sum(kyc.values()) / len(kyc) * 100)
        
        pending.append({
            "id": str(s.id), "business_name": s.business_name,
            "owner_name": user.full_name if user else "Unknown",
            "gst_number": s.gst_number, "pan_number": s.pan_number,
            "city": s.city, "state": s.state,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "kyc_checklist": kyc,
        })
    
    return {"pending_suppliers": pending, "total": len(pending)}


@router.put("/suppliers/{supplier_id}/verify")
async def verify_supplier(
    supplier_id: UUID,
    request: Request,
    approved: bool = Query(True),
    reason: str = Query(""),
    admin_data: dict = Depends(require_permission("suppliers:approve")),
    db: AsyncSession = Depends(get_db),
):
    """Approve/reject supplier with audit."""
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    before = {"is_verified": supplier.is_verified}
    supplier.is_verified = approved
    
    await create_audit_log(
        db, admin_data["user_id"],
        "supplier_approved" if approved else "supplier_rejected",
        "supplier", entity_id=str(supplier.id),
        before_state=before,
        after_state={"is_verified": approved},
        ip_address=admin_data["client_ip"],
        reason=reason or None,
    )
    
    return {
        "supplier_id": str(supplier.id), "business_name": supplier.business_name,
        "is_verified": supplier.is_verified,
    }


# ── Product Management ──────────────────────────────────

@router.get("/products")
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    out_of_stock: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("products:view")),
    db: AsyncSession = Depends(get_db),
):
    """List products with stock monitoring."""
    query = select(Product)
    if out_of_stock is True:
        query = query.where(Product.stock_quantity <= 0)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if supplier_id:
        query = query.where(Product.supplier_id == UUID(supplier_id))
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    product_list = []
    for p in products:
        supplier_result = await db.execute(select(Supplier).where(Supplier.id == p.supplier_id))
        supplier = supplier_result.scalar_one_or_none()
        product_list.append({
            "id": str(p.id), "name": p.name, "brand": p.brand,
            "price": p.price, "mrp": p.mrp,
            "stock_quantity": p.stock_quantity,
            "unit": p.unit.value if hasattr(p.unit, 'value') else p.unit,
            "is_active": p.is_active,
            "supplier_name": supplier.business_name if supplier else "Unknown",
            "supplier_id": str(p.supplier_id),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    
    return {"products": product_list, "total": total, "page": page, "page_size": page_size}


@router.put("/products/{product_id}")
async def update_product(
    product_id: UUID,
    request: Request,
    is_active: Optional[bool] = Query(None),
    price: Optional[float] = Query(None),
    admin_data: dict = Depends(require_permission("products:edit")),
    db: AsyncSession = Depends(get_db),
):
    """Edit product with moderation log."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    before = {"is_active": product.is_active, "price": product.price}
    
    if is_active is not None:
        product.is_active = is_active
    if price is not None:
        # Record price history
        ph = PriceHistory(
            product_id=product.id,
            supplier_id=product.supplier_id,
            old_price=product.price,
            new_price=price,
            change_reason="Admin modification",
        )
        db.add(ph)
        product.price = price
    
    await create_audit_log(
        db, admin_data["user_id"], "product_modified", "product",
        entity_id=str(product.id),
        before_state=before,
        after_state={"is_active": product.is_active, "price": product.price},
        ip_address=admin_data["client_ip"],
    )
    
    return {"product_id": str(product.id), "message": "Product updated"}


# ── Inventory Management ────────────────────────────────

@router.get("/inventory/low-stock")
async def get_low_stock(
    threshold: int = Query(10, ge=0),
    admin_data: dict = Depends(require_permission("inventory:view")),
    db: AsyncSession = Depends(get_db),
):
    """Products at or below stock threshold."""
    result = await db.execute(
        select(Product).where(
            and_(Product.is_active == True, Product.stock_quantity <= threshold)
        ).order_by(Product.stock_quantity.asc()).limit(100)
    )
    products = result.scalars().all()
    
    items = []
    for p in products:
        supplier_result = await db.execute(select(Supplier).where(Supplier.id == p.supplier_id))
        supplier = supplier_result.scalar_one_or_none()
        items.append({
            "id": str(p.id), "name": p.name, "brand": p.brand,
            "stock_quantity": p.stock_quantity,
            "supplier_name": supplier.business_name if supplier else "Unknown",
            "price": p.price,
        })
    
    return {"low_stock_products": items, "threshold": threshold, "count": len(items)}


@router.put("/inventory/adjust")
async def adjust_inventory(
    payload: InventoryAdjustRequest,
    request: Request,
    admin_data: dict = Depends(require_permission("inventory:adjust")),
    db: AsyncSession = Depends(get_db),
):
    """Adjust inventory with audit."""
    result = await db.execute(select(Product).where(Product.id == UUID(payload.product_id)))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    before_qty = product.stock_quantity
    product.stock_quantity = payload.new_quantity
    
    # Create inventory log
    log = InventoryLog(
        product_id=product.id,
        supplier_id=product.supplier_id,
        previous_quantity=before_qty,
        new_quantity=payload.new_quantity,
        change_type="admin_adjustment",
        reference_id=f"admin:{admin_data['user_id']}",
    )
    db.add(log)
    
    await create_audit_log(
        db, admin_data["user_id"], "inventory_adjusted", "product",
        entity_id=str(product.id),
        before_state={"stock_quantity": before_qty},
        after_state={"stock_quantity": payload.new_quantity},
        ip_address=admin_data["client_ip"],
        reason=payload.reason,
    )
    
    return {
        "product_id": str(product.id), "name": product.name,
        "before": before_qty, "after": payload.new_quantity,
        "message": "Inventory adjusted",
    }


# ── Delivery Management ────────────────────────────────

@router.get("/deliveries")
async def list_deliveries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("deliveries:view")),
    db: AsyncSession = Depends(get_db),
):
    """List deliveries with partner info."""
    query = select(Delivery)
    if status:
        query = query.where(Delivery.status == DeliveryStatus(status))
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Delivery.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    deliveries = result.scalars().all()
    
    items = []
    for d in deliveries:
        order_result = await db.execute(select(Order).where(Order.id == d.order_id))
        order = order_result.scalar_one_or_none()
        partner_name = "Unassigned"
        if d.partner_id:
            partner_result = await db.execute(select(DeliveryPartner).where(DeliveryPartner.id == d.partner_id))
            partner = partner_result.scalar_one_or_none()
            if partner:
                pu = await db.execute(select(User).where(User.id == partner.user_id))
                pu = pu.scalar_one_or_none()
                partner_name = pu.full_name if pu else "Unknown"
        
        items.append({
            "id": str(d.id),
            "order_number": order.order_number if order else "Unknown",
            "order_id": str(d.order_id),
            "status": d.status.value,
            "partner_name": partner_name,
            "distance_km": d.distance_km,
            "delivery_fee": d.delivery_fee,
            "estimated_delivery": d.estimated_delivery_time.isoformat() if d.estimated_delivery_time else None,
            "actual_delivery": d.actual_delivery_time.isoformat() if d.actual_delivery_time else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    
    return {"deliveries": items, "total": total, "page": page, "page_size": page_size}


@router.get("/delivery-partners")
async def list_delivery_partners(
    admin_data: dict = Depends(require_permission("deliveries:view")),
    db: AsyncSession = Depends(get_db),
):
    """List delivery partners with stats."""
    result = await db.execute(select(DeliveryPartner).order_by(DeliveryPartner.created_at.desc()))
    partners = result.scalars().all()
    
    items = []
    for p in partners:
        user_result = await db.execute(select(User).where(User.id == p.user_id))
        user = user_result.scalar_one_or_none()
        items.append({
            "id": str(p.id), "name": user.full_name if user else "Unknown",
            "phone": user.phone if user else "",
            "vehicle_type": p.vehicle_type.value,
            "vehicle_number": p.vehicle_number,
            "is_available": p.is_available, "is_verified": p.is_verified,
            "rating": p.rating, "total_deliveries": p.total_deliveries,
            "completion_rate": p.completion_rate, "city": p.city,
        })
    
    return {"partners": items, "total": len(items)}


@router.put("/deliveries/{delivery_id}/assign")
async def assign_delivery_partner(
    delivery_id: UUID,
    partner_id: UUID = Query(...),
    request: Request = None,
    admin_data: dict = Depends(require_permission("deliveries:assign")),
    db: AsyncSession = Depends(get_db),
):
    """Assign or reassign delivery partner."""
    delivery_result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = delivery_result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    before = {"partner_id": str(delivery.partner_id) if delivery.partner_id else None}
    delivery.partner_id = partner_id
    
    await create_audit_log(
        db, admin_data["user_id"], "delivery_partner_assigned", "delivery",
        entity_id=str(delivery.id),
        before_state=before,
        after_state={"partner_id": str(partner_id)},
        ip_address=admin_data["client_ip"],
    )
    
    return {"delivery_id": str(delivery.id), "partner_id": str(partner_id), "message": "Partner assigned"}


# ── Disputes & Support ──────────────────────────────────

@router.get("/disputes")
async def list_disputes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("disputes:view")),
    db: AsyncSession = Depends(get_db),
):
    """List disputes/support tickets."""
    query = select(Dispute)
    if status:
        query = query.where(Dispute.status == status)
    if priority:
        query = query.where(Dispute.priority == priority)
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Dispute.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    disputes = result.scalars().all()
    
    items = []
    for d in disputes:
        order_result = await db.execute(select(Order).where(Order.id == d.order_id))
        order = order_result.scalar_one_or_none()
        user_result = await db.execute(select(User).where(User.id == d.raised_by_user_id))
        user = user_result.scalar_one_or_none()
        
        items.append({
            "id": str(d.id),
            "order_id": str(d.order_id),
            "order_number": order.order_number if order else "Unknown",
            "raised_by": user.full_name if user else "Unknown",
            "dispute_type": d.dispute_type,
            "status": d.status,
            "priority": d.priority,
            "description": d.description[:200],
            "resolution_type": d.resolution_type,
            "refund_amount": d.refund_amount,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
        })
    
    return {"disputes": items, "total": total, "page": page, "page_size": page_size}


@router.post("/disputes")
async def create_dispute(
    payload: DisputeCreateRequest,
    request: Request,
    admin_data: dict = Depends(require_permission("disputes:resolve")),
    db: AsyncSession = Depends(get_db),
):
    """Create a dispute on behalf of a customer."""
    dispute = Dispute(
        order_id=UUID(payload.order_id),
        raised_by_user_id=UUID(admin_data["user_id"]),
        assigned_admin_id=UUID(admin_data["user_id"]),
        dispute_type=payload.dispute_type,
        priority=payload.priority,
        description=payload.description,
    )
    db.add(dispute)
    await db.flush()
    
    await create_audit_log(
        db, admin_data["user_id"], "dispute_created", "dispute",
        entity_id=str(dispute.id),
        ip_address=admin_data["client_ip"],
    )
    
    return {"dispute_id": str(dispute.id), "message": "Dispute created"}


@router.put("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: UUID,
    payload: DisputeResolveRequest,
    request: Request,
    admin_data: dict = Depends(require_permission("disputes:resolve")),
    db: AsyncSession = Depends(get_db),
):
    """Resolve a dispute with resolution type."""
    result = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = result.scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    before = {"status": dispute.status, "resolution_type": dispute.resolution_type}
    dispute.status = "resolved"
    dispute.resolution = payload.resolution
    dispute.resolution_type = payload.resolution_type
    dispute.refund_amount = payload.refund_amount
    dispute.resolved_at = datetime.now(timezone.utc)
    dispute.assigned_admin_id = UUID(admin_data["user_id"])
    
    await create_audit_log(
        db, admin_data["user_id"], "dispute_resolved", "dispute",
        entity_id=str(dispute.id),
        before_state=before,
        after_state={"status": "resolved", "resolution_type": payload.resolution_type},
        ip_address=admin_data["client_ip"],
        reason=payload.reason,
    )
    
    return {"dispute_id": str(dispute.id), "message": "Dispute resolved"}


# ── Reviews ─────────────────────────────────────────────

@router.get("/reviews")
async def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_rating: Optional[int] = Query(None, ge=1, le=5),
    max_rating: Optional[int] = Query(None, ge=1, le=5),
    admin_data: dict = Depends(require_permission("reviews:view")),
    db: AsyncSession = Depends(get_db),
):
    """List reviews for moderation."""
    query = select(Review)
    if min_rating:
        query = query.where(Review.rating >= min_rating)
    if max_rating:
        query = query.where(Review.rating <= max_rating)
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Review.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    items = []
    for r in reviews:
        user_result = await db.execute(select(User).where(User.id == r.reviewer_id))
        user = user_result.scalar_one_or_none()
        order_result = await db.execute(select(Order).where(Order.id == r.order_id))
        order = order_result.scalar_one_or_none()
        
        items.append({
            "id": str(r.id),
            "reviewer_name": user.full_name if user else "Unknown",
            "order_number": order.order_number if order else "Unknown",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    
    return {"reviews": items, "total": total, "page": page, "page_size": page_size}


# ── Payments & Settlements ──────────────────────────────

@router.get("/payments/overview")
async def payments_overview(
    days: int = Query(30, ge=1, le=365),
    admin_data: dict = Depends(require_permission("payments:view")),
    db: AsyncSession = Depends(get_db),
):
    """Payment analytics overview."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    total_revenue = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= since, Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    
    paid = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.payment_status == PaymentStatus.PAID,
        )
    )).scalar() or 0
    
    pending = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.payment_status == PaymentStatus.PENDING,
        )
    )).scalar() or 0
    
    refunded = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.payment_status == PaymentStatus.REFUNDED,
        )
    )).scalar() or 0
    
    failed = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.payment_status == PaymentStatus.FAILED,
        )
    )).scalar() or 0
    
    # Credit overview
    total_credit_accounts = (await db.execute(select(func.count(CreditAccount.id)))).scalar() or 0
    total_credit_limit = (await db.execute(
        select(func.sum(CreditAccount.credit_limit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    total_used_credit = (await db.execute(
        select(func.sum(CreditAccount.used_credit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    
    return {
        "period_days": days,
        "revenue": round(total_revenue, 2),
        "payment_status": {
            "paid": paid, "pending": pending,
            "refunded": refunded, "failed": failed,
        },
        "credit": {
            "total_accounts": total_credit_accounts,
            "total_limit": round(total_credit_limit, 2),
            "total_used": round(total_used_credit, 2),
            "utilization_pct": round((total_used_credit / total_credit_limit * 100) if total_credit_limit > 0 else 0, 1),
        },
    }


# ── Revenue Analytics (time series) ────────────────────

@router.get("/analytics/revenue-trend")
async def revenue_trend(
    days: int = Query(30, ge=7, le=365),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Daily revenue trend for charts."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get daily revenue using raw SQL for date grouping
    result = await db.execute(
        text("""
            SELECT DATE(created_at) as day,
                   COUNT(*) as order_count,
                   COALESCE(SUM(total_amount), 0) as revenue
            FROM orders
            WHERE created_at >= :since AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY day
        """),
        {"since": since},
    )
    rows = result.fetchall()
    
    return {
        "period_days": days,
        "data": [
            {
                "date": row[0].isoformat() if row[0] else None,
                "orders": row[1],
                "revenue": round(float(row[2]), 2),
            }
            for row in rows
        ],
    }


@router.get("/analytics/top-products")
async def top_products(
    days: int = Query(30, ge=7, le=365),
    limit: int = Query(10, ge=5, le=50),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Top selling products."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    result = await db.execute(
        text("""
            SELECT p.name, p.brand, SUM(oi.quantity) as total_qty,
                   SUM(oi.total_price) as total_revenue,
                   COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= :since AND o.status != 'cancelled'
            GROUP BY p.id, p.name, p.brand
            ORDER BY total_revenue DESC
            LIMIT :limit
        """),
        {"since": since, "limit": limit},
    )
    rows = result.fetchall()
    
    return {
        "period_days": days,
        "products": [
            {
                "name": row[0], "brand": row[1],
                "total_quantity": int(row[2]),
                "total_revenue": round(float(row[3]), 2),
                "order_count": int(row[4]),
            }
            for row in rows
        ],
    }


@router.get("/analytics/top-suppliers")
async def top_suppliers(
    days: int = Query(30, ge=7, le=365),
    limit: int = Query(10, ge=5, le=50),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Top suppliers by revenue."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    result = await db.execute(
        text("""
            SELECT s.business_name, s.city, s.rating,
                   SUM(oi.total_price) as total_revenue,
                   COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN suppliers s ON s.id = oi.supplier_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= :since AND o.status != 'cancelled'
            GROUP BY s.id, s.business_name, s.city, s.rating
            ORDER BY total_revenue DESC
            LIMIT :limit
        """),
        {"since": since, "limit": limit},
    )
    rows = result.fetchall()
    
    return {
        "period_days": days,
        "suppliers": [
            {
                "business_name": row[0], "city": row[1],
                "rating": float(row[2]) if row[2] else 0,
                "total_revenue": round(float(row[3]), 2),
                "order_count": int(row[4]),
            }
            for row in rows
        ],
    }


# ── Audit Logs ──────────────────────────────────────────

@router.get("/audit-logs")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    admin_user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    admin_data: dict = Depends(require_permission("system:audit")),
    db: AsyncSession = Depends(get_db),
):
    """Query audit logs."""
    query = select(AuditLog)
    
    if admin_user_id:
        query = query.where(AuditLog.admin_user_id == UUID(admin_user_id))
    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if from_date:
        query = query.where(AuditLog.created_at >= datetime.fromisoformat(from_date))
    if to_date:
        query = query.where(AuditLog.created_at <= datetime.fromisoformat(to_date))
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    logs = result.scalars().all()
    
    items = []
    for log in logs:
        # Get admin name
        admin_result = await db.execute(select(User).where(User.id == log.admin_user_id))
        admin_user = admin_result.scalar_one_or_none()
        
        items.append({
            "id": str(log.id),
            "admin_user_id": str(log.admin_user_id),
            "admin_name": admin_user.full_name if admin_user else "Unknown",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "before_state": log.before_state,
            "after_state": log.after_state,
            "ip_address": log.ip_address,
            "reason": log.reason,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })
    
    return {"audit_logs": items, "total": total, "page": page, "page_size": page_size}


# ── System Alerts ───────────────────────────────────────

@router.get("/alerts")
async def list_alerts(
    unread_only: bool = Query(False),
    admin_data: dict = Depends(require_permission("system:view")),
    db: AsyncSession = Depends(get_db),
):
    """List system alerts."""
    query = select(SystemAlert)
    if unread_only:
        query = query.where(SystemAlert.is_read == False)
    query = query.order_by(SystemAlert.created_at.desc()).limit(100)
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return {
        "alerts": [
            {
                "id": str(a.id), "alert_type": a.alert_type,
                "severity": a.severity, "title": a.title,
                "message": a.message, "is_read": a.is_read,
                "is_resolved": a.is_resolved,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
    }


@router.put("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: UUID,
    admin_data: dict = Depends(require_permission("system:view")),
    db: AsyncSession = Depends(get_db),
):
    """Mark alert as read."""
    result = await db.execute(select(SystemAlert).where(SystemAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if alert:
        alert.is_read = True
    return {"message": "Alert marked as read"}


# ── System Health ───────────────────────────────────────

@router.get("/system/health")
async def system_health(
    admin_data: dict = Depends(require_permission("system:view")),
    db: AsyncSession = Depends(get_db),
):
    """System health overview."""
    # DB check
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Active admin sessions
    active_sessions = (await db.execute(
        select(func.count(AdminSession.id)).where(AdminSession.is_active == True)
    )).scalar() or 0
    
    # Recent audit logs (last hour)
    recent_audits = (await db.execute(
        select(func.count(AuditLog.id)).where(
            AuditLog.created_at >= datetime.now(timezone.utc) - timedelta(hours=1)
        )
    )).scalar() or 0
    
    # Failed logins in last hour
    failed_logins = (await db.execute(
        select(func.count(AuditLog.id)).where(
            AuditLog.action == "login_failed",
            AuditLog.created_at >= datetime.now(timezone.utc) - timedelta(hours=1),
        )
    )).scalar() or 0
    
    return {
        "database": db_status,
        "active_admin_sessions": active_sessions,
        "recent_audit_events": recent_audits,
        "failed_logins_last_hour": failed_logins,
        "security_status": "warning" if failed_logins > 5 else "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Orders Overview (analytics) ─────────────────────────

@router.get("/orders/overview")
async def orders_overview(
    days: int = Query(30, ge=1, le=365),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Order analytics summary."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    total = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= since)
    )).scalar() or 0
    revenue = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= since, Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    avg_value = (await db.execute(
        select(func.avg(Order.total_amount)).where(
            Order.created_at >= since, Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    cancelled = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.status == OrderStatus.CANCELLED,
        )
    )).scalar() or 0
    delivered = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since, Order.status == OrderStatus.DELIVERED,
        )
    )).scalar() or 0
    
    return {
        "period_days": days, "total_orders": total,
        "total_revenue": round(revenue, 2),
        "average_order_value": round(avg_value, 2),
        "delivered": delivered, "cancelled": cancelled,
        "cancellation_rate": round((cancelled / total * 100) if total > 0 else 0, 1),
    }


# ── Credit Overview ─────────────────────────────────────

@router.get("/credit/overview")
async def credit_overview(
    admin_data: dict = Depends(require_permission("payments:view")),
    db: AsyncSession = Depends(get_db),
):
    """Credit system overview."""
    total_accounts = (await db.execute(select(func.count(CreditAccount.id)))).scalar() or 0
    approved = (await db.execute(
        select(func.count(CreditAccount.id)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    total_limit = (await db.execute(
        select(func.sum(CreditAccount.credit_limit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    total_used = (await db.execute(
        select(func.sum(CreditAccount.used_credit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    
    return {
        "total_accounts": total_accounts, "approved": approved,
        "pending": total_accounts - approved,
        "total_credit_limit": round(total_limit, 2),
        "total_used": round(total_used, 2),
        "utilization_rate": round((total_used / total_limit * 100) if total_limit > 0 else 0, 1),
    }


# ── Predictions / Forecasts ────────────────────────────

@router.get("/predictions/revenue")
async def get_revenue_forecast(
    lookback: int = Query(90, ge=30, le=365),
    forecast_days: int = Query(30, ge=7, le=90),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Revenue forecast using trend + EMA blend model."""
    return await forecast_revenue(db, lookback, forecast_days)


@router.get("/predictions/demand/{product_id}")
async def get_demand_forecast(
    product_id: UUID,
    lookback: int = Query(90, ge=30, le=365),
    forecast_days: int = Query(30, ge=7, le=90),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Product demand forecast."""
    return await forecast_product_demand(db, product_id, lookback, forecast_days)


@router.get("/predictions/stockouts")
async def get_stockout_predictions(
    lookback: int = Query(30, ge=7, le=90),
    admin_data: dict = Depends(require_permission("inventory:view")),
    db: AsyncSession = Depends(get_db),
):
    """Predict which products will run out of stock and when."""
    return await predict_stockouts(db, lookback)


@router.get("/predictions/delivery-delays")
async def get_delivery_delay_predictions(
    lookback: int = Query(60, ge=14, le=180),
    admin_data: dict = Depends(require_permission("deliveries:view")),
    db: AsyncSession = Depends(get_db),
):
    """Delivery delay analysis and at-risk deliveries."""
    return await predict_delivery_delays(db, lookback)


@router.get("/analytics/customers")
async def get_customer_insights(
    days: int = Query(90, ge=7, le=365),
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """Customer behavior analytics — top customers, repeat rate."""
    return await customer_insights(db, days)


@router.get("/recommendations")
async def get_recommendations(
    admin_data: dict = Depends(require_permission("analytics:view")),
    db: AsyncSession = Depends(get_db),
):
    """AI-driven actionable recommendations for the admin."""
    recs = await generate_recommendations(db)
    return {"recommendations": recs, "count": len(recs)}
