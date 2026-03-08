"""Project, Conversation, and Estimate models for Veda AI memory system."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Index, JSON,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    """User construction project — stores context for Veda consultations."""
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="My Project")

    # Plot & Location
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    plot_length_ft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    plot_width_ft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    plot_area_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    facing: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # north/south/east/west

    # Building Specs
    floors: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    built_up_area_sqft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    building_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # residential/commercial/mixed
    soil_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    structural_system: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # rcc_frame/load_bearing

    # Budget
    budget_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    budget_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Preferences (flexible JSON)
    preferences: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    # e.g. {"material_preference": "aac_blocks", "ventilation_priority": "high",
    #        "cost_priority": "medium", "durability_priority": "high"}

    # Project stage
    project_stage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    # planning/design/foundation/structure/finishing/completed

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="projects")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")
    estimates = relationship("Estimate", back_populates="project", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_projects_user_active", "user_id", "is_active"),
    )


class Conversation(Base):
    """Chat conversation session for Veda AI."""
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user = relationship("User", backref="conversations")
    project = relationship("Project", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    """Individual message in a Veda conversation."""
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user/assistant/system
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Agent routing metadata
    intent: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    agent_module: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    risk_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # low/medium/high/critical

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    __table_args__ = (
        Index("ix_messages_conv_time", "conversation_id", "created_at"),
    )


class Estimate(Base):
    """Generated estimates linked to a project."""
    __tablename__ = "estimates"

    id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    estimate_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # quantity/cost/material/stage_plan

    assumptions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    outputs: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="estimates")
