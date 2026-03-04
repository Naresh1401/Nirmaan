"""Product management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.product import Product, Category
from app.models.supplier import Supplier
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    CategoryResponse,
)

router = APIRouter()


# ── Categories ────────────────────────────────────────────


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all material categories."""
    result = await db.execute(
        select(Category).where(Category.is_active).order_by(Category.sort_order)
    )
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(c) for c in categories]


# ── Products ──────────────────────────────────────────────


@router.get("", response_model=ProductListResponse)
async def list_products(
    category: str = Query(None, description="Category slug"),
    supplier_id: UUID = Query(None, description="Filter by supplier"),
    city: str = Query(None, description="Filter by supplier city"),
    min_price: float = Query(None, ge=0),
    max_price: float = Query(None, ge=0),
    in_stock: bool = Query(None, description="Only show in-stock items"),
    sort_by: str = Query("relevance", description="price_asc, price_desc, rating, newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List products with filters and sorting."""
    query = select(Product).where(Product.is_active)

    if category:
        query = query.join(Category).where(Category.slug == category)
    if supplier_id:
        query = query.where(Product.supplier_id == supplier_id)
    if city:
        query = query.join(Supplier).where(Supplier.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if in_stock:
        query = query.where(Product.stock_quantity > 0)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Sort
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    products = result.scalars().all()

    return ProductListResponse(
        products=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get product details."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new product (supplier only)."""
    # Find supplier for this user
    result = await db.execute(
        select(Supplier).where(Supplier.user_id == current_user["user_id"])
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=403, detail="Only suppliers can create products")

    product = Product(
        supplier_id=supplier.id,
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        brand=data.brand,
        unit=data.unit,
        price=data.price,
        mrp=data.mrp,
        stock_quantity=data.stock_quantity,
        min_order_quantity=data.min_order_quantity,
        max_order_quantity=data.max_order_quantity,
        images=data.images,
        specifications=data.specifications,
    )
    db.add(product)
    await db.flush()
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Verify ownership
    supplier_result = await db.execute(
        select(Supplier).where(Supplier.id == product.supplier_id)
    )
    supplier = supplier_result.scalar_one()
    if str(supplier.user_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    await db.flush()
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a product (mark inactive)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    supplier_result = await db.execute(
        select(Supplier).where(Supplier.id == product.supplier_id)
    )
    supplier = supplier_result.scalar_one()
    if str(supplier.user_id) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    product.is_active = False
