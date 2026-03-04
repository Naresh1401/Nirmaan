"""Payment and Credit system models."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class PaymentMethod(str, enum.Enum):
    RAZORPAY = "razorpay"
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CREDIT = "credit"
    COD = "cod"


class CreditStatus(str, enum.Enum):
    ACTIVE = "active"
    OVERDUE = "overdue"
    PAID = "paid"
    DEFAULTED = "defaulted"


class Payment(Base):
    """Payment transaction records."""

    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")  # pending, completed, failed, refunded
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class CreditAccount(Base):
    """Credit system for contractors."""

    __tablename__ = "credit_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    credit_limit = Column(Float, default=50000.0)
    used_credit = Column(Float, default=0.0)
    available_credit = Column(Float, default=50000.0)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(UUID(as_uuid=True), nullable=True)
    credit_score = Column(Integer, default=500)  # 300-900 range
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CreditTransaction(Base):
    """Credit usage and repayment records."""

    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    credit_account_id = Column(UUID(as_uuid=True), ForeignKey("credit_accounts.id"), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # usage, repayment
    status = Column(Enum(CreditStatus), default=CreditStatus.ACTIVE)
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
