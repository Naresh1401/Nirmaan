"""Project Planning Agent — construction stages, timeline, milestones, sequencing."""


def handle_project_planning(intent: str, params: dict) -> str:
    """Handle project planning queries."""

    if intent == "construction_stages":
        return _respond_construction_stages()
    if intent == "project_management":
        return _respond_project_timeline(params)

    return _respond_construction_stages()


def _respond_construction_stages() -> str:
    return (
        "## Construction Stages — Foundation to Finishing\n\n"
        "### Quick Answer\n"
        "Residential construction follows 12 sequential stages. Each stage depends on the "
        "previous one. Typical G+1 house (1500 sqft) takes 6–8 months.\n\n"
        "### Why This Matters\n"
        "Skipping or rushing stages leads to structural defects, rework, and cost overruns. "
        "Proper curing alone affects 20–30% of final concrete strength.\n\n"
        "### Stage-wise Breakdown\n"
        "| Phase | Activities | Duration | Cost % |\n"
        "|---|---|---|---|\n"
        "| 1. Site Preparation | Survey, soil test, layout marking | 1–2 weeks | 2–3% |\n"
        "| 2. Excavation & PCC | Excavation to design depth, PCC (M10/M15, 150mm) | 1–2 weeks | 3–4% |\n"
        "| 3. Foundation | Footing reinforcement, concreting (M20/M25), backfill | 2–3 weeks | 8–10% |\n"
        "| 4. Plinth Beam & DPC | Plinth beam, DPC membrane, anti-termite treatment | 1 week | 3–4% |\n"
        "| 5. Superstructure | Columns → beams → slab for each floor | 4–6 weeks/floor | 25–30% |\n"
        "| 6. Masonry (Brickwork) | External & internal walls, lintels | 2–3 weeks/floor | 10–12% |\n"
        "| 7. Plastering & Curing | Internal 12mm, external 20mm, 7-day curing | 3–4 weeks | 5–7% |\n"
        "| 8. Electrical & Plumbing | Conduits, wiring, pipe laying, fixtures | 3–4 weeks | 12–15% |\n"
        "| 9. Flooring & Tiling | Floor tiles, wall tiles, granite thresholds | 2–3 weeks | 8–10% |\n"
        "| 10. Doors & Windows | Frames, shutters, hardware, grills | 1–2 weeks | 5–7% |\n"
        "| 11. Painting | Primer + 2 coats interior, weathercoat exterior | 2–3 weeks | 4–5% |\n"
        "| 12. Final Finishing | Cleaning, punch list, utility connections | 1–2 weeks | 2–3% |\n\n"
        "### Formwork Removal (Striking) Times — IS 456 Cl. 11.3\n"
        "| Member | Min. Days |\n"
        "|---|---|\n"
        "| Columns & vertical faces | 1–2 days |\n"
        "| Slab soffit (props remain) | 3 days |\n"
        "| Beam soffit (props remain) | 7 days |\n"
        "| Props to slabs (span < 4.5m) | 7 days |\n"
        "| Props to slabs (span > 4.5m) | 14 days |\n"
        "| Props to beams/arches (span < 6m) | 14 days |\n"
        "| Props to beams/arches (span > 6m) | 21 days |\n\n"
        "### Curing Requirements\n"
        "• OPC concrete: min 7 days continuous moist curing\n"
        "• PPC/PSC concrete: min 10 days\n"
        "• Plastering: min 7 days\n"
        "• Strength at 7 days ≈ 65% of 28-day strength\n\n"
        "### Common Mistakes to Avoid\n"
        "- Rushing formwork removal before minimum curing period\n"
        "- Not conducting soil test before excavation\n"
        "- Skipping DPC layer (causes rising damp for life)\n"
        "- Doing electrical after plastering (causes chasing damage)\n\n"
        "### Typical Timeline\n"
        "• G+1 house (1500 sqft): 6–8 months\n"
        "• G+2 house (2500 sqft): 9–12 months\n"
        "• G+3 building: 12–15 months\n\n"
        "### Safety Note\n"
        "⚠️ Never rush curing or formwork removal — insufficient curing reduces final strength "
        "by 20–30%. These timelines assume normal conditions without rain delays.\n\n"
        "### Next Step\n"
        "Share your plot size and number of floors for a project-specific timeline.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence. Reference: IS 456:2000 (Cl. 11, 13), NBC 2016.*"
    )


def _respond_project_timeline(params: dict) -> str:
    floors = params.get("floors", 2)
    sqft = params.get("sqft", 1500)

    # Estimate timeline
    foundation_weeks = 4
    structure_weeks = floors * 5
    finishing_weeks = 12
    total_weeks = foundation_weeks + structure_weeks + finishing_weeks
    total_months = round(total_weeks / 4.3)

    return (
        f"## Project Timeline — G+{floors-1} ({sqft:.0f} sqft)\n\n"
        f"### Quick Answer\n"
        f"Estimated construction duration: **{total_months} months** "
        f"({total_weeks} weeks) for a G+{floors-1} residential building.\n\n"
        f"### Phase-wise Timeline\n"
        f"| Phase | Duration | Cumulative |\n"
        f"|---|---|---|\n"
        f"| Site prep & foundation | {foundation_weeks} weeks | {foundation_weeks} weeks |\n"
        f"| Structure ({floors} floors) | {structure_weeks} weeks | {foundation_weeks + structure_weeks} weeks |\n"
        f"| Masonry & plastering | 6 weeks | {foundation_weeks + structure_weeks + 6} weeks |\n"
        f"| MEP (electrical/plumbing) | 4 weeks | {foundation_weeks + structure_weeks + 10} weeks |\n"
        f"| Finishing (flooring, paint) | {finishing_weeks - 10} weeks | {total_weeks} weeks |\n\n"
        f"### Common Mistakes to Avoid\n"
        f"- Not ordering materials 2–3 weeks in advance (causes delays)\n"
        f"- Starting plastering before curing completes\n"
        f"- Not scheduling inspections at each stage\n\n"
        f"### Next Step\n"
        f"Create a detailed Gantt chart with your contractor for week-by-week tracking.\n\n"
        f"📋 *Veda — Nirmaan Civil Engineering Intelligence.*"
    )
