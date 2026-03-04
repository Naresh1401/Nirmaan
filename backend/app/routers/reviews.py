"""Reviews API router."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.review import Review
from app.models.order import Order
from app.models.user import User

router = APIRouter()


class ReviewCreate(BaseModel):
    order_id: UUID
    supplier_id: UUID | None = None
    delivery_partner_id: UUID | None = None
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: UUID
    order_id: UUID
    reviewer_id: UUID
    supplier_id: UUID | None
    delivery_partner_id: UUID | None
    rating: int
    comment: str | None
    reviewer_name: str | None = None

    model_config = {"from_attributes": True}


@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a review for an order."""
    # Verify order belongs to user
    order = await db.get(Order, review_data.order_id)
    if not order or order.customer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check for duplicate review
    existing = await db.execute(
        select(Review).where(
            Review.order_id == review_data.order_id,
            Review.reviewer_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already reviewed this order")

    review = Review(
        order_id=review_data.order_id,
        reviewer_id=current_user.id,
        supplier_id=review_data.supplier_id,
        delivery_partner_id=review_data.delivery_partner_id,
        rating=review_data.rating,
        comment=review_data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return ReviewResponse(
        id=review.id,
        order_id=review.order_id,
        reviewer_id=review.reviewer_id,
        supplier_id=review.supplier_id,
        delivery_partner_id=review.delivery_partner_id,
        rating=review.rating,
        comment=review.comment,
        reviewer_name=current_user.full_name,
    )


@router.get("/supplier/{supplier_id}")
async def get_supplier_reviews(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all reviews for a supplier."""
    result = await db.execute(
        select(Review).where(Review.supplier_id == supplier_id).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.supplier_id == supplier_id)
    )
    avg_rating = avg_result.scalar() or 0

    return {
        "supplier_id": str(supplier_id),
        "average_rating": round(float(avg_rating), 1),
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": str(r.id),
                "rating": r.rating,
                "comment": r.comment,
                "created_at": str(r.created_at),
            }
            for r in reviews
        ],
    }
