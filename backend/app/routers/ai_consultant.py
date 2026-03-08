"""SETU — AI Civil Engineering Consultant.

Premium AI Civil Engineering Consultant for the Nirmaan platform.
Routes queries through the multi-agent pipeline for expert-level consultation.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.premium import PremiumMembership, MembershipTier, TIER_BENEFITS
from app.agents.orchestrator import process_query

router = APIRouter(prefix="/api/v1/ai-consultant", tags=["SETU AI Consultant"])

# ═══════════════════════════════════════════════════════════════════════════════
# IS CODE REFERENCE DATABASE
# ═══════════════════════════════════════════════════════════════════════════════

IS_CODES = {
    # Concrete
    "IS 456:2000": "Plain and Reinforced Concrete — Code of Practice",
    "IS 1343:2012": "Prestressed Concrete — Code of Practice",
    "IS 3370": "Concrete Structures for Storage of Liquids (Parts 1–4)",
    "IS 10262:2019": "Concrete Mix Proportioning — Guidelines",
    # Loads
    "IS 875 Part 1": "Dead Loads — Unit Weights of Building Materials",
    "IS 875 Part 2": "Imposed Loads on Buildings and Structures",
    "IS 875 Part 3": "Wind Loads on Buildings and Structures",
    "IS 875 Part 4": "Snow Loads",
    "IS 875 Part 5": "Special Loads and Combinations",
    # Seismic
    "IS 1893 Part 1:2016": "Earthquake Resistant Design — General Provisions",
    "IS 1893 Part 2": "Earthquake Resistant Design — Liquid Retaining Tanks",
    "IS 1893 Part 4": "Earthquake Resistant Design — Industrial Structures",
    "IS 13920:2016": "Ductile Design and Detailing of RCC Structures",
    "IS 4326:2013": "Earthquake Resistant Design and Construction of Buildings",
    # Steel
    "IS 800:2007": "General Construction in Steel — Code of Practice (LSM)",
    "IS 1786:2008": "High Strength Deformed Steel Bars (Fe415/Fe500/Fe550D)",
    # Foundations
    "IS 1904:1986": "Design and Construction of Foundations in Soils",
    "IS 2911 Part 1": "Design and Construction of Pile Foundations",
    "IS 6403:1981": "Determination of Bearing Capacity of Shallow Foundations",
    # Materials
    "IS 8112:2013": "43 Grade Ordinary Portland Cement — Specification",
    "IS 12269:2013": "53 Grade Ordinary Portland Cement — Specification",
    "IS 1489 Part 1": "Portland Pozzolana Cement (Fly Ash Based)",
    "IS 2386": "Methods of Test for Aggregates for Concrete (Parts 1–8)",
    "IS 1077:1992": "Common Burnt Clay Building Bricks — Specification",
    # Transportation
    "IRC 37:2018": "Guidelines for Design of Flexible Pavements",
    "IRC 58:2015": "Guidelines for Design of Plain Jointed Rigid Pavements",
    "IRC 6:2017": "Standard Specifications and Code for Road Bridges — Loads",
    "IRC 78:2014": "Standard Specifications for Road Bridges — Foundations",
    "IRC SP:13": "Guidelines for the Design of Small Bridges and Culverts",
    # Water / Hydraulic
    "IS 3370 Part 2": "Reinforced Concrete Structures for Liquid Storage",
    "IS 1172:1993": "Basic Requirements for Water Supply for Buildings",
    # Environmental
    "IS 1742:1983": "Code of Practice for Building Drainage",
    "NBC 2016": "National Building Code of India",
}

# ═══════════════════════════════════════════════════════════════════════════════
# FOUNDATION RECOMMENDATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

FOUNDATION_GUIDE = {
    "hard_rock": {
        "type": "Isolated Footing / Raft Foundation",
        "depth_m": "0.5–1.0", "bearing_kn_m2": "3000–5000+",
        "spt_n": ">50 (refusal)", "notes": "Excellent. Minimal excavation.",
    },
    "weathered_rock": {
        "type": "Isolated or Strip Footing",
        "depth_m": "0.8–1.5", "bearing_kn_m2": "500–3000",
        "spt_n": "30–50", "notes": "Good. Standard footings. Verify rock quality.",
    },
    "dense_gravel": {
        "type": "Isolated Footing",
        "depth_m": "1.0–1.5", "bearing_kn_m2": "200–500",
        "spt_n": "30–50", "notes": "Good for low to medium-rise buildings.",
    },
    "dense_sand": {
        "type": "Isolated or Strip Footing",
        "depth_m": "1.5–2.0", "bearing_kn_m2": "150–300",
        "spt_n": "15–30", "notes": "Adequate. Check scour depth for riverine sites.",
    },
    "stiff_clay": {
        "type": "Isolated or Combined Footing",
        "depth_m": "1.5–2.0", "bearing_kn_m2": "100–200",
        "spt_n": "8–15", "notes": "Moderate. Check long-term settlement (consolidation).",
    },
    "soft_clay": {
        "type": "Raft Foundation or Pile Foundation",
        "depth_m": "1.5–3.0+", "bearing_kn_m2": "50–150",
        "spt_n": "2–8", "notes": "Low SBC. Raft or piles needed. Check consolidation.",
    },
    "loose_sand": {
        "type": "Raft or Pile Foundation",
        "depth_m": "2.0–4.0", "bearing_kn_m2": "50–100",
        "spt_n": "<10", "notes": "Poor. Liquefaction risk in Seismic Zone III+.",
    },
    "filled_ground": {
        "type": "Pile Foundation",
        "depth_m": "4.0+", "bearing_kn_m2": "30–80",
        "spt_n": "Variable", "notes": "Very poor. Piles must reach stable strata.",
    },
    "marine_clay": {
        "type": "Bored Piles / Well Foundation",
        "depth_m": "10.0+", "bearing_kn_m2": "20–70",
        "spt_n": "<5", "notes": "Highly compressible. Deep foundations mandatory.",
    },
    "expansive_black_cotton": {
        "type": "Under-Reamed Pile / CNS Cushion",
        "depth_m": "2.0–4.0", "bearing_kn_m2": "80–150",
        "spt_n": "5–15", "notes": "Swell-shrink potential. IS 2911 Part 3 applies.",
    },
}

# ═══════════════════════════════════════════════════════════════════════════════
# SEISMIC ZONE DATA
# ═══════════════════════════════════════════════════════════════════════════════

SEISMIC_ZONES = {
    "II":  {"Z": 0.10, "risk": "Low", "cities": "Hyderabad, Bangalore, Chennai, Nagpur, Thiruvananthapuram"},
    "III": {"Z": 0.16, "risk": "Moderate", "cities": "Mumbai, Kolkata, Lucknow, Jaipur, Bhopal, Ahmedabad, Vizag"},
    "IV":  {"Z": 0.24, "risk": "High", "cities": "Delhi, Patna, Jammu, Chandigarh, Dehradun, Siliguri"},
    "V":   {"Z": 0.36, "risk": "Very High", "cities": "Guwahati, Shillong, Srinagar, Gangtok, Port Blair, entire NE India"},
}

# Telangana-specific zone data
TELANGANA_SEISMIC = {
    "Hyderabad": "Zone II (Z=0.10)",
    "Warangal": "Zone II (Z=0.10)",
    "Karimnagar": "Zone II (Z=0.10)",
    "Peddapalli": "Zone II (Z=0.10)",
    "Ramagundam": "Zone II (Z=0.10)",
    "Khammam": "Zone II (Z=0.10)",
    "Adilabad": "Zone II–III boundary",
    "Nizamabad": "Zone II (Z=0.10)",
}




class ConsultRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    context: Optional[str] = Field(None, max_length=5000)
    mode: Optional[str] = None  # "calculator", "forensic", "exam", etc.


class ConsultResponse(BaseModel):
    answer: str
    is_premium: bool
    tier: str
    queries_remaining: int
    mode: str = "setu"


class SetuCapabilities(BaseModel):
    domains: List[str]
    is_codes_count: int
    foundation_types: int
    calculators: List[str]


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/capabilities")
async def get_capabilities():
    """Return SETU system capabilities."""
    return SetuCapabilities(
        domains=[
            "Structural Engineering (RCC + Steel)",
            "Geotechnical Engineering",
            "Transportation Engineering",
            "Hydraulic & Water Resources",
            "Environmental Engineering",
            "Construction Management",
            "Surveying & Geomatics",
            "Material Science",
            "Seismic Design",
            "Prestressed Concrete",
            "Forensic Failure Analysis",
            "Sustainability & Carbon Tracking",
            "3D Visualization & BIM",
            "Civil Engineering Software Tools",
        ],
        is_codes_count=len(IS_CODES),
        foundation_types=len(FOUNDATION_GUIDE),
        calculators=[
            "Beam Design (IS 456)",
            "Column Design (IS 456)",
            "Slab Design (IS 456)",
            "Isolated Footing (IS 456)",
            "Retaining Wall",
            "Concrete Mix Design (IS 10262)",
            "Bar Bending Schedule (IS 2502)",
        ],
    )


@router.post("/consult", response_model=ConsultResponse)
async def consult(
    req: ConsultRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """SETU — Premium AI civil engineering consultation."""
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Fetch membership
    result = await db.execute(
        select(PremiumMembership).where(
            PremiumMembership.user_id == current_user["user_id"]
        )
    )
    membership = result.scalar_one_or_none()

    tier = MembershipTier.FREE
    is_premium = False
    is_admin = current_user.get("role") == "admin"

    if membership:
        now = datetime.now(timezone.utc)
        if membership.expires_at:
            expires = membership.expires_at
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires < now:
                membership.tier = MembershipTier.FREE
                await db.commit()
        tier = membership.tier
        is_premium = tier != MembershipTier.FREE
    else:
        membership = PremiumMembership(
            user_id=current_user["user_id"],
            tier=MembershipTier.FREE,
        )
        db.add(membership)
        await db.commit()
        await db.refresh(membership)

    # Admins get full enterprise access
    if is_admin:
        tier = MembershipTier.ENTERPRISE
        is_premium = True

    benefits = TIER_BENEFITS[tier]
    daily_limit = benefits["ai_queries_per_day"]

    # Reset counter if new day
    now = datetime.now(timezone.utc)
    reset_date = membership.ai_queries_reset_date
    if reset_date.tzinfo is None:
        reset_date = reset_date.replace(tzinfo=timezone.utc)
    if (now - reset_date).days >= 1:
        membership.ai_queries_today = 0
        membership.ai_queries_reset_date = now

    # Check quota (admins are exempt)
    if not is_admin and daily_limit != -1 and membership.ai_queries_today >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily query limit reached ({daily_limit} queries/day for {tier.value} tier). "
                f"Upgrade your Nirmaan Premium plan for more queries."
            ),
        )

    # Generate SETU response (multi-agent pipeline)
    answer = process_query(question, req.context, tier.value)

    # Premium header
    if is_premium:
        tier_labels = {
            "silver": "Professional", "gold": "Business",
            "platinum": "Premium", "enterprise": "Enterprise",
        }
        label = tier_labels.get(tier.value, tier.value.capitalize())
        answer = f"🏗️ **SETU** — {label} Tier Consultation\n\n" + answer

    # Increment counter
    membership.ai_queries_today += 1
    await db.commit()

    remaining = daily_limit - membership.ai_queries_today if daily_limit != -1 else -1

    return ConsultResponse(
        answer=answer,
        is_premium=is_premium,
        tier=tier.value,
        queries_remaining=remaining,
        mode="setu",
    )
