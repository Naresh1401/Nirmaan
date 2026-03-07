"""Seed script — populate the premium_benefits table.

Run after applying the 0002_premium_tier Alembic migration:

    cd backend
    python scripts/seed_premium_benefits.py

Requires DATABASE_URL to be set (or a .env file in the backend directory).
"""

import asyncio
import os
import sys
import uuid
from pathlib import Path

# Allow running from any directory by putting backend/ on sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, text

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    sys.exit(1)

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

BENEFITS: list[dict] = [
    # ── Silver ──────────────────────────────────────────────────────
    {
        "tier": "silver",
        "benefit_name": "5% Discount on All Orders",
        "benefit_description": "Automatic 5% discount applied at checkout on every order.",
        "benefit_category": "discount",
        "value": "5%",
    },
    {
        "tier": "silver",
        "benefit_name": "Free Delivery on Orders ₹3,000+",
        "benefit_description": "Free delivery when order value exceeds ₹3,000 (vs ₹10,000 for free users).",
        "benefit_category": "delivery",
        "value": "₹3,000 threshold",
    },
    {
        "tier": "silver",
        "benefit_name": "1.5× Loyalty Points",
        "benefit_description": "Earn points 1.5 times faster on every purchase.",
        "benefit_category": "loyalty",
        "value": "1.5x multiplier",
    },
    {
        "tier": "silver",
        "benefit_name": "Priority Customer Support",
        "benefit_description": "Skip the queue — your support tickets are handled first.",
        "benefit_category": "support",
        "value": "Priority queue",
    },
    {
        "tier": "silver",
        "benefit_name": "25% Higher Credit Limit",
        "benefit_description": "Your business credit limit is boosted by 25%.",
        "benefit_category": "feature",
        "value": "+25% credit",
    },
    {
        "tier": "silver",
        "benefit_name": "Exclusive Deals & Offers",
        "benefit_description": "Access to member-only deals not available to free users.",
        "benefit_category": "feature",
        "value": "Member deals",
    },
    {
        "tier": "silver",
        "benefit_name": "AI Civil Engineering Consultant (25 queries/day)",
        "benefit_description": "Ask the AI consultant about IS codes, structural design, and cost estimation.",
        "benefit_category": "feature",
        "value": "25 queries/day",
    },
    # ── Gold ────────────────────────────────────────────────────────
    {
        "tier": "gold",
        "benefit_name": "10% Discount on All Orders",
        "benefit_description": "Automatic 10% discount applied at checkout on every order.",
        "benefit_category": "discount",
        "value": "10%",
    },
    {
        "tier": "gold",
        "benefit_name": "Always Free Delivery",
        "benefit_description": "Free delivery on every order regardless of order value.",
        "benefit_category": "delivery",
        "value": "Always free",
    },
    {
        "tier": "gold",
        "benefit_name": "2× Loyalty Points",
        "benefit_description": "Earn points twice as fast on every purchase.",
        "benefit_category": "loyalty",
        "value": "2x multiplier",
    },
    {
        "tier": "gold",
        "benefit_name": "Priority Customer Support",
        "benefit_description": "Skip the queue — your support tickets are handled first.",
        "benefit_category": "support",
        "value": "Priority queue",
    },
    {
        "tier": "gold",
        "benefit_name": "Dedicated Account Manager",
        "benefit_description": "A dedicated manager assigned to your account for personalised service.",
        "benefit_category": "support",
        "value": "Dedicated manager",
    },
    {
        "tier": "gold",
        "benefit_name": "50% Higher Credit Limit",
        "benefit_description": "Your business credit limit is boosted by 50%.",
        "benefit_category": "feature",
        "value": "+50% credit",
    },
    {
        "tier": "gold",
        "benefit_name": "Early Access to New Features",
        "benefit_description": "Be the first to try new platform features before general release.",
        "benefit_category": "feature",
        "value": "Early access",
    },
    {
        "tier": "gold",
        "benefit_name": "Bulk Pricing Access",
        "benefit_description": "Unlock bulk/wholesale pricing tiers from suppliers.",
        "benefit_category": "feature",
        "value": "Bulk pricing",
    },
    {
        "tier": "gold",
        "benefit_name": "AI Civil Engineering Consultant (100 queries/day)",
        "benefit_description": "Ask the AI consultant about IS codes, structural design, and cost estimation.",
        "benefit_category": "feature",
        "value": "100 queries/day",
    },
    # ── Platinum ─────────────────────────────────────────────────────
    {
        "tier": "platinum",
        "benefit_name": "15% Discount on All Orders",
        "benefit_description": "Automatic 15% discount applied at checkout on every order.",
        "benefit_category": "discount",
        "value": "15%",
    },
    {
        "tier": "platinum",
        "benefit_name": "Always Free Delivery",
        "benefit_description": "Free delivery on every order regardless of order value.",
        "benefit_category": "delivery",
        "value": "Always free",
    },
    {
        "tier": "platinum",
        "benefit_name": "3× Loyalty Points",
        "benefit_description": "Earn points three times as fast on every purchase.",
        "benefit_category": "loyalty",
        "value": "3x multiplier",
    },
    {
        "tier": "platinum",
        "benefit_name": "Priority Customer Support",
        "benefit_description": "Skip the queue — your support tickets are handled first.",
        "benefit_category": "support",
        "value": "Priority queue",
    },
    {
        "tier": "platinum",
        "benefit_name": "Dedicated Account Manager",
        "benefit_description": "A dedicated manager assigned to your account for personalised service.",
        "benefit_category": "support",
        "value": "Dedicated manager",
    },
    {
        "tier": "platinum",
        "benefit_name": "100% Higher Credit Limit",
        "benefit_description": "Your business credit limit is doubled.",
        "benefit_category": "feature",
        "value": "2× credit limit",
    },
    {
        "tier": "platinum",
        "benefit_name": "Early Access to New Features",
        "benefit_description": "Be the first to try new platform features before general release.",
        "benefit_category": "feature",
        "value": "Early access",
    },
    {
        "tier": "platinum",
        "benefit_name": "Bulk Pricing Access",
        "benefit_description": "Unlock bulk/wholesale pricing tiers from suppliers.",
        "benefit_category": "feature",
        "value": "Bulk pricing",
    },
    {
        "tier": "platinum",
        "benefit_name": "Unlimited AI Civil Engineering Consultant",
        "benefit_description": "Unlimited daily queries to the AI consultant.",
        "benefit_category": "feature",
        "value": "Unlimited",
    },
    {
        "tier": "platinum",
        "benefit_name": "Infrastructure Project Support",
        "benefit_description": "Specialist assistance for large-scale infrastructure and government projects.",
        "benefit_category": "feature",
        "value": "Dedicated support",
    },
    {
        "tier": "platinum",
        "benefit_name": "Government Tender Access",
        "benefit_description": "Access curated government tender listings relevant to your projects.",
        "benefit_category": "feature",
        "value": "Tender listings",
    },
    {
        "tier": "platinum",
        "benefit_name": "Custom Analytics Reports",
        "benefit_description": "Receive tailor-made spending and procurement reports.",
        "benefit_category": "feature",
        "value": "Custom reports",
    },
]


async def seed() -> None:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if the table already has data to avoid duplicates.
        result = await session.execute(text("SELECT COUNT(*) FROM premium_benefits"))
        count = result.scalar_one()
        if count > 0:
            print(f"premium_benefits already has {count} rows — skipping seed.")
            await engine.dispose()
            return

        rows = [{"id": uuid.uuid4(), "is_active": True, **b} for b in BENEFITS]
        await session.execute(
            text(
                """
                INSERT INTO premium_benefits
                    (id, tier, benefit_name, benefit_description, benefit_category, value, is_active)
                VALUES
                    (:id, :tier, :benefit_name, :benefit_description, :benefit_category, :value, :is_active)
                """
            ),
            rows,
        )
        await session.commit()
        print(f"Inserted {len(rows)} premium benefit rows.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
