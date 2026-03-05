"""
Admin security services: brute-force protection, session management,
TOTP handling, audit logging, IP allowlisting.
"""

import hashlib
import io
import secrets
import time
import base64
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import pyotp
import qrcode
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.admin import (
    AdminProfile, TOTPDevice, BackupCode, AdminSession,
    AuditLog, AdminRoleType, ROLE_PERMISSIONS,
)
from app.models.user import User, UserRole


# ── Brute Force Protection ──────────────────────────────

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATIONS = [60, 300, 900, 3600, 7200]  # Exponential backoff: 1m, 5m, 15m, 1h, 2h
OTP_RATE_LIMIT = 60  # seconds between OTP requests

_login_attempts: dict[str, list[float]] = defaultdict(list)
_otp_cooldowns: dict[str, float] = {}


def check_brute_force(identifier: str) -> tuple[bool, int]:
    """Check if login should be rate-limited. Returns (is_blocked, retry_after_seconds)."""
    now = time.time()
    window = 900  # 15 minute window
    _login_attempts[identifier] = [
        t for t in _login_attempts[identifier] if now - t < window
    ]
    attempts = len(_login_attempts[identifier])
    if attempts >= MAX_LOGIN_ATTEMPTS:
        lockout_idx = min(attempts - MAX_LOGIN_ATTEMPTS, len(LOCKOUT_DURATIONS) - 1)
        lockout_seconds = LOCKOUT_DURATIONS[lockout_idx]
        last_attempt = _login_attempts[identifier][-1]
        remaining = int(lockout_seconds - (now - last_attempt))
        if remaining > 0:
            return True, remaining
    return False, 0


def record_login_attempt(identifier: str):
    """Record a failed login attempt."""
    _login_attempts[identifier].append(time.time())


def clear_login_attempts(identifier: str):
    """Clear login attempts on successful login."""
    _login_attempts.pop(identifier, None)


def check_otp_cooldown(identifier: str) -> tuple[bool, int]:
    """Check OTP request cooldown."""
    now = time.time()
    last_sent = _otp_cooldowns.get(identifier, 0)
    remaining = int(OTP_RATE_LIMIT - (now - last_sent))
    if remaining > 0:
        return True, remaining
    return False, 0


def record_otp_sent(identifier: str):
    """Record OTP send time."""
    _otp_cooldowns[identifier] = time.time()


# ── TOTP Management ─────────────────────────────────────

def generate_totp_secret() -> str:
    """Generate a new TOTP secret."""
    return pyotp.random_base32()


def get_totp_provisioning_uri(secret: str, username: str) -> str:
    """Get provisioning URI for QR code."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=username, issuer_name="Nirmaan Admin")


def generate_totp_qr_base64(provisioning_uri: str) -> str:
    """Generate QR code as base64 PNG."""
    qr = qrcode.QRCode(version=1, box_size=6, border=2)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify a TOTP code with ±1 window tolerance."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


# ── Backup Codes ────────────────────────────────────────

def generate_backup_codes(count: int = 10) -> list[str]:
    """Generate human-readable backup codes."""
    codes = []
    for _ in range(count):
        code = f"{secrets.token_hex(2)}-{secrets.token_hex(2)}-{secrets.token_hex(2)}"
        codes.append(code.upper())
    return codes


def hash_backup_code(code: str) -> str:
    """Hash a backup code for storage."""
    return hashlib.sha256(code.encode()).hexdigest()


# ── Session Management ──────────────────────────────────

def generate_session_token() -> str:
    """Generate a cryptographically secure session token."""
    return secrets.token_urlsafe(48)


async def create_admin_session(
    db: AsyncSession,
    admin_profile_id: UUID,
    ip_address: str,
    user_agent: str = None,
    session_hours: int = 8,
) -> AdminSession:
    """Create a new admin session."""
    session = AdminSession(
        admin_profile_id=admin_profile_id,
        session_token=generate_session_token(),
        ip_address=ip_address,
        user_agent=user_agent,
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=session_hours),
    )
    db.add(session)
    await db.flush()
    return session


async def validate_admin_session(
    db: AsyncSession, session_token: str
) -> Optional[AdminSession]:
    """Validate and refresh an admin session."""
    result = await db.execute(
        select(AdminSession).where(
            AdminSession.session_token == session_token,
            AdminSession.is_active == True,
            AdminSession.expires_at > datetime.now(timezone.utc),
        )
    )
    session = result.scalar_one_or_none()
    if session:
        session.last_activity_at = datetime.now(timezone.utc)
    return session


async def revoke_session(db: AsyncSession, session_id: UUID):
    """Revoke a specific admin session."""
    await db.execute(
        update(AdminSession)
        .where(AdminSession.id == session_id)
        .values(is_active=False)
    )


async def revoke_all_sessions(db: AsyncSession, admin_profile_id: UUID, except_session_id: UUID = None):
    """Revoke all sessions for an admin, optionally keeping current one."""
    query = update(AdminSession).where(
        AdminSession.admin_profile_id == admin_profile_id,
        AdminSession.is_active == True,
    ).values(is_active=False)
    if except_session_id:
        query = query.where(AdminSession.id != except_session_id)
    await db.execute(query)


# ── Audit Logging ───────────────────────────────────────

async def create_audit_log(
    db: AsyncSession,
    admin_user_id: str,
    action: str,
    entity_type: str,
    entity_id: str = None,
    before_state: dict = None,
    after_state: dict = None,
    ip_address: str = "unknown",
    user_agent: str = None,
    reason: str = None,
    metadata: dict = None,
) -> AuditLog:
    """Create an immutable audit log entry."""
    log = AuditLog(
        admin_user_id=UUID(admin_user_id) if isinstance(admin_user_id, str) else admin_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_state=before_state,
        after_state=after_state,
        ip_address=ip_address,
        user_agent=user_agent,
        reason=reason,
        extra_data=metadata,
    )
    db.add(log)
    await db.flush()
    return log


# ── IP Allowlisting ─────────────────────────────────────

def check_ip_allowed(ip_address: str, allowlist: list[str]) -> bool:
    """Check if IP is in allowlist. Empty list = all allowed."""
    if not allowlist:
        return True
    return ip_address in allowlist


# ── Admin Profile Helpers ───────────────────────────────

async def get_admin_profile(db: AsyncSession, user_id: UUID) -> Optional[AdminProfile]:
    """Get admin profile for a user."""
    result = await db.execute(
        select(AdminProfile).where(AdminProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_admin_profile(
    db: AsyncSession,
    user_id: UUID,
    admin_role: AdminRoleType = AdminRoleType.SUPPORT_ADMIN,
) -> AdminProfile:
    """Get existing or create new admin profile."""
    profile = await get_admin_profile(db, user_id)
    if not profile:
        profile = AdminProfile(
            user_id=user_id,
            admin_role=admin_role,
        )
        db.add(profile)
        await db.flush()
    return profile


def get_client_ip(request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"
