"""Civil Engineering Knowledge Agent — structural design, materials, geotechnical, seismic.

Contains calculators (beam, column, slab, footing, retaining wall, mix design, BBS)
and reference data (IS codes, foundation guide, seismic zones).
Extracted from the original monolithic _build_setu_response().
"""

import math
import re
from typing import Optional


# ═══════════════════════════════════════════════════════════════════════════════
# REFERENCE DATA
# ═══════════════════════════════════════════════════════════════════════════════

IS_CODES = {
    "IS 456:2000": "Plain and Reinforced Concrete — Code of Practice",
    "IS 1343:2012": "Prestressed Concrete — Code of Practice",
    "IS 3370": "Concrete Structures for Storage of Liquids (Parts 1–4)",
    "IS 10262:2019": "Concrete Mix Proportioning — Guidelines",
    "IS 875 Part 1": "Dead Loads — Unit Weights of Building Materials",
    "IS 875 Part 2": "Imposed Loads on Buildings and Structures",
    "IS 875 Part 3": "Wind Loads on Buildings and Structures",
    "IS 875 Part 4": "Snow Loads",
    "IS 875 Part 5": "Special Loads and Combinations",
    "IS 1893 Part 1:2016": "Earthquake Resistant Design — General Provisions",
    "IS 1893 Part 2": "Earthquake Resistant Design — Liquid Retaining Tanks",
    "IS 1893 Part 4": "Earthquake Resistant Design — Industrial Structures",
    "IS 13920:2016": "Ductile Design and Detailing of RCC Structures",
    "IS 4326:2013": "Earthquake Resistant Design and Construction of Buildings",
    "IS 800:2007": "General Construction in Steel — Code of Practice (LSM)",
    "IS 1786:2008": "High Strength Deformed Steel Bars (Fe415/Fe500/Fe550D)",
    "IS 1904:1986": "Design and Construction of Foundations in Soils",
    "IS 2911 Part 1": "Design and Construction of Pile Foundations",
    "IS 6403:1981": "Determination of Bearing Capacity of Shallow Foundations",
    "IS 8112:2013": "43 Grade Ordinary Portland Cement — Specification",
    "IS 12269:2013": "53 Grade Ordinary Portland Cement — Specification",
    "IS 1489 Part 1": "Portland Pozzolana Cement (Fly Ash Based)",
    "IS 2386": "Methods of Test for Aggregates for Concrete (Parts 1–8)",
    "IS 1077:1992": "Common Burnt Clay Building Bricks — Specification",
    "IRC 37:2018": "Guidelines for Design of Flexible Pavements",
    "IRC 58:2015": "Guidelines for Design of Plain Jointed Rigid Pavements",
    "IRC 6:2017": "Standard Specifications and Code for Road Bridges — Loads",
    "IRC 78:2014": "Standard Specifications for Road Bridges — Foundations",
    "IRC SP:13": "Guidelines for the Design of Small Bridges and Culverts",
    "IS 3370 Part 2": "Reinforced Concrete Structures for Liquid Storage",
    "IS 1172:1993": "Basic Requirements for Water Supply for Buildings",
    "IS 1742:1983": "Code of Practice for Building Drainage",
    "NBC 2016": "National Building Code of India",
}

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

SEISMIC_ZONES = {
    "II":  {"Z": 0.10, "risk": "Low", "cities": "Hyderabad, Bangalore, Chennai, Nagpur, Thiruvananthapuram"},
    "III": {"Z": 0.16, "risk": "Moderate", "cities": "Mumbai, Kolkata, Lucknow, Jaipur, Bhopal, Ahmedabad, Vizag"},
    "IV":  {"Z": 0.24, "risk": "High", "cities": "Delhi, Patna, Jammu, Chandigarh, Dehradun, Siliguri"},
    "V":   {"Z": 0.36, "risk": "Very High", "cities": "Guwahati, Shillong, Srinagar, Gangtok, Port Blair, entire NE India"},
}

TELANGANA_SEISMIC = {
    "Hyderabad": "Zone II (Z=0.10)", "Warangal": "Zone II (Z=0.10)",
    "Karimnagar": "Zone II (Z=0.10)", "Peddapalli": "Zone II (Z=0.10)",
    "Ramagundam": "Zone II (Z=0.10)", "Khammam": "Zone II (Z=0.10)",
    "Adilabad": "Zone II–III boundary", "Nizamabad": "Zone II (Z=0.10)",
}


# ═══════════════════════════════════════════════════════════════════════════════
# STRUCTURAL CALCULATORS
# ═══════════════════════════════════════════════════════════════════════════════

def calc_beam(span_m: float, support: str = "simply_supported") -> str:
    """Beam design calculation per IS 456."""
    ld_ratio = {"simply_supported": 12, "continuous": 15, "cantilever": 7}
    ratio = ld_ratio.get(support, 12)
    depth_mm = max(300, int(span_m * 1000 / ratio))
    width_mm = max(230, depth_mm // 2)
    sw = 25 * (width_mm / 1000) * (depth_mm / 1000)
    fck, fy = 20, 500
    d_eff = depth_mm - 50
    mu_lim_actual = 0.138 * fck * width_mm * d_eff**2 / 1e6
    ast_min = max(0.85 * width_mm * d_eff / fy, 0.12 / 100 * width_mm * depth_mm)
    bar_dia = 16 if span_m <= 5 else 20
    bar_area = math.pi * bar_dia**2 / 4
    min_bars = max(2, math.ceil(ast_min / bar_area))

    return (
        f"## Beam Design — {span_m}m Span ({support.replace('_', ' ').title()})\n\n"
        f"### Quick Answer\n"
        f"For a {span_m}m {support.replace('_', ' ')} beam: **{width_mm}×{depth_mm} mm** section "
        f"with {min_bars}–{min_bars+2} nos. of {bar_dia}mm bars.\n\n"
        f"### Why This Matters\n"
        f"Correct beam sizing ensures adequate strength against bending and shear while "
        f"controlling deflection. Under-designed beams lead to excessive cracks and sagging.\n\n"
        f"### Design Parameters\n"
        f"- Concrete: M{fck} (fck = {fck} N/mm²)\n"
        f"- Steel: Fe{fy} (fy = {fy} N/mm²)\n"
        f"- Cover: 25mm (moderate), 40mm (severe exposure)\n"
        f"- Support: {support.replace('_', ' ').title()}\n\n"
        f"### Step-by-Step Calculation\n\n"
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
        f"### Recommended Section\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Width (b) | **{width_mm} mm** |\n"
        f"| Depth (D) | **{depth_mm} mm** |\n"
        f"| Main bars (bottom) | {min_bars}–{min_bars+2} nos. of {bar_dia}mm |\n"
        f"| Hanger bars (top) | 2 nos. of 12mm |\n"
        f"| Stirrups | 8mm @ 150 c/c (middle), 100 c/c (ends) |\n"
        f"| Clear cover | 25mm |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Never skip stirrup spacing reduction near supports\n"
        f"- Always check deflection limit (L/250 for total, L/350 for live load)\n"
        f"- Ensure minimum 2 bars continuous at top and bottom\n\n"
        f"### Safety Note\n"
        f"⚠️ These are preliminary sizes. Final design requires actual loading, "
        f"BM/SF diagrams, and detailed reinforcement per IS 456 Cl.22–26. "
        f"Must be verified by a licensed Professional Engineer.\n\n"
        f"### Next Step\n"
        f"Provide the actual loading (dead + live + wall load) for a detailed "
        f"design with reinforcement schedule and stirrup spacing.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 456:2000.*"
    )


def calc_column(load_kn: float, height_m: float = 3.0, fck: int = 20, fy: int = 500) -> str:
    """Column design calculation per IS 456."""
    p = 0.01
    pu_capacity_per_mm2 = 0.4 * fck + 0.67 * fy * p
    ag_reqd = (load_kn * 1000) / pu_capacity_per_mm2
    side = max(230, int(math.ceil(math.sqrt(ag_reqd) / 25) * 25))
    le = 0.65 * height_m * 1000 if height_m <= 4 else 0.80 * height_m * 1000
    slenderness = le / side
    is_short = slenderness < 12
    ast = p * side * side
    bar_dia = 16 if load_kn < 800 else 20
    bar_area = math.pi * bar_dia**2 / 4
    num_bars = max(4, math.ceil(ast / bar_area))
    tie_spacing = min(300, side, 16 * bar_dia)

    return (
        f"## Column Design — {load_kn} kN Axial Load\n\n"
        f"### Quick Answer\n"
        f"For {load_kn} kN load at {height_m}m height: **{side}×{side} mm** column "
        f"with {num_bars} nos. of {bar_dia}mm bars and 8mm ties @ {tie_spacing}mm c/c.\n\n"
        f"### Why This Matters\n"
        f"Columns are the primary vertical load-carrying members. Under-designed columns "
        f"can lead to sudden, catastrophic failure without warning.\n\n"
        f"### Design Parameters\n"
        f"- Concrete: M{fck}, Steel: Fe{fy}\n"
        f"- Height: {height_m}m, Assumed steel %: {p*100:.0f}%\n\n"
        f"### Step-by-Step Calculation\n\n"
        f"**STEP 1 — Required Area (IS 456 Cl.39.3):**\n"
        f"```\n"
        f"  Pu = 0.4·fck·Ac + 0.67·fy·Asc\n"
        f"  For p = {p*100:.0f}%: capacity/mm² = 0.4×{fck} + 0.67×{fy}×{p} = {pu_capacity_per_mm2:.2f} N/mm²\n"
        f"  Ag = Pu / capacity = {load_kn*1000:.0f} / {pu_capacity_per_mm2:.2f} = {ag_reqd:.0f} mm²\n"
        f"  Side = √{ag_reqd:.0f} ≈ {side} mm\n"
        f"```\n\n"
        f"**STEP 2 — Slenderness Check:**\n"
        f"```\n"
        f"  Le/D = {le:.0f}/{side} = {slenderness:.1f} {'< 12 → SHORT column ✅' if is_short else '≥ 12 → SLENDER column ⚠️'}\n"
        f"```\n\n"
        f"**STEP 3 — Reinforcement:**\n"
        f"```\n"
        f"  Ast = {p*100:.0f}% × {side}² = {ast:.0f} mm²\n"
        f"  Use: {num_bars} nos. of {bar_dia}mm dia ({num_bars * bar_area:.0f} mm²)\n"
        f"  Ties: 8mm @ {tie_spacing}mm c/c\n"
        f"```\n\n"
        f"### Recommended Section\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Size | **{side}×{side} mm** |\n"
        f"| Longitudinal steel | {num_bars} nos. of {bar_dia}mm |\n"
        f"| Ties | 8mm @ {tie_spacing}mm c/c |\n"
        f"| Type | {'Short' if is_short else 'Slender'} column |\n"
        f"| Cover | 40mm |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Never reduce tie spacing at column-beam joints — increase it\n"
        f"- Maintain minimum 1% and maximum 6% steel ratio\n"
        f"- Ensure lap splices are staggered, not all at one level\n\n"
        f"### Safety Note\n"
        f"⚠️ {'Slender column — apply additional moment per IS 456 Cl.39.7. ' if not is_short else ''}"
        f"Preliminary design only. Must be verified by a licensed Professional Engineer.\n\n"
        f"### Next Step\n"
        f"Provide beam layout and actual loads from each floor for combined axial + moment design.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 456:2000.*"
    )


def calc_slab(span_m: float, slab_type: str = "two_way", fck: int = 20, fy: int = 500) -> str:
    """Slab design calculation per IS 456."""
    ratios = {"one_way": 30, "two_way": 35, "cantilever": 10, "flat_slab": 32}
    ratio = ratios.get(slab_type, 35)
    d_mm = max(100, int(span_m * 1000 / ratio))
    D_mm = d_mm + 20 + 5

    ast_min = 0.12 / 100 * 1000 * D_mm
    dl_slab = 25 * D_mm / 1000
    dl_finish = 1.5
    ll = 2.0
    total = dl_slab + dl_finish + ll
    factored = 1.5 * total

    bar_area_8 = math.pi * 64 / 4
    spacing_8 = int(1000 * bar_area_8 / ast_min)
    spacing_8 = min(spacing_8, 300, 3 * D_mm)

    return (
        f"## Slab Design — {span_m}m Span ({slab_type.replace('_', ' ').title()})\n\n"
        f"### Quick Answer\n"
        f"For a {span_m}m {slab_type.replace('_', ' ')} slab: **{D_mm}mm overall thickness** "
        f"with 8mm bars @ {spacing_8}mm c/c.\n\n"
        f"### Why This Matters\n"
        f"Slab thickness controls deflection, cracking, and serviceability. "
        f"Too thin = excessive deflection. Too thick = unnecessary dead load on structure.\n\n"
        f"### Design Parameters\n"
        f"- Concrete: M{fck}, Steel: Fe{fy}\n"
        f"- Span: {span_m}m, Type: {slab_type.replace('_', ' ').title()}\n\n"
        f"### Step-by-Step Calculation\n\n"
        f"**STEP 1 — Depth (IS 456 Cl.23.2.1):**\n"
        f"```\n"
        f"  d = L/{ratio} = {span_m*1000}/{ratio} = {d_mm} mm\n"
        f"  D = d + cover + φ/2 = {d_mm} + 20 + 5 = {D_mm} mm\n"
        f"```\n\n"
        f"**STEP 2 — Loading:**\n"
        f"```\n"
        f"  DL (slab) = 25 × {D_mm/1000:.3f} = {dl_slab:.2f} kN/m²\n"
        f"  DL (finish) = {dl_finish} kN/m²\n"
        f"  LL = {ll} kN/m² (residential)\n"
        f"  Total = {total:.2f} kN/m² → Factored = {factored:.2f} kN/m²\n"
        f"```\n\n"
        f"**STEP 3 — Reinforcement:**\n"
        f"```\n"
        f"  Ast,min = 0.12% × b × D = {ast_min:.0f} mm²/m\n"
        f"  Use 8mm @ {spacing_8} c/c ({1000 * bar_area_8 / spacing_8:.0f} mm²/m)\n"
        f"```\n\n"
        f"### Recommended Section\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Overall thickness | **{D_mm} mm** |\n"
        f"| Main bars | 8mm @ {spacing_8} c/c |\n"
        f"| Distribution bars | 8mm @ {min(spacing_8 + 50, 300)} c/c |\n"
        f"| Cover | 20mm (mild), 30mm (moderate) |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Never omit distribution steel in one-way slabs\n"
        f"- Always provide extra top bars at continuous supports\n"
        f"- Check punching shear for flat slabs near columns\n\n"
        f"### Safety Note\n"
        f"⚠️ Preliminary design. Verify with actual loading and support conditions. "
        f"Must be designed by a licensed Professional Engineer.\n\n"
        f"### Next Step\n"
        f"Specify support conditions (simply supported vs continuous) and actual live loads.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 456:2000.*"
    )


def calc_footing(load_kn: float, sbc_kn_m2: float = 150, fck: int = 20, fy: int = 500) -> str:
    """Isolated footing design per IS 456."""
    area_reqd = load_kn / sbc_kn_m2
    side = math.ceil(math.sqrt(area_reqd) * 10) / 10
    side_mm = int(side * 1000)
    if side_mm % 50 != 0:
        side_mm = (side_mm // 50 + 1) * 50

    depth_mm = max(300, int(side_mm * 0.25))
    vol = side_mm * side_mm * depth_mm / 1e9

    return (
        f"## Isolated Footing — {load_kn} kN Load\n\n"
        f"### Quick Answer\n"
        f"For {load_kn} kN on soil with SBC {sbc_kn_m2} kN/m²: "
        f"**{side_mm}×{side_mm}×{depth_mm} mm** footing.\n\n"
        f"### Why This Matters\n"
        f"The footing transfers column loads safely to the soil. Undersized footings "
        f"cause settlement; oversized ones waste material and increase excavation cost.\n\n"
        f"### Step-by-Step Calculation\n\n"
        f"**STEP 1 — Area Required:**\n"
        f"```\n"
        f"  A = P/SBC = {load_kn}/{sbc_kn_m2} = {area_reqd:.2f} m²\n"
        f"  Side = √{area_reqd:.2f} = {side:.2f} m → {side_mm} mm\n"
        f"```\n\n"
        f"**STEP 2 — Depth (one-way shear governs):**\n"
        f"```\n"
        f"  d ≈ 0.25 × B = 0.25 × {side_mm} = {depth_mm} mm\n"
        f"```\n\n"
        f"**STEP 3 — Concrete Volume:**\n"
        f"```\n"
        f"  V = {side_mm/1000:.2f} × {side_mm/1000:.2f} × {depth_mm/1000:.2f} = {vol:.3f} m³\n"
        f"```\n\n"
        f"### Recommended Section\n"
        f"| Parameter | Value |\n"
        f"|-----------|-------|\n"
        f"| Size | **{side_mm}×{side_mm} mm** |\n"
        f"| Depth | **{depth_mm} mm** |\n"
        f"| Concrete grade | M{fck} |\n"
        f"| Cover | 50mm (foundation) |\n"
        f"| PCC bed | M10, 150mm thick |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Never cast footing directly on soil — always use PCC levelling course\n"
        f"- Check for punching shear around column face\n"
        f"- Add 10% self-weight to load for final design\n\n"
        f"### Safety Note\n"
        f"⚠️ SBC must be confirmed by soil investigation report. Never assume bearing capacity. "
        f"Must be designed by a licensed Professional Engineer.\n\n"
        f"### Next Step\n"
        f"Provide soil test report (SPT N-value) for accurate SBC determination.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 456, IS 6403.*"
    )


def calc_retaining_wall(height_m: float, soil_type: str = "medium") -> str:
    """Retaining wall preliminary design."""
    gamma = {"loose": 16, "medium": 18, "dense": 20}.get(soil_type, 18)
    phi = {"loose": 25, "medium": 30, "dense": 35}.get(soil_type, 30)
    ka = round((1 - math.sin(math.radians(phi))) / (1 + math.sin(math.radians(phi))), 3)

    base_w = max(0.5 * height_m, 1.5)
    toe = round(base_w / 3, 2)
    heel = round(base_w - toe - 0.3, 2)
    stem_base = max(200, int(height_m * 80))
    stem_top = 200

    pa = 0.5 * ka * gamma * height_m ** 2
    mo = round(pa * height_m / 3, 1)

    return (
        f"## Retaining Wall — {height_m}m Height\n\n"
        f"### Quick Answer\n"
        f"For a {height_m}m cantilever retaining wall in {soil_type} soil: base width **{base_w:.1f}m**, "
        f"stem thickness **{stem_base}mm** (base) tapering to **{stem_top}mm** (top).\n\n"
        f"### Why This Matters\n"
        f"Retaining walls resist lateral earth pressure. Failure leads to soil collapse, "
        f"flooding, and damage to adjacent structures.\n\n"
        f"### Design Parameters\n"
        f"- Soil unit weight: {gamma} kN/m³\n"
        f"- Angle of internal friction (φ): {phi}°\n"
        f"- Ka (Rankine): {ka}\n\n"
        f"### Step-by-Step Calculation\n\n"
        f"**STEP 1 — Earth Pressure:**\n"
        f"```\n"
        f"  Ka = (1 - sinφ) / (1 + sinφ) = {ka}\n"
        f"  Pa = ½ × Ka × γ × H² = ½ × {ka} × {gamma} × {height_m}² = {pa:.1f} kN/m\n"
        f"  Mo = Pa × H/3 = {pa:.1f} × {height_m/3:.2f} = {mo:.1f} kN·m/m\n"
        f"```\n\n"
        f"**STEP 2 — Dimensions:**\n"
        f"```\n"
        f"  Base width = 0.5H to 0.7H = {base_w:.1f} m\n"
        f"  Toe = B/3 = {toe} m\n"
        f"  Heel = {heel} m\n"
        f"  Stem: {stem_base}mm (base) → {stem_top}mm (top)\n"
        f"```\n\n"
        f"### Stability Checks Required\n"
        f"- Overturning: FOS ≥ 2.0\n"
        f"- Sliding: FOS ≥ 1.5\n"
        f"- Bearing pressure: within SBC\n"
        f"- Max pressure at toe, min at heel (no tension)\n\n"
        f"### Safety Note\n"
        f"⚠️ Retaining walls above 3m must be structurally designed. "
        f"Include drainage (weep holes) to prevent hydrostatic buildup. "
        f"Must be designed by a licensed Professional Engineer.\n\n"
        f"### Next Step\n"
        f"Provide soil test data and surcharge loads for complete design.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 456, IS 6403.*"
    )


def calc_mix_design(grade: str = "M25") -> str:
    """Concrete mix design per IS 10262:2019."""
    grade_num = int(grade.replace("M", ""))

    designs = {
        20: {"w_c": 0.50, "cement": 360, "water": 180, "fa": 680, "ca": 1200, "slump": "75–100"},
        25: {"w_c": 0.45, "cement": 400, "water": 180, "fa": 660, "ca": 1180, "slump": "75–100"},
        30: {"w_c": 0.42, "cement": 430, "water": 180, "fa": 640, "ca": 1160, "slump": "75–100"},
        35: {"w_c": 0.40, "cement": 450, "water": 180, "fa": 620, "ca": 1140, "slump": "100–120"},
        40: {"w_c": 0.38, "cement": 470, "water": 178, "fa": 600, "ca": 1120, "slump": "100–120"},
    }

    d = designs.get(grade_num, designs[25])
    ratio_c = d["cement"] / d["cement"]
    ratio_fa = round(d["fa"] / d["cement"], 2)
    ratio_ca = round(d["ca"] / d["cement"], 2)

    return (
        f"## Concrete Mix Design — {grade}\n\n"
        f"### Quick Answer\n"
        f"**{grade}** nominal mix ratio: **1 : {ratio_fa} : {ratio_ca}** (C : FA : CA) "
        f"with W/C = {d['w_c']}.\n\n"
        f"### Why This Matters\n"
        f"Correct mix proportioning ensures the concrete achieves design strength at 28 days "
        f"while maintaining workability during placement.\n\n"
        f"### Mix Proportions (per m³ of concrete)\n"
        f"| Material | Quantity | Unit |\n"
        f"|----------|---------|------|\n"
        f"| Cement (OPC 53) | {d['cement']} | kg |\n"
        f"| Water | {d['water']} | litres |\n"
        f"| Fine aggregate (FA) | {d['fa']} | kg |\n"
        f"| Coarse aggregate 20mm (CA) | {d['ca']} | kg |\n"
        f"| W/C ratio | {d['w_c']} | — |\n"
        f"| Slump | {d['slump']} | mm |\n\n"
        f"### Practical Ratios\n"
        f"| Ratio | Value |\n"
        f"|-------|-------|\n"
        f"| By weight (C:FA:CA) | 1 : {ratio_fa} : {ratio_ca} |\n"
        f"| Cement bags/m³ | {d['cement']/50:.1f} bags |\n"
        f"| Cost/m³ (approx.) | ₹{4000 + grade_num * 50}–{5000 + grade_num * 60} |\n\n"
        f"### Options / Comparisons\n"
        f"| Grade | Target Strength | Typical Use |\n"
        f"|-------|----------------|-------------|\n"
        f"| M15 | 15 MPa | PCC, levelling course |\n"
        f"| M20 | 20 MPa | General RCC (mild exposure) |\n"
        f"| M25 | 25 MPa | RCC (moderate exposure) |\n"
        f"| M30 | 30 MPa | RCC (severe exposure) |\n"
        f"| M35 | 35 MPa | Prestressed, marine |\n"
        f"| M40 | 40 MPa | Bridges, PQC roads |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Adding water at site to increase workability (use plasticizer instead)\n"
        f"- Not accounting for aggregate moisture content\n"
        f"- Using uncalibrated batching equipment\n\n"
        f"### Safety Note\n"
        f"⚠️ Design mix (IS 10262) is mandatory for M25 and above. "
        f"Nominal mix is only acceptable up to M20.\n\n"
        f"### Next Step\n"
        f"Specify exposure condition (mild/moderate/severe) and required workability for "
        f"a design mix with admixture recommendations.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 10262:2019, IS 456.*"
    )


def calc_bbs(member: str = "beam", b: int = 230, d: int = 450, span_m: float = 4.0) -> str:
    """Bar bending schedule for common members."""
    l_mm = int(span_m * 1000)
    ld = 40 * 16  # development length for 16mm @ Fe500

    main_length = l_mm + 2 * ld
    stirrup_length = 2 * (b + d - 4 * 25) + 2 * 75  # hooks
    num_stirrups = int(l_mm / 150) + 1

    weight_main = 4 * main_length * 1.580 / 1000
    weight_stirrups = num_stirrups * stirrup_length * 0.395 / 1000
    weight_hanger = 2 * main_length * 0.888 / 1000

    return (
        f"## Bar Bending Schedule — {member.title()} ({b}×{d}mm, {span_m}m)\n\n"
        f"### Quick Answer\n"
        f"Total steel required: **{weight_main + weight_stirrups + weight_hanger:.1f} kg** "
        f"for a {b}×{d}mm beam of {span_m}m span.\n\n"
        f"### BBS Table\n"
        f"| # | Bar Type | Dia (mm) | Nos | Length (mm) | Total (m) | Weight (kg) |\n"
        f"|---|----------|----------|-----|-------------|-----------|-------------|\n"
        f"| 1 | Main (bottom) | 16 | 4 | {main_length} | {4*main_length/1000:.1f} | {weight_main:.1f} |\n"
        f"| 2 | Hanger (top) | 12 | 2 | {main_length} | {2*main_length/1000:.1f} | {weight_hanger:.1f} |\n"
        f"| 3 | Stirrups | 8 | {num_stirrups} | {stirrup_length} | {num_stirrups*stirrup_length/1000:.1f} | {weight_stirrups:.1f} |\n"
        f"| | **TOTAL** | | | | | **{weight_main + weight_stirrups + weight_hanger:.1f}** |\n\n"
        f"### Key Notes\n"
        f"- Development length (Ld) = 40φ = {ld}mm for Fe500 in M20\n"
        f"- Stirrup hook length = 10d = 80mm (rounded to 75mm)\n"
        f"- Add 5% wastage for actual procurement: "
        f"**{(weight_main + weight_stirrups + weight_hanger) * 1.05:.1f} kg**\n\n"
        f"### Next Step\n"
        f"Provide beam layout drawing for complete project BBS.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 2502, SP:34.*"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# KNOWLEDGE RESPONSE HANDLERS
# ═══════════════════════════════════════════════════════════════════════════════

def respond_soil_geotechnical() -> str:
    """Soil and geotechnical engineering knowledge."""
    lines = [
        "## Foundation & Soil Analysis\n",
        "### Quick Answer\n"
        "Foundation selection depends on soil type, bearing capacity (SBC), and building loads. "
        "Always conduct a soil investigation (SPT borelog) before design.\n",
        "### Why This Matters\n"
        "The foundation transfers the entire building load to the ground. Wrong foundation "
        "choice leads to settlement, cracking, and structural failure.\n",
        "### Practical Recommendation\n"
        "**Key IS Codes:** IS 1904, IS 2911, IS 6403\n\n"
        "**Terzaghi's Bearing Capacity Equation:**\n"
        "```\n"
        "  qu = c·Nc + γ·Df·Nq + 0.5·γ·B·Nγ\n"
        "  where: c = cohesion, Df = depth, B = width\n"
        "```\n",
        "### Options / Comparisons\n"
        "**Foundation Recommendations by Soil Type:**\n",
    ]
    for soil, info in FOUNDATION_GUIDE.items():
        lines.append(f"\n**{soil.replace('_', ' ').title()}** (SPT N: {info['spt_n']})")
        lines.append(f"- Foundation: {info['type']}")
        lines.append(f"- Depth: {info['depth_m']} m | SBC: {info['bearing_kn_m2']} kN/m²")
        lines.append(f"- Notes: {info['notes']}")
    lines += [
        "\n### Common Mistakes to Avoid\n"
        "- Assuming SBC without soil test (most common error)\n"
        "- Not checking for water table level\n"
        "- Ignoring expansive soil behaviour (black cotton soil)\n",
        "### Safety Note\n"
        "⚠️ For Zone III+: check liquefaction potential per IS 1893. "
        "Professional geotechnical investigation is mandatory for all foundations.\n",
        "### Next Step\n"
        "Get a soil investigation report (2 boreholes minimum for residential) "
        "for accurate foundation design.\n",
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 1904, IS 6403.*",
    ]
    return "\n".join(lines)


def respond_seismic() -> str:
    """Seismic design guide."""
    lines = [
        "## Seismic Design Guide (IS 1893:2016 + IS 13920)\n\n"
        "### Quick Answer\n"
        "India has 4 seismic zones (II–V). Design requires calculating base shear "
        "using zone factor, importance factor, and response reduction factor.\n\n"
        "### Why This Matters\n"
        "Earthquake forces are unpredictable lateral loads that can cause catastrophic "
        "building collapse if not properly designed for.\n",
        "### Options / Comparisons\n"
        "**Seismic Zones in India:**\n"
        "| Zone | Z Factor | Risk | Major Cities |\n"
        "|------|----------|------|-------------|\n",
    ]
    for zone, data in SEISMIC_ZONES.items():
        lines.append(f"| {zone} | {data['Z']:.2f} | {data['risk']} | {data['cities']} |")
    lines += [
        "\n**Telangana Seismic Data:**",
    ]
    for city, zone in TELANGANA_SEISMIC.items():
        lines.append(f"- {city}: {zone}")
    lines += [
        "\n### Practical Recommendation\n"
        "**Base Shear Calculation (IS 1893 Cl.6.4.2):**\n"
        "```\n"
        "  VB = Ah × W\n"
        "  Ah = (Z/2) × (I/R) × (Sa/g)\n"
        "```\n\n"
        "**Ductile Detailing (IS 13920:2016):**\n"
        "1. Beams: Closed stirrups, min 2 bars continuous top & bottom\n"
        "2. Columns: ΣMc ≥ 1.1 × ΣMb (strong column–weak beam)\n"
        "3. Beam-column joints: Special confining reinforcement\n"
        "4. Shear walls: Boundary elements with confined concrete\n"
        "5. Lap splices NOT allowed in plastic hinge zones\n",
        "### Safety Note\n"
        "⚠️ For structures in Zone IV/V, detailed dynamic analysis is mandatory. "
        "Must be designed by a licensed Structural Engineer.\n",
        "### Next Step\n"
        "Provide building location and configuration for zone-specific seismic design.\n",
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 1893, IS 13920.*",
    ]
    return "\n".join(lines)


def respond_loads() -> str:
    """Load analysis guide — IS 875."""
    return (
        "## Load Analysis Guide (IS 875 Parts 1–5)\n\n"
        "### Quick Answer\n"
        "Design loads include dead loads (self-weight), live loads (occupancy), "
        "wind loads, and seismic forces. All must be factored per load combinations.\n\n"
        "### Why This Matters\n"
        "Accurate load estimation is the foundation of all structural design. "
        "Under-estimated loads lead to structural failure; over-estimated loads waste material.\n\n"
        "### Practical Recommendation\n\n"
        "**Dead Loads (IS 875 Part 1):**\n"
        "| Material | Unit Weight |\n"
        "|----------|------------|\n"
        "| RCC | 25 kN/m³ |\n"
        "| PCC | 24 kN/m³ |\n"
        "| Brick masonry | 20 kN/m³ |\n"
        "| Steel | 78.5 kN/m³ |\n"
        "| Floor finishes | 0.5–1.5 kN/m² |\n"
        "| Partition walls (movable) | 1.0 kN/m² min |\n"
        "| Waterproofing | 0.5 kN/m² |\n\n"
        "**Live Loads (IS 875 Part 2):**\n"
        "| Occupancy | Live Load (kN/m²) |\n"
        "|-----------|------------------|\n"
        "| Residential | 2.0 |\n"
        "| Office | 2.5–4.0 |\n"
        "| Assembly (fixed seats) | 4.0 |\n"
        "| Staircase | 3.0–5.0 |\n"
        "| Parking | 2.5 (cars), 7.5 (trucks) |\n"
        "| Roof (accessible) | 1.5–2.0 |\n"
        "| Roof (inaccessible) | 0.75 |\n\n"
        "### Options / Comparisons\n"
        "**Load Combinations (IS 875 Part 5 / IS 456):**\n"
        "```\n"
        "  1. 1.5 (DL + LL)\n"
        "  2. 1.2 (DL + LL + EQ)\n"
        "  3. 1.5 (DL + EQ)\n"
        "  4. 0.9 DL + 1.5 EQ (uplift/overturning)\n"
        "```\n\n"
        "### Next Step\n"
        "Specify building type and location for wind and seismic load calculation.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 875, IS 456.*"
    )


def respond_road_engineering() -> str:
    """Road and pavement engineering."""
    return (
        "## Road & Pavement Engineering Guide\n\n"
        "### Quick Answer\n"
        "Road pavement design depends on traffic (MSA), subgrade CBR, "
        "and design life. IRC:37 governs flexible pavements, IRC:58 governs rigid.\n\n"
        "### Why This Matters\n"
        "Pavement design affects ride quality, maintenance costs, and road lifespan. "
        "Under-designed pavements fail prematurely, causing accidents and costly repairs.\n\n"
        "### Practical Recommendation\n\n"
        "**Flexible Pavement Layers (bottom to top):**\n"
        "```\n"
        "  Compacted Subgrade → GSB (200mm) → WMM (250mm) → DBM (50-75mm) → BC (25-40mm)\n"
        "```\n\n"
        "**Rigid Pavement (IRC:58):**\n"
        "- PQC (M40): 300mm thick\n"
        "- DLC (M10): 150mm\n"
        "- Dowel bars: 32mm @ 300 c/c at transverse joints\n"
        "- Tie bars: 12mm @ 500 c/c at longitudinal joints\n\n"
        "### Options / Comparisons\n"
        "**Cost Range (Telangana, 2025-26):**\n"
        "| Road Type | Cost/km |\n"
        "|-----------|--------|\n"
        "| Gravel road (village) | ₹20–40 lakh |\n"
        "| WBM rural road | ₹50–80 lakh |\n"
        "| BT 2-lane road | ₹1.5–2.5 crore |\n"
        "| NH 4-lane (flexible) | ₹8–15 crore |\n"
        "| NH 4-lane (rigid/CC) | ₹12–20 crore |\n\n"
        "### Next Step\n"
        "Provide traffic data (CVPD) and subgrade CBR for pavement thickness design.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IRC:37, IRC:58.*"
    )


def respond_bridge() -> str:
    """Bridge engineering guide."""
    return (
        "## Bridge Engineering Guide\n\n"
        "### Quick Answer\n"
        "Bridge type selection depends on span, loading class, and site conditions. "
        "IRC:6 governs loads; IRC:78 governs foundations.\n\n"
        "### Options / Comparisons\n"
        "| Span | Type | Approx. Cost/m² |\n"
        "|------|------|------------------|\n"
        "| < 6m | Box/Slab Culvert | ₹25,000–40,000 |\n"
        "| 6–15m | Slab / T-Beam | ₹35,000–55,000 |\n"
        "| 15–30m | T-Beam Girder | ₹45,000–70,000 |\n"
        "| 30–60m | PSC Box Girder | ₹60,000–1,00,000 |\n"
        "| 60–200m | Cable-Stayed / Suspension | ₹1,50,000+ |\n\n"
        "**IRC Loading Classes:**\n"
        "- **Class AA:** 70T tracked / 40T wheeled (NH/SH)\n"
        "- **Class A:** 55.4T train\n"
        "- **Class 70R:** 100T bogie (special)\n\n"
        "### Safety Note\n"
        "⚠️ Bridge design requires detailed site investigation, scour analysis, "
        "and hydraulic study. Must be designed by a licensed Structural Engineer.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IRC:6, IRC:78.*"
    )


def respond_hydraulic() -> str:
    """Hydraulic and water resources engineering."""
    return (
        "## Hydraulic & Water Resources Engineering\n\n"
        "### Quick Answer\n"
        "Open channel flow uses Manning's equation; pipe flow uses Hazen-Williams. "
        "Water demand per IS 1172 is 135 lpcd for residential.\n\n"
        "### Practical Recommendation\n\n"
        "**Manning's Equation:**\n"
        "```\n"
        "  V = (1/n) × R^(2/3) × S^(1/2)\n"
        "  Q = A × V\n"
        "```\n\n"
        "**Manning's n values:**\n"
        "| Surface | n |\n"
        "|---------|---|\n"
        "| Concrete (smooth) | 0.012 |\n"
        "| Brick masonry | 0.015 |\n"
        "| Earth (clean) | 0.022 |\n\n"
        "**Water Demand (IS 1172):**\n"
        "| Category | lpcd |\n"
        "|----------|------|\n"
        "| Residential (piped) | 135 |\n"
        "| Commercial | 150 |\n\n"
        "**Storm Drain (Rational Formula):**\n"
        "```\n"
        "  Q = C × I × A / 360 (m³/s)\n"
        "```\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 1172, Manning.*"
    )


def respond_steel_structure() -> str:
    """Steel structure design per IS 800."""
    return (
        "## Steel Structure Design (IS 800:2007 — LSM)\n\n"
        "### Quick Answer\n"
        "Steel design follows Limit State Method with partial safety factors. "
        "Common sections: ISMB (beams), ISMC (channels), ISA (angles).\n\n"
        "### Practical Recommendation\n\n"
        "**Tension Member (IS 800 Cl.6):**\n"
        "```\n"
        "  Tdg = Ag × fy / γm0 (yielding)\n"
        "  Tdn = 0.9 × An × fu / γm1 (rupture)\n"
        "```\n\n"
        "**Compression Member (IS 800 Cl.7):**\n"
        "```\n"
        "  Pd = Ae × fcd\n"
        "  Max λ: 180 (main), 350 (secondary)\n"
        "```\n\n"
        "**Connection Design:**\n"
        "- Bolt strength: Vdsb = fu/(√3 × γmb) × Anb\n"
        "- Min 2 bolts per connection\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 800:2007.*"
    )


def respond_is_codes() -> str:
    """IS code reference library."""
    lines = ["## IS Code Reference Library (BIS Standards)\n\n"
             "### Quick Answer\n"
             "Indian Standards (IS/IRC codes) govern all aspects of civil engineering "
             "design and construction in India.\n\n"
             "### Options / Comparisons\n"
             "| Code | Description |\n"
             "|------|-------------|"]
    for code, desc in IS_CODES.items():
        lines.append(f"| **{code}** | {desc} |")
    lines += [
        "\n### Next Step\n"
        "Ask about any specific clause or topic for detailed guidance.\n",
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. IS Codes available at bis.gov.in*",
    ]
    return "\n".join(lines)


def respond_prestressed() -> str:
    """Prestressed concrete design."""
    return (
        "## Prestressed Concrete Design (IS 1343:2012)\n\n"
        "### Quick Answer\n"
        "Prestressed concrete applies initial compressive stress to counteract tensile forces. "
        "Total losses range 20–35% of initial prestress.\n\n"
        "### Options / Comparisons\n"
        "| Loss Type | Stage | Typical % |\n"
        "|-----------|-------|----------|\n"
        "| Elastic shortening | Immediate | 3–5% |\n"
        "| Friction | Immediate | 5–8% |\n"
        "| Anchorage slip | Immediate | 1–3% |\n"
        "| Creep | Time-dependent | 5–7% |\n"
        "| Shrinkage | Time-dependent | 4–6% |\n"
        "| Relaxation | Time-dependent | 3–5% |\n"
        "| **Total** | — | **20–35%** |\n\n"
        "### Safety Note\n"
        "⚠️ PSC design is complex. Requires detailed tendon profile & loss calculations. "
        "Min concrete: M35 (pre-T), M30 (post-T).\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 1343:2012.*"
    )


def respond_environment() -> str:
    """Sustainability and environmental engineering."""
    return (
        "## Sustainability & Environmental Engineering\n\n"
        "### Quick Answer\n"
        "Construction accounts for ~40% of global CO₂ emissions. Material substitution "
        "is the most effective way to reduce embodied carbon.\n\n"
        "### Options / Comparisons\n"
        "**Embodied Carbon:**\n"
        "| Material | kgCO₂e/kg |\n"
        "|----------|----------|\n"
        "| OPC Cement | 0.87 |\n"
        "| PPC Cement | 0.57 |\n"
        "| TMT Steel | 1.8–2.0 |\n"
        "| Recycled Steel | 0.4–0.6 |\n"
        "| AAC Blocks | 0.08 |\n"
        "| Fly Ash Bricks | 0.05 |\n\n"
        "**Sustainable Alternatives:**\n"
        "| Replace | With | Carbon Savings |\n"
        "|---------|------|---------------|\n"
        "| OPC | PPC/PSC | 30–35% |\n"
        "| Fired bricks | AAC/Fly ash | 50–70% |\n"
        "| Virgin steel | Recycled steel | 60–75% |\n\n"
        "### Next Step\n"
        "Use Nirmaan's carbon tracking tools for project-level analysis.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence.*"
    )


def respond_ndt_quality() -> str:
    """NDT and quality control."""
    return (
        "## Quality Control & NDT Methods\n\n"
        "### Quick Answer\n"
        "Concrete quality is verified through cube tests (IS 516), UPV (IS 13311), "
        "and rebound hammer tests.\n\n"
        "### Options / Comparisons\n"
        "**Concrete Testing:**\n"
        "| Test | Standard | Purpose |\n"
        "|------|----------|--------|\n"
        "| Slump | IS 1199 | Workability |\n"
        "| Cube compression | IS 516 | Compressive strength |\n"
        "| UPV | IS 13311 Pt 1 | Uniformity, voids |\n"
        "| Rebound hammer | IS 13311 Pt 2 | Surface hardness |\n"
        "| Core test | IS 516 Pt 4 | In-situ strength |\n\n"
        "**UPV Classification:**\n"
        "| Velocity (km/s) | Quality |\n"
        "|-----------------|--------|\n"
        "| > 4.5 | Excellent |\n"
        "| 3.5–4.5 | Good |\n"
        "| 3.0–3.5 | Medium |\n"
        "| < 3.0 | Doubtful |\n\n"
        "**Acceptance (IS 456 Cl.16):**\n"
        "- Individual cube: ≥ fck - 3 N/mm²\n"
        "- Mean of 3 cubes: ≥ fck + 0.825s\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Reference: IS 516, IS 13311.*"
    )


def respond_survey() -> str:
    """Surveying and geomatics."""
    return (
        "## Surveying & Geomatics\n\n"
        "### Quick Answer\n"
        "Modern surveying uses total stations and DGPS for cm-level accuracy. "
        "Setting out requires baseline establishment and diagonal verification.\n\n"
        "### Practical Recommendation\n"
        "**Setting Out a Building:**\n"
        "1. Establish baseline from reference point\n"
        "2. Set corner pegs using total station\n"
        "3. Check diagonals (should be equal for rectangle)\n"
        "4. Set batter boards at offset distance\n"
        "5. Transfer levels from benchmark\n\n"
        "**Volume Calculation:**\n"
        "- Prismoidal formula: V = (L/6)(A₁ + 4Am + A₂)\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence.*"
    )


def respond_project_management() -> str:
    """Construction project management."""
    return (
        "## Construction Project Management\n\n"
        "### Quick Answer\n"
        "CPM identifies the critical path (zero-float activities). "
        "EVA monitors cost and schedule performance via CPI and SPI.\n\n"
        "### Practical Recommendation\n\n"
        "**CPM (Critical Path Method):**\n"
        "```\n"
        "  ES = max(EF of predecessors)\n"
        "  Float = LS - ES\n"
        "  Critical path: activities with Float = 0\n"
        "```\n\n"
        "**Earned Value Analysis:**\n"
        "| Metric | Formula | Interpretation |\n"
        "|--------|---------|---------------|\n"
        "| CPI | EV/AC | >1.0 = under budget |\n"
        "| SPI | EV/PV | >1.0 = ahead |\n"
        "| EAC | BAC/CPI | Estimated final cost |\n\n"
        "### Next Step\n"
        "Use proper scheduling software (Primavera P6 / MS Project) for complex projects.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence.*"
    )


def respond_3d_bim() -> str:
    """3D visualization and BIM guidance."""
    return (
        "## 3D Visualization & BIM\n\n"
        "### Quick Answer\n"
        "BIM (Building Information Modeling) integrates 3D geometry with construction data. "
        "Revit is the industry standard for structural BIM.\n\n"
        "### Options / Comparisons\n"
        "| Tool | Best For | Format |\n"
        "|------|----------|--------|\n"
        "| **Revit** | BIM modeling | .rvt, .ifc |\n"
        "| **STAAD.Pro** | Structural analysis | .std |\n"
        "| **ETABS** | Multi-story analysis | .e2k |\n"
        "| **SketchUp** | Conceptual 3D | .skp |\n"
        "| **Tekla** | Steel detailing | .ifc |\n\n"
        "**Rendering:**\n"
        "| Tool | Type |\n"
        "|------|------|\n"
        "| Lumion | Real-time |\n"
        "| V-Ray | Photorealistic |\n"
        "| Enscape | Real-time (Revit) |\n"
        "| Twinmotion | Quick viz |\n\n"
        "### Next Step\n"
        "For concept images → SketchUp Free. For photorealistic renders → Lumion + Revit. "
        "For engineering analysis → STAAD.Pro or ETABS.\n\n"
        "💡 Use Nirmaan's Digital Twin module for real-time 3D structural monitoring.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence.*"
    )


def respond_software_tools() -> str:
    """Civil engineering software tools guide."""
    return (
        "## Civil Engineering Software Tools Guide\n\n"
        "### Quick Answer\n"
        "Choose software based on your domain: STAAD.Pro/ETABS for structural, "
        "PLAXIS for geotechnical, Primavera for project management.\n\n"
        "### Options / Comparisons\n\n"
        "**Structural Analysis:**\n"
        "| Software | Use Case | IS Code Support |\n"
        "|----------|----------|----------------|\n"
        "| STAAD.Pro | Frame analysis | IS 456, IS 800 |\n"
        "| ETABS | Multi-story buildings | IS 456, IS 1893 |\n"
        "| SAP2000 | General FEA | Multiple |\n"
        "| SAFE | Slab & foundation | IS 456 |\n\n"
        "**Geotechnical:** PLAXIS 2D/3D, GEO5, SLIDE\n"
        "**Drafting:** AutoCAD, Revit, Tekla\n"
        "**Project Mgmt:** Primavera P6, MS Project\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence.*"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# DISPATCHER — Maps intents to response functions
# ═══════════════════════════════════════════════════════════════════════════════

def handle_civil_engineering(intent: str, params: dict) -> str:
    """Dispatch to the correct civil engineering response based on intent and params."""

    # Structural calculators
    if intent == "structural_design":
        q_lower = params.get("_question", "")
        if "beam" in q_lower:
            span = params.get("span_m", 5.0)
            support = params.get("support", "simply_supported")
            return calc_beam(span, support)
        elif "column" in q_lower:
            load = params.get("load_kn", 600)
            h = params.get("height_m", params.get("span_m", 3.0))
            return calc_column(load, h)
        elif "slab" in q_lower:
            span = params.get("span_m", 4.0)
            st = params.get("slab_type", "two_way")
            return calc_slab(span, st)
        elif "footing" in q_lower or "foundation" in q_lower:
            load = params.get("load_kn", 500)
            sbc = params.get("sbc", 150)
            return calc_footing(load, sbc)
        elif "retaining" in q_lower:
            h = params.get("height_m", params.get("span_m", 3.0))
            soil = params.get("soil_type", "medium")
            return calc_retaining_wall(h, soil)
        elif "bbs" in q_lower or "bar bending" in q_lower or "bending schedule" in q_lower:
            return calc_bbs()
        # Default structural
        return calc_beam(params.get("span_m", 5.0))

    if intent == "mix_design":
        grade = params.get("grade", "M25")
        return calc_mix_design(grade)

    # Knowledge responses
    dispatch = {
        "soil_geotechnical": respond_soil_geotechnical,
        "seismic_design": respond_seismic,
        "load_analysis": respond_loads,
        "road_engineering": respond_road_engineering,
        "bridge_engineering": respond_bridge,
        "hydraulic_engineering": respond_hydraulic,
        "steel_structure": respond_steel_structure,
        "is_code_reference": respond_is_codes,
        "prestressed_concrete": respond_prestressed,
        "sustainability": respond_environment,
        "project_management": respond_project_management,
        "ndt_quality": respond_ndt_quality,
        "surveying": respond_survey,
        "3d_bim": respond_3d_bim,
        "software_tools": respond_software_tools,
    }

    handler = dispatch.get(intent)
    if handler:
        return handler()

    # Fallback
    return respond_soil_geotechnical()
