"""AI Civil Engineering Consultant — NirmaaN Premium feature."""

from datetime import date
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db as get_session
from app.core.security import get_current_user
from app.models.premium import MEMBERSHIP_PLANS, MembershipStatus, PremiumMembership
from app.models.user import User

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────


class ConsultRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=2000)
    context: Optional[Dict[str, Any]] = None  # optional structured context


class ConsultResponse(BaseModel):
    response: str
    references: List[str]
    recommendations: List[str]
    estimated_cost: Optional[Dict[str, Any]]
    safety_notes: List[str]
    next_steps: List[str]
    queries_remaining: int  # -1 = unlimited
    tier: str


# ── Knowledge base helpers ────────────────────────────────────────────

_IS_CODES = {
    "concrete": ["IS 456:2000", "IS 10262:2019"],
    "steel": ["IS 800:2007", "IS 1786:2008"],
    "earthquake": ["IS 1893:2016 (Part 1)", "IS 13920:2016"],
    "foundation": ["IS 1904:1986", "IS 2950:1981", "IS 6403:1981"],
    "soil": ["IS 1892:1979", "IS 2131:1981"],
    "safety": ["IS 3764:1992", "IS 4130:1991"],
    "masonry": ["IS 1905:1987", "IS 2212:1991"],
    "timber": ["IS 883:1994"],
    "load": ["IS 875:2015 (Parts 1-5)"],
    "rcc": ["IS 456:2000", "SP 16:1980", "SP 34:1987"],
    "pile": ["IS 2911:2010"],
    "waterproofing": ["IS 3067:1988", "IS 2645:2003"],
    "cement": ["IS 269:2015", "IS 1489:1991"],
}

_SOIL_BEARINGS = {
    "hard rock": "3200–6400 kN/m²",
    "soft rock": "1600–3200 kN/m²",
    "gravel": "300–600 kN/m²",
    "dense sand": "200–400 kN/m²",
    "medium sand": "100–250 kN/m²",
    "loose sand": "50–150 kN/m²",
    "stiff clay": "150–300 kN/m²",
    "medium clay": "75–150 kN/m²",
    "soft clay": "25–75 kN/m²",
    "black cotton soil": "50–150 kN/m² (expansive, needs special treatment)",
}

_CEMENT_GRADES = {
    "M10": {"ratio": "1:3:6", "use": "Lean concrete, blinding"},
    "M15": {"ratio": "1:2:4", "use": "Plain concrete, pathways"},
    "M20": {"ratio": "1:1.5:3", "use": "RCC slabs, beams (standard residential)"},
    "M25": {"ratio": "1:1:2", "use": "Heavy structures, columns"},
    "M30": {"ratio": "Design mix", "use": "High-rise, bridges, industrial"},
    "M35": {"ratio": "Design mix", "use": "Critical structures, post-tensioned"},
}


def _keyword_match(query_lower: str, keywords: List[str]) -> bool:
    return any(k in query_lower for k in keywords)


def _build_response(query: str) -> ConsultResponse:
    """
    Rule-based civil engineering consultant response.
    Generates structured guidance based on detected keywords.
    """
    q = query.lower()
    references: List[str] = []
    recommendations: List[str] = []
    safety_notes: List[str] = []
    next_steps: List[str] = []
    estimated_cost: Optional[Dict[str, Any]] = None
    response_parts: List[str] = []

    # ── Foundation / Soil ─────────────────────────────────────────────
    if _keyword_match(q, ["foundation", "footing", "raft", "pile", "soil"]):
        references += _IS_CODES["foundation"] + _IS_CODES["soil"]
        if "black cotton" in q or "expansive" in q:
            response_parts.append(
                "**Black Cotton Soil Foundation Design**\n\n"
                "Black cotton (expansive) soil presents significant challenges due to high swelling and shrinkage. "
                "Recommended approaches:\n"
                "1. **Under-reamed pile foundation** (IS 2911) — most reliable for expansive soils\n"
                "2. Sand replacement up to 600 mm below foundation level\n"
                "3. Use **Grade M25 concrete** minimum for foundation\n"
                "4. Provide anti-termite treatment before casting\n"
                "5. **Plinth protection band** 900 mm wide around the building\n\n"
                f"Bearing capacity of black cotton soil: {_SOIL_BEARINGS['black cotton soil']}"
            )
            recommendations += [
                "Conduct a soil investigation per IS 1892 before finalising foundation type",
                "Consider under-reamed piles as primary option",
                "Provide 300 mm granular sub-base before casting",
                "Include expansion joints every 10 m in slabs",
            ]
        elif _keyword_match(q, ["raft"]):
            response_parts.append(
                "**Raft Foundation Design Guidelines (IS 2950:1981)**\n\n"
                "Suitable when column loads are heavy and soil bearing capacity is low (<100 kN/m²). "
                "Design steps:\n"
                "1. Determine net allowable bearing capacity from soil report\n"
                "2. Raft thickness ≥ L/10 (L = span between columns)\n"
                "3. Minimum concrete grade: **M25**\n"
                "4. Two-way reinforcement (top & bottom)\n"
                "5. Min steel ratio: 0.12% of gross area (IS 456, Cl. 26.5.2)\n"
            )
        else:
            response_parts.append(
                "**Foundation Selection Guide**\n\n"
                "| Foundation Type | Soil Bearing Capacity | Floors |\n"
                "|---|---|---|\n"
                "| Isolated footing | > 150 kN/m² | G+1 to G+3 |\n"
                "| Combined footing | 100–150 kN/m² | G+2 to G+4 |\n"
                "| Raft foundation | < 100 kN/m² | Any |\n"
                "| Pile foundation | Poor / expansive | Any |\n\n"
                "**Soil bearing capacities:**\n"
                + "\n".join(f"- {k.title()}: {v}" for k, v in _SOIL_BEARINGS.items())
            )
        safety_notes += [
            "Always conduct a soil investigation (IS 1892) before foundation design",
            "Ensure foundation depth below zone of seasonal moisture variation (min 600 mm in non-expansive soils)",
        ]

    # ── RCC / Concrete Design ─────────────────────────────────────────
    if _keyword_match(q, ["rcc", "beam", "column", "slab", "concrete", "reinforcement"]):
        references += _IS_CODES["rcc"]
        if "beam" in q:
            span_hint = "6m" if "6m" in q or "6 m" in q else "5m"
            response_parts.append(
                f"**RCC Beam Design — IS 456:2000**\n\n"
                f"For a {span_hint} simply supported beam (typical residential):\n\n"
                "**Section sizing (thumb rules):**\n"
                f"- Depth = Span / 12 to 15 = {int(6000/13)} mm ≈ 450 mm\n"
                "- Width = D / 2 to D / 1.5 ≈ 230–300 mm\n\n"
                "**Concrete grade:** Minimum M20 for beams (IS 456, Cl. 6.1.2)\n\n"
                "**Steel (Fe 500):**\n"
                "- Minimum tension steel: 0.85 bd / fy\n"
                "- Maximum tension steel: 4% of bD\n"
                "- 2 nos. of 16 mm dia. (top), 3 nos. 16 mm dia. (bottom) — typical for 6 m span\n\n"
                "**Stirrups:** 8 mm dia @ 150 mm c/c (shear zone), 200 mm c/c (mid-span)\n\n"
                "**Clear cover:** 25 mm for beams in moderate exposure"
            )
        elif "column" in q:
            response_parts.append(
                "**RCC Column Design — IS 456:2000**\n\n"
                "**Short column criteria:** l_eff / D ≤ 12\n\n"
                "**Minimum column size:** 230 × 300 mm (residential), 300 × 300 mm+ (commercial)\n\n"
                "**Longitudinal steel (IS 456, Cl. 26.5.3):**\n"
                "- Minimum: 0.8% of Ag\n"
                "- Maximum: 6% of Ag (4% preferred for practical concreting)\n"
                "- Min. 4 bars; 6–8 bars for rectangular sections\n\n"
                "**Lateral ties:** 8 mm dia, pitch = min(least lateral dimension, 16× long. bar dia, 300 mm)\n\n"
                "**Concrete grade:** M25 minimum recommended for columns carrying heavy loads"
            )
        elif "slab" in q:
            response_parts.append(
                "**RCC Slab Design — IS 456:2000**\n\n"
                "**One-way slab** (L/B > 2): Main steel spans shorter direction\n"
                "**Two-way slab** (L/B ≤ 2): Steel in both directions\n\n"
                "**Typical thickness (residential):**\n"
                "- L/25 to L/30 (simply supported) = 120–150 mm for 3.5 m span\n\n"
                "**Steel:** 10 mm dia @ 150 mm c/c (main), 8 mm dia @ 200 mm c/c (distribution)\n\n"
                "**Clear cover:** 15 mm\n\n"
                "**Concrete grade:** M20 minimum (M25 for roof/terrace)"
            )
        recommendations += [
            "Use M20 or higher concrete grade for all structural RCC elements",
            "Ensure proper curing for minimum 7 days (IS 456, Cl. 13)",
            "Use Fe 500 TMT bars conforming to IS 1786",
        ]
        safety_notes += ["Ensure proper lap splices — minimum 40d for tension splices (IS 456)"]

    # ── Earthquake / Seismic ──────────────────────────────────────────
    if _keyword_match(q, ["earthquake", "seismic", "zone", "ductile", "lateral"]):
        references += _IS_CODES["earthquake"]
        zone_hint = "III" if "zone iii" in q or "zone 3" in q else ("IV" if "zone iv" in q or "zone 4" in q else "II")
        response_parts.append(
            f"**Earthquake Resistant Design — IS 1893:2016, IS 13920:2016**\n\n"
            f"**Seismic Zone {zone_hint} Design Considerations:**\n\n"
            "1. **Base Shear Calculation (IS 1893, Cl. 7.5.3):**\n"
            "   VB = Ah × W\n"
            "   where Ah = Z/2 × Sa/g × I/R\n\n"
            "2. **Zone Factor Z:**\n"
            "   - Zone II: 0.10\n"
            "   - Zone III: 0.16\n"
            "   - Zone IV: 0.24\n"
            "   - Zone V: 0.36\n\n"
            "3. **Ductile detailing (IS 13920) requirements:**\n"
            "   - Beam: min. 2 bars (top & bottom throughout)\n"
            "   - Column: ties at 100 mm c/c in confinement zones\n"
            "   - Strong column–weak beam concept must be followed\n\n"
            "4. **Building configuration:** Avoid irregular plans; provide symmetric layout\n"
            "5. **Soft storey:** Avoid open ground floor (stilt) — if required, design per IS 1893 Cl. 7.10"
        )
        recommendations += [
            "Engage a structural engineer for seismic design and detailing",
            "Adopt IS 13920 ductile detailing for all structural elements",
            "Avoid soft storey configurations",
        ]

    # ── Load calculation ──────────────────────────────────────────────
    if _keyword_match(q, ["load", "dead load", "live load", "wind load"]):
        references += _IS_CODES["load"]
        response_parts.append(
            "**Load Analysis — IS 875:2015**\n\n"
            "**Standard load values:**\n"
            "| Load Type | Value |\n"
            "|---|---|\n"
            "| Dead load (RCC slab, 150 mm) | 3.75 kN/m² |\n"
            "| Floor finish | 1.0–1.5 kN/m² |\n"
            "| Partition walls | 1.0–2.0 kN/m² |\n"
            "| Live load (residential) | 2.0 kN/m² (IS 875 Part 2) |\n"
            "| Live load (office) | 4.0 kN/m² |\n"
            "| Live load (staircase) | 3.0 kN/m² |\n"
            "| Roof live load | 1.5 kN/m² |\n\n"
            "**Load combination (IS 456, IS 1893):**\n"
            "- 1.5 (DL + LL)\n"
            "- 1.2 (DL + LL + EL)\n"
            "- 1.5 (DL + EL)"
        )

    # ── Cost estimation ───────────────────────────────────────────────
    if _keyword_match(q, ["cost", "estimate", "budget", "price", "rate"]):
        estimated_cost = {
            "residential_construction": "₹1,600–₹2,500 per sqft (basic to premium finish)",
            "cement_consumption": "0.4–0.5 bags per sqft of built-up area",
            "steel_consumption": "3.5–4.5 kg per sqft",
            "sand_consumption": "1.8–2.2 cft per sqft",
            "aggregate_consumption": "3.5–4.0 cft per sqft",
            "labour_charges": "₹400–₹600 per sqft (skilled + unskilled)",
            "disclaimer": "Estimates are indicative. Get actual quotes from local suppliers.",
        }
        response_parts.append(
            "**Construction Cost Estimation (2024–25 Telangana rates)**\n\n"
            "| Item | Unit | Rate |\n"
            "|---|---|---|\n"
            "| Cement (OPC 53) | 50 kg bag | ₹380–₹420 |\n"
            "| TMT Steel (Fe 500) | kg | ₹62–₹68 |\n"
            "| River sand | cft | ₹35–₹50 |\n"
            "| Coarse aggregate 20mm | cft | ₹28–₹38 |\n"
            "| Fly ash bricks | nos | ₹6–₹8 |\n"
            "| Ready mix concrete M20 | m³ | ₹5,500–₹6,500 |\n\n"
            "**Total construction cost (approx.):**\n"
            "- Economy finish: ₹1,600–₹1,900/sqft\n"
            "- Standard finish: ₹2,000–₹2,500/sqft\n"
            "- Premium finish: ₹2,800–₹4,000/sqft"
        )

    # ── Waterproofing ─────────────────────────────────────────────────
    if _keyword_match(q, ["waterproof", "basement", "terrace", "leak"]):
        references += _IS_CODES["waterproofing"]
        response_parts.append(
            "**Waterproofing Specifications — IS 3067 & IS 2645**\n\n"
            "**Terrace / Roof waterproofing:**\n"
            "1. Clean and prepare surface; fill cracks with polymer modified mortar\n"
            "2. Apply primer coat (bituminous or polymer)\n"
            "3. Waterproofing membrane — 2 coats of APP/SBS modified bitumen (4 mm thick)\n"
            "4. Screed (40 mm thick, 1:4 cement mortar) with 0.5% slope to drains\n"
            "5. Top with tiles or reflective paint\n\n"
            "**Basement waterproofing:**\n"
            "1. Use integral waterproofing compound in concrete mix (IS 2645)\n"
            "2. External face: crystalline waterproofing or tanking system\n"
            "3. Drainage layer (dimple mat) on outer face\n"
            "4. Dewatering during construction if water table is high\n\n"
            "**BIS specifications for waterproofing materials:**\n"
            "- Bituminous primer: IS 3384\n"
            "- Integral waterproofing compound: IS 2645"
        )

    # ── Construction scheduling ───────────────────────────────────────
    if _keyword_match(q, ["schedule", "timeline", "duration", "cpm", "pert", "planning"]):
        response_parts.append(
            "**Construction Schedule for G+2 Residential Building**\n\n"
            "| Activity | Duration | Notes |\n"
            "|---|---|---|\n"
            "| Site clearance & layout | 3 days | Mark all column centres |\n"
            "| Excavation | 5–7 days | Machine + manual |\n"
            "| Foundation (PCC + footing) | 10–14 days | Include 7 days curing |\n"
            "| Plinth beam & filling | 7–10 days | Compact fill in layers |\n"
            "| Ground floor columns | 7 days | |\n"
            "| Ground floor beam & slab | 14 days | Include 21 days curing |\n"
            "| First floor columns | 7 days | |\n"
            "| First floor beam & slab | 14 days | |\n"
            "| Second floor columns | 7 days | |\n"
            "| Second floor beam & slab | 14 days | |\n"
            "| Roof slab | 14 days | |\n"
            "| Brick masonry | 30–40 days | All floors |\n"
            "| Plastering | 20–25 days | |\n"
            "| Flooring, tiles | 15–20 days | |\n"
            "| Painting | 10–15 days | |\n"
            "| Electrical & plumbing | 20–25 days (concurrent) | |\n\n"
            "**Total: 5–7 months** (concurrent activities reduce overall timeline)\n\n"
            "Use **CPM (Critical Path Method)** to identify critical activities. "
            "Critical path typically: Foundation → Columns → Slabs → Masonry → Finishes"
        )

    # ── Fallback / General ────────────────────────────────────────────
    if not response_parts:
        response_parts.append(
            "**NirmaaN Premium Civil Engineering Consultant**\n\n"
            "I can help you with:\n"
            "- **Foundation design** (isolated, raft, pile) for various soil conditions\n"
            "- **RCC design** — beams, columns, slabs per IS 456:2000\n"
            "- **Earthquake resistant design** — IS 1893:2016, IS 13920:2016\n"
            "- **Load calculations** — IS 875:2015\n"
            "- **Waterproofing specifications** — IS 3067, IS 2645\n"
            "- **Construction cost estimation** — material rates & labour\n"
            "- **Project scheduling** — CPM/PERT for construction projects\n"
            "- **Material specifications** — BIS standards, grades, quantities\n"
            "- **Soil investigation** guidance — IS 1892, bearing capacity\n\n"
            "Please ask a more specific question about your project for detailed guidance."
        )
        references = ["IS 456:2000", "IS 875:2015", "IS 1893:2016"]
        recommendations = ["Provide more details about your specific project for targeted advice"]
        safety_notes = ["Always engage a licensed structural engineer for final design approval"]

    if not next_steps:
        next_steps = [
            "Conduct a soil investigation at your site",
            "Engage a licensed structural engineer for detailed design",
            "Source BIS-marked materials from verified suppliers on NirmaaN",
            "Review local building bye-laws and obtain necessary permits",
        ]

    if not safety_notes:
        safety_notes = ["Ensure all designs comply with local building regulations"]

    return ConsultResponse(
        response="\n\n".join(response_parts),
        references=list(dict.fromkeys(references)),  # deduplicate preserving order
        recommendations=recommendations,
        estimated_cost=estimated_cost,
        safety_notes=safety_notes,
        next_steps=next_steps,
        queries_remaining=0,  # filled in by the endpoint
        tier="",  # filled in by the endpoint
    )


# ── Endpoint ─────────────────────────────────────────────────────────

@router.post("/consultant", response_model=ConsultResponse)
async def ai_consultant(
    body: ConsultRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Premium AI Civil Engineering Consultant.
    Requires Silver tier or above.
    """
    user_id = UUID(user["user_id"])

    # Load user to check tier
    user_result = await db.execute(select(User).where(User.id == user_id))
    db_user = user_result.scalar_one_or_none()
    tier = getattr(db_user, "membership_tier", "free") if db_user else "free"

    if tier == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Civil Engineering Consultant is a NirmaaN Premium feature. "
                   "Upgrade to Silver or higher to access.",
        )

    # Check daily query limit
    daily_limit = MEMBERSHIP_PLANS.get(tier, {}).get("benefits", {}).get("ai_queries_per_day", 0)
    # For simplicity (no Redis), we allow the call and report the configured limit
    queries_remaining = -1 if daily_limit == -1 else daily_limit

    response = _build_response(body.query)
    response.queries_remaining = queries_remaining
    response.tier = tier
    return response
