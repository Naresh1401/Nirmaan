"""Cost Estimation Agent — cost per sqft, stage-wise budget, material rates."""


def handle_cost_estimation(intent: str, params: dict) -> str:
    """Handle cost and budget queries."""
    sqft = params.get("sqft")
    if sqft:
        return _respond_cost_for_area(sqft, params)
    return _respond_cost_general()


def _respond_cost_for_area(sqft: float, params: dict) -> str:
    floors = params.get("floors", 1)
    total_area = sqft * floors if sqft < 2000 else sqft

    # Cost ranges
    economy = (total_area * 1500, total_area * 1800)
    standard = (total_area * 1800, total_area * 2200)
    premium = (total_area * 2500, total_area * 3500)

    return (
        f"## Construction Cost Estimate — {total_area:.0f} sqft\n\n"
        f"### Quick Answer\n"
        f"For {total_area:.0f} sqft built-up area:\n"
        f"- Economy: **₹{economy[0]/100000:.1f}–{economy[1]/100000:.1f} lakhs**\n"
        f"- Standard: **₹{standard[0]/100000:.1f}–{standard[1]/100000:.1f} lakhs**\n"
        f"- Premium: **₹{premium[0]/100000:.1f}–{premium[1]/100000:.1f} lakhs**\n\n"
        f"### Why This Matters\n"
        f"Understanding cost distribution helps allocate budget correctly. "
        f"Most cost overruns happen in finishing (40%) not structure (30%).\n\n"
        f"### Stage-wise Cost Breakup (Standard Quality)\n"
        f"| Component | % | Amount (₹) |\n"
        f"|-----------|---|------------|\n"
        f"| Excavation & Foundation | 11% | {standard[0]*0.11:,.0f}–{standard[1]*0.11:,.0f} |\n"
        f"| RCC Structure | 28% | {standard[0]*0.28:,.0f}–{standard[1]*0.28:,.0f} |\n"
        f"| Brickwork & Plastering | 13% | {standard[0]*0.13:,.0f}–{standard[1]*0.13:,.0f} |\n"
        f"| Flooring & Tiling | 9% | {standard[0]*0.09:,.0f}–{standard[1]*0.09:,.0f} |\n"
        f"| Doors & Windows | 6% | {standard[0]*0.06:,.0f}–{standard[1]*0.06:,.0f} |\n"
        f"| Electrical | 9% | {standard[0]*0.09:,.0f}–{standard[1]*0.09:,.0f} |\n"
        f"| Plumbing & Sanitary | 9% | {standard[0]*0.09:,.0f}–{standard[1]*0.09:,.0f} |\n"
        f"| Painting | 5% | {standard[0]*0.05:,.0f}–{standard[1]*0.05:,.0f} |\n"
        f"| Miscellaneous | 10% | {standard[0]*0.10:,.0f}–{standard[1]*0.10:,.0f} |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Not budgeting for compound wall, gate, and external works (adds 5–8%)\n"
        f"- Underestimating electrical costs (modern homes need more points)\n"
        f"- Not keeping 10% contingency reserve\n\n"
        f"### Next Step\n"
        f"Share your specific requirements (no. of rooms, quality preferences) "
        f"for a detailed room-wise estimate.\n\n"
        f"📋 *SETU — Nirmaan Civil Engineering Intelligence. Rates: Telangana 2025-26.*"
    )


def _respond_cost_general() -> str:
    return (
        "## Construction Cost Estimation (2025-26, Telangana)\n\n"
        "### Quick Answer\n"
        "Standard residential construction costs **₹1,800–2,200 per sqft** in Telangana. "
        "Economy starts at ₹1,500; premium at ₹2,500+.\n\n"
        "### Why This Matters\n"
        "Knowing accurate cost per sqft prevents budget overruns and helps negotiate "
        "fair contractor rates.\n\n"
        "### Options / Comparisons\n"
        "| Quality | Cost/sqft | Description |\n"
        "|---------|----------|-------------|\n"
        "| Economy | ₹1,500–1,800 | Basic finishes, local materials |\n"
        "| Standard | ₹1,800–2,200 | Good finishes, branded materials |\n"
        "| Premium | ₹2,500–3,500 | High-end finishes, premium brands |\n"
        "| Luxury | ₹4,000+ | Imported materials, custom design |\n\n"
        "### Detailed Cost Breakup (Standard)\n"
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
        "### Current Material Rates (Telangana, 2025-26)\n"
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
        "### Common Mistakes to Avoid\n"
        "- Relying on \"per sqft\" rates without understanding what's included\n"
        "- Not accounting for site preparation, compound wall, water/electricity\n"
        "- Comparing super built-up rates with carpet area rates\n\n"
        "### Next Step\n"
        "Tell me your total built-up area and quality preference "
        "for a project-specific cost breakdown.\n\n"
        "📋 *SETU — Nirmaan Civil Engineering Intelligence. Rates are indicative.*"
    )
