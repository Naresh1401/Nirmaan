"""User schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(default="customer")
    city: Optional[str] = None
    state: Optional[str] = None


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    full_name: str
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
