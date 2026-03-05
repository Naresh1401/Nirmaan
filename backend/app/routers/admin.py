"""Admin endpoints for platform management — comprehensive monitoring & control."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.delivery import DeliveryPartner, Delivery
from app.models.payment import CreditAccount
from app.schemas.supplier import SupplierResponse

router = APIRouter()


# ── Auth dependency ──────────────────────────────────────

def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency that requires admin role."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ── Dashboard & Analytics ────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Comprehensive platform-wide analytics dashboard."""
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

    total_suppliers = (await db.execute(select(func.count(Supplier.id)))).scalar() or 0
    verified_suppliers = (await db.execute(
        select(func.count(Supplier.id)).where(Supplier.is_verified == True)
    )).scalar() or 0

    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    active_products = (await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True)
    )).scalar() or 0
    out_of_stock = (await db.execute(
        select(func.count(Product.id)).where(
            and_(Product.is_active == True, Product.stock_quantity <= 0)
        )
    )).scalar() or 0

    total_drivers = (await db.execute(select(func.count(DeliveryPartner.id)))).scalar() or 0
    available_drivers = (await db.execute(
        select(func.count(DeliveryPartner.id)).where(DeliveryPartner.is_available == True)
    )).scalar() or 0

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

    paid_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.payment_status == PaymentStatus.PAID)
    )).scalar() or 0
    pending_payments = (await db.execute(
        select(func.count(Order.id)).where(Order.payment_status == PaymentStatus.PENDING)
    )).scalar() or 0

    now = datetime.now(timezone.utc)
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

    new_users_7d = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= now - timedelta(days=7))
    )).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_role": role_counts,
            "new_last_7d": new_users_7d,
        },
        "suppliers": {
            "total": total_suppliers,
            "verified": verified_suppliers,
            "pending": total_suppliers - verified_suppliers,
        },
        "products": {
            "total": total_products,
            "active": active_products,
            "out_of_stock": out_of_stock,
        },
        "delivery_partners": {
            "total": total_drivers,
            "available": available_drivers,
            "offline": total_drivers - available_drivers,
        },
        "orders": {
            "total": total_orders,
            "by_status": status_counts,
            "last_24h": orders_24h,
            "last_7d": orders_7d,
            "last_30d": orders_30d,
        },
        "revenue": {
            "total_gmv": round(total_gmv, 2),
            "last_24h": round(revenue_24h, 2),
            "last_7d": round(revenue_7d, 2),
            "last_30d": round(revenue_30d, 2),
        },
        "payments": {
            "paid": paid_orders,
            "pending": pending_payments,
        },
    }


# ── User Management ─────────────────────────────────────

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users with filtering, search, and pagination."""
    query = select(User)

    if role:
        query = query.where(User.role == UserRole(role))
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (User.full_name.ilike(search_term)) |
            (User.phone.ilike(search_term)) |
            (User.email.ilike(search_term))
        )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

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
                Order.customer_id == u.id,
                Order.status != OrderStatus.CANCELLED,
            )
        )).scalar() or 0

        user_list.append({
            "id": str(u.id),
            "full_name": u.full_name,
            "phone": u.phone,
            "email": u.email,
            "role": u.role.value if isinstance(u.role, UserRole) else u.role,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "city": u.city,
            "state": u.state,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "total_orders": order_count,
            "total_spent": round(total_spent, 2),
        })

    return {
        "users": user_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: UUID,
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed info for a specific user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    orders_result = await db.execute(
        select(Order).where(Order.customer_id == user_id).order_by(Order.created_at.desc()).limit(20)
    )
    orders = orders_result.scalars().all()

    order_count = (await db.execute(
        select(func.count(Order.id)).where(Order.customer_id == user_id)
    )).scalar() or 0
    total_spent = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.customer_id == user_id,
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0

    return {
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role.value if isinstance(user.role, UserRole) else user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "city": user.city,
            "state": user.state,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        },
        "stats": {
            "total_orders": order_count,
            "total_spent": round(total_spent, 2),
        },
        "recent_orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "status": o.status.value if isinstance(o.status, OrderStatus) else o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
    }


@router.put("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: UUID,
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Activate or deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if str(user.id) == _admin["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    user.is_active = not user.is_active
    action = "activated" if user.is_active else "deactivated"
    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "is_active": user.is_active,
        "message": f"User {action} successfully",
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: UUID,
    new_role: str = Query(...),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Change a user's role (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        user.role = UserRole(new_role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {new_role}")

    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "new_role": user.role.value,
        "message": f"Role changed to {new_role}",
    }


# ── Order Management ────────────────────────────────────

@router.get("/orders")
async def list_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    days: Optional[int] = Query(None, ge=1, le=365),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List ALL orders with filtering and pagination."""
    query = select(Order).options(selectinload(Order.items))

    if status:
        query = query.where(Order.status == OrderStatus(status))
    if payment_status:
        query = query.where(Order.payment_status == PaymentStatus(payment_status))
    if days:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.where(Order.created_at >= since)
    if search:
        query = query.where(Order.order_number.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().unique().all()

    order_list = []
    for o in orders:
        customer_result = await db.execute(select(User).where(User.id == o.customer_id))
        customer = customer_result.scalar_one_or_none()

        order_list.append({
            "id": str(o.id),
            "order_number": o.order_number,
            "customer_name": customer.full_name if customer else "Unknown",
            "customer_phone": customer.phone if customer else "",
            "status": o.status.value if isinstance(o.status, OrderStatus) else o.status,
            "payment_status": o.payment_status.value if isinstance(o.payment_status, PaymentStatus) else o.payment_status,
            "payment_method": o.payment_method,
            "total_amount": o.total_amount,
            "delivery_city": o.delivery_city,
            "delivery_address": o.delivery_address,
            "item_count": len(o.items) if o.items else 0,
            "priority": o.priority.value if hasattr(o.priority, 'value') else o.priority,
            "notes": o.notes,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "updated_at": o.updated_at.isoformat() if o.updated_at else None,
        })

    return {
        "orders": order_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    new_status: str = Query(...),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update order status (admin override)."""
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.status = OrderStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")

    if new_status == "delivered":
        order.payment_status = PaymentStatus.PAID

    if new_status == "cancelled":
        for item in order.items:
            product_result = await db.execute(select(Product).where(Product.id == item.product_id))
            product = product_result.scalar_one_or_none()
            if product:
                product.stock_quantity += item.quantity

    return {
        "order_id": str(order.id),
        "order_number": order.order_number,
        "new_status": order.status.value,
        "message": f"Order status updated to {new_status}",
    }


@router.put("/orders/{order_id}/payment-status")
async def update_payment_status(
    order_id: UUID,
    new_status: str = Query(...),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update payment status for an order."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.payment_status = PaymentStatus(new_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid payment status: {new_status}")

    return {
        "order_id": str(order.id),
        "order_number": order.order_number,
        "new_payment_status": order.payment_status.value,
        "message": f"Payment status updated to {new_status}",
    }


# ── Supplier Management ─────────────────────────────────

@router.get("/suppliers")
async def list_all_suppliers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all suppliers with details."""
    query = select(Supplier)

    if verified is not None:
        query = query.where(Supplier.is_verified == verified)
    if search:
        query = query.where(Supplier.business_name.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

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

        supplier_list.append({
            "id": str(s.id),
            "user_id": str(s.user_id),
            "business_name": s.business_name,
            "owner_name": user.full_name if user else "Unknown",
            "owner_phone": user.phone if user else "",
            "gst_number": s.gst_number,
            "city": s.city,
            "state": s.state,
            "is_verified": s.is_verified,
            "rating": s.rating,
            "total_orders": s.total_orders,
            "total_revenue": s.total_revenue,
            "product_count": product_count,
            "subscription_tier": s.subscription_tier.value if hasattr(s.subscription_tier, 'value') else s.subscription_tier,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    return {
        "suppliers": supplier_list,
        "total": total,
        "page": page,
        "page_size": page_size,
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


# ── Product Monitoring ──────────────────────────────────

@router.get("/products")
async def list_all_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    out_of_stock: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all products with monitoring info."""
    query = select(Product)

    if out_of_stock is True:
        query = query.where(Product.stock_quantity <= 0)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    product_list = []
    for p in products:
        supplier_result = await db.execute(select(Supplier).where(Supplier.id == p.supplier_id))
        supplier = supplier_result.scalar_one_or_none()

        product_list.append({
            "id": str(p.id),
            "name": p.name,
            "brand": p.brand,
            "price": p.price,
            "mrp": p.mrp,
            "stock_quantity": p.stock_quantity,
            "unit": p.unit.value if hasattr(p.unit, 'value') else p.unit,
            "is_active": p.is_active,
            "supplier_name": supplier.business_name if supplier else "Unknown",
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    return {
        "products": product_list,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ── Revenue & Analytics ─────────────────────────────────

@router.get("/orders/overview")
async def orders_overview(
    days: int = Query(30, ge=1, le=365),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Order analytics for the last N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    total = (await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= since)
    )).scalar() or 0

    revenue = (await db.execute(
        select(func.sum(Order.total_amount)).where(
            Order.created_at >= since,
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0

    avg_order_value = (await db.execute(
        select(func.avg(Order.total_amount)).where(
            Order.created_at >= since,
            Order.status != OrderStatus.CANCELLED,
        )
    )).scalar() or 0

    cancelled = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since,
            Order.status == OrderStatus.CANCELLED,
        )
    )).scalar() or 0

    delivered = (await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= since,
            Order.status == OrderStatus.DELIVERED,
        )
    )).scalar() or 0

    return {
        "period_days": days,
        "total_orders": total,
        "total_revenue": round(revenue, 2),
        "average_order_value": round(avg_order_value, 2),
        "delivered": delivered,
        "cancelled": cancelled,
        "cancellation_rate": round((cancelled / total * 100) if total > 0 else 0, 1),
    }


# ── Credit Monitoring ───────────────────────────────────

@router.get("/credit/overview")
async def credit_overview(
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Overview of credit system."""
    total_accounts = (await db.execute(select(func.count(CreditAccount.id)))).scalar() or 0
    approved_accounts = (await db.execute(
        select(func.count(CreditAccount.id)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    total_credit_limit = (await db.execute(
        select(func.sum(CreditAccount.credit_limit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0
    total_used = (await db.execute(
        select(func.sum(CreditAccount.used_credit)).where(CreditAccount.is_approved == True)
    )).scalar() or 0

    return {
        "total_accounts": total_accounts,
        "approved": approved_accounts,
        "pending": total_accounts - approved_accounts,
        "total_credit_limit": round(total_credit_limit, 2),
        "total_used": round(total_used, 2),
        "utilization_rate": round((total_used / total_credit_limit * 100) if total_credit_limit > 0 else 0, 1),
    }


# ── Delivery Monitoring ─────────────────────────────────

@router.get("/deliveries")
async def delivery_overview(
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Overview of delivery operations."""
    total_partners = (await db.execute(select(func.count(DeliveryPartner.id)))).scalar() or 0
    available = (await db.execute(
        select(func.count(DeliveryPartner.id)).where(DeliveryPartner.is_available == True)
    )).scalar() or 0
    verified = (await db.execute(
        select(func.count(DeliveryPartner.id)).where(DeliveryPartner.is_verified == True)
    )).scalar() or 0

    return {
        "partners": {
            "total": total_partners,
            "available": available,
            "offline": total_partners - available,
            "verified": verified,
            "unverified": total_partners - verified,
        },
    }


# ── Admin User Creation ─────────────────────────────────

@router.post("/create-admin")
async def create_admin_user(
    full_name: str = Query(...),
    phone: str = Query(...),
    password: str = Query(...),
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin user (requires existing admin auth)."""
    from app.core.security import hash_password

    existing = await db.execute(select(User).where(User.phone == phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone already registered")

    user = User(
        full_name=full_name,
        phone=phone,
        password_hash=hash_password(password),
        role=UserRole.ADMIN,
        is_verified=True,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "phone": user.phone,
        "role": "admin",
        "message": "Admin user created successfully",
    }
