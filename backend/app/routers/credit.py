"""Credit system router — apply, check, transact, repay."""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db as get_session
from app.core.security import get_current_user
from app.models.payment import CreditAccount, CreditTransaction, CreditStatus

router = APIRouter(prefix="/api/v1/credit", tags=["credit"])


# ── Schemas ──────────────────────────────────────────────────────────

class CreditApplyRequest(BaseModel):
    requested_limit: float = Field(..., gt=0, le=5000000, description="Requested credit limit in INR")
    business_turnover: Optional[str] = None
    reason: Optional[str] = None


class CreditAccountResponse(BaseModel):
    id: str
    credit_limit: float
    used_credit: float
    available_credit: float
    is_approved: bool
    credit_score: int
    created_at: datetime

    class Config:
        from_attributes = True


class CreditTransactionResponse(BaseModel):
    id: str
    amount: float
    transaction_type: str
    status: str
    due_date: Optional[datetime]
    paid_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RepaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = "bank_transfer"


# ── Endpoints ────────────────────────────────────────────────────────

@router.post("/apply", response_model=dict)
async def apply_for_credit(
    body: CreditApplyRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Apply for a business credit account."""
    # Check if already exists
    result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user["user_id"])
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credit account already exists. Use /increase-limit to request more.",
        )

    account = CreditAccount(
        user_id=user["user_id"],
        credit_limit=min(body.requested_limit, 100000),  # Initial max ₹1L
        used_credit=0,
        available_credit=min(body.requested_limit, 100000),
        is_approved=True,   # Auto-approve with initial low limit
        credit_score=500,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)

    return {
        "message": "Credit account approved",
        "credit_limit": account.credit_limit,
        "available_credit": account.available_credit,
        "id": str(account.id),
    }


@router.get("/account", response_model=CreditAccountResponse)
async def get_credit_account(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get current user's credit account details."""
    result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user["user_id"])
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="No credit account found. Apply first.")
    return CreditAccountResponse(
        id=str(account.id),
        credit_limit=account.credit_limit,
        used_credit=account.used_credit,
        available_credit=account.available_credit,
        is_approved=account.is_approved,
        credit_score=account.credit_score,
        created_at=account.created_at,
    )


@router.get("/transactions", response_model=list[CreditTransactionResponse])
async def get_credit_transactions(
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Get credit transaction history."""
    # Get account
    acc_result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user["user_id"])
    )
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="No credit account found.")

    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.credit_account_id == account.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(limit)
    )
    txns = result.scalars().all()
    return [
        CreditTransactionResponse(
            id=str(t.id),
            amount=t.amount,
            transaction_type=t.transaction_type,
            status=t.status.value if hasattr(t.status, 'value') else str(t.status),
            due_date=t.due_date,
            paid_date=t.paid_date,
            notes=t.notes,
            created_at=t.created_at,
        )
        for t in txns
    ]


@router.post("/repay", response_model=dict)
async def repay_credit(
    body: RepaymentRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Make a credit repayment."""
    acc_result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user["user_id"])
    )
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="No credit account found.")

    if body.amount > account.used_credit:
        raise HTTPException(
            status_code=400,
            detail=f"Repayment amount exceeds used credit (₹{account.used_credit}).",
        )

    # Update account
    account.used_credit -= body.amount
    account.available_credit += body.amount

    # Record transaction
    txn = CreditTransaction(
        credit_account_id=account.id,
        amount=body.amount,
        transaction_type="repayment",
        status=CreditStatus.PAID,
        paid_date=datetime.utcnow(),
        notes=f"Repayment via {body.payment_method}",
    )
    db.add(txn)
    await db.commit()

    return {
        "message": "Repayment successful",
        "amount_paid": body.amount,
        "used_credit": account.used_credit,
        "available_credit": account.available_credit,
    }


@router.post("/increase-limit", response_model=dict)
async def request_limit_increase(
    body: CreditApplyRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Request a credit limit increase."""
    acc_result = await db.execute(
        select(CreditAccount).where(CreditAccount.user_id == user["user_id"])
    )
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="No credit account found. Apply first.")

    return {
        "message": "Limit increase request submitted for review",
        "current_limit": account.credit_limit,
        "requested_limit": body.requested_limit,
        "status": "pending_review",
    }
