"""User schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, model_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="customer")
    city: Optional[str] = None
    state: Optional[str] = None


class UserLogin(BaseModel):
    """Login with username, phone, or email + password."""
    identifier: str = Field(..., min_length=1, description="Username, phone number, or email")
    password: str


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    username: Optional[str] = None
    phone: str
    email: Optional[str] = None
    role: str
    is_verified: bool
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── OTP Schemas ──

class OTPSendRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    purpose: str = Field(default="login", pattern=r"^(login|reset_password)$")


class OTPSendResponse(BaseModel):
    success: bool
    message: str
    expires_in: Optional[int] = None
    retry_after: Optional[int] = None
    _dev_otp: Optional[str] = None


class OTPVerifyLoginRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    otp: str = Field(..., min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    """Accept phone number OR email for password recovery."""
    identifier: str = Field(..., min_length=1, description="Phone number or email address")


class ResetPasswordRequest(BaseModel):
    identifier: str = Field(..., min_length=1, description="Phone number or email used for recovery")
    phone: str = Field(..., description="Phone number where OTP was sent")
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=100)
