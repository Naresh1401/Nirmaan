"""Authentication endpoints — hardened with rate limiting and input validation."""

import re
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    OTPSendRequest,
    OTPSendResponse,
    OTPVerifyLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.otp import send_otp as otp_send, verify_otp as otp_verify

router = APIRouter()

# Roles that users are allowed to self-assign during registration
ALLOWED_SELF_ROLES = {"customer", "supplier", "delivery_partner"}


def _validate_password_strength(password: str) -> None:
    """Enforce password complexity rules."""
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("one digit")
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Password must contain {', '.join(errors)}",
        )


def _is_email(value: str) -> bool:
    """Check if value looks like an email."""
    return "@" in value and "." in value.split("@")[-1]


def _is_phone(value: str) -> bool:
    """Check if value looks like a phone number."""
    return bool(re.match(r"^\+?[1-9]\d{9,14}$", value))


async def _find_user_by_identifier(identifier: str, db: AsyncSession) -> User | None:
    """Find a user by username, phone number, or email."""
    identifier = identifier.strip()

    # Try matching by phone, email, or username
    result = await db.execute(
        select(User).where(
            or_(
                User.phone == identifier,
                User.email == identifier,
                User.username == identifier,
            )
        )
    )
    return result.scalar_one_or_none()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user. Admin role cannot be self-assigned."""

    # SECURITY: Block admin role self-assignment
    role = data.role.lower().strip()
    if role not in ALLOWED_SELF_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role. Choose from: customer, supplier, delivery_partner",
        )

    # Validate password strength
    _validate_password_strength(data.password)

    # Check if phone already exists
    result = await db.execute(select(User).where(User.phone == data.phone))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered",
        )

    # Check email uniqueness if provided
    if data.email:
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

    # Check username uniqueness if provided
    if data.username:
        # Validate username format
        if not re.match(r"^[a-zA-Z0-9_]+$", data.username):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Username can only contain letters, numbers, and underscores",
            )
        result = await db.execute(select(User).where(User.username == data.username.lower()))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )

    user = User(
        full_name=data.full_name,
        username=data.username.lower() if data.username else None,
        phone=data.phone,
        email=data.email,
        password_hash=hash_password(data.password),
        role=UserRole(role),
        city=data.city,
        state=data.state,
    )
    db.add(user)
    await db.flush()

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with username/phone/email and password. Includes timing-safe failure delay."""
    user = await _find_user_by_identifier(data.identifier, db)

    if not user or not verify_password(data.password, user.password_hash):
        # Delay to slow brute-force attacks
        await asyncio.sleep(1)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Check your username/phone/email and password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh-token")
async def refresh_token(refresh_token: str):
    """Get a new access token using refresh token."""
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    token_data = {"sub": payload["sub"], "role": payload["role"]}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current logged-in user info."""
    result = await db.execute(
        select(User).where(User.id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


# ═══════════════════════════════════════════════════════════════
# OTP-BASED LOGIN
# ═══════════════════════════════════════════════════════════════

@router.post("/otp/send")
async def send_login_otp(data: OTPSendRequest, db: AsyncSession = Depends(get_db)):
    """
    Send an OTP to a registered phone number for passwordless login.
    The phone must already be registered.
    """
    # Verify user exists
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal whether account exists — add delay like real send
        await asyncio.sleep(0.5)
        # Return success anyway to prevent phone enumeration
        return {"success": True, "message": "If this number is registered, an OTP has been sent.", "expires_in": 300}

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )

    result = otp_send(data.phone, purpose=data.purpose)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=result["message"],
        )

    # In production, don't expose _dev_otp
    return {
        "success": True,
        "message": "OTP sent successfully",
        "expires_in": result.get("expires_in", 300),
        "_dev_otp": result.get("_dev_otp"),  # Remove in production!
    }


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_login_otp(data: OTPVerifyLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP and log the user in (passwordless login).
    Returns access + refresh tokens on success.
    """
    # Verify OTP first
    otp_result = otp_verify(data.phone, data.otp, purpose="login")

    if not otp_result["success"]:
        await asyncio.sleep(0.5)  # Slow down brute force
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=otp_result["message"],
        )

    # OTP verified — find user
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Mark user as verified (they proved they own this phone)
    if not user.is_verified:
        user.is_verified = True
        await db.flush()

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserResponse.model_validate(user),
    )


# ═══════════════════════════════════════════════════════════════
# FORGOT PASSWORD / RESET PASSWORD
# ═══════════════════════════════════════════════════════════════

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Send OTP for password reset.
    Accepts phone number OR email as identifier.
    Always returns success to prevent enumeration.
    """
    identifier = data.identifier.strip()

    # Find user by phone or email
    user = await _find_user_by_identifier(identifier, db)

    if not user:
        await asyncio.sleep(0.5)
        return {
            "success": True,
            "message": "If this account exists, an OTP has been sent to the registered phone.",
            "expires_in": 300,
            "recovery_phone": None,
        }

    # OTP is always sent to the user's phone number
    otp_result = otp_send(user.phone, purpose="reset_password")

    if not otp_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=otp_result["message"],
        )

    # Mask the phone for display (show last 4 digits)
    masked_phone = "X" * (len(user.phone) - 4) + user.phone[-4:]

    return {
        "success": True,
        "message": "OTP sent successfully for password reset",
        "expires_in": otp_result.get("expires_in", 300),
        "recovery_phone": masked_phone,
        "phone": user.phone,  # Needed for reset-password step
        "_dev_otp": otp_result.get("_dev_otp"),  # Remove in production!
    }


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset password after OTP verification.
    Requires: identifier, phone (where OTP was sent), otp, new_password
    """
    # Validate new password strength
    _validate_password_strength(data.new_password)

    # Verify OTP against the phone number
    otp_result = otp_verify(data.phone, data.otp, purpose="reset_password")

    if not otp_result["success"]:
        await asyncio.sleep(0.5)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=otp_result["message"],
        )

    # Find user by the phone
    result = await db.execute(select(User).where(User.phone == data.phone))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update password
    user.password_hash = hash_password(data.new_password)
    await db.flush()

    return {"success": True, "message": "Password reset successfully. You can now log in with your new password."}
