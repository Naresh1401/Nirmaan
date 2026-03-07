"""Security middleware for Nirmaan API."""

import time
import hashlib
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; font-src 'self'; frame-ancestors 'none'"
        )
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        # Remove server version header
        if "server" in response.headers:
            del response.headers["server"]
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter.
    - Auth endpoints:  10 requests / 60 seconds per IP
    - General API:    120 requests / 60 seconds per IP
    """

    def __init__(self, app, auth_limit: int = 10, general_limit: int = 120, window: int = 60):
        super().__init__(app)
        self.auth_limit = auth_limit
        self.general_limit = general_limit
        self.window = window
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _clean_old(self, key: str, now: float):
        self._requests[key] = [
            t for t in self._requests[key] if now - t < self.window
        ]

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ("/", "/health"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()
        path = request.url.path

        # Determine rate limit based on path
        is_auth = "/auth/" in path
        is_2fa = "/verify-2fa" in path or "/verify-backup-code" in path
        if is_2fa:
            limit = 5  # Strict limit for 2FA attempts
            bucket = f"2fa:{client_ip}"
        elif is_auth:
            limit = self.auth_limit
            bucket = f"auth:{client_ip}"
        else:
            limit = self.general_limit
            bucket = f"api:{client_ip}"

        self._clean_old(bucket, now)

        if len(self._requests[bucket]) >= limit:
            retry_after = int(self.window - (now - self._requests[bucket][0]))
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please slow down.",
                    "retry_after": max(1, retry_after),
                },
                headers={"Retry-After": str(max(1, retry_after))},
            )

        self._requests[bucket].append(now)

        # Periodic cleanup to prevent memory growth
        if sum(len(v) for v in self._requests.values()) > 10000:
            cutoff = now - self.window
            for k in list(self._requests):
                self._requests[k] = [t for t in self._requests[k] if t > cutoff]
                if not self._requests[k]:
                    del self._requests[k]

        return await call_next(request)


class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """Block obviously malicious payloads (SQL injection, XSS)."""

    DANGEROUS_PATTERNS = [
        "<script",
        "javascript:",
        "onclick=",
        "onerror=",
        "onload=",
        "'; DROP TABLE",
        "1=1",
        "UNION SELECT",
        "' OR '1'='1",
        "-- ",
        "/**/",
        "xp_cmdshell",
        "exec(",
        "eval(",
    ]

    async def dispatch(self, request: Request, call_next):
        # Only check mutation requests with bodies
        if request.method in ("POST", "PUT", "PATCH"):
            try:
                body = await request.body()
                body_text = body.decode("utf-8", errors="ignore").lower()

                for pattern in self.DANGEROUS_PATTERNS:
                    if pattern.lower() in body_text:
                        return JSONResponse(
                            status_code=400,
                            content={"detail": "Request contains potentially unsafe content."},
                        )
            except Exception:
                pass  # If we can't read body, let it through for the route to handle

        # Also check query parameters
        query_string = str(request.url.query).lower()
        for pattern in self.DANGEROUS_PATTERNS:
            if pattern.lower() in query_string:
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Request contains potentially unsafe content."},
                )

        return await call_next(request)


class RequestBodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests with bodies exceeding the configured size limit."""

    def __init__(self, app, max_body_bytes: int = 10 * 1024 * 1024):  # 10 MB default
        super().__init__(app)
        self.max_body_bytes = max_body_bytes

    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_body_bytes:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body too large."},
                )
        return await call_next(request)
