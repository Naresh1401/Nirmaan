"""
Nirmaan — Construction Materials Marketplace API

Main FastAPI application entry point.
Hardened with security headers, rate limiting, and input sanitization.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.core.middleware import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    InputSanitizationMiddleware,
)
from app.routers import auth, suppliers, products, orders, delivery, search, admin
from app.routers import estimator, reviews, prices, credit, inventory
from app.routers import admin_auth, admin_dashboard

# Import all models so tables are created
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Create tables (use Alembic migrations in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Nirmaan API",
    description="Digital Infrastructure for Construction Material Supply",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ── Security Middleware (applied in reverse order) ──
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, auth_limit=10, general_limit=120, window=60)
app.add_middleware(InputSanitizationMiddleware)

# CORS — restricted to known origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    max_age=600,
)

# Trusted Host — prevent host header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.nirmaan.co", "nirmaan.co"],
)


# ── Routers ──────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["Suppliers"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(delivery.router, prefix="/api/v1/deliveries", tags=["Delivery"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(admin_auth.router, prefix="/api/v1/admin/auth", tags=["Admin Auth"])
app.include_router(admin_dashboard.router, prefix="/api/v1/admin/v2", tags=["Admin Dashboard"])
app.include_router(estimator.router, prefix="/api/v1/estimator", tags=["AI Estimator"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Reviews"])
app.include_router(prices.router, prefix="/api/v1/prices", tags=["Price Transparency"])
app.include_router(credit.router)  # prefix in router
app.include_router(inventory.router)  # prefix in router


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "Nirmaan API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
