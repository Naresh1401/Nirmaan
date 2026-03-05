"""
OTP Service — generates, stores, and validates time-based OTPs.

Uses in-memory storage for development. In production, switch to Redis.
OTPs are 6-digit, valid for 5 minutes, max 3 verification attempts.
Rate limited to 1 OTP per phone every 60 seconds.

SMS delivery via Twilio. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
and TWILIO_PHONE_NUMBER environment variables to enable real SMS.
Falls back to console-only output when Twilio is not configured.
"""

import os
import random
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Configuration ──
OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = 300  # 5 minutes
OTP_COOLDOWN_SECONDS = 60  # 1 minute between sends
MAX_VERIFY_ATTEMPTS = 3

# ── Twilio configuration (loaded from app settings / .env) ──
def _get_twilio_config():
    """Load Twilio config from app settings."""
    try:
        from app.core.config import settings
        return settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER
    except Exception:
        return os.getenv("TWILIO_ACCOUNT_SID", ""), os.getenv("TWILIO_AUTH_TOKEN", ""), os.getenv("TWILIO_PHONE_NUMBER", "")

_twilio_client = None

def _get_twilio_client():
    """Lazily initialize the Twilio client."""
    global _twilio_client
    if _twilio_client is not None:
        return _twilio_client
    sid, token, _ = _get_twilio_config()
    if sid and token:
        try:
            from twilio.rest import Client
            _twilio_client = Client(sid, token)
            logger.info("[OTP] Twilio client initialized — real SMS enabled")
        except Exception as e:
            logger.warning(f"[OTP] Failed to initialize Twilio: {e}")
            _twilio_client = None
    return _twilio_client


def _send_sms(phone: str, otp: str, purpose: str) -> bool:
    """
    Send OTP via Twilio SMS.
    Returns True if SMS was sent, False if falling back to dev mode.
    """
    client = _get_twilio_client()
    _, _, twilio_phone = _get_twilio_config()
    if not client or not twilio_phone:
        return False  # Fall back to dev/console mode

    # Ensure phone has country code (default to India +91)
    to_number = phone.strip()
    if not to_number.startswith("+"):
        to_number = f"+91{to_number}"

    purpose_label = "login" if purpose == "login" else "password reset"
    body = f"Your Nirmaan verification code is: {otp}. Valid for {OTP_EXPIRY_SECONDS // 60} minutes. Do not share this code with anyone."

    try:
        message = client.messages.create(
            body=body,
            from_=twilio_phone,
            to=to_number,
        )
        logger.info(f"[OTP] SMS sent to {to_number} | SID: {message.sid} | Purpose: {purpose}")
        return True
    except Exception as e:
        logger.error(f"[OTP] Twilio SMS failed for {to_number}: {e}")
        return False


# ── In-memory store ──
# key: phone → { otp, created_at, attempts, purpose }
_otp_store: dict[str, dict] = {}


def _cleanup_expired():
    """Remove expired OTPs from memory."""
    now = time.time()
    expired = [k for k, v in _otp_store.items() if now - v["created_at"] > OTP_EXPIRY_SECONDS * 2]
    for k in expired:
        del _otp_store[k]


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))


def send_otp(phone: str, purpose: str = "login") -> dict:
    """
    Generate and 'send' an OTP for a phone number.
    
    In development: OTP is logged to console (not actually sent via SMS).
    In production: integrate with an SMS provider (Twilio, MSG91, etc).
    
    Args:
        phone: The phone number to send OTP to
        purpose: 'login' or 'reset_password'
    
    Returns:
        dict with success status and message
    """
    _cleanup_expired()
    
    store_key = f"{phone}:{purpose}"
    now = time.time()
    
    # Rate limit: 1 OTP per phone per purpose per cooldown period
    if store_key in _otp_store:
        elapsed = now - _otp_store[store_key]["created_at"]
        if elapsed < OTP_COOLDOWN_SECONDS:
            remaining = int(OTP_COOLDOWN_SECONDS - elapsed)
            return {
                "success": False,
                "message": f"Please wait {remaining} seconds before requesting a new OTP",
                "retry_after": remaining,
            }
    
    otp = generate_otp()
    
    _otp_store[store_key] = {
        "otp": otp,
        "created_at": now,
        "attempts": 0,
        "purpose": purpose,
    }
    
    # Try sending via Twilio first
    sms_sent = _send_sms(phone, otp, purpose)
    
    if sms_sent:
        logger.info(f"[OTP] SMS delivered to {phone} | Purpose: {purpose}")
    else:
        # ── DEV/FALLBACK MODE: Print OTP to console ──
        logger.info(f"[OTP] Phone: {phone} | Purpose: {purpose} | OTP: {otp}")
        print(f"\n{'='*50}")
        print(f"  📱 OTP for {phone}")
        print(f"  🔑 Code: {otp}")
        print(f"  📋 Purpose: {purpose}")
        print(f"  ⏰ Expires in {OTP_EXPIRY_SECONDS // 60} minutes")
        print(f"  ⚠️  Twilio not configured — showing OTP here")
        print(f"{'='*50}\n")
    
    response = {
        "success": True,
        "message": "OTP sent successfully" if sms_sent else "OTP generated (dev mode — check console)",
        "expires_in": OTP_EXPIRY_SECONDS,
        "sms_sent": sms_sent,
    }
    
    # Only include dev OTP in response if SMS was NOT sent (dev mode)
    if not sms_sent:
        response["_dev_otp"] = otp
    
    return response


def verify_otp(phone: str, otp: str, purpose: str = "login") -> dict:
    """
    Verify an OTP for a phone number.
    
    Args:
        phone: The phone number
        otp: The OTP to verify
        purpose: 'login' or 'reset_password'
    
    Returns:
        dict with success status
    """
    store_key = f"{phone}:{purpose}"
    now = time.time()
    
    if store_key not in _otp_store:
        return {"success": False, "message": "No OTP found. Please request a new one."}
    
    record = _otp_store[store_key]
    
    # Check expiry
    if now - record["created_at"] > OTP_EXPIRY_SECONDS:
        del _otp_store[store_key]
        return {"success": False, "message": "OTP has expired. Please request a new one."}
    
    # Check max attempts
    if record["attempts"] >= MAX_VERIFY_ATTEMPTS:
        del _otp_store[store_key]
        return {"success": False, "message": "Too many failed attempts. Please request a new OTP."}
    
    # Increment attempt counter
    record["attempts"] += 1
    
    # Verify
    if record["otp"] != otp.strip():
        remaining = MAX_VERIFY_ATTEMPTS - record["attempts"]
        return {
            "success": False,
            "message": f"Invalid OTP. {remaining} attempt(s) remaining.",
        }
    
    # Success — remove the OTP (one-time use)
    del _otp_store[store_key]
    
    return {"success": True, "message": "OTP verified successfully"}


def get_active_otp_count() -> int:
    """Return count of active OTPs (for admin monitoring)."""
    _cleanup_expired()
    return len(_otp_store)
