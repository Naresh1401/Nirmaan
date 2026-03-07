"""SETU — Structural Engineering & Technical Utility.

Premium AI Civil Engineering Consultant for the Nirmaan platform.
Provides expert-level structural, geotechnical, hydraulic, transportation,
environmental, construction management, 3D visualization, and software tools consultation.
"""

import math
import re
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.premium import PremiumMembership, MembershipTier, TIER_BENEFITS

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

# ═══════════════════════════════════════════════════════════════════════════════
# STRUCTURAL CALCULATORS
# ═══════════════════════════════════════════════════════════════════════════════

def _calc_beam(span_m: float, support: str = "simply_supported") -> str:
    """Detailed beam design calculation per IS 456."""
    ld_ratio = {"simply_supported": 12, "continuous": 15, "cantilever": 7}
    ratio = ld_ratio.get(support, 12)
    depth_mm = max(300, int(span_m * 1000 / ratio))
    width_mm = max(230, depth_mm // 2)
    # Self-weight check
    sw = 25 * (width_mm / 1000) * (depth_mm / 1000)  # kN/m

    # Reinforcement estimation (for M20/Fe500)
    fck, fy = 20, 500
    # Limiting moment of resistance
    xu_max_d = 0.46  # for Fe500
    mu_lim = 0.138 * fck * width_mm * depth_mm**2 / 1e6  # kN·m (approx effective depth = D-50)
    d_eff = depth_mm - 50
    mu_lim_actual = 0.138 * fck * width_mm * d_eff**2 / 1e6

    # Min reinforcement
    ast_min = max(0.85 * width_mm * d_eff / fy, 0.12 / 100 * width_mm * depth_mm)

    # Suggested bars
    bar_dia = 16 if span_m <= 5 else 20
    bar_area = math.pi * bar_dia**2 / 4
    min_bars = max(2, math.ceil(ast_min / bar_area))

    return (
        f"## 📐 Beam Design — {span_m}m Span ({support.replace('_', ' ').title()})\n\n"
        f"**Design Parameters:**\n"
        f"- Concrete: M{fck} (fck = {fck} N/mm²)\n"
        f"- Steel: Fe{fy} (fy = {fy} N/mm²)\n"
        f"- Cover: 25mm (moderate), 40mm (severe exposure)\n"
        f"- Support: {support.replace('_', ' ').title()}\n\n"
        f"**STEP 1 — Preliminary Sizing (IS 456 Cl.23.2.1):**\n"
        f"```\n"
        f"  Depth  D = L/{ratio} = {span_m*1000}/{ratio} = {depth_mm} mm\n"
        f"  Width  b = D/2 = {depth_mm}/2 = {width_mm} mm (min 230mm)\n"
        f"  d_eff  = D - cover - φ/2 = {depth_mm} - 25 - {bar_dia//2} ≈ {d_eff} mm\n"
        f"```\n\n"
        f"**STEP 2 — Self Weight:**\n"
        f"```\n"
        f"  w_sw = 25 × {width_mm/1000:.3f} × {depth_mm/1000:.3f} = {sw:.2f} kN/m\n"
        f"```\n\n"
        f"**STEP 3 — Limiting Moment of Resistance:**\n"
        f"```\n"
        f"  Mu,lim = 0.138 × fck × b × d² = 0.138 × {fck} × {width_mm} × {d_eff}²\n"
        f"         = {mu_lim_actual:.1f} kN·m\n"
        f"```\n\n"
        f"**STEP 4 — Minimum Reinforcement (IS 456 Cl.26.5.1.1):**\n"
        f"```\n"
        f"  Ast,min = 0.85 × b × d / fy = 0.85 × {width_mm} × {d_eff} / {fy}\n"
        f"         = {ast_min:.0f} mm²\n"
        f"  Use: {min_bars} nos. of {bar_dia}mm dia ({min_bars * bar_area:.0f} mm²)\n"
        f"```\n\n"
        f"**RECOMMENDED SECTION:**\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Width (b) | **{width_mm} mm** |\n"
        f"| Depth (D) | **{depth_mm} mm** |\n"
        f"| Main bars (bottom) | {min_bars}–{min_bars+2} nos. of {bar_dia}mm |\n"
        f"| Hanger bars (top) | 2 nos. of 12mm |\n"
        f"| Stirrups | 8mm @ 150 c/c (middle), 100 c/c (ends) |\n"
        f"| Clear cover | 25mm |\n\n"
        f"⚠️ **WARNING:** These are preliminary sizes. Final design requires actual loading, "
        f"BM/SF diagrams, and detailed reinforcement per IS 456 Cl.22–26.\n\n"
        f"📋 *SETU AI — Preliminary design. Must be verified by a licensed Professional Engineer.*"
    )


def _calc_column(load_kn: float, height_m: float = 3.0, fck: int = 20, fy: int = 500) -> str:
    """Column design calculation per IS 456."""
    # Assuming 1% steel
    p = 0.01
    pu_capacity_per_mm2 = 0.4 * fck + 0.67 * fy * p  # N/mm²
    ag_reqd = (load_kn * 1000) / pu_capacity_per_mm2
    side = max(230, int(math.ceil(math.sqrt(ag_reqd) / 25) * 25))  # round to 25mm

    # Slenderness check
    le = 0.65 * height_m * 1000 if height_m <= 4 else 0.80 * height_m * 1000
    slenderness = le / side
    is_short = slenderness < 12

    # Steel area
    ast = p * side * side
    bar_dia = 16 if load_kn < 800 else 20
    bar_area = math.pi * bar_dia**2 / 4
    num_bars = max(4, math.ceil(ast / bar_area))

    # Tie spacing
    tie_spacing = min(300, side, 16 * bar_dia)

    return (
        f"## 📐 Column Design — {load_kn} kN Axial Load\n\n"
        f"**Design Parameters:**\n"
        f"- Concrete: M{fck}, Steel: Fe{fy}\n"
        f"- Height: {height_m}m, Assumed steel %: {p*100:.0f}%\n\n"
        f"**STEP 1 — Required Area (IS 456 Cl.39.3):**\n"
        f"```\n"
        f"  Pu = 0.4·fck·Ac + 0.67·fy·Asc\n"
        f"  For p = {p*100:.0f}%: capacity/mm² = 0.4×{fck} + 0.67×{fy}×{p} = {pu_capacity_per_mm2:.2f} N/mm²\n"
        f"  Ag = Pu / capacity = {load_kn*1000:.0f} / {pu_capacity_per_mm2:.2f} = {ag_reqd:.0f} mm²\n"
        f"  Side = √{ag_reqd:.0f} ≈ {side} mm\n"
        f"```\n\n"
        f"**STEP 2 — Slenderness Check:**\n"
        f"```\n"
        f"  Le/D = {le:.0f}/{side} = {slenderness:.1f} {'< 12 → SHORT column ✅' if is_short else '≥ 12 → SLENDER column ⚠️ (needs additional moment)'}\n"
        f"```\n\n"
        f"**STEP 3 — Reinforcement:**\n"
        f"```\n"
        f"  Ast = {p*100:.0f}% × {side}² = {ast:.0f} mm²\n"
        f"  Use: {num_bars} nos. of {bar_dia}mm dia ({num_bars * bar_area:.0f} mm²)\n"
        f"  Ties: 8mm @ {tie_spacing}mm c/c\n"
        f"```\n\n"
        f"**RECOMMENDED SECTION:**\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Size | **{side}×{side} mm** |\n"
        f"| Longitudinal steel | {num_bars} nos. of {bar_dia}mm |\n"
        f"| Ties | 8mm @ {tie_spacing}mm c/c |\n"
        f"| Type | {'Short' if is_short else 'Slender'} column |\n"
        f"| Cover | 40mm |\n\n"
        f"{'⚠️ **WARNING:** Slender column — apply additional moment per IS 456 Cl.39.7' if not is_short else ''}\n\n"
        f"📋 *SETU AI — Preliminary design. Must be verified by a licensed Professional Engineer.*"
    )


def _calc_slab(span_m: float, slab_type: str = "two_way", fck: int = 20, fy: int = 500) -> str:
    """Slab design calculation per IS 456."""
    ratios = {"one_way": 30, "two_way": 35, "cantilever": 10, "flat_slab": 32}
    ratio = ratios.get(slab_type, 35)
    d_mm = max(100, int(span_m * 1000 / ratio))
    D_mm = d_mm + 20 + 5  # cover + half bar

    # Min reinforcement
    ast_min = 0.12 / 100 * 1000 * D_mm  # per m width

    # Dead load
    dl_slab = 25 * D_mm / 1000  # kN/m²
    dl_finish = 1.5
    ll = 2.0
    total = dl_slab + dl_finish + ll
    factored = 1.5 * total

    # Spacing for 8mm bars
    bar_area_8 = math.pi * 64 / 4
    spacing_main = min(300, int(1000 * bar_area_8 / ast_min))

    return (
        f"## 📐 Slab Design — {span_m}m Span ({slab_type.replace('_', ' ').title()})\n\n"
        f"**Design Parameters:** M{fck}/Fe{fy}\n\n"
        f"**STEP 1 — Thickness (IS 456 Cl.23.2.1):**\n"
        f"```\n"
        f"  d = L/{ratio} = {span_m*1000:.0f}/{ratio} = {d_mm} mm\n"
        f"  D = d + cover + φ/2 = {d_mm} + 20 + 5 = {D_mm} mm\n"
        f"```\n\n"
        f"**STEP 2 — Loads:**\n"
        f"```\n"
        f"  Dead load (slab) = 25 × {D_mm/1000:.3f} = {dl_slab:.2f} kN/m²\n"
        f"  Floor finish      = {dl_finish:.1f} kN/m²\n"
        f"  Live load          = {ll:.1f} kN/m²\n"
        f"  Total              = {total:.2f} kN/m²\n"
        f"  Factored (1.5×)    = {factored:.2f} kN/m²\n"
        f"```\n\n"
        f"**STEP 3 — Minimum Reinforcement (IS 456 Cl.26.5.2.1):**\n"
        f"```\n"
        f"  Ast,min = 0.12% × 1000 × {D_mm} = {ast_min:.0f} mm²/m\n"
        f"  Using 8mm bars: spacing = {spacing_main} mm c/c\n"
        f"  Distribution steel: 8mm @ 300 c/c (or 0.12% of bD)\n"
        f"```\n\n"
        f"**RESULT:**\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Slab thickness | **{D_mm} mm** |\n"
        f"| Main steel | 8mm @ {spacing_main} c/c |\n"
        f"| Distribution | 8mm @ 300 c/c |\n"
        f"| Cover | 20mm (mild), 30mm (moderate) |\n\n"
        f"📋 *SETU AI — Preliminary design. Must be verified by a licensed Professional Engineer.*"
    )


def _calc_footing(load_kn: float, sbc_kn_m2: float = 150, fck: int = 20, fy: int = 500) -> str:
    """Isolated footing design per IS 456."""
    # Service load area
    area_m2 = load_kn / sbc_kn_m2
    side_m = math.sqrt(area_m2)
    side_m = max(1.0, math.ceil(side_m * 4) / 4)  # round up to 0.25m

    # Net upward pressure (factored)
    pu = load_kn * 1.5
    qu = pu / (side_m ** 2)

    # Depth from one-way shear
    d_mm = max(300, int(side_m * 150))  # rough thumb rule

    # BM at face of column (assume 300mm column)
    col = 0.3
    cantilever = (side_m - col) / 2
    mu = qu * 1 * cantilever**2 / 2  # per m width

    return (
        f"## 📐 Isolated Footing Design — {load_kn} kN Column Load\n\n"
        f"**Given:**\n"
        f"- Column load (service): {load_kn} kN\n"
        f"- Safe Bearing Capacity (SBC): {sbc_kn_m2} kN/m²\n"
        f"- Concrete: M{fck}, Steel: Fe{fy}\n\n"
        f"**STEP 1 — Plan Area:**\n"
        f"```\n"
        f"  Area = P/SBC = {load_kn}/{sbc_kn_m2} = {area_m2:.2f} m²\n"
        f"  Side = √{area_m2:.2f} = {math.sqrt(area_m2):.2f} m → Use {side_m:.2f}m × {side_m:.2f}m\n"
        f"```\n\n"
        f"**STEP 2 — Factored Pressure:**\n"
        f"```\n"
        f"  Pu = 1.5 × {load_kn} = {pu:.0f} kN\n"
        f"  qu = {pu:.0f} / {side_m:.2f}² = {qu:.1f} kN/m²\n"
        f"```\n\n"
        f"**STEP 3 — Depth (One-way Shear Check):**\n"
        f"```\n"
        f"  Assumed effective depth d = {d_mm} mm\n"
        f"  Overall depth D = {d_mm + 60} mm (with 60mm cover)\n"
        f"```\n\n"
        f"**STEP 4 — Bending Moment at Column Face:**\n"
        f"```\n"
        f"  Cantilever = ({side_m:.2f} - {col})/2 = {cantilever:.3f} m\n"
        f"  Mu = qu × 1 × L²/2 = {qu:.1f} × {cantilever:.3f}² / 2 = {mu:.1f} kN·m/m\n"
        f"```\n\n"
        f"**RESULT:**\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Footing size | **{side_m:.2f}m × {side_m:.2f}m** |\n"
        f"| Depth | **{d_mm + 60} mm** |\n"
        f"| Bottom steel | 12mm @ 150–200 c/c (both ways) |\n"
        f"| Cover | 60mm (in contact with earth) |\n\n"
        f"⚠️ Check punching shear (two-way shear) at d/2 from column face — IS 456 Cl.31.6\n\n"
        f"📋 *SETU AI — Preliminary design. Must be verified by a licensed Professional Engineer.*"
    )


def _calc_retaining_wall(height_m: float, soil_type: str = "medium") -> str:
    """Cantilever retaining wall design guidance."""
    # Earth pressure coefficients
    phi_map = {"loose": 25, "medium": 30, "dense": 35}
    phi = phi_map.get(soil_type, 30)
    ka = (1 - math.sin(math.radians(phi))) / (1 + math.sin(math.radians(phi)))
    gamma = 18  # kN/m³ typical

    # Active pressure
    pa = 0.5 * ka * gamma * height_m**2

    # Proportions
    base_width = max(1.5, round(0.5 * height_m + 0.6, 2))
    stem_base = max(200, int(height_m * 80))
    stem_top = 200
    toe = round(base_width * 0.33, 2)
    heel = round(base_width - toe - stem_base / 1000, 2)

    return (
        f"## 📐 Cantilever Retaining Wall — {height_m}m Height\n\n"
        f"**Soil Properties (assumed {soil_type}):**\n"
        f"- φ = {phi}°, γ = {gamma} kN/m³\n"
        f"- Ka = (1-sinφ)/(1+sinφ) = {ka:.3f}\n\n"
        f"**Active Earth Pressure:**\n"
        f"```\n"
        f"  Pa = ½ × Ka × γ × H² = 0.5 × {ka:.3f} × {gamma} × {height_m}²\n"
        f"     = {pa:.1f} kN/m (acting at H/3 = {height_m/3:.2f}m from base)\n"
        f"```\n\n"
        f"**Preliminary Dimensions:**\n"
        f"| Component | Dimension |\n"
        f"|-----------|----------|\n"
        f"| Overall height | {height_m}m |\n"
        f"| Base width | **{base_width}m** (≈ 0.5H–0.7H) |\n"
        f"| Stem thickness (base) | **{stem_base}mm** |\n"
        f"| Stem thickness (top) | **{stem_top}mm** |\n"
        f"| Toe projection | {toe}m |\n"
        f"| Heel projection | {heel}m |\n"
        f"| Base slab thickness | {max(300, int(height_m*70))}mm |\n\n"
        f"**Stability Checks Required (IS 456 / IS 14458):**\n"
        f"1. ✅ Overturning: FOS ≥ 1.5 (Resisting/Overturning)\n"
        f"2. ✅ Sliding: FOS ≥ 1.5 (μW/Pa)\n"
        f"3. ✅ Bearing pressure: Max pressure < SBC\n"
        f"4. ✅ Eccentricity: e ≤ B/6 (no tension at base)\n\n"
        f"📋 *SETU AI — Preliminary design. Must be verified by a licensed Professional Engineer.*"
    )


def _calc_mix_design(grade: str = "M25") -> str:
    """Concrete mix design per IS 10262:2019."""
    grades = {
        "M15": {"fck": 15, "target": 21.6, "wc": 0.60, "cement": 300, "water": 186},
        "M20": {"fck": 20, "target": 26.6, "wc": 0.55, "cement": 340, "water": 186},
        "M25": {"fck": 25, "target": 31.6, "wc": 0.50, "cement": 380, "water": 186},
        "M30": {"fck": 30, "target": 38.3, "wc": 0.45, "cement": 400, "water": 186},
        "M35": {"fck": 35, "target": 43.3, "wc": 0.42, "cement": 420, "water": 186},
        "M40": {"fck": 40, "target": 48.3, "wc": 0.40, "cement": 440, "water": 180},
        "M45": {"fck": 45, "target": 53.3, "wc": 0.38, "cement": 450, "water": 172},
        "M50": {"fck": 50, "target": 58.3, "wc": 0.35, "cement": 460, "water": 165},
    }
    g = grades.get(grade, grades["M25"])
    # Calculate aggregates  (total agg volume after water, cement, air)
    cement_vol = g["cement"] / 3150 * 1000  # liters
    water_vol = g["water"]
    air = 20  # liters ~ 2%
    agg_vol = 1000 - cement_vol - water_vol - air
    ca_frac = 0.62  # coarse aggregate fraction
    fa_vol = agg_vol * (1 - ca_frac)
    ca_vol = agg_vol * ca_frac

    # Approximate weights (sp.gr: FA=2.6, CA=2.7)
    fa_kg = fa_vol * 2.6 / 1000 * 1000
    ca_kg = ca_vol * 2.7 / 1000 * 1000

    ratio_c = 1
    ratio_fa = round(fa_kg / g["cement"], 2)
    ratio_ca = round(ca_kg / g["cement"], 2)

    return (
        f"## 📐 Concrete Mix Design — {grade} (IS 10262:2019)\n\n"
        f"**Target Strength:**\n"
        f"```\n"
        f"  fck = {g['fck']} N/mm²\n"
        f"  f'ck (target) = fck + 1.65 × s = {g['target']:.1f} N/mm² (s = 4.0 assumed)\n"
        f"```\n\n"
        f"**Design Mix (per m³ of concrete):**\n"
        f"| Material | Quantity | Unit |\n"
        f"|----------|---------|------|\n"
        f"| **Cement (OPC 53)** | **{g['cement']}** | kg |\n"
        f"| **Water** | **{g['water']}** | kg |\n"
        f"| **Fine Aggregate (Zone II)** | **{fa_kg:.0f}** | kg |\n"
        f"| **Coarse Aggregate (20mm)** | **{ca_kg:.0f}** | kg |\n"
        f"| Admixture (if needed) | 0.5–1.5% of cement | — |\n\n"
        f"**Mix Ratio: {ratio_c} : {ratio_fa} : {ratio_ca} (w/c = {g['wc']:.2f})**\n\n"
        f"**Bags of Cement per m³:** {g['cement'] / 50:.1f} bags (50kg each)\n\n"
        f"**Quality Control:**\n"
        f"- Slump test: 75–100mm (general), 100–150mm (pumped)\n"
        f"- Cube strength test: 7-day ≥ 67% of 28-day, 28-day ≥ f'ck\n"
        f"- Curing: min 7 days (IS 456), 14 days recommended\n\n"
        f"📋 *SETU AI — Based on IS 10262:2019. Trial mixes must be conducted on-site.*"
    )


def _calc_bbs(member: str = "beam", b: int = 230, d: int = 450, span_m: float = 4.0) -> str:
    """Generate a Bar Bending Schedule template."""
    cover = 25
    ld = int(47 * 16)  # development length for 16mm Fe500
    d_eff = d - cover - 8  # assuming 16mm main bar

    # Main bottom bars
    main_length = int(span_m * 1000 + 2 * ld)  # with development length
    # Top bars (hanger)
    top_length = main_length
    # Stirrup
    stirrup_length = 2 * (b - 2 * cover + d - 2 * cover) + 2 * 75  # hooks

    num_stirrups = int(span_m * 1000 / 150) + 1  # @ 150 c/c
    nos_main = 3
    nos_top = 2

    wt_16 = 1.58  # kg/m
    wt_12 = 0.888
    wt_8 = 0.395

    return (
        f"## 📋 Bar Bending Schedule — Beam ({b}×{d}mm, {span_m}m span)\n\n"
        f"**IS Reference:** IS 2502:1999 (Steel Detailing)\n\n"
        f"| S.No | Description | Dia (mm) | Nos | Length (mm) | Total (m) | Wt (kg/m) | Weight (kg) |\n"
        f"|------|-------------|----------|-----|-------------|-----------|-----------|-------------|\n"
        f"| 1 | Main bottom bars | 16 | {nos_main} | {main_length} | {nos_main * main_length / 1000:.1f} | {wt_16} | {nos_main * main_length / 1000 * wt_16:.1f} |\n"
        f"| 2 | Hanger bars (top) | 12 | {nos_top} | {top_length} | {nos_top * top_length / 1000:.1f} | {wt_12} | {nos_top * top_length / 1000 * wt_12:.1f} |\n"
        f"| 3 | Stirrups | 8 | {num_stirrups} | {stirrup_length} | {num_stirrups * stirrup_length / 1000:.1f} | {wt_8} | {num_stirrups * stirrup_length / 1000 * wt_8:.1f} |\n"
        f"| 4 | Extra bars (at supports) | 12 | 2 | {int(span_m*1000*0.3)} | {2 * span_m*0.3:.1f} | {wt_12} | {2 * span_m * 0.3 * wt_12:.1f} |\n\n"
        f"**Total Steel Weight:** {(nos_main * main_length / 1000 * wt_16 + nos_top * top_length / 1000 * wt_12 + num_stirrups * stirrup_length / 1000 * wt_8 + 2 * span_m * 0.3 * wt_12):.1f} kg\n\n"
        f"**Notes:**\n"
        f"- Development length (Ld) for 16mm Fe500 in M20 = {ld}mm\n"
        f"- Add 10% wastage for cutting and bending\n"
        f"- Stirrup hook length = 10d = 80mm each side\n\n"
        f"📋 *SETU AI — BBS template per IS 2502. Verify with structural drawings.*"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# SETU EXPERT RESPONSE ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

def _build_setu_response(question: str, context: Optional[str], tier: str) -> str:
    """SETU rule-based expert civil engineering response engine."""
    q = question.lower().strip()

    # ── Extract numerical parameters ──
    def _find_float(pattern: str) -> Optional[float]:
        m = re.search(pattern, q)
        return float(m.group(1)) if m else None

    span_m = _find_float(r"(\d+\.?\d*)\s*(?:m\b|meter|metre)")
    load_kn = _find_float(r"(\d+\.?\d*)\s*(?:kn|kilo\s*newton)")
    height_m = _find_float(r"(\d+\.?\d*)\s*(?:m\b|meter|metre)?\s*(?:high|height|tall)")
    sqft = _find_float(r"(\d[\d,]*)\s*(?:sq\.?\s*ft|sqft|sft|square\s*feet?)")

    # ── BEAM DESIGN ──
    if "beam" in q and any(k in q for k in ["size", "dimension", "design", "span", "calculate", "what"]):
        span = span_m or 5.0
        support = "cantilever" if "cantilever" in q else "continuous" if "continuous" in q else "simply_supported"
        return _calc_beam(span, support)

    # ── COLUMN DESIGN ──
    if "column" in q and any(k in q for k in ["size", "design", "calculate", "load", "what", "dimension"]):
        load = load_kn or 600
        h = height_m or _find_float(r"(\d+\.?\d*)\s*(?:m\b)") or 3.0
        return _calc_column(load, h)

    # ── SLAB DESIGN ──
    if "slab" in q and any(k in q for k in ["size", "design", "thickness", "calculate", "what", "span", "for"]):
        span = span_m or 4.0
        st = "one_way" if "one" in q else "cantilever" if "cantilever" in q else "flat" if "flat" in q else "two_way"
        return _calc_slab(span, st)

    # ── FOOTING / FOUNDATION DESIGN ──
    if any(k in q for k in ["footing", "foundation"]) and any(k in q for k in ["design", "size", "calculate", "what", "for"]):
        load = load_kn or 500
        sbc = _find_float(r"(\d+\.?\d*)\s*(?:kn/m|kpa|sbc)") or 150
        return _calc_footing(load, sbc)

    # ── RETAINING WALL ──
    if "retaining" in q and "wall" in q:
        h = height_m or span_m or 3.0
        soil = "loose" if "loose" in q else "dense" if "dense" in q else "medium"
        return _calc_retaining_wall(h, soil)

    # ── MIX DESIGN ──
    if any(k in q for k in ["mix design", "concrete mix", "mix proportion"]):
        grade_match = re.search(r"m\s*(\d{2})", q)
        grade = f"M{grade_match.group(1)}" if grade_match else "M25"
        return _calc_mix_design(grade)

    # ── BAR BENDING SCHEDULE ──
    if any(k in q for k in ["bbs", "bar bending", "bending schedule", "reinforcement schedule"]):
        return _calc_bbs()

    # ── SOIL & GEOTECHNICAL ──
    if any(k in q for k in ["soil", "bearing capacity", "strata", "geotechnical", "spt", "bore"]):
        lines = [
            "## 🪨 Foundation & Soil Analysis\n",
            "**Key IS Codes:** IS 1904, IS 2911, IS 6403\n",
            "**Terzaghi's Bearing Capacity Equation:**",
            "```",
            "  qu = c·Nc + γ·Df·Nq + 0.5·γ·B·Nγ",
            "  where: c = cohesion, Df = depth, B = width",
            "  Nc, Nq, Nγ = bearing capacity factors (depend on φ)",
            "```\n",
            "**Soil Classification & Recommended Foundations:**",
        ]
        for soil, info in FOUNDATION_GUIDE.items():
            lines.append(f"\n**{soil.replace('_', ' ').title()}** (SPT N: {info['spt_n']})")
            lines.append(f"- Foundation: {info['type']}")
            lines.append(f"- Depth: {info['depth_m']} m | SBC: {info['bearing_kn_m2']} kN/m²")
            lines.append(f"- Notes: {info['notes']}")
        lines += [
            "\n**Standard Practice:**",
            "- Always conduct Soil Investigation (boring/SPT) before design",
            "- Minimum depth: 1.5m or below frost/shrinkage zone",
            "- IS 6403 for shallow foundations, IS 2911 for piles",
            "- For Zone III+: check liquefaction potential (IS 1893)\n",
            "📋 *SETU AI — Professional geotechnical investigation recommended.*",
        ]
        return "\n".join(lines)

    # ── EARTHQUAKE / SEISMIC ──
    if any(k in q for k in ["seismic", "earthquake", "zone", "is 1893", "ductile", "is 13920"]):
        lines = [
            "## 🌍 Seismic Design Guide (IS 1893:2016 + IS 13920)\n",
            "**Seismic Zones in India:**",
            "| Zone | Z Factor | Risk | Major Cities |",
            "|------|----------|------|-------------|",
        ]
        for zone, data in SEISMIC_ZONES.items():
            lines.append(f"| {zone} | {data['Z']:.2f} | {data['risk']} | {data['cities']} |")
        lines += [
            "\n**Telangana Seismic Data:**",
        ]
        for city, zone in TELANGANA_SEISMIC.items():
            lines.append(f"- {city}: {zone}")
        lines += [
            "\n**Base Shear Calculation (IS 1893 Cl.6.4.2):**",
            "```",
            "  VB = Ah × W",
            "  Ah = (Z/2) × (I/R) × (Sa/g)",
            "  where:",
            "    Z = Zone factor",
            "    I = Importance factor (1.0 normal, 1.5 critical)",
            "    R = Response reduction factor (3.0–5.0 for SMRF)",
            "    Sa/g = Spectral acceleration from response spectrum",
            "```\n",
            "**Ductile Detailing Requirements (IS 13920:2016):**",
            "1. Beams: Closed stirrups, min 2 bars continuous top & bottom",
            "2. Columns: ΣMc ≥ 1.1 × ΣMb (strong column–weak beam)",
            "3. Beam-column joints: Special confining reinforcement",
            "4. Shear walls: Boundary elements with confined concrete",
            "5. Lap splices NOT allowed in plastic hinge zones\n",
            "📋 *SETU AI — For structures in Zone IV/V, detailed dynamic analysis is mandatory.*",
        ]
        return "\n".join(lines)

    # ── LOAD CALCULATIONS ──
    if any(k in q for k in ["load", "dead load", "live load", "wind load", "is 875", "load combination"]):
        return (
            "## ⚖️ Load Analysis Guide (IS 875 Parts 1–5)\n\n"
            "**Dead Loads (IS 875 Part 1):**\n"
            "| Material | Unit Weight |\n"
            "|----------|------------|\n"
            "| RCC | 25 kN/m³ |\n"
            "| PCC | 24 kN/m³ |\n"
            "| Brick masonry | 20 kN/m³ |\n"
            "| Steel | 78.5 kN/m³ |\n"
            "| Floor finishes | 0.5–1.5 kN/m² |\n"
            "| Partition walls (movable) | 1.0 kN/m² min |\n"
            "| Waterproofing | 0.5 kN/m² |\n"
            "| Earth fill | 18 kN/m³ |\n\n"
            "**Live Loads (IS 875 Part 2):**\n"
            "| Occupancy | Live Load (kN/m²) |\n"
            "|-----------|------------------|\n"
            "| Residential | 2.0 |\n"
            "| Office | 2.5–4.0 |\n"
            "| Assembly (fixed seats) | 4.0 |\n"
            "| Assembly (movable) | 5.0 |\n"
            "| Staircase | 3.0–5.0 |\n"
            "| Parking | 2.5 (cars), 7.5 (trucks) |\n"
            "| Roof (accessible) | 1.5–2.0 |\n"
            "| Roof (inaccessible) | 0.75 |\n"
            "| Hospital/OT | 3.0 |\n"
            "| Library (stack rooms) | 6.0–10.0 |\n\n"
            "**Load Combinations (IS 875 Part 5 / IS 456):**\n"
            "```\n"
            "  1. 1.5 (DL + LL)\n"
            "  2. 1.2 (DL + LL + EQ)\n"
            "  3. 1.5 (DL + EQ)\n"
            "  4. 0.9 DL + 1.5 EQ (uplift/overturning)\n"
            "```\n\n"
            "**Wind Loads (IS 875 Part 3):**\n"
            "- Basic wind speed (Vb): varies 33–55 m/s by region\n"
            "- Design wind speed: Vz = Vb × k1 × k2 × k3\n"
            "- Design wind pressure: pz = 0.6 × Vz² (N/m²)\n"
            "- Telangana: Vb ≈ 39–44 m/s\n\n"
            "📋 *SETU AI — Always apply appropriate load factors per IS 456 Cl.36.4.*"
        )

    # ── COST / BUDGET ──
    if any(k in q for k in ["cost", "budget", "price", "rate", "estimate", "sqft", "sq ft"]):
        return (
            "## 💰 Construction Cost Estimation (2025-26, Telangana)\n\n"
            "**Average Built-up Cost per sqft:**\n"
            "| Quality | Cost/sqft | Description |\n"
            "|---------|----------|-------------|\n"
            "| Economy | ₹1,500–1,800 | Basic finishes, local materials |\n"
            "| Standard | ₹1,800–2,200 | Good finishes, branded materials |\n"
            "| Premium | ₹2,500–3,500 | High-end finishes, premium brands |\n"
            "| Luxury | ₹4,000+ | Imported materials, custom design |\n\n"
            "**Detailed Cost Breakup (Standard):**\n"
            "| Component | Percentage | Per sqft |\n"
            "|-----------|-----------|----------|\n"
            "| Excavation & Foundation | 10–12% | ₹180–264 |\n"
            "| RCC Structure | 25–30% | ₹450–660 |\n"
            "| Brickwork & Plastering | 12–15% | ₹216–330 |\n"
            "| Flooring & Tiling | 8–10% | ₹144–220 |\n"
            "| Doors & Windows | 5–7% | ₹90–154 |\n"
            "| Electrical | 8–10% | ₹144–220 |\n"
            "| Plumbing & Sanitary | 8–10% | ₹144–220 |\n"
            "| Painting | 4–5% | ₹72–110 |\n"
            "| Miscellaneous | 5% | ₹90–110 |\n\n"
            "**Current Material Rates (Telangana, 2025-26):**\n"
            "| Material | Rate |\n"
            "|----------|------|\n"
            "| Cement OPC 53 (50kg) | ₹370–420/bag |\n"
            "| TMT Steel Fe500D | ₹60,000–68,000/MT |\n"
            "| River Sand | ₹2,500–3,500/ton |\n"
            "| M-Sand | ₹1,200–1,800/ton |\n"
            "| 20mm Aggregate | ₹1,200–1,600/ton |\n"
            "| Red Bricks (1st class) | ₹8–12/brick |\n"
            "| AAC Blocks | ₹45–55/block |\n"
            "| Fly Ash Bricks | ₹6–8/brick |\n\n"
            "💡 **Tip:** Use the Nirmaan AI Estimator for project-specific breakdowns.\n\n"
            "📋 *SETU AI — Rates are indicative. Verify with local suppliers on Nirmaan.*"
        )

    # ── ROAD ENGINEERING ──
    if any(k in q for k in ["road", "highway", "pavement", "bitumen", "asphalt", "tar", "irc"]):
        return (
            "## 🛣️ Road & Pavement Engineering Guide\n\n"
            "**Applicable Standards:** IRC:37-2018 (Flexible), IRC:58-2015 (Rigid), MoRTH 5th Revision\n\n"
            "**Flexible Pavement Layers (bottom to top):**\n"
            "```\n"
            "  ┌─────────────────────────────────────┐\n"
            "  │   BC — Bituminous Concrete (25-40mm) │ ← Wearing course\n"
            "  ├─────────────────────────────────────┤\n"
            "  │   DBM — Dense Bituminous Mac (50-75) │ ← Binder course\n"
            "  ├─────────────────────────────────────┤\n"
            "  │   WMM — Wet Mix Macadam (250mm)      │ ← Base course\n"
            "  ├─────────────────────────────────────┤\n"
            "  │   GSB — Granular Sub-base (200mm)    │ ← Sub-base\n"
            "  ├─────────────────────────────────────┤\n"
            "  │   Compacted Subgrade (500mm)         │ ← Foundation\n"
            "  └─────────────────────────────────────┘\n"
            "```\n\n"
            "**Rigid Pavement (IRC:58):**\n"
            "- PQC (Pavement Quality Concrete): M40, 300mm thick\n"
            "- DLC (Dry Lean Concrete): M10, 150mm\n"
            "- GSB: 200mm\n"
            "- Joint spacing: transverse 4.5m, longitudinal 3.5m\n"
            "- Dowel bars: 32mm @ 300 c/c at transverse joints\n"
            "- Tie bars: 12mm @ 500 c/c at longitudinal joints\n\n"
            "**Cost Range (Telangana, 2025-26):**\n"
            "| Road Type | Cost/km |\n"
            "|-----------|--------|\n"
            "| Gravel road (village) | ₹20–40 lakh |\n"
            "| WBM rural road | ₹50–80 lakh |\n"
            "| BT 2-lane road | ₹1.5–2.5 crore |\n"
            "| NH 4-lane (flexible) | ₹8–15 crore |\n"
            "| NH 4-lane (rigid/CC) | ₹12–20 crore |\n\n"
            "📋 *SETU AI — Design per IRC:37 requires traffic data (MSA) and subgrade CBR.*"
        )

    # ── BRIDGE ENGINEERING ──
    if any(k in q for k in ["bridge", "culvert", "flyover", "viaduct"]):
        return (
            "## 🌉 Bridge Engineering Guide\n\n"
            "**Applicable Standards:** IRC:6-2017 (Loads), IRC:21-2000 (Concrete), IRC:78-2014 (Foundations)\n\n"
            "**Bridge Types by Span:**\n"
            "| Span | Type | Approx. Cost/m² |\n"
            "|------|------|------------------|\n"
            "| < 6m | Box/Slab Culvert | ₹25,000–40,000 |\n"
            "| 6–15m | Slab / T-Beam | ₹35,000–55,000 |\n"
            "| 15–30m | T-Beam Girder | ₹45,000–70,000 |\n"
            "| 30–60m | PSC Box Girder | ₹60,000–1,00,000 |\n"
            "| 60–200m | Cable-Stayed / Suspension | ₹1,50,000+ |\n"
            "| Flyover | Precast PSC Girder | ₹80,000–1,20,000 |\n\n"
            "**IRC Loading Classes:**\n"
            "- **Class AA:** 70T tracked / 40T wheeled (for NH/SH)\n"
            "- **Class A:** 55.4T train of vehicles\n"
            "- **Class 70R:** 100T bogie loading (special)\n"
            "- **Class B:** 32T (minor/district roads)\n\n"
            "**Design Checks:**\n"
            "1. Scour depth: Lacey's formula — dsm = 1.35 × (q²/f)^(1/3)\n"
            "2. Foundation: Min. 2m below max scour level\n"
            "3. Freeboard: min 1.5m above HFL\n"
            "4. Seismic: IS 1893 Part 3 for bridges\n\n"
            "📋 *SETU AI — Bridge design requires detailed site investigation & hydraulic study.*"
        )

    # ── WATER / HYDRAULIC ──
    if any(k in q for k in ["water", "pipe", "drain", "sewer", "tank", "hydraulic", "manning", "flow"]):
        return (
            "## 💧 Hydraulic & Water Resources Engineering\n\n"
            "**Open Channel Flow (Manning's Equation):**\n"
            "```\n"
            "  V = (1/n) × R^(2/3) × S^(1/2)\n"
            "  Q = A × V\n"
            "  where: n = Manning's roughness, R = A/P, S = bed slope\n"
            "```\n\n"
            "**Typical Manning's n values:**\n"
            "| Surface | n |\n"
            "|---------|---|\n"
            "| Concrete (smooth) | 0.012 |\n"
            "| Concrete (rough) | 0.015 |\n"
            "| Brick masonry | 0.015 |\n"
            "| Earth (clean) | 0.022 |\n"
            "| Earth (weedy) | 0.035 |\n"
            "| Natural stream | 0.030–0.050 |\n\n"
            "**Pipe Flow (Hazen-Williams):**\n"
            "```\n"
            "  V = 0.849 × C × R^0.63 × S^0.54\n"
            "  C = 150 (new PVC), 130 (new CI), 100 (old CI)\n"
            "```\n\n"
            "**Water Demand (IS 1172):**\n"
            "| Category | lpcd |\n"
            "|----------|------|\n"
            "| Residential (piped) | 135 |\n"
            "| Institutional | 135+25% |\n"
            "| Commercial | 150 |\n"
            "| Industrial | As per process |\n\n"
            "**Storm Drain (Rational Formula):**\n"
            "```\n"
            "  Q = C × I × A / 360 (m³/s)\n"
            "  where: C = runoff coefficient, I = intensity (mm/hr), A = area (hectares)\n"
            "```\n\n"
            "📋 *SETU AI — Hydraulic design requires site-specific rainfall and topographic data.*"
        )

    # ── STEEL STRUCTURE ──
    if any(k in q for k in ["steel", "is 800", "ismc", "ismb", "truss", "peb", "welded", "bolted"]):
        return (
            "## 🔩 Steel Structure Design (IS 800:2007 — LSM)\n\n"
            "**Design Philosophy:** Limit State Method (partial safety factors)\n\n"
            "**Common Sections:**\n"
            "| Section | Use |\n"
            "|---------|-----|\n"
            "| ISMB (beams) | Floor beams, rafters |\n"
            "| ISMC (channels) | Purlins, bracings |\n"
            "| ISA (angles) | Trusses, bracings |\n"
            "| Hollow sections | Columns, aesthetics |\n"
            "| Built-up | Heavy girders, plate girders |\n\n"
            "**Tension Member (IS 800 Cl.6):**\n"
            "```\n"
            "  Tdg = Ag × fy / γm0          (yielding of gross section)\n"
            "  Tdn = 0.9 × An × fu / γm1    (rupture of net section)\n"
            "  Design strength Td = min(Tdg, Tdn)\n"
            "```\n\n"
            "**Compression Member (IS 800 Cl.7):**\n"
            "```\n"
            "  Pd = Ae × fcd\n"
            "  fcd = f(fy, λ, buckling class a/b/c/d)\n"
            "  λ = KL/r (slenderness ratio)\n"
            "  Max λ: 180 (main), 350 (secondary)\n"
            "```\n\n"
            "**Connection Design:**\n"
            "- Bolt strength: Vdsb = fu/(√3 × γmb) × Anb (single shear)\n"
            "- Weld strength: fw = fu/(√3 × γmw) per IS 800 Cl.10\n"
            "- Min 2 bolts per connection\n\n"
            "📋 *SETU AI — Steel design per IS 800:2007. Verify using STAAD/ETABS.*"
        )

    # ── IS CODE REFERENCE ──
    if any(k in q for k in ["is code", "is 456", "code reference", "standard", "which code", "nbc"]):
        lines = ["## 📚 IS Code Reference Library (BIS Standards)\n"]
        lines.append("| Code | Description |")
        lines.append("|------|-------------|")
        for code, desc in IS_CODES.items():
            lines.append(f"| **{code}** | {desc} |")
        lines += [
            "\n**How to Use IS Codes:**",
            "- Ask me about any specific clause or topic",
            "- Example: \"What does IS 456 say about minimum cover?\"",
            "- Example: \"IS 875 Part 2 live load for hospital\"",
            "- Example: \"IS 1893 zone factor for Delhi\"\n",
            "📋 *SETU AI — IS Codes available at bis.gov.in*",
        ]
        return "\n".join(lines)

    # ── PRESTRESSED CONCRETE ──
    if any(k in q for k in ["prestress", "post.?tension", "pre.?tension", "is 1343"]):
        return (
            "## 🔧 Prestressed Concrete Design (IS 1343:2012)\n\n"
            "**Types:**\n"
            "- **Pre-tensioning:** Strands tensioned before casting (factory)\n"
            "- **Post-tensioning:** Tendons stressed after concrete hardens (site)\n\n"
            "**Losses in Prestress:**\n"
            "| Loss Type | Stage | Typical % |\n"
            "|-----------|-------|----------|\n"
            "| Elastic shortening | Immediate | 3–5% |\n"
            "| Friction (μ, k) | Immediate | 5–8% |\n"
            "| Anchorage slip | Immediate | 1–3% |\n"
            "| Creep | Time-dependent | 5–7% |\n"
            "| Shrinkage | Time-dependent | 4–6% |\n"
            "| Relaxation of steel | Time-dependent | 3–5% |\n"
            "| **Total** | — | **20–35%** |\n\n"
            "**Design Stress Limits (IS 1343):**\n"
            "```\n"
            "  At transfer: σct ≤ 0.8·fci (compression)\n"
            "  At service: σcs ≤ 0.33·fck (tension, Type 1)\n"
            "  Minimum concrete: M35 (pre-T), M30 (post-T)\n"
            "```\n\n"
            "📋 *SETU AI — PSC design is complex. Requires detailed tendon profile & loss calculations.*"
        )

    # ── ENVIRONMENTAL / SUSTAINABILITY ──
    if any(k in q for k in ["environment", "carbon", "green", "leed", "igbc", "sustainability", "eia"]):
        return (
            "## 🌱 Sustainability & Environmental Engineering\n\n"
            "**Embodied Carbon of Common Materials:**\n"
            "| Material | kgCO₂e/kg | kgCO₂e/m³ |\n"
            "|----------|-----------|----------|\n"
            "| OPC Cement | 0.87 | — |\n"
            "| PPC Cement | 0.57 | — |\n"
            "| Concrete M25 | — | 250–300 |\n"
            "| Steel TMT | 1.8–2.0 | — |\n"
            "| Recycled Steel | 0.4–0.6 | — |\n"
            "| Fired Bricks | 0.20 | — |\n"
            "| AAC Blocks | 0.08 | — |\n"
            "| Fly Ash Bricks | 0.05 | — |\n"
            "| Timber (air-dried) | -1.6 | — |\n\n"
            "**Green Building Rating Systems (India):**\n"
            "1. **IGBC** (Indian Green Building Council) — Green Homes, Green Factory, etc.\n"
            "2. **GRIHA** (Green Rating for Integrated Habitat Assessment) — Govt. endorsed\n"
            "3. **LEED India** — Adapted from US LEED\n\n"
            "**Sustainable Alternatives:**\n"
            "| Replace | With | Carbon Savings |\n"
            "|---------|------|---------------|\n"
            "| OPC Cement | PPC / PSC | 30–35% |\n"
            "| Fired bricks | AAC / Fly ash blocks | 50–70% |\n"
            "| Virgin steel | Recycled steel | 60–75% |\n"
            "| River sand | M-Sand / recycled agg. | 90%+ |\n"
            "| Timber formwork | Steel formwork (reuse) | 80% |\n\n"
            "📋 *SETU AI — Use Nirmaan's carbon tracking tools for project-level analysis.*"
        )

    # ── CONSTRUCTION MANAGEMENT ──
    if any(k in q for k in ["schedule", "cpm", "pert", "gantt", "project management", "earned value", "eva"]):
        return (
            "## 📊 Construction Project Management\n\n"
            "**CPM (Critical Path Method):**\n"
            "```\n"
            "  ES = max(EF of predecessors)\n"
            "  EF = ES + Duration\n"
            "  LF = min(LS of successors)\n"
            "  LS = LF - Duration\n"
            "  Float = LS - ES = LF - EF\n"
            "  Critical path: activities with Float = 0\n"
            "```\n\n"
            "**Earned Value Analysis (EVA):**\n"
            "| Metric | Formula | Interpretation |\n"
            "|--------|---------|---------------|\n"
            "| CPI | EV/AC | >1.0 = under budget |\n"
            "| SPI | EV/PV | >1.0 = ahead of schedule |\n"
            "| CV | EV - AC | +ve = under budget |\n"
            "| SV | EV - PV | +ve = ahead |\n"
            "| EAC | BAC/CPI | Estimated final cost |\n"
            "| ETC | EAC - AC | Cost to complete |\n\n"
            "**Typical Construction Timeline (Residential):**\n"
            "| Activity | Duration |\n"
            "|----------|----------|\n"
            "| Foundation | 3–4 weeks |\n"
            "| Ground floor structure | 4–6 weeks |\n"
            "| Each upper floor | 3–4 weeks |\n"
            "| Brickwork (per floor) | 2–3 weeks |\n"
            "| Plastering + curing | 3–4 weeks |\n"
            "| Electrical + plumbing | 3–4 weeks |\n"
            "| Flooring + tiling | 2–3 weeks |\n"
            "| Painting | 2–3 weeks |\n\n"
            "📋 *SETU AI — Use proper scheduling software for complex projects.*"
        )

    # ── NDT / QUALITY ──
    if any(k in q for k in ["ndt", "rebound", "upv", "test", "quality", "cube", "slump"]):
        return (
            "## 🔬 Quality Control & NDT Methods\n\n"
            "**Concrete Testing:**\n"
            "| Test | Standard | Purpose |\n"
            "|------|----------|--------|\n"
            "| Slump test | IS 1199 | Workability |\n"
            "| Cube compression | IS 516 | Compressive strength |\n"
            "| UPV (Ultrasonic) | IS 13311 Part 1 | Uniformity, voids |\n"
            "| Rebound hammer | IS 13311 Part 2 | Surface hardness |\n"
            "| Core test | IS 516 Part 4 | In-situ strength |\n"
            "| Carbonation | — | Durability depth |\n"
            "| Half-cell potential | ASTM C876 | Corrosion risk |\n\n"
            "**UPV Classification (IS 13311):**\n"
            "| Velocity (km/s) | Quality |\n"
            "|-----------------|--------|\n"
            "| > 4.5 | Excellent |\n"
            "| 3.5–4.5 | Good |\n"
            "| 3.0–3.5 | Medium |\n"
            "| < 3.0 | Doubtful |\n\n"
            "**Acceptance Criteria (IS 456 Cl.16):**\n"
            "- Individual cube: ≥ fck - 3 N/mm²\n"
            "- Mean of 3 cubes: ≥ fck + 0.825s (or fck + 3 for <30 results)\n"
            "- 150mm cubes at 28 days, water cured\n\n"
            "📋 *SETU AI — Report anomalous results to structural engineer immediately.*"
        )

    # ── FAILURE ANALYSIS / FORENSIC ──
    if any(k in q for k in ["crack", "failure", "collapse", "defect", "damage", "repair", "retrofit", "settle"]):
        return (
            "## 🔍 Forensic Failure Analysis Mode\n\n"
            "**Common Structural Defects & Diagnosis:**\n\n"
            "**1. Cracks in RCC Members:**\n"
            "| Crack Pattern | Probable Cause |\n"
            "|--------------|----------------|\n"
            "| Vertical in beam mid-span | Flexural — under-reinforcement or overload |\n"
            "| Diagonal (45°) near supports | Shear — inadequate stirrups |\n"
            "| Horizontal at beam-column joint | Poor detailing / seismic |\n"
            "| Map/pattern cracks | Shrinkage / ASR (Alkali-Silica Reaction) |\n"
            "| Along reinforcement | Corrosion of steel (cover inadequate) |\n"
            "| In slab (mid-span, both ways) | Flexural overloading |\n\n"
            "**2. Foundation Settlement:**\n"
            "- Uniform settlement: generally acceptable (< 75mm)\n"
            "- Differential settlement: CRITICAL — causes cracking\n"
            "  - Limit: 1/300 for frames, 1/500 for infill walls\n\n"
            "**3. Immediate Safety Actions:**\n"
            "⚠️ 1. If cracks > 3mm wide or growing → evacuate, call structural engineer\n"
            "⚠️ 2. If steel exposed/corroded → prop/shore member immediately\n"
            "⚠️ 3. If settlement > 50mm differential → stop construction above\n\n"
            "**4. Remediation Methods:**\n"
            "| Problem | Short-Term Fix | Permanent Fix |\n"
            "|---------|---------------|---------------|\n"
            "| Flexural cracks | Epoxy injection | Carbon fiber wrap / plate bonding |\n"
            "| Corrosion | Patch repair | Cathodic protection / re-alkalisation |\n"
            "| Shear deficiency | Steel plates | FRP wrapping / jacketing |\n"
            "| Settlement | Underpinning | Micropiles / grouting |\n"
            "| Weak concrete | — | Concrete jacketing |\n\n"
            "📋 *SETU AI — All rehabilitation must follow IS 15988:2013 (Seismic Evaluation & Strengthening).*"
        )

    # ── SURVEYING ──
    if any(k in q for k in ["survey", "levelling", "theodolite", "total station", "gps", "contour", "setting out"]):
        return (
            "## 📏 Surveying & Geomatics\n\n"
            "**Key Methods:**\n"
            "1. **Chain/Tape Survey** — Simple, short distances\n"
            "2. **Compass Survey** — Magnetic bearings\n"
            "3. **Theodolite/Total Station** — Angles + distances, high precision\n"
            "4. **DGPS/RTK** — cm-level accuracy, large areas\n"
            "5. **Drone/UAV** — Photogrammetry, volumetric calculations\n\n"
            "**Setting Out a Building:**\n"
            "```\n"
            "  1. Establish baseline from reference point\n"
            "  2. Set corner pegs using total station\n"
            "  3. Check diagonals (should be equal for rectangle)\n"
            "  4. Set batter boards at offset distance\n"
            "  5. Transfer levels from benchmark\n"
            "```\n\n"
            "**Contouring:**\n"
            "- Direct method: spot levels on grid\n"
            "- Indirect method: interpolation between points\n"
            "- Contour interval: 0.5–2m (detailed), 5–20m (topographic)\n\n"
            "**Volume Calculation:**\n"
            "- Prismoidal formula: V = (L/6)(A₁ + 4Am + A₂)\n"
            "- Trapezoidal rule, Simpson's rule for cross-sections\n\n"
            "📋 *SETU AI — Always check survey data against known benchmarks.*"
        )

    # ── MATERIAL ESTIMATION (DETAILED) ──
    if any(k in q for k in ["material", "quantity", "boq", "bill of quantity", "take.?off"]):
        return (
            "## 📋 Material Estimation & BOQ Guide\n\n"
            "**Quick Reference — Standard RCC Building (per 100 sqft built-up):**\n"
            "| Material | Quantity | Unit | Rate (₹) | Amount (₹) |\n"
            "|----------|---------|------|---------|------------|\n"
            "| Cement OPC 53 | 40 | bags | 400 | 16,000 |\n"
            "| Sand (fine) | 125 | cft | 50 | 6,250 |\n"
            "| Aggregate 20mm | 75 | cft | 40 | 3,000 |\n"
            "| Steel Fe500D | 4 | qtl | 6,500 | 26,000 |\n"
            "| Bricks (1st class) | 800 | nos | 9 | 7,200 |\n"
            "| Water | 2,000 | ltr | — | 500 |\n"
            "| Tiles (vitrified) | 100 | sqft | 45 | 4,500 |\n"
            "| Paint | 5 | ltr | 350 | 1,750 |\n"
            "| Plumbing (lumpsum) | — | LS | — | 8,000 |\n"
            "| Electrical | — | LS | — | 8,000 |\n"
            "| **TOTAL MATERIAL** | | | | **~₹81,200** |\n"
            "| Labour (40%) | | | | ~₹32,500 |\n"
            "| **GRAND TOTAL** | | | | **~₹1,135/sqft** |\n\n"
            "**Wastage Factors:**\n"
            "- Cement: 3–5%, Steel: 3–5%, Bricks: 5–8%, Sand: 10%, Tiles: 5%\n\n"
            "**Additional per floor:** Multiply quantities by 0.85–0.90× for upper floors (less foundation)\n\n"
            "💡 **Tip:** Use Nirmaan AI Estimator for exact project-specific BOQ.\n\n"
            "📋 *SETU AI — Rates per Telangana DSR 2025-26. Subject to market variation.*"
        )

    # ── 3D VISUALIZATION & BIM ──
    if any(k in q for k in ["3d", "bim", "revit", "visualization", "render", "3d image", "3d model", "digital twin", "three dimensional", "image", "picture", "photo", "visual", "drawing", "sketch", "illustration", "architect"]):
        return (
            "## 🖥️ SETU — 3D Visualization & Building Images\n\n"
            "I can guide you on generating professional building images and 3D models.\n\n"
            "### How to Get Building Images & 3D Renders\n\n"
            "**Quick Options:**\n"
            "- **SketchUp Free** (web) — Create a 3D building model in minutes, export images\n"
            "- **Blender** (free, open-source) — Full 3D modeling + photorealistic rendering\n"
            "- **Twinmotion** (free for Revit users) — Instant photorealistic building renders\n"
            "- **AI Image Tools** — Midjourney, DALL-E, Stable Diffusion for concept images\n\n"
            "### Professional 3D Modeling & BIM Software\n\n"
            "| Tool | Best For | Format |\n"
            "|------|----------|--------|\n"
            "| **Autodesk Revit** | BIM modeling, structural & MEP | .rvt, .ifc |\n"
            "| **STAAD.Pro** | 3D structural analysis with visualization | .std |\n"
            "| **ETABS** | Multi-story building analysis & 3D view | .e2k |\n"
            "| **SketchUp** | Conceptual 3D design & massing | .skp |\n"
            "| **Tekla Structures** | Steel & precast concrete detailing | .ifc |\n"
            "| **Bentley OpenBuildings** | Infrastructure BIM | .dgn |\n"
            "| **AutoCAD 3D** | General 3D drafting | .dwg |\n"
            "| **Blender** | Architectural visualization & rendering | .blend |\n\n"
            "### Rendering Tools (Photorealistic Images)\n\n"
            "| Tool | Type | Best For |\n"
            "|------|------|----------|\n"
            "| **Lumion** | Real-time | Architectural walkthroughs & images |\n"
            "| **V-Ray** | Ray-traced | High-quality photorealistic renders |\n"
            "| **Enscape** | Real-time | Revit/SketchUp live rendering |\n"
            "| **Twinmotion** | Real-time | Quick visualization from BIM |\n"
            "| **D5 Render** | Real-time | GPU-accelerated rendering |\n\n"
            "### Recommended Workflow for Building Images\n\n"
            "1. **Conceptual Model** → SketchUp / Revit massing study\n"
            "2. **Structural Model** → STAAD.Pro / ETABS for analysis\n"
            "3. **Detailed BIM** → Revit / Tekla with full reinforcement\n"
            "4. **Photorealistic Render** → Lumion / V-Ray / Enscape\n"
            "5. **Digital Twin** → IoT integration for real-time monitoring\n\n"
            "💡 **Tip:** For quick building concept images, use SketchUp Free (web-based) → export as PNG. "
            "For photorealistic renders, pair Revit with Lumion or Enscape.\n\n"
            "💡 **On Nirmaan:** Use our **Digital Twin** module for real-time 3D structural monitoring "
            "and our **Architecture & Design Studio** for connecting with professional architects.\n\n"
            "📋 *SETU AI — For professional building images, use the rendering tools listed above. "
            "SETU provides engineering guidance — for generated images, use AI image tools like Midjourney or DALL-E.*"
        )

    # ── SOFTWARE TOOLS ──
    if any(k in q for k in ["software", "tool", "staad", "etabs", "autocad", "primavera", "revit", "tekla", "sap2000", "safe", "midas", "ansys", "plaxis", "geo5", "prokon"]):
        return (
            "## 🛠️ SETU — Civil Engineering Software Tools Guide\n\n"
            "**Industry-Standard Software for Civil Engineers:**\n\n"
            "### Structural Analysis & Design\n"
            "| Software | Use Case | IS Code Support |\n"
            "|----------|----------|----------------|\n"
            "| **STAAD.Pro** | Frame analysis, steel & RCC design | IS 456, IS 800, IS 1893 |\n"
            "| **ETABS** | Multi-story buildings, seismic analysis | IS 456, IS 1893 |\n"
            "| **SAP2000** | General purpose FEA | Multiple codes |\n"
            "| **SAFE** | Slab & foundation design | IS 456 |\n"
            "| **MIDAS Civil** | Bridge & infrastructure analysis | IRC, IS codes |\n"
            "| **Prokon** | Structural detailing & design | IS 456 |\n\n"
            "### Geotechnical Engineering\n"
            "| Software | Use Case |\n"
            "|----------|----------|\n"
            "| **PLAXIS 2D/3D** | FEM soil-structure interaction |\n"
            "| **GEO5** | Slope stability, retaining walls |\n"
            "| **SLIDE** | Slope stability analysis |\n"
            "| **FLAC** | Geomechanics continuum analysis |\n\n"
            "### Design & Drafting\n"
            "| Software | Use Case |\n"
            "|----------|----------|\n"
            "| **AutoCAD** | 2D/3D drafting & detailing |\n"
            "| **Revit** | BIM modeling & coordination |\n"
            "| **Tekla Structures** | Steel & precast detailing |\n"
            "| **SketchUp** | Conceptual 3D design |\n\n"
            "### Project Management\n"
            "| Software | Use Case |\n"
            "|----------|----------|\n"
            "| **Primavera P6** | CPM scheduling, resource planning |\n"
            "| **MS Project** | Gantt charts, task management |\n"
            "| **Navisworks** | BIM clash detection & 4D simulation |\n\n"
            "### Rendering & Visualization\n"
            "| Software | Use Case |\n"
            "|----------|----------|\n"
            "| **Lumion** | Real-time architectural rendering |\n"
            "| **V-Ray** | Photorealistic rendering |\n"
            "| **Enscape** | Real-time walkthrough |\n"
            "| **Twinmotion** | Architectural visualization |\n\n"
            "💡 Ask me about any specific software workflow or how to set up an analysis.\n\n"
            "📋 *SETU AI — Software recommendations based on industry best practices.*"
        )

    # ── DEFAULT / CAPABILITIES ──
    return (
        "## 🏗️ SETU — Structural Engineering & Technical Utility\n\n"
        "I am your **AI Civil Engineering Consultant** with expertise spanning all major disciplines.\n\n"
        "**What I can do:**\n\n"
        "📐 **Structural Design** — Beam, column, slab, footing, retaining wall calculations with IS 456\n"
        "🪨 **Geotechnical** — Soil classification, bearing capacity, foundation selection, pile design\n"
        "🌍 **Seismic Design** — IS 1893 zone data, base shear, ductile detailing (IS 13920)\n"
        "🔩 **Steel Structures** — IS 800, tension/compression members, connections\n"
        "🛣️ **Transportation** — Road design (IRC:37/58), pavement, bridge engineering\n"
        "💧 **Hydraulics** — Pipe flow, open channels, drains, water/sewage treatment\n"
        "🔧 **Prestressed Concrete** — IS 1343, losses, tendon design\n"
        "📋 **BBS / BOQ** — Bar bending schedules, bill of quantities, cost estimation\n"
        "🔬 **Concrete Mix Design** — IS 10262 with proportions for M15–M50\n"
        "🔍 **Failure Analysis** — Crack diagnosis, remediation, retrofitting\n"
        "📊 **Project Management** — CPM, Gantt, EVA, scheduling\n"
        "🌱 **Sustainability** — Carbon tracking, green building ratings\n"
        "📏 **Surveying** — Setting out, levelling, GPS, contour mapping\n"
        "🖥️ **3D Visualization & BIM** — Revit, STAAD, ETABS, Tekla, SketchUp guidance\n"
        "🛠️ **Software Tools** — STAAD.Pro, ETABS, AutoCAD, Primavera, PLAXIS, SAP2000\n\n"
        "**Try asking:**\n"
        "- \"Design a beam for 6m span\"\n"
        "- \"Column for 800kN load, 3.5m height\"\n"
        "- \"Foundation for soft clay with 100kN/m² SBC\"\n"
        "- \"Mix design for M30 concrete\"\n"
        "- \"Retaining wall 4m high in medium soil\"\n"
        "- \"Seismic zone and base shear for Hyderabad\"\n"
        "- \"Which software for multi-story building analysis?\"\n"
        "- \"How to create 3D model of a building?\"\n"
        "- \"Compare STAAD.Pro vs ETABS\"\n"
        "- \"Diagnose diagonal cracks in beam\"\n\n"
        "📋 *SETU AI v2.0 — Powered by Nirmaan's construction intelligence platform.*"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

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

    # Generate SETU response
    answer = _build_setu_response(question, req.context, tier.value)

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
