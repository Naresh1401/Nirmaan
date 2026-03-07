"""
Admin authentication router with 2FA TOTP, backup codes, session management.
Production-grade admin auth for Nirmaan platform.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, decode_token,
)
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.admin import (
    AdminProfile, TOTPDevice, BackupCode, AdminSession,
    AdminRoleType, ROLE_PERMISSIONS,
)
from app.schemas.admin import (
    AdminLoginRequest, AdminLoginResponse, Admin2FAVerifyRequest,
    AdminTokenResponse, TOTPSetupResponse, TOTPConfirmRequest,
    BackupCodesResponse, BackupCodeVerifyRequest, StepUpAuthRequest,
    AdminSessionResponse, CreateAdminRequest, AdminProfileResponse,
    AdminProfileUpdate,
)
from app.services.admin_security import (
    check_brute_force, record_login_attempt, clear_login_attempts,
    generate_totp_secret, get_totp_provisioning_uri, generate_totp_qr_base64,
    verify_totp_code, generate_backup_codes, hash_backup_code,
    create_admin_session, validate_admin_session, revoke_session,
    revoke_all_sessions, create_audit_log, check_ip_allowed,
    get_admin_profile, get_or_create_admin_profile, get_client_ip,
    generate_session_token,
)
from collections import defaultdict
import time

# 2FA attempt tracking: {temp_token_hash: [timestamps]}
_2fa_attempts: dict[str, list[float]] = defaultdict(list)
MAX_2FA_ATTEMPTS = 5
_2FA_WINDOW = 300  # 5 minutes

router = APIRouter()


# ── Helper: require admin with profile ──────────────────

async def require_admin_with_profile(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Dependency: require admin role + load admin profile."""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user_id = UUID(current_user["user_id"])

    # Validate user still exists and is active in DB
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access revoked")

    profile = await get_admin_profile(db, user_id)
    
    if not profile:
        raise HTTPException(status_code=403, detail="Admin profile not configured")
    
    # Validate session is still active in DB
    token_str = request.headers.get("authorization", "").replace("Bearer ", "")
    try:
        token_data = decode_token(token_str)
        session_id = token_data.get("session_id")
        if session_id:
            sess_result = await db.execute(
                select(AdminSession).where(
                    AdminSession.id == UUID(session_id),
                    AdminSession.is_active == True,
                    AdminSession.expires_at > datetime.now(timezone.utc),
                )
            )
            if not sess_result.scalar_one_or_none():
                raise HTTPException(status_code=401, detail="Session expired or revoked")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Check IP allowlist
    client_ip = get_client_ip(request)
    if profile.ip_allowlist and not check_ip_allowed(client_ip, profile.ip_allowlist):
        raise HTTPException(status_code=403, detail="Access denied from this IP")
    
    # Check account lock
    if profile.locked_until and profile.locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=423, detail="Account temporarily locked")
    
    return {
        **current_user,
        "admin_profile": profile,
        "client_ip": client_ip,
    }


def require_permission(scope: str):
    """Dependency factory: require specific permission."""
    async def _check(
        admin_data: dict = Depends(require_admin_with_profile),
    ) -> dict:
        profile: AdminProfile = admin_data["admin_profile"]
        if not profile.has_permission(scope):
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions: {scope} required"
            )
        return admin_data
    return _check


# ── Login (Step 1: credentials) ─────────────────────────

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    request: Request,
    payload: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Admin login - Step 1: Validate credentials.
    If 2FA is enabled, returns a temp token for step 2.
    """
    identifier = payload.username
    client_ip = get_client_ip(request)
    
    # Check brute force protection
    is_blocked, retry_after = check_brute_force(identifier)
    if is_blocked:
        raise HTTPException(
            status_code=429,
            detail=f"Too many login attempts. Try again in {retry_after}s.",
            headers={"Retry-After": str(retry_after)},
        )
    
    # Find user by username, email, or phone
    result = await db.execute(
        select(User).where(
            (User.username == identifier) |
            (User.email == identifier) |
            (User.phone == identifier)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or user.role != UserRole.ADMIN:
        record_login_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    
    if not verify_password(payload.password, user.password_hash):
        record_login_attempt(identifier)
        # Update failed attempts on profile
        profile = await get_admin_profile(db, user.id)
        if profile:
            profile.failed_login_attempts += 1
            if profile.failed_login_attempts >= MAX_LOCKOUT_THRESHOLD:
                profile.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
        
        await create_audit_log(
            db, str(user.id), "login_failed", "auth",
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            metadata={"reason": "invalid_password"},
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get or create admin profile
    profile = await get_or_create_admin_profile(db, user.id)
    
    # Clear failed attempts
    clear_login_attempts(identifier)
    profile.failed_login_attempts = 0
    profile.locked_until = None
    
    # Check if 2FA is required
    if profile.is_2fa_enabled:
        # Issue temp token (short-lived, only for 2FA verification)
        temp_token = create_access_token(
            {"sub": str(user.id), "role": "admin", "type": "2fa_pending"},
            expires_delta=timedelta(minutes=5),
        )
        return AdminLoginResponse(
            requires_2fa=True,
            temp_token=temp_token,
            message="2FA verification required",
        )
    
    # No 2FA — issue full session
    session = await create_admin_session(
        db, profile.id, client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    
    profile.last_login_at = datetime.now(timezone.utc)
    profile.last_login_ip = client_ip
    
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": "admin",
            "admin_role": profile.admin_role.value,
            "session_id": str(session.id),
        },
        expires_delta=timedelta(hours=2),
    )
    
    await create_audit_log(
        db, str(user.id), "login_success", "auth",
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    
    return AdminLoginResponse(
        requires_2fa=False,
        access_token=access_token,
        user_id=str(user.id),
        full_name=user.full_name,
        admin_role=profile.admin_role.value,
        permissions=profile.get_permissions(),
        message="Login successful",
    )


MAX_LOCKOUT_THRESHOLD = 10


# ── Logout ──────────────────────────────────────────────

@router.post("/logout")
async def admin_logout(
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Logout admin: revoke current session."""
    auth_header = request.headers.get("authorization", "")
    token_str = auth_header.replace("Bearer ", "") if auth_header else ""
    try:
        token_data = decode_token(token_str)
        session_id = token_data.get("session_id")
        if session_id:
            await revoke_session(db, UUID(session_id))
    except Exception:
        pass

    await create_audit_log(
        db, admin_data["user_id"], "logout", "auth",
        ip_address=admin_data["client_ip"],
        user_agent=request.headers.get("user-agent"),
    )
    return {"message": "Logged out successfully"}


# ── Login (Step 2: 2FA verification) ────────────────────

@router.post("/verify-2fa", response_model=AdminTokenResponse)
async def verify_2fa(
    request: Request,
    payload: Admin2FAVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify TOTP code after successful credential check."""
    try:
        token_data = decode_token(payload.temp_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired temp token")
    
    if token_data.get("type") != "2fa_pending":
        raise HTTPException(status_code=400, detail="Invalid token type")
    
    # Rate-limit 2FA attempts per temp_token
    token_key = hashlib.sha256(payload.temp_token.encode()).hexdigest()[:16]
    now = time.time()
    _2fa_attempts[token_key] = [t for t in _2fa_attempts[token_key] if now - t < _2FA_WINDOW]
    if len(_2fa_attempts[token_key]) >= MAX_2FA_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many 2FA attempts. Request a new login.")
    _2fa_attempts[token_key].append(now)

    user_id = UUID(token_data["sub"])
    client_ip = get_client_ip(request)
    
    # Get user and profile
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await get_admin_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=403, detail="Admin profile not found")
    
    # Get TOTP device
    totp_result = await db.execute(
        select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
    )
    totp_device = totp_result.scalar_one_or_none()
    
    if not totp_device:
        raise HTTPException(status_code=400, detail="2FA device not configured")
    
    # Verify TOTP code
    if not verify_totp_code(totp_device.secret, payload.totp_code):
        await create_audit_log(
            db, str(user.id), "2fa_failed", "auth",
            ip_address=client_ip,
            metadata={"reason": "invalid_totp"},
        )
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    
    # Create session
    session = await create_admin_session(
        db, profile.id, client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    
    profile.last_login_at = datetime.now(timezone.utc)
    profile.last_login_ip = client_ip
    profile.failed_login_attempts = 0
    
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": "admin",
            "admin_role": profile.admin_role.value,
            "session_id": str(session.id),
        },
        expires_delta=timedelta(hours=2),
    )
    
    await create_audit_log(
        db, str(user.id), "login_success_2fa", "auth",
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    
    return AdminTokenResponse(
        access_token=access_token,
        expires_in=2 * 3600,
        admin_role=profile.admin_role.value,
        permissions=profile.get_permissions(),
        user={
            "id": str(user.id),
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
        },
    )


# ── Verify backup code (alternative to TOTP) ────────────

@router.post("/verify-backup-code", response_model=AdminTokenResponse)
async def verify_backup_code(
    request: Request,
    payload: BackupCodeVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Use a one-time backup code instead of TOTP."""
    try:
        token_data = decode_token(payload.temp_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired temp token")
    
    if token_data.get("type") != "2fa_pending":
        raise HTTPException(status_code=400, detail="Invalid token type")
    
    # Rate-limit 2FA/backup attempts per temp_token
    token_key = hashlib.sha256(payload.temp_token.encode()).hexdigest()[:16]
    now = time.time()
    _2fa_attempts[token_key] = [t for t in _2fa_attempts[token_key] if now - t < _2FA_WINDOW]
    if len(_2fa_attempts[token_key]) >= MAX_2FA_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new login.")
    _2fa_attempts[token_key].append(now)

    user_id = UUID(token_data["sub"])
    client_ip = get_client_ip(request)
    
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await get_admin_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=403, detail="Admin profile not found")
    
    # Find matching unused backup code
    code_hash = hash_backup_code(payload.backup_code.upper().strip())
    bc_result = await db.execute(
        select(BackupCode).where(
            BackupCode.admin_profile_id == profile.id,
            BackupCode.code_hash == code_hash,
            BackupCode.is_used == False,
        )
    )
    backup_code = bc_result.scalar_one_or_none()
    
    if not backup_code:
        await create_audit_log(
            db, str(user.id), "backup_code_failed", "auth",
            ip_address=client_ip,
        )
        raise HTTPException(status_code=401, detail="Invalid backup code")
    
    # Mark code as used
    backup_code.is_used = True
    backup_code.used_at = datetime.now(timezone.utc)
    
    # Create session
    session = await create_admin_session(
        db, profile.id, client_ip,
        user_agent=request.headers.get("user-agent"),
    )
    
    profile.last_login_at = datetime.now(timezone.utc)
    profile.last_login_ip = client_ip
    
    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": "admin",
            "admin_role": profile.admin_role.value,
            "session_id": str(session.id),
        },
        expires_delta=timedelta(hours=2),
    )
    
    # Count remaining backup codes
    remaining = await db.execute(
        select(func.count(BackupCode.id)).where(
            BackupCode.admin_profile_id == profile.id,
            BackupCode.is_used == False,
        )
    )
    remaining_count = remaining.scalar() or 0
    
    await create_audit_log(
        db, str(user.id), "login_with_backup_code", "auth",
        ip_address=client_ip,
        metadata={"remaining_codes": remaining_count},
    )
    
    return AdminTokenResponse(
        access_token=access_token,
        expires_in=2 * 3600,
        admin_role=profile.admin_role.value,
        permissions=profile.get_permissions(),
        user={
            "id": str(user.id),
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "warning": f"Only {remaining_count} backup codes remaining" if remaining_count < 3 else None,
        },
    )


# ── TOTP Setup ──────────────────────────────────────────

@router.post("/setup-2fa", response_model=TOTPSetupResponse)
async def setup_2fa(
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Generate TOTP secret and QR code for 2FA setup."""
    profile: AdminProfile = admin_data["admin_profile"]
    user_id = UUID(admin_data["user_id"])
    
    # Get username for provisioning URI
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    username = user.username or user.phone if user else "admin"
    
    # Generate or replace TOTP device
    existing = await db.execute(
        select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
    )
    old_device = existing.scalar_one_or_none()
    if old_device:
        await db.delete(old_device)
    
    secret = generate_totp_secret()
    uri = get_totp_provisioning_uri(secret, username)
    qr_base64 = generate_totp_qr_base64(uri)
    
    device = TOTPDevice(
        admin_profile_id=profile.id,
        secret=secret,
        is_confirmed=False,
    )
    db.add(device)
    
    await create_audit_log(
        db, admin_data["user_id"], "2fa_setup_initiated", "auth",
        ip_address=admin_data["client_ip"],
    )
    
    return TOTPSetupResponse(
        secret=secret,
        provisioning_uri=uri,
        qr_code_base64=qr_base64,
    )


@router.post("/confirm-2fa")
async def confirm_2fa(
    request: Request,
    payload: TOTPConfirmRequest,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Confirm 2FA setup by verifying a TOTP code."""
    profile: AdminProfile = admin_data["admin_profile"]
    
    totp_result = await db.execute(
        select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
    )
    device = totp_result.scalar_one_or_none()
    
    if not device:
        raise HTTPException(status_code=400, detail="No 2FA device pending setup")
    
    if not verify_totp_code(device.secret, payload.code):
        raise HTTPException(status_code=400, detail="Invalid code — scan QR and try again")
    
    device.is_confirmed = True
    profile.is_2fa_enabled = True
    
    # Generate backup codes
    codes = generate_backup_codes(10)
    for code in codes:
        bc = BackupCode(
            admin_profile_id=profile.id,
            code_hash=hash_backup_code(code),
        )
        db.add(bc)
    
    await create_audit_log(
        db, admin_data["user_id"], "2fa_enabled", "auth",
        ip_address=admin_data["client_ip"],
    )
    
    return {
        "message": "2FA enabled successfully",
        "backup_codes": codes,
        "warning": "Save these backup codes in a secure location. They cannot be shown again.",
    }


# ── Regenerate backup codes ─────────────────────────────

@router.post("/regenerate-backup-codes", response_model=BackupCodesResponse)
async def regenerate_backup_codes(
    request: Request,
    payload: StepUpAuthRequest,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate backup codes (requires step-up TOTP)."""
    profile: AdminProfile = admin_data["admin_profile"]
    
    # Step-up auth: verify TOTP
    totp_result = await db.execute(
        select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
    )
    device = totp_result.scalar_one_or_none()
    if not device or not verify_totp_code(device.secret, payload.totp_code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code for step-up auth")
    
    # Delete old backup codes
    from sqlalchemy import delete as sa_delete
    await db.execute(
        sa_delete(BackupCode).where(BackupCode.admin_profile_id == profile.id)
    )
    
    # Generate new ones
    codes = generate_backup_codes(10)
    for code in codes:
        bc = BackupCode(
            admin_profile_id=profile.id,
            code_hash=hash_backup_code(code),
        )
        db.add(bc)
    
    await create_audit_log(
        db, admin_data["user_id"], "backup_codes_regenerated", "auth",
        ip_address=admin_data["client_ip"],
    )
    
    return BackupCodesResponse(codes=codes)


# ── Step-up authentication ──────────────────────────────

@router.post("/step-up-verify")
async def step_up_verify(
    request: Request,
    payload: StepUpAuthRequest,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Re-authenticate with TOTP for sensitive actions."""
    profile: AdminProfile = admin_data["admin_profile"]
    
    if not profile.is_2fa_enabled:
        return {"verified": True, "message": "2FA not enabled, step-up not required"}
    
    totp_result = await db.execute(
        select(TOTPDevice).where(TOTPDevice.admin_profile_id == profile.id)
    )
    device = totp_result.scalar_one_or_none()
    
    if not device or not verify_totp_code(device.secret, payload.totp_code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    
    # Mark step-up as verified for this session (5 minute window)
    token_data = decode_token(request.headers.get("authorization", "").replace("Bearer ", ""))
    session_id = token_data.get("session_id")
    if session_id:
        session_result = await db.execute(
            select(AdminSession).where(AdminSession.id == UUID(session_id))
        )
        session = session_result.scalar_one_or_none()
        if session:
            session.step_up_verified_at = datetime.now(timezone.utc)
    
    return {"verified": True, "valid_for_seconds": 300}


# ── Session Management ──────────────────────────────────

@router.get("/sessions")
async def list_sessions(
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """List all active sessions for current admin."""
    profile: AdminProfile = admin_data["admin_profile"]
    
    result = await db.execute(
        select(AdminSession).where(
            AdminSession.admin_profile_id == profile.id,
            AdminSession.is_active == True,
        ).order_by(AdminSession.last_activity_at.desc())
    )
    sessions = result.scalars().all()
    
    # Determine current session
    token_data = decode_token(request.headers.get("authorization", "").replace("Bearer ", ""))
    current_session_id = token_data.get("session_id")
    
    return [
        AdminSessionResponse(
            id=str(s.id),
            ip_address=s.ip_address,
            user_agent=s.user_agent,
            is_active=s.is_active,
            created_at=s.created_at.isoformat(),
            last_activity_at=s.last_activity_at.isoformat(),
            is_current=(str(s.id) == current_session_id),
        )
        for s in sessions
    ]


@router.delete("/sessions/{session_id}")
async def revoke_session_endpoint(
    session_id: UUID,
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Revoke a specific session."""
    await revoke_session(db, session_id)
    await create_audit_log(
        db, admin_data["user_id"], "session_revoked", "auth",
        entity_id=str(session_id),
        ip_address=admin_data["client_ip"],
    )
    return {"message": "Session revoked"}


@router.delete("/sessions")
async def revoke_all_sessions_endpoint(
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Revoke all other sessions."""
    token_data = decode_token(request.headers.get("authorization", "").replace("Bearer ", ""))
    current_session_id = token_data.get("session_id")
    
    await revoke_all_sessions(
        db, admin_data["admin_profile"].id,
        except_session_id=UUID(current_session_id) if current_session_id else None,
    )
    
    await create_audit_log(
        db, admin_data["user_id"], "all_sessions_revoked", "auth",
        ip_address=admin_data["client_ip"],
    )
    return {"message": "All other sessions revoked"}


# ── Admin Profile ───────────────────────────────────────

@router.get("/me", response_model=AdminProfileResponse)
async def get_admin_me(
    admin_data: dict = Depends(require_admin_with_profile),
):
    """Get current admin profile."""
    profile: AdminProfile = admin_data["admin_profile"]
    return AdminProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        admin_role=profile.admin_role.value,
        permissions=profile.get_permissions(),
        is_2fa_enabled=profile.is_2fa_enabled,
        last_login_at=profile.last_login_at.isoformat() if profile.last_login_at else None,
        last_login_ip=profile.last_login_ip,
        created_at=profile.created_at.isoformat(),
    )


# ── Create Admin (Super Admin only) ─────────────────────

@router.post("/create-admin")
async def create_new_admin(
    request: Request,
    payload: CreateAdminRequest,
    admin_data: dict = Depends(require_permission("system:admin")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin user with role (super admin only)."""
    # Check username/phone uniqueness
    existing = await db.execute(
        select(User).where(
            (User.phone == payload.phone) |
            (User.username == payload.username)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Phone or username already registered")
    
    # Create user
    user = User(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=UserRole.ADMIN,
        is_verified=True,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    
    # Create admin profile
    try:
        admin_role = AdminRoleType(payload.admin_role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid admin role: {payload.admin_role}")
    
    profile = AdminProfile(
        user_id=user.id,
        admin_role=admin_role,
    )
    db.add(profile)
    
    await create_audit_log(
        db, admin_data["user_id"], "admin_created", "user",
        entity_id=str(user.id),
        after_state={
            "full_name": payload.full_name,
            "username": payload.username,
            "admin_role": payload.admin_role,
        },
        ip_address=admin_data["client_ip"],
    )
    
    return {
        "user_id": str(user.id),
        "full_name": user.full_name,
        "username": user.username,
        "admin_role": admin_role.value,
        "message": "Admin user created. They should set up 2FA on first login.",
    }


# ── Update Admin Profile (Super Admin only) ─────────────

@router.put("/admins/{user_id}/profile")
async def update_admin_profile(
    user_id: UUID,
    payload: AdminProfileUpdate,
    request: Request,
    admin_data: dict = Depends(require_permission("system:admin")),
    db: AsyncSession = Depends(get_db),
):
    """Update admin role or permissions (super admin only)."""
    profile = await get_admin_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Admin profile not found")
    
    before = {
        "admin_role": profile.admin_role.value,
        "custom_permissions": profile.custom_permissions,
        "ip_allowlist": profile.ip_allowlist,
    }
    
    if payload.admin_role:
        try:
            profile.admin_role = AdminRoleType(payload.admin_role)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid admin role")
    
    if payload.custom_permissions is not None:
        profile.custom_permissions = payload.custom_permissions
    
    if payload.ip_allowlist is not None:
        profile.ip_allowlist = payload.ip_allowlist
    
    await create_audit_log(
        db, admin_data["user_id"], "admin_profile_updated", "user",
        entity_id=str(user_id),
        before_state=before,
        after_state={
            "admin_role": profile.admin_role.value,
            "custom_permissions": profile.custom_permissions,
            "ip_allowlist": profile.ip_allowlist,
        },
        ip_address=admin_data["client_ip"],
    )
    
    return {"message": "Admin profile updated", "admin_role": profile.admin_role.value}


@router.post("/logout")
async def admin_logout(
    request: Request,
    admin_data: dict = Depends(require_admin_with_profile),
    db: AsyncSession = Depends(get_db),
):
    """Logout and revoke current session."""
    token_data = decode_token(request.headers.get("authorization", "").replace("Bearer ", ""))
    session_id = token_data.get("session_id")
    if session_id:
        await revoke_session(db, UUID(session_id))
    
    await create_audit_log(
        db, admin_data["user_id"], "logout", "auth",
        ip_address=admin_data["client_ip"],
    )
    
    return {"message": "Logged out successfully"}
