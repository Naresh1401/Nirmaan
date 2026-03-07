"""Premium AI Civil Engineering Consultant.

Provides advanced civil engineering consultation for premium members.
Covers structural design, soil analysis, IS code references, cost optimization,
and construction planning.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.premium import PremiumMembership, MembershipTier, TIER_BENEFITS

router = APIRouter(prefix="/api/v1/ai-consultant", tags=["AI Consultant"])


# ── IS Code Reference Database ────────────────────────────────────────────────
IS_CODES = {
    "IS 456": "Plain and Reinforced Concrete — Code of Practice",
    "IS 875": "Code of Practice for Design Loads (Part 1–5)",
    "IS 1893": "Criteria for Earthquake Resistant Design of Structures",
    "IS 800": "General Construction in Steel — Code of Practice",
    "IS 3370": "Code of Practice for Concrete Structures for Storage of Liquids",
    "IS 2911": "Design and Construction of Pile Foundations",
    "IS 1904": "Design and Construction of Foundations in Soils",
    "IS 13920": "Ductile Detailing of Reinforced Concrete Structures",
    "IS 4326": "Earthquake Resistant Design and Construction of Buildings",
    "IS 2386": "Methods of Test for Aggregates for Concrete",
    "IS 1786": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
    "IS 8112": "Specification for 43 Grade Ordinary Portland Cement",
    "IS 12269": "Specification for 53 Grade Ordinary Portland Cement",
}

# ── Foundation Recommendation Engine ─────────────────────────────────────────
FOUNDATION_GUIDE = {
    "hard_rock": {
        "type": "Isolated Footing / Raft Foundation",
        "depth_m": "0.5–1.0",
        "bearing_capacity_kn_m2": "3000–5000+",
        "notes": "Excellent. Minimal excavation needed.",
    },
    "medium_rock": {
        "type": "Isolated or Combined Footing",
        "depth_m": "1.0–1.5",
        "bearing_capacity_kn_m2": "500–3000",
        "notes": "Good. Standard isolated footings sufficient for most loads.",
    },
    "dense_gravel": {
        "type": "Isolated Footing",
        "depth_m": "1.0–1.5",
        "bearing_capacity_kn_m2": "200–500",
        "notes": "Good for low to medium-rise buildings.",
    },
    "dense_sand": {
        "type": "Isolated or Strip Footing",
        "depth_m": "1.5–2.0",
        "bearing_capacity_kn_m2": "150–300",
        "notes": "Adequate. Ensure below scour depth for riverine sites.",
    },
    "soft_clay": {
        "type": "Raft Foundation or Pile Foundation",
        "depth_m": "1.5–3.0+",
        "bearing_capacity_kn_m2": "50–150",
        "notes": "Low bearing capacity. Raft distributes load. Piles may be needed for heavy structures.",
    },
    "loose_sand": {
        "type": "Raft or Pile Foundation",
        "depth_m": "2.0–4.0",
        "bearing_capacity_kn_m2": "50–100",
        "notes": "Poor. Risk of liquefaction in seismic zones. Deep foundations recommended.",
    },
    "filled_ground": {
        "type": "Pile Foundation",
        "depth_m": "4.0+",
        "bearing_capacity_kn_m2": "30–80",
        "notes": "Very poor. Piles must reach natural stable strata. Thorough geotechnical investigation mandatory.",
    },
}

# ── Structural Rule-of-Thumb Calculator ──────────────────────────────────────

def beam_size(span_m: float) -> dict:
    """Calculate indicative beam dimensions per IS 456."""
    depth_mm = max(300, int(span_m * 1000 / 12))   # L/12 rule
    width_mm = max(230, depth_mm // 2)
    return {
        "span_m": span_m,
        "depth_mm": depth_mm,
        "width_mm": width_mm,
        "formula": "IS 456: depth = L/12, width = D/2 (minimum 230mm)",
        "code": "IS 456:2000",
    }


def column_size(height_m: float, load_kn: float) -> dict:
    """Indicative column sizing per IS 456."""
    # Simple sizing: size ≈ sqrt(P/(0.4*fck)) assuming M20
    import math
    fck = 20  # N/mm² for M20
    area_mm2 = (load_kn * 1000) / (0.4 * fck)
    side_mm = max(230, int(math.sqrt(area_mm2)))
    return {
        "height_m": height_m,
        "load_kn": load_kn,
        "min_size_mm": f"{side_mm}×{side_mm}",
        "formula": "IS 456: Area ≥ P/(0.4·fck), min 230mm",
        "code": "IS 456:2000",
    }


def slab_thickness(span_m: float, slab_type: str = "one_way") -> dict:
    """Indicative slab thickness per IS 456."""
    if slab_type == "one_way":
        thickness_mm = max(125, int(span_m * 1000 / 30))  # L/30
        note = "One-way slab: thickness = L/30"
    else:
        thickness_mm = max(125, int(span_m * 1000 / 35))  # L/35
        note = "Two-way slab: thickness = L/35"
    return {
        "span_m": span_m,
        "slab_type": slab_type,
        "thickness_mm": thickness_mm,
        "note": note,
        "code": "IS 456:2000",
    }


# ── Knowledge Base for Consultant Responses ──────────────────────────────────

def _build_expert_response(question: str, context: Optional[str]) -> str:
    """
    Rule-based expert civil engineering response engine.
    Used as fallback / augmentation when OpenAI is not configured.
    """
    q = question.lower()

    # Soil & Foundation queries
    if any(k in q for k in ["soil", "foundation", "footing", "bearing", "strata", "geotechnical"]):
        lines = [
            "## Foundation & Soil Analysis",
            "",
            "**Key IS Codes:** IS 1904, IS 2911, IS 6403",
            "",
            "**Soil Classification & Recommended Foundations:**",
        ]
        for soil, info in FOUNDATION_GUIDE.items():
            lines.append(f"\n**{soil.replace('_', ' ').title()}**")
            lines.append(f"- Foundation: {info['type']}")
            lines.append(f"- Depth: {info['depth_m']} m")
            lines.append(f"- Bearing Capacity: {info['bearing_capacity_kn_m2']} kN/m²")
            lines.append(f"- Notes: {info['notes']}")
        lines += [
            "",
            "**Standard Practice:**",
            "- Always conduct a Soil Investigation (boring/SPT test) before design",
            "- Minimum depth: 1.5m or below frost/shrinkage zone",
            "- For seismic Zone III+: check liquefaction potential (IS 1893 Part 1)",
        ]
        return "\n".join(lines)

    # Beam sizing
    if "beam" in q and any(k in q for k in ["size", "dimension", "design", "span"]):
        # Try to extract span
        import re
        spans = re.findall(r"(\d+(?:\.\d+)?)\s*(?:m|meter|metre)", q)
        if spans:
            span = float(spans[0])
            data = beam_size(span)
            return (
                f"## Beam Design — {span}m Span\n\n"
                f"**Recommended Dimensions (IS 456 rule-of-thumb):**\n"
                f"- Depth: **{data['depth_mm']} mm**\n"
                f"- Width: **{data['width_mm']} mm**\n"
                f"- Formula: {data['formula']}\n\n"
                f"**Reinforcement Guidance:**\n"
                f"- Main bars: 3–4 nos. of 16–20mm dia (bottom)\n"
                f"- Hanger bars: 2 nos. of 12mm dia (top)\n"
                f"- Stirrups: 8mm @ 150mm c/c (middle), 100mm c/c (ends)\n\n"
                f"⚠️ These are indicative sizes. Detailed design per IS 456 Clause 22–26 required."
            )
        return (
            "## Beam Design Guide (IS 456)\n\n"
            "**Rule of Thumb:**\n"
            "- Depth = L/12 to L/15 (simply supported)\n"
            "- Width = Depth/2 (minimum 230mm)\n"
            "- Minimum cover: 25mm (moderate exposure)\n\n"
            "**Reinforcement:**\n"
            "- Min steel: 0.85/(fy) × bd\n"
            "- Max steel: 4% of bd\n\n"
            "Please provide the span length for specific calculations."
        )

    # Column sizing
    if "column" in q:
        return (
            "## Column Design Guide (IS 456)\n\n"
            "**Minimum Dimensions:** 230mm × 230mm (IS 456 Clause 26.5.3)\n\n"
            "**Sizing Formula:**\n"
            "- Area ≥ P / (0.4·fck + 0.67·fy·p)\n"
            "- For M20 concrete + Fe415 steel @ 1% steel: Pu ≈ 0.4×20×Ag + 0.67×415×0.01×Ag\n\n"
            "**Typical Sizes:**\n"
            "| Load (kN) | Min. Column Size |\n"
            "|-----------|------------------|\n"
            "| Up to 300 | 230×230 mm |\n"
            "| 300–600   | 300×300 mm |\n"
            "| 600–1200  | 400×400 mm |\n"
            "| 1200+     | 500×500 or rectangular |\n\n"
            "**Longitudinal Steel:** 0.8%–6% of gross area\n"
            "**Ties:** min 6mm dia, spacing ≤ lesser of 300mm or least column dimension"
        )

    # Slab design
    if "slab" in q:
        return (
            "## Slab Design Guide (IS 456)\n\n"
            "**Minimum Thickness:** 125mm (for normal loads)\n\n"
            "**Thumb Rules:**\n"
            "- One-way slab: D = L/30 (simply supported)\n"
            "- Two-way slab: D = L/35 (short span)\n"
            "- Flat slab: D = L/32\n\n"
            "**Reinforcement:**\n"
            "- Main steel: 8–12mm @ 150–200mm c/c\n"
            "- Distribution steel: 8mm @ 300mm c/c\n"
            "- Minimum steel: 0.12% of bD (HYSD), 0.15% (mild steel)\n\n"
            "**Load Calculation:**\n"
            "- Dead load: 0.025 × D(mm) kN/m² (self weight)\n"
            "- Live load: 2.0 kN/m² (residential), 3.0–5.0 kN/m² (commercial)\n"
            "- Finishes: 1.0–1.5 kN/m²"
        )

    # Earthquake / seismic
    if any(k in q for k in ["seismic", "earthquake", "zone", "is 1893"]):
        return (
            "## Seismic Design Guide (IS 1893:2016)\n\n"
            "**Seismic Zones in India:**\n"
            "| Zone | Factor (Z) | Risk |\n"
            "|------|-----------|------|\n"
            "| II   | 0.10 | Low |\n"
            "| III  | 0.16 | Moderate |\n"
            "| IV   | 0.24 | High |\n"
            "| V    | 0.36 | Very High |\n\n"
            "**Telangana:** Mostly Zone II–III. Hyderabad: Zone II.\n\n"
            "**Key Requirements (IS 13920):**\n"
            "- Ductile detailing of RCC frames\n"
            "- Confined boundary elements in shear walls\n"
            "- Closed stirrups in beams and columns\n"
            "- Column-beam strength ratio: ΣMc ≥ 1.1 × ΣMb\n\n"
            "**Base Shear:** V = Ah × W\n"
            "where Ah = Z/2 × I/R × Sa/g"
        )

    # Material estimation / quantities
    if any(k in q for k in ["estimate", "material", "quantity", "sqft", "sq ft", "square"]):
        return (
            "## Material Estimation Guide\n\n"
            "Use the **AI Estimator** tool for precise calculations, or ask me for specific structures.\n\n"
            "**Quick Reference — Standard RCC Building:**\n"
            "| Material | Per 100 sqft (built-up) |\n"
            "|----------|------------------------|\n"
            "| Cement (50kg bags) | 40 bags |\n"
            "| Sand (cft) | 125 cft |\n"
            "| Gravel/Aggregate | 75 cft |\n"
            "| Steel (kg) | 400 kg |\n"
            "| Bricks | 800 nos |\n"
            "| Water | 2000 liters |\n\n"
            "**Wastage Factor:** Add 5–10% for all materials.\n\n"
            "Tell me your plot dimensions and number of floors for detailed estimates!"
        )

    # IS code queries
    if "is code" in q or "is 456" in q or "code" in q:
        lines = ["## IS Code Reference (BIS Standards)\n"]
        for code, desc in IS_CODES.items():
            lines.append(f"- **{code}:** {desc}")
        lines += [
            "",
            "**Download:** Available at BIS official portal (bis.gov.in)",
            "",
            "Ask me about any specific IS code topic for detailed guidance.",
        ]
        return "\n".join(lines)

    # Load calculation
    if any(k in q for k in ["load", "dead load", "live load", "wind load"]):
        return (
            "## Load Analysis Guide (IS 875)\n\n"
            "**Dead Loads (IS 875 Part 1):**\n"
            "- RCC slab: 25 kN/m³\n"
            "- Brick masonry: 20 kN/m³\n"
            "- Floor finishes: 0.5–1.5 kN/m²\n"
            "- Partition walls: 1.0 kN/m² (minimum)\n\n"
            "**Live Loads (IS 875 Part 2):**\n"
            "| Occupancy | Live Load (kN/m²) |\n"
            "|-----------|------------------|\n"
            "| Residential | 2.0 |\n"
            "| Office | 2.5–4.0 |\n"
            "| Assembly | 4.0–5.0 |\n"
            "| Staircase | 3.0 |\n"
            "| Roof (accessible) | 1.5–2.0 |\n\n"
            "**Wind Loads (IS 875 Part 3):**\n"
            "- Basic wind speed varies by city\n"
            "- Peddapalli/Karimnagar area: ~39 m/s\n"
            "- Design wind pressure: pd = 0.6 × Vz²"
        )

    # Cost / budget
    if any(k in q for k in ["cost", "budget", "price", "rate"]):
        return (
            "## Construction Cost Estimation (2025-26, Telangana)\n\n"
            "**Average Built-up Cost per sqft:**\n"
            "| Quality | Cost/sqft |\n"
            "|---------|----------|\n"
            "| Economy | ₹1,500–1,800 |\n"
            "| Standard | ₹1,800–2,200 |\n"
            "| Premium | ₹2,500–3,500 |\n"
            "| Luxury | ₹4,000+ |\n\n"
            "**Cost Breakup (Standard):**\n"
            "- Structure (civil): 55–60%\n"
            "- Finishes (tiles, paint): 15–20%\n"
            "- Electrical: 8–10%\n"
            "- Plumbing/Sanitary: 8–10%\n"
            "- Miscellaneous: 5%\n\n"
            "**Key Material Rates (Telangana, 2025-26):**\n"
            "- Cement (50kg): ₹370–420/bag\n"
            "- TMT Steel: ₹60,000–68,000/ton\n"
            "- River Sand: ₹2,500–3,500/ton\n"
            "- M-Sand: ₹1,200–1,800/ton\n\n"
            "Use the AI Estimator for project-specific cost breakdown."
        )

    # Road construction
    if any(k in q for k in ["road", "highway", "pavement", "bitumen"]):
        return (
            "## Road Construction Guide\n\n"
            "**IRC Standards:** IRC:37-2018 (Flexible), IRC:58-2011 (Rigid)\n\n"
            "**Flexible Pavement Layers:**\n"
            "1. Subgrade (natural/compacted soil)\n"
            "2. Sub-base: Granular (150–200mm) — IRC:78\n"
            "3. Base: WBM/Wet Mix Macadam (250mm)\n"
            "4. DBM: Dense Bituminous Macadam (50–75mm)\n"
            "5. BC: Bituminous Concrete wearing course (25–40mm)\n\n"
            "**Cost Range (Telangana):**\n"
            "| Road Type | Cost/km |\n"
            "|-----------|--------|\n"
            "| Village gravel road | ₹20–40 lakh |\n"
            "| WBM rural road | ₹50–80 lakh |\n"
            "| BT road (2-lane) | ₹1.5–2.5 cr |\n"
            "| NH 4-lane | ₹8–15 cr |\n\n"
            "**Material Quantities (per km, 2-lane BT road):**\n"
            "- Bitumen: 50–80 MT\n"
            "- Aggregate: 1,500–2,000 MT\n"
            "- Sand: 400–600 MT"
        )

    # Bridge
    if any(k in q for k in ["bridge", "culvert", "span", "deck"]):
        return (
            "## Bridge Engineering Guide\n\n"
            "**IRC Standards:** IRC:6-2017 (Loads), IRC:21-2000 (Concrete), IRC:78-2014 (Foundation)\n\n"
            "**Bridge Types by Span:**\n"
            "| Span | Recommended Type |\n"
            "|------|------------------|\n"
            "| <6m  | Box Culvert / Slab Culvert |\n"
            "| 6–15m | Slab Bridge / T-Beam Bridge |\n"
            "| 15–30m | T-Beam Girder Bridge |\n"
            "| 30–60m | Box Girder / PSC Bridge |\n"
            "| 60–200m | Cable-Stayed / Suspension |\n\n"
            "**Loading Standards (IRC:6):**\n"
            "- Class AA: 70T tracked / 40T wheeled\n"
            "- Class A: 55T train of vehicles\n"
            "- 70R: 100T tracked\n\n"
            "**Foundation:** Check scour depth (IS 3955 / IRC:78)"
        )

    # Default — general civil engineering guidance
    return (
        "## Civil Engineering Consultation\n\n"
        "I'm your **Premium AI Civil Engineering Consultant** powered by Nirmaan's knowledge base.\n\n"
        "I can assist with:\n\n"
        "**Structural Design**\n"
        "- Beam, column, slab sizing (IS 456)\n"
        "- Foundation recommendations (IS 1904, IS 2911)\n"
        "- Seismic design (IS 1893, IS 13920)\n\n"
        "**Material & Cost Estimation**\n"
        "- Quantity take-off for all structure types\n"
        "- Current Telangana market rates\n"
        "- Budget optimization strategies\n\n"
        "**Soil & Geotechnical**\n"
        "- Soil classification & bearing capacity\n"
        "- Foundation selection\n"
        "- Settlement analysis guidance\n\n"
        "**Infrastructure**\n"
        "- Road & pavement design (IRC standards)\n"
        "- Bridge engineering\n"
        "- Water & drainage systems\n\n"
        "**IS Code Library**\n"
        "- IS 456, IS 875, IS 1893, IS 800, IS 2911 and more\n\n"
        "Ask me anything like:\n"
        "- \"What size beam for a 6m span?\"\n"
        "- \"Foundation for soft clay soil?\"\n"
        "- \"Cost of 1500 sqft house in Karimnagar?\"\n"
        "- \"Seismic zone for Warangal?\""
    )


# ── Schemas ───────────────────────────────────────────────────────────────────

class ConsultRequest(BaseModel):
    question: str
    context: Optional[str] = None  # e.g. previous Q&A


class ConsultResponse(BaseModel):
    answer: str
    is_premium: bool
    tier: str
    queries_remaining: int


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/consult", response_model=ConsultResponse)
async def consult(
    req: ConsultRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Premium AI civil engineering consultation."""
    if not req.question or not req.question.strip():
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

    if membership:
        # Check expiry
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
        # Auto-create free membership record
        membership = PremiumMembership(
            user_id=current_user["user_id"],
            tier=MembershipTier.FREE,
        )
        db.add(membership)
        await db.commit()
        await db.refresh(membership)

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

    # Check quota
    if daily_limit != -1 and membership.ai_queries_today >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily query limit reached ({daily_limit} queries/day for {tier.value} tier). "
                f"Upgrade to Premium for more queries."
            ),
        )

    # Generate response
    answer = _build_expert_response(req.question, req.context)

    # Premium users get richer context prefix
    if is_premium:
        answer = (
            f"🏆 **Premium Civil Engineering Consultation** ({tier.value.capitalize()} Tier)\n\n"
            + answer
        )

    # Increment counter
    membership.ai_queries_today += 1
    await db.commit()

    remaining = (
        daily_limit - membership.ai_queries_today
        if daily_limit != -1
        else -1
    )

    return ConsultResponse(
        answer=answer,
        is_premium=is_premium,
        tier=tier.value,
        queries_remaining=remaining,
    )
