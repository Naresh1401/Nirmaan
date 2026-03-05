"""Application configuration loaded from environment variables."""

from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # ── App ───────────────────────────────────────────
    APP_NAME: str = "Nirmaan"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://nirmaan:nirmaan@localhost:5432/nirmaan"

    # ── Redis ─────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Auth ──────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # ── External APIs ─────────────────────────────────
    GOOGLE_MAPS_API_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # ── Twilio SMS (for OTP) ────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""  # e.g. "+1234567890"

    # ── File Storage ──────────────────────────────────
    S3_BUCKET: str = "nirmaan-uploads"
    S3_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    model_config = {"env_file": "../.env", "case_sensitive": True, "extra": "ignore"}


settings = Settings()
