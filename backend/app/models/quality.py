"""Quality verification model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class QualityCheck(Base):
    """Quality verification records for orders."""

    __tablename__ = "quality_checks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
    inspector_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Quality parameters
    material_grade = Column(String(50), nullable=True)
    certification_number = Column(String(100), nullable=True)
    expected_weight_kg = Column(Float, nullable=True)
    actual_weight_kg = Column(Float, nullable=True)
    weight_variance_pct = Column(Float, nullable=True)

    # Results
    passed = Column(Boolean, nullable=True)
    issues = Column(JSONB, default=list)  # list of issue descriptions
    photos = Column(JSONB, default=list)  # photo URLs
    notes = Column(Text, nullable=True)

    checked_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
