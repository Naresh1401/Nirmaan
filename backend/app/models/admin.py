"""
Admin-specific models: RBAC, 2FA TOTP, sessions, audit logs, backup codes.
Production-grade admin infrastructure for Nirmaan platform.
"""

import uuid
import enum
import secrets
from datetime import datetime, timezone

from sqlalchemy import (
    String, Boolean, DateTime, Integer, Float, ForeignKey, Text,
    Enum as SAEnum, Index, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ── Admin Roles & Permissions ───────────────────────────

class AdminRoleType(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    OPS_ADMIN = "ops_admin"
    SUPPLIER_ADMIN = "supplier_admin"
    FINANCE_ADMIN = "finance_admin"
    SUPPORT_ADMIN = "support_admin"


class PermissionScope(str, enum.Enum):
    """Fine-grained permission scopes."""
    # User management
    USERS_VIEW = "users:view"
    USERS_EDIT = "users:edit"
    USERS_SUSPEND = "users:suspend"
    # Order management
    ORDERS_VIEW = "orders:view"
    ORDERS_EDIT = "orders:edit"
    ORDERS_REFUND = "orders:refund"
    # Supplier management
    SUPPLIERS_VIEW = "suppliers:view"
    SUPPLIERS_APPROVE = "suppliers:approve"
    SUPPLIERS_EDIT = "suppliers:edit"
    # Product management
    PRODUCTS_VIEW = "products:view"
    PRODUCTS_EDIT = "products:edit"
    PRODUCTS_MODERATE = "products:moderate"
    # Inventory
    INVENTORY_VIEW = "inventory:view"
    INVENTORY_ADJUST = "inventory:adjust"
    # Delivery
    DELIVERIES_VIEW = "deliveries:view"
    DELIVERIES_ASSIGN = "deliveries:assign"
    # Payments / Finance
    PAYMENTS_VIEW = "payments:view"
    PAYMENTS_REFUND = "payments:refund"
    PAYMENTS_SETTLE = "payments:settle"
    # Disputes / Support
    DISPUTES_VIEW = "disputes:view"
    DISPUTES_RESOLVE = "disputes:resolve"
    # Reviews
    REVIEWS_VIEW = "reviews:view"
    REVIEWS_MODERATE = "reviews:moderate"
    # Analytics
    ANALYTICS_VIEW = "analytics:view"
    ANALYTICS_EXPORT = "analytics:export"
    # System / Security
    SYSTEM_VIEW = "system:view"
    SYSTEM_AUDIT = "system:audit"
    SYSTEM_ADMIN = "system:admin"
    # Settings
    SETTINGS_VIEW = "settings:view"
    SETTINGS_EDIT = "settings:edit"


# Default permissions per role
ROLE_PERMISSIONS: dict[AdminRoleType, list[PermissionScope]] = {
    AdminRoleType.SUPER_ADMIN: list(PermissionScope),  # All permissions
    AdminRoleType.OPS_ADMIN: [
        PermissionScope.ORDERS_VIEW, PermissionScope.ORDERS_EDIT, PermissionScope.ORDERS_REFUND,
        PermissionScope.DELIVERIES_VIEW, PermissionScope.DELIVERIES_ASSIGN,
        PermissionScope.INVENTORY_VIEW, PermissionScope.INVENTORY_ADJUST,
        PermissionScope.USERS_VIEW,
        PermissionScope.ANALYTICS_VIEW,
    ],
    AdminRoleType.SUPPLIER_ADMIN: [
        PermissionScope.SUPPLIERS_VIEW, PermissionScope.SUPPLIERS_APPROVE, PermissionScope.SUPPLIERS_EDIT,
        PermissionScope.PRODUCTS_VIEW, PermissionScope.PRODUCTS_EDIT, PermissionScope.PRODUCTS_MODERATE,
        PermissionScope.REVIEWS_VIEW, PermissionScope.REVIEWS_MODERATE,
        PermissionScope.ANALYTICS_VIEW,
    ],
    AdminRoleType.FINANCE_ADMIN: [
        PermissionScope.PAYMENTS_VIEW, PermissionScope.PAYMENTS_REFUND, PermissionScope.PAYMENTS_SETTLE,
        PermissionScope.ORDERS_VIEW,
        PermissionScope.ANALYTICS_VIEW, PermissionScope.ANALYTICS_EXPORT,
    ],
    AdminRoleType.SUPPORT_ADMIN: [
        PermissionScope.USERS_VIEW,
        PermissionScope.ORDERS_VIEW,
        PermissionScope.DISPUTES_VIEW, PermissionScope.DISPUTES_RESOLVE,
        PermissionScope.REVIEWS_VIEW,
    ],
}


class AdminProfile(Base):
    """Extended admin profile with role and security settings."""
    __tablename__ = "admin_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True
    )
    admin_role: Mapped[AdminRoleType] = mapped_column(
        SAEnum(AdminRoleType), default=AdminRoleType.SUPPORT_ADMIN
    )
    # Custom permissions override (JSONB array of scope strings)
    custom_permissions: Mapped[dict] = mapped_column(
        JSONB, default=list, server_default="[]"
    )
    # Security settings
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_ip: Mapped[str] = mapped_column(String(45), nullable=True)
    # IP allowlist (empty = all allowed)
    ip_allowlist: Mapped[dict] = mapped_column(
        JSONB, default=list, server_default="[]"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    totp_device = relationship("TOTPDevice", back_populates="admin_profile", uselist=False, cascade="all, delete-orphan")
    backup_codes = relationship("BackupCode", back_populates="admin_profile", cascade="all, delete-orphan")
    sessions = relationship("AdminSession", back_populates="admin_profile", cascade="all, delete-orphan")

    def get_permissions(self) -> list[str]:
        """Get effective permissions for this admin."""
        base_permissions = [p.value for p in ROLE_PERMISSIONS.get(self.admin_role, [])]
        custom = self.custom_permissions if isinstance(self.custom_permissions, list) else []
        return list(set(base_permissions + custom))

    def has_permission(self, scope: str) -> bool:
        """Check if admin has a specific permission."""
        if self.admin_role == AdminRoleType.SUPER_ADMIN:
            return True
        return scope in self.get_permissions()


class TOTPDevice(Base):
    """TOTP 2FA device (Google Authenticator / Authy compatible)."""
    __tablename__ = "totp_devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("admin_profiles.id"), unique=True
    )
    # Encrypted TOTP secret (base32)
    secret: Mapped[str] = mapped_column(String(64))
    # Whether device has been verified (user scanned QR + confirmed code)
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    admin_profile = relationship("AdminProfile", back_populates="totp_device")


class BackupCode(Base):
    """One-time-use backup codes for 2FA recovery."""
    __tablename__ = "backup_codes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("admin_profiles.id"), index=True
    )
    code_hash: Mapped[str] = mapped_column(String(255))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    admin_profile = relationship("AdminProfile", back_populates="backup_codes")


class AdminSession(Base):
    """Track admin sessions for security monitoring."""
    __tablename__ = "admin_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("admin_profiles.id"), index=True
    )
    session_token: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    ip_address: Mapped[str] = mapped_column(String(45))
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    device_fingerprint: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Step-up auth validity
    step_up_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True)
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    admin_profile = relationship("AdminProfile", back_populates="sessions")


class AuditLog(Base):
    """Immutable audit log for every admin action."""
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_admin_id_created", "admin_user_id", "created_at"),
        Index("ix_audit_logs_action_created", "action", "created_at"),
        Index("ix_audit_logs_entity", "entity_type", "entity_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    action: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str] = mapped_column(String(50))  # user, order, supplier, product, etc.
    entity_id: Mapped[str] = mapped_column(String(100), nullable=True)
    # Before/after state for data changes
    before_state: Mapped[dict] = mapped_column(JSONB, nullable=True)
    after_state: Mapped[dict] = mapped_column(JSONB, nullable=True)
    # Context
    ip_address: Mapped[str] = mapped_column(String(45))
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    extra_data: Mapped[dict] = mapped_column(JSONB, nullable=True)
    # Immutable timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Dispute(Base):
    """Customer disputes and support tickets."""
    __tablename__ = "disputes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), index=True
    )
    raised_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), index=True
    )
    assigned_admin_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    dispute_type: Mapped[str] = mapped_column(
        String(50)  # quality, delivery_delay, wrong_item, damaged, missing, billing
    )
    status: Mapped[str] = mapped_column(
        String(30), default="open"  # open, investigating, resolved, escalated, closed
    )
    priority: Mapped[str] = mapped_column(
        String(20), default="medium"  # low, medium, high, critical
    )
    description: Mapped[str] = mapped_column(Text)
    resolution: Mapped[str] = mapped_column(Text, nullable=True)
    resolution_type: Mapped[str] = mapped_column(
        String(30), nullable=True  # refund, replacement, reship, credit, rejected
    )
    refund_amount: Mapped[float] = mapped_column(Float, nullable=True)
    evidence: Mapped[dict] = mapped_column(JSONB, default=list)  # photo URLs, etc.
    internal_notes: Mapped[dict] = mapped_column(JSONB, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    resolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class SystemAlert(Base):
    """Configurable system alerts for admin notifications."""
    __tablename__ = "system_alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alert_type: Mapped[str] = mapped_column(
        String(50)  # low_stock, delayed_delivery, suspicious_activity, high_disputes, system_error
    )
    severity: Mapped[str] = mapped_column(
        String(20), default="info"  # info, warning, critical
    )
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class ForecastResult(Base):
    """Store prediction/forecast results for dashboard display."""
    __tablename__ = "forecast_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    forecast_type: Mapped[str] = mapped_column(
        String(50)  # demand, revenue, stockout, delivery_delay
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=True)  # product, category, supplier
    entity_id: Mapped[str] = mapped_column(String(100), nullable=True)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    predicted_value: Mapped[float] = mapped_column(Float)
    confidence_lower: Mapped[float] = mapped_column(Float, nullable=True)
    confidence_upper: Mapped[float] = mapped_column(Float, nullable=True)
    model_name: Mapped[str] = mapped_column(String(50))
    model_version: Mapped[str] = mapped_column(String(20))
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=True)  # MAE, RMSE, etc.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
