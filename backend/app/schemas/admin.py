"""Admin-specific Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Auth Schemas ─────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class AdminLoginResponse(BaseModel):
    requires_2fa: bool
    temp_token: Optional[str] = None  # Short-lived token for 2FA step
    access_token: Optional[str] = None
    user_id: Optional[str] = None
    full_name: Optional[str] = None
    admin_role: Optional[str] = None
    permissions: Optional[list[str]] = None
    message: str


class Admin2FAVerifyRequest(BaseModel):
    temp_token: str
    totp_code: str = Field(..., min_length=6, max_length=6)


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin_role: str
    permissions: list[str]
    user: dict


class TOTPSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str
    qr_code_base64: str


class TOTPConfirmRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class BackupCodesResponse(BaseModel):
    codes: list[str]
    message: str = "Store these codes securely. Each can only be used once."


class BackupCodeVerifyRequest(BaseModel):
    temp_token: str
    backup_code: str


class AdminRecoveryRequest(BaseModel):
    identifier: str  # email or phone
    

class AdminRecoveryVerifyRequest(BaseModel):
    identifier: str
    otp: str
    totp_code: Optional[str] = None
    backup_code: Optional[str] = None


class StepUpAuthRequest(BaseModel):
    totp_code: str = Field(..., min_length=6, max_length=6)


# ── RBAC Schemas ─────────────────────────────────────────

class AdminProfileResponse(BaseModel):
    id: str
    user_id: str
    admin_role: str
    permissions: list[str]
    is_2fa_enabled: bool
    last_login_at: Optional[str] = None
    last_login_ip: Optional[str] = None
    created_at: str


class AdminProfileUpdate(BaseModel):
    admin_role: Optional[str] = None
    custom_permissions: Optional[list[str]] = None
    ip_allowlist: Optional[list[str]] = None


class CreateAdminRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    admin_role: str = "support_admin"


# ── Session Schemas ──────────────────────────────────────

class AdminSessionResponse(BaseModel):
    id: str
    ip_address: str
    user_agent: Optional[str] = None
    is_active: bool
    created_at: str
    last_activity_at: str
    is_current: bool = False


# ── Audit Log Schemas ────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: str
    admin_user_id: str
    admin_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    before_state: Optional[dict] = None
    after_state: Optional[dict] = None
    ip_address: str
    reason: Optional[str] = None
    created_at: str


class AuditLogQuery(BaseModel):
    admin_user_id: Optional[str] = None
    action: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    page: int = 1
    page_size: int = 50


# ── Dispute Schemas ──────────────────────────────────────

class DisputeResponse(BaseModel):
    id: str
    order_id: str
    order_number: Optional[str] = None
    raised_by_name: Optional[str] = None
    assigned_admin_name: Optional[str] = None
    dispute_type: str
    status: str
    priority: str
    description: str
    resolution: Optional[str] = None
    resolution_type: Optional[str] = None
    refund_amount: Optional[float] = None
    created_at: str
    updated_at: str
    resolved_at: Optional[str] = None


class DisputeResolveRequest(BaseModel):
    resolution: str = Field(..., min_length=10)
    resolution_type: str  # refund, replacement, reship, credit, rejected
    refund_amount: Optional[float] = None
    reason: Optional[str] = None


class DisputeCreateRequest(BaseModel):
    order_id: str
    dispute_type: str  # quality, delivery_delay, wrong_item, damaged, missing, billing
    priority: str = "medium"
    description: str = Field(..., min_length=10)


# ── Alert Schemas ────────────────────────────────────────

class SystemAlertResponse(BaseModel):
    id: str
    alert_type: str
    severity: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    is_read: bool
    is_resolved: bool
    created_at: str


# ── Analytics Schemas ────────────────────────────────────

class ForecastResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    forecast_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    period_start: str
    period_end: str
    predicted_value: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    model_name: str


class RecommendationResponse(BaseModel):
    category: str  # replenish_stock, increase_capacity, audit_supplier, promote_product, reorder_bundle
    priority: str  # low, medium, high, critical
    title: str
    description: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    data: Optional[dict] = None


# ── Refund Schemas ───────────────────────────────────────

class RefundRequest(BaseModel):
    order_id: str
    amount: float = Field(..., gt=0)
    reason: str = Field(..., min_length=10)
    refund_type: str = "full"  # full, partial
    step_up_totp: str = Field(..., min_length=6, max_length=6, description="Required: TOTP code for step-up auth")


# ── Inventory Adjustment ────────────────────────────────

class InventoryAdjustRequest(BaseModel):
    product_id: str
    new_quantity: int = Field(..., ge=0)
    reason: str = Field(..., min_length=5)
