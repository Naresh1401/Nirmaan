"""Quantity Estimation Agent — material quantities, BOQ, material take-off."""


def handle_quantity_estimation(intent: str, params: dict) -> str:
    """Handle quantity and BOQ queries."""
    sqft = params.get("sqft")
    if sqft:
        return _respond_quantity_for_area(sqft)
    return _respond_quantity_general()


def _respond_quantity_for_area(sqft: float) -> str:
    # Scale from per-100-sqft reference
    factor = sqft / 100
    cement_bags = round(40 * factor)
    sand_cft = round(125 * factor)
    agg_cft = round(75 * factor)
    steel_qtl = round(4 * factor, 1)
    bricks = round(800 * factor)
    material_cost = round(81200 * factor)
    labour_cost = round(32500 * factor)
    total = material_cost + labour_cost

    return (
        f"## Material Estimation — {sqft:.0f} sqft Built-up Area\n\n"
        f"### Quick Answer\n"
        f"For a {sqft:.0f} sqft standard RCC residential building: "
        f"**{cement_bags} bags cement**, **{steel_qtl} quintals steel**, "
        f"**{bricks} bricks**. Total estimated cost: **₹{total:,.0f}** "
        f"(~₹{total/sqft:.0f}/sqft).\n\n"
        f"### Why This Matters\n"
        f"Accurate quantity estimation prevents material shortage (delays) "
        f"and over-ordering (waste). Typical wastage is 3–8% depending on material.\n\n"
        f"### Detailed BOQ\n"
        f"| Material | Quantity | Unit | Rate (₹) | Amount (₹) |\n"
        f"|----------|---------|------|---------|------------|\n"
        f"| Cement OPC 53 | {cement_bags} | bags | 400 | {cement_bags * 400:,} |\n"
        f"| Sand (fine) | {sand_cft} | cft | 50 | {sand_cft * 50:,} |\n"
        f"| Aggregate 20mm | {agg_cft} | cft | 40 | {agg_cft * 40:,} |\n"
        f"| Steel Fe500D | {steel_qtl} | qtl | 6,500 | {steel_qtl * 6500:,.0f} |\n"
        f"| Bricks (1st class) | {bricks} | nos | 9 | {bricks * 9:,} |\n"
        f"| Tiles (vitrified) | {sqft:.0f} | sqft | 45 | {sqft * 45:,.0f} |\n"
        f"| Paint | {sqft/20:.0f} | ltr | 350 | {sqft/20 * 350:,.0f} |\n"
        f"| Plumbing (lumpsum) | — | LS | — | {int(sqft * 53):,} |\n"
        f"| Electrical | — | LS | — | {int(sqft * 53):,} |\n"
        f"| **TOTAL MATERIAL** | | | | **₹{material_cost:,}** |\n"
        f"| Labour (~40%) | | | | ₹{labour_cost:,} |\n"
        f"| **GRAND TOTAL** | | | | **₹{total:,}** |\n\n"
        f"### Wastage Factors (add to quantities)\n"
        f"- Cement: 3–5% | Steel: 3–5% | Bricks: 5–8% | Sand: 10% | Tiles: 5%\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Not accounting for wastage in procurement\n"
        f"- Ordering all materials at once (storage issues, theft risk)\n"
        f"- Using per-sqft rates without adjusting for floors (upper floors need less foundation)\n\n"
        f"### Next Step\n"
        f"Use the Nirmaan AI Estimator for an exact project-specific BOQ with current market rates.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Rates per Telangana DSR 2025-26.*"
    )


def _respond_quantity_general() -> str:
    return (
        "## Material Estimation & BOQ Guide\n\n"
        "### Quick Answer\n"
        "A standard RCC building requires approximately **40 bags cement, 4 quintals steel, "
        "and 800 bricks per 100 sqft** of built-up area.\n\n"
        "### Why This Matters\n"
        "Accurate BOQ prevents shortages, reduces waste, and enables budget control.\n\n"
        "### Standard Quantities (per 100 sqft built-up)\n"
        "| Material | Quantity | Unit | Rate (₹) | Amount (₹) |\n"
        "|----------|---------|------|---------|------------|\n"
        "| Cement OPC 53 | 40 | bags | 400 | 16,000 |\n"
        "| Sand (fine) | 125 | cft | 50 | 6,250 |\n"
        "| Aggregate 20mm | 75 | cft | 40 | 3,000 |\n"
        "| Steel Fe500D | 4 | qtl | 6,500 | 26,000 |\n"
        "| Bricks (1st class) | 800 | nos | 9 | 7,200 |\n"
        "| Tiles (vitrified) | 100 | sqft | 45 | 4,500 |\n"
        "| Paint | 5 | ltr | 350 | 1,750 |\n"
        "| Plumbing | — | LS | — | 8,000 |\n"
        "| Electrical | — | LS | — | 8,000 |\n"
        "| **TOTAL MATERIAL** | | | | **~₹81,200** |\n"
        "| Labour (40%) | | | | ~₹32,500 |\n"
        "| **GRAND TOTAL** | | | | **~₹1,135/sqft** |\n\n"
        "### Wastage Factors\n"
        "- Cement: 3–5%, Steel: 3–5%, Bricks: 5–8%, Sand: 10%, Tiles: 5%\n\n"
        "### Next Step\n"
        "Tell me your total built-up area (e.g., \"1500 sqft\") for a "
        "project-specific quantity breakdown.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Rates per Telangana DSR 2025-26.*"
    )
