"""Material Recommendation Agent — cement, brick, steel, waterproofing selection."""


def handle_material_recommendation(intent: str, params: dict) -> str:
    """Handle material selection and comparison queries."""

    dispatch = {
        "cement_selection": _respond_cement,
        "brick_selection": _respond_brick,
        "steel_selection": _respond_steel_tmt,
    }

    handler = dispatch.get(intent)
    if handler:
        return handler()

    # Default
    return _respond_cement()


def _respond_cement() -> str:
    return (
        "## Cement Selection — Types, Standards & Application Guide\n\n"
        "### Quick Answer\n"
        "Use **OPC 53** for RCC structural work, **PPC** for foundations and plastering, "
        "**PSC** for coastal/marine environments.\n\n"
        "### Why This Matters\n"
        "Wrong cement selection affects strength gain, durability, and heat of hydration. "
        "Using OPC 53 for mass concrete causes thermal cracking; using PPC where early strength "
        "is needed delays formwork removal.\n\n"
        "### Options / Comparisons\n"
        "| Type | IS Standard | 28-day Strength | Best For |\n"
        "|---|---|---|---|\n"
        "| OPC 33 | IS 269 | 33 MPa | Plastering, non-structural |\n"
        "| OPC 43 | IS 8112 | 43 MPa | General RCC (M20–M30) |\n"
        "| OPC 53 | IS 12269 | 53 MPa | High-strength RCC (M30+), precast |\n"
        "| PPC | IS 1489 Pt 1 | 33→43+ MPa | Foundations, mass concrete, plastering |\n"
        "| PSC | IS 455 | 33→43+ MPa | Marine, sulphate-rich soils |\n"
        "| SRC | IS 12330 | 33 MPa | Sulphate-exposed foundations |\n"
        "| Rapid Hardening | IS 8041 | High early | Repair, fast-track work |\n\n"
        "### Practical Recommendation\n"
        "| Activity | Recommended | Reason |\n"
        "|---|---|---|\n"
        "| RCC columns, beams | OPC 53 | High early & ultimate strength |\n"
        "| Foundation in normal soil | OPC 43 or PPC | Adequate strength, lower heat |\n"
        "| Foundation in black cotton soil | PSC or SRC | Sulphate resistance |\n"
        "| Mass concrete (raft, retaining wall) | PPC | Lower heat of hydration |\n"
        "| Plastering | PPC or OPC 43 | Better workability, fewer cracks |\n"
        "| Precast elements | OPC 53 | Fast strength gain |\n"
        "| Marine / coastal | PSC | Chloride resistance |\n\n"
        "### Common Mistakes to Avoid\n"
        "- Using OPC 53 for plastering (shrinkage cracks due to high heat)\n"
        "- Using expired cement (shelf life: 3 months for OPC, slightly more for PPC)\n"
        "- Mixing different cement types in the same structural element\n\n"
        "### Safety Note\n"
        "⚠️ Always check cement manufacturing date. Strength reduces ~10% per month "
        "after 3 months. Store raised off ground in dry conditions.\n\n"
        "### Next Step\n"
        "Specify your application (RCC/plastering/foundation) and soil conditions "
        "for a precise cement recommendation.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence. Reference: IS 269, IS 8112, IS 12269, IS 1489.*"
    )


def _respond_brick() -> str:
    return (
        "## Brick Selection — Types, Properties & Structural Impact\n\n"
        "### Quick Answer\n"
        "For RCC frame buildings, use **AAC blocks** (65% lighter dead load). "
        "For budget construction, use **fly ash bricks**. For load-bearing walls, use **1st class clay bricks**.\n\n"
        "### Why This Matters\n"
        "Walling material affects dead load (hence beam/column sizes), thermal comfort, "
        "construction speed, and long-term maintenance costs.\n\n"
        "### Options / Comparisons\n"
        "| Property | Red Clay Brick | Fly Ash Brick | AAC Block | Hollow Block |\n"
        "|---|---|---|---|---|\n"
        "| Size (mm) | 230×110×75 | 230×110×75 | 600×200×200 | 400×200×200 |\n"
        "| Density (kg/m³) | 1800–2000 | 1700–1850 | 550–700 | 1200–1500 |\n"
        "| Compressive (N/mm²) | 3.5–10 | 7–12 | 3–5 | 4–8 |\n"
        "| Water Absorption | 15–20% | 10–15% | 10–12% | 5–10% |\n"
        "| Thermal Cond. | 0.81 W/mK | 0.60 W/mK | 0.16 W/mK | 0.50 W/mK |\n"
        "| Cost/sqft wall | ₹35–45 | ₹30–38 | ₹32–42 | ₹28–36 |\n\n"
        "### Practical Recommendation\n"
        "| Application | Recommended | Reason |\n"
        "|---|---|---|\n"
        "| Load-bearing walls | Red clay (1st class) | Higher compressive strength |\n"
        "| Infill walls (RCC frame) | AAC blocks | Light weight, lower dead load |\n"
        "| External walls (hot climate) | AAC blocks | Best thermal insulation |\n"
        "| Budget construction | Fly ash bricks | Cost-effective, uniform |\n"
        "| Compound walls | Hollow concrete blocks | Fast, economical |\n"
        "| High-rise buildings | AAC blocks | Reduces structural cost 10–15% |\n\n"
        "### Dead Load Impact (230mm wall per sqm)\n"
        "• Red brick: 4.6 kN/m²  •  Fly ash: 4.0 kN/m²  •  AAC: **1.6 kN/m²**\n"
        "• AAC reduces wall dead load by ~65%, directly reducing beam/column sizes\n\n"
        "### Common Mistakes to Avoid\n"
        "- Using under-burnt clay bricks (low strength, high absorption)\n"
        "- Not soaking bricks before laying (absorbs mortar water, weakens bond)\n"
        "- Not using block adhesive for AAC (cement mortar wastes AAC benefits)\n\n"
        "### Next Step\n"
        "Specify your building type (load-bearing vs RCC frame) and climate "
        "for the best walling recommendation.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence. Reference: IS 1077, IS 12894, IS 2185.*"
    )


def _respond_steel_tmt() -> str:
    return (
        "## TMT Steel Bars — Grades, Properties & Selection Guide\n\n"
        "### Quick Answer\n"
        "Use **Fe 500D** for seismic zones III/IV/V and all ductile structures. "
        "Use **Fe 500** for general RCC in Zone II. Avoid Fe 600 for seismic resistance.\n\n"
        "### Why This Matters\n"
        "Steel grade affects ductility — the structure's ability to absorb energy during "
        "earthquakes. Fe 500D ('D' = Ductile) has higher elongation and UTS/YS ratio.\n\n"
        "### Options / Comparisons\n"
        "| Property | Fe 415 | Fe 500 | Fe 500D | Fe 550D | Fe 600 |\n"
        "|---|---|---|---|---|---|\n"
        "| Yield Strength (MPa) | 415 | 500 | 500 | 550 | 600 |\n"
        "| UTS (min MPa) | 485 | 545 | 565 | 600 | 660 |\n"
        "| Elongation (%) | 14.5 | 12 | 16 | 14.5 | 10 |\n"
        "| UTS/YS ratio | ≥1.10 | ≥1.08 | ≥1.12 | ≥1.08 | ≥1.06 |\n"
        "| Ductility | Good | Moderate | **High** | High | Low |\n"
        "| Seismic suitability | Yes | Moderate | **Best** | Good | No |\n\n"
        "### Bar Weight Table\n"
        "| Dia (mm) | Weight (kg/m) | Weight (kg/12m bar) |\n"
        "|---|---|---|\n"
        "| 8 | 0.395 | 4.74 |\n"
        "| 10 | 0.617 | 7.40 |\n"
        "| 12 | 0.888 | 10.66 |\n"
        "| 16 | 1.580 | 18.96 |\n"
        "| 20 | 2.469 | 29.63 |\n"
        "| 25 | 3.858 | 46.30 |\n"
        "| 32 | 6.316 | 75.79 |\n\n"
        "**Weight formula:** W (kg/m) = D² / 162\n\n"
        "### Common Mistakes to Avoid\n"
        "- Using rusted/bent bars without straightening and cleaning\n"
        "- Not checking steel test certificates (every lot must have mill TC)\n"
        "- Mixing Fe 500 and Fe 500D in the same element\n\n"
        "### Next Step\n"
        "Specify your seismic zone and structural member type for "
        "precise grade recommendation.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence. Reference: IS 1786:2008, IS 13920.*"
    )
