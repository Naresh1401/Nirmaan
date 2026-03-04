"""Search endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.product import Product, Category
from app.models.supplier import Supplier
from app.schemas.product import ProductResponse
from app.schemas.supplier import SupplierResponse

router = APIRouter()


@router.get("")
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    city: str = Query(None, description="Filter by city"),
    category: str = Query(None, description="Category slug"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Full-text search across products and suppliers.
    Returns matching products and suppliers.
    """
    search_term = f"%{q}%"

    # Search products
    product_query = (
        select(Product)
        .where(
            Product.is_active,
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term),
            ),
        )
    )

    if city:
        product_query = product_query.join(Supplier).where(
            Supplier.city.ilike(f"%{city}%")
        )
    if category:
        product_query = product_query.join(Category).where(
            Category.slug == category
        )

    product_query = product_query.limit(page_size).offset((page - 1) * page_size)
    product_result = await db.execute(product_query)
    products = product_result.scalars().all()

    # Search suppliers
    supplier_query = (
        select(Supplier)
        .where(
            or_(
                Supplier.business_name.ilike(search_term),
                Supplier.description.ilike(search_term),
            )
        )
        .limit(10)
    )

    if city:
        supplier_query = supplier_query.where(Supplier.city.ilike(f"%{city}%"))

    supplier_result = await db.execute(supplier_query)
    suppliers = supplier_result.scalars().all()

    return {
        "query": q,
        "products": {
            "items": [ProductResponse.model_validate(p) for p in products],
            "count": len(products),
        },
        "suppliers": {
            "items": [SupplierResponse.model_validate(s) for s in suppliers],
            "count": len(suppliers),
        },
    }
