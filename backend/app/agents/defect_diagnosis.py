"""Defect Diagnosis Agent — cracks, waterproofing, concrete defects, failure analysis."""


def handle_defect_diagnosis(intent: str, params: dict) -> str:
    """Dispatch defect and diagnosis queries."""
    q = params.get("_question", "")
    if "waterproof" in q:
        return _respond_waterproofing()
    if any(w in q for w in ("crack", "fracture", "fissure")):
        return _respond_cracks()
    if any(w in q for w in ("honeycomb", "bleeding", "segregat")):
        return _respond_concrete_defects()
    if any(w in q for w in ("plaster", "render")):
        return _respond_plastering_defects()
    if any(w in q for w in ("failure", "collapse", "fail")):
        return _respond_failure_analysis()
    if any(w in q for w in ("ndt", "non.?destruct", "test")):
        return _respond_ndt()
    if any(w in q for w in ("rebar", "corros", "rust")):
        return _respond_corrosion()
    # default to cracks as most common
    return _respond_cracks()


# ── Crack Diagnosis ──────────────────────────────────────────────────

def _respond_cracks() -> str:
    return (
        "## Crack Diagnosis & Repair Guide\n\n"
        "### Quick Answer\n"
        "Cracks are classified by **width** and **pattern**. Most non-structural cracks "
        "(< 0.3mm) are cosmetic; wider cracks (> 0.3mm) need structural assessment.\n\n"
        "### Why This Matters\n"
        "Ignoring structural cracks can lead to progressive failure. Correct diagnosis before "
        "repair saves money — treating symptoms without fixing the cause wastes effort.\n\n"
        "### Classification by Width (IS 456:2000)\n"
        "| Width | Class | Action |\n"
        "|-------|-------|--------|\n"
        "| < 0.1mm | Hairline | Cosmetic — seal with acrylic paint |\n"
        "| 0.1–0.3mm | Fine | Monitor — fill with cement slurry |\n"
        "| 0.3–1.0mm | Medium | Investigate — epoxy injection |\n"
        "| 1.0–2.0mm | Wide | Structural — epoxy/micro-concrete |\n"
        "| > 2.0mm | Severe | Emergency — consult structural engineer |\n\n"
        "### Classification by Pattern\n"
        "| Pattern | Likely Cause | Repair |\n"
        "|---------|-------------|--------|\n"
        "| Horizontal (walls) | Differential settlement | Underpinning |\n"
        "| Vertical (walls) | Thermal expansion | Expansion joints |\n"
        "| Diagonal (45°) | Shear stress / settlement | Structural repair |\n"
        "| Map/pattern (surface) | Shrinkage / alkali-aggregate | Surface treatment |\n"
        "| Along reinforcement | Corrosion of rebar | Cathodic protection |\n"
        "| Around openings | Stress concentration | Lintel/bond beam |\n\n"
        "### Repair Methods by Severity\n"
        "**Non-structural (< 0.3mm):**\n"
        "1. Clean crack with wire brush\n"
        "2. Apply primer/bonding agent\n"
        "3. Fill with polymer-modified mortar\n"
        "4. Apply flexible sealant if movement joint\n\n"
        "**Structural (> 0.3mm):**\n"
        "1. Drill injection ports at 200mm spacing\n"
        "2. Seal surface between ports with epoxy paste\n"
        "3. Inject low-viscosity epoxy under pressure (2–5 bar)\n"
        "4. Allow 24-hour cure before removing ports\n"
        "5. Apply protective coating\n\n"
        "### Common Mistakes to Avoid\n"
        "- Filling structural cracks with cement mortar (will re-crack)\n"
        "- Not identifying the root cause before repair\n"
        "- Using rigid filler on movement cracks\n\n"
        "### ⚠️ Safety Note\n"
        "Cracks wider than 2mm, especially diagonal cracks in columns/beams, require "
        "**immediate structural engineer assessment**. Do not occupy the structure.\n\n"
        "### Next Step\n"
        "Describe the crack location, width, and pattern — "
        "I can provide a specific diagnosis.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Waterproofing ────────────────────────────────────────────────────

def _respond_waterproofing() -> str:
    return (
        "## Waterproofing Systems Guide\n\n"
        "### Quick Answer\n"
        "Choose waterproofing based on **location** and **water exposure type**. "
        "Cementitious coating for basements, bituminous membrane for roofs, "
        "PU coating for wet areas.\n\n"
        "### Why This Matters\n"
        "Water damage causes 40% of building maintenance costs. Proper waterproofing "
        "during construction costs 1–2% of project but saves 10–15% in maintenance.\n\n"
        "### Options / Comparisons\n"
        "| System | Best For | Life | Cost/sqft |\n"
        "|--------|---------|------|----------|\n"
        "| Cementitious coating | Basements, water tanks | 10–15 yr | ₹40–60 |\n"
        "| Bituminous membrane (APP) | Roof slabs | 15–20 yr | ₹80–120 |\n"
        "| Polyurethane (PU) | Terraces, wet areas | 10–15 yr | ₹60–90 |\n"
        "| Crystalline (Xypex-type) | Concrete structures | 20+ yr | ₹100–150 |\n"
        "| Bentonite sheet | Foundation below grade | 15–20 yr | ₹120–180 |\n"
        "| Acrylic elastomeric | External walls | 5–8 yr | ₹25–40 |\n\n"
        "### Application Guide (Terrace Waterproofing)\n"
        "1. Clean surface — remove loose material, moss, old coatings\n"
        "2. Fill cracks with polymer-modified mortar\n"
        "3. Apply primer coat (based on system chosen)\n"
        "4. Apply 2 coats waterproofing membrane (perpendicular directions)\n"
        "5. Lay geotextile fabric between coats (for membrane systems)\n"
        "6. Apply protective screed (40mm min) with slope 1:100\n"
        "7. Cure for 7 days before use\n\n"
        "### Common Mistakes to Avoid\n"
        "- Applying waterproofing on damp/unclean surface\n"
        "- Not maintaining slope for drainage on flat roofs\n"
        "- Skipping primer — reduces adhesion by 50%\n"
        "- Not extending waterproofing up parapet by 300mm\n\n"
        "### Next Step\n"
        "Tell me the area to waterproof (terrace/basement/bathroom) and I'll suggest "
        "the best system with material quantities.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Concrete Defects ─────────────────────────────────────────────────

def _respond_concrete_defects() -> str:
    return (
        "## Concrete Defects — Causes & Remedies\n\n"
        "### Quick Answer\n"
        "Common concrete defects (honeycombing, bleeding, segregation) are usually caused by "
        "**poor compaction, incorrect mix, or bad placement practices**.\n\n"
        "### Why This Matters\n"
        "Defects reduce structural capacity and durability. Honeycombing can reduce "
        "concrete strength by 30–50% at the affected zone.\n\n"
        "### Defect Classification & Repair\n"
        "| Defect | Cause | Prevention | Repair |\n"
        "|--------|-------|-----------|--------|\n"
        "| Honeycombing | Poor vibration, congested rebar | Proper vibration, smaller aggregate | Chip, clean, apply bonding agent, patch |\n"
        "| Bleeding | High W/C ratio, over-vibration | Reduce W/C, use air entrainer | Re-vibrate before final set |\n"
        "| Segregation | Dropping concrete from height > 1.5m | Use tremie pipe, chutes | Remix before placement |\n"
        "| Cold joints | Delay > initial setting time | Plan pour sequence, use retarders | Chip, roughen, bond, repour |\n"
        "| Plastic shrinkage | Rapid surface drying | Cover, mist cure, wind break | Fill with polymer mortar |\n"
        "| Surface scaling | Freeze-thaw, chemical attack | Air entrainment, quality curing | Overlay with bonded topping |\n"
        "| Bug holes | Trapped air at formwork | Proper vibration, form release agent | Grout with sack rub |\n\n"
        "### Repair Protocol (Honeycombing)\n"
        "1. Chip out all loose and weak concrete\n"
        "2. Clean exposed rebar — remove rust if any\n"
        "3. If rebar exposed: apply anti-corrosive primer\n"
        "4. Apply bonding agent (SBR/epoxy) to surface\n"
        "5. Fill with non-shrink grout or micro-concrete\n"
        "6. Cure for minimum 7 days\n\n"
        "### Common Mistakes to Avoid\n"
        "- Patching without chipping away weak concrete\n"
        "- Using plain cement mortar for structural repairs\n"
        "- Not investigating whether honeycombing extends deeper\n\n"
        "### ⚠️ Safety Note\n"
        "If honeycombing exposes reinforcement in **columns or beams**, get structural "
        "assessment before proceeding. Load-bearing capacity may be compromised.\n\n"
        "### Next Step\n"
        "Share a photo or describe the defect location — I'll recommend the "
        "specific repair method.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Plastering Defects ───────────────────────────────────────────────

def _respond_plastering_defects() -> str:
    return (
        "## Plastering & Rendering Guide\n\n"
        "### Quick Answer\n"
        "Standard plastering: **12mm internal** (1:6 CM), **20mm external** (1:4 CM), "
        "**6mm ceiling** (1:3 CM). Always cure for 7 days minimum.\n\n"
        "### Why This Matters\n"
        "Plaster defects (hollowness, cracks, delamination) are the most common "
        "post-construction complaints and are entirely preventable.\n\n"
        "### Plastering Specification\n"
        "| Location | Thickness | Mix | Key Notes |\n"
        "|----------|-----------|-----|----------|\n"
        "| Internal walls | 12mm | 1:6 CM | Wet surface before application |\n"
        "| External walls | 20mm (2 coats) | 1:4 CM | Apply in 2 coats, first 12mm rough |\n"
        "| Ceiling | 6mm | 1:3 CM | Use bonding agent on smooth concrete |\n"
        "| Bathroom | 12mm + WP | 1:4 CM + WP additive | Waterproof additive mandatory |\n"
        "| Column/beam | 12mm | 1:4 CM | Use chicken mesh at concrete-brick junction |\n\n"
        "### Common Defects & Prevention\n"
        "| Defect | Cause | Prevention |\n"
        "|--------|-------|-----------|\n"
        "| Hollowness | Dry surface, poor bonding | Wet surface, apply in thin coats |\n"
        "| Hair cracks | Excess cement, poor curing | Use correct mix, cure 7 days |\n"
        "| Delamination | Smooth concrete surface | Use bonding agent or chicken mesh |\n"
        "| Efflorescence | Soluble salts in materials | Use quality materials, ensure drainage |\n"
        "| Peeling | Moisture behind plaster | Fix source of dampness first |\n\n"
        "### Next Step\n"
        "Tell me the area and surface type for plastering quantity calculation.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Failure Analysis ─────────────────────────────────────────────────

def _respond_failure_analysis() -> str:
    return (
        "## Structural Failure Analysis\n\n"
        "### Quick Answer\n"
        "Building failures are caused by: **design errors (25%), construction defects (40%), "
        "overloading (20%), material failure (10%), natural events (5%)**.\n\n"
        "### Why This Matters\n"
        "Understanding failure patterns prevents recurrence. 90% of structural failures "
        "are preventable with proper quality control.\n\n"
        "### Common Failure Modes\n"
        "| Failure Type | Warning Signs | Critical Action |\n"
        "|-------------|---------------|----------------|\n"
        "| Shear failure (beam) | Diagonal cracks at 45° near supports | Immediate shoring |\n"
        "| Flexural failure (slab) | Midspan deflection, bottom cracks | Load removal, propping |\n"
        "| Column buckling | Spalling, vertical cracks, bulging | Evacuate, emergency shoring |\n"
        "| Foundation settlement | Tilting, diagonal wall cracks | Underpinning, releveling |\n"
        "| Connection failure | Cracks at beam-column joint | Steel plate jacketing |\n"
        "| Slab punching shear | Cracks around column head | Capital/drop panel retrofit |\n\n"
        "### Investigation Protocol (IS 13311, IS 13935)\n"
        "1. Visual inspection — document all cracks, deflections, distress\n"
        "2. NDT: Rebound hammer → surface strength estimate\n"
        "3. NDT: UPV (Ultrasonic Pulse Velocity) → internal quality\n"
        "4. Core test: Extract cylinders for actual compressive strength\n"
        "5. Carbonation test: Phenolphthalein on fresh core\n"
        "6. Half-cell potential: Assess rebar corrosion probability\n"
        "7. Load test if needed (IS 456 Cl. 17.6)\n\n"
        "### ⚠️ Safety Note\n"
        "**Never attempt structural rehabilitation without professional structural engineer "
        "assessment.** Evacuate the affected zone before investigation.\n\n"
        "### Next Step\n"
        "Describe the distress signs — cracks, settlement, or deflection — "
        "and I'll guide the investigation approach.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── NDT ──────────────────────────────────────────────────────────────

def _respond_ndt() -> str:
    return (
        "## Non-Destructive Testing (NDT) for Structures\n\n"
        "### Quick Answer\n"
        "Use **Rebound Hammer** for quick strength screening, **UPV** for internal quality, "
        "and **Core Test** for definitive strength.\n\n"
        "### Why This Matters\n"
        "NDT allows structural assessment without damaging the structure. "
        "Essential for old buildings, distressed structures, and quality disputes.\n\n"
        "### NDT Methods Comparison\n"
        "| Method | Measures | Accuracy | Cost | IS Code |\n"
        "|--------|---------|----------|------|---------|\n"
        "| Rebound Hammer | Surface hardness → strength | ±25% | Low | IS 13311 Part 2 |\n"
        "| UPV | Pulse velocity → quality | ±20% | Medium | IS 13311 Part 1 |\n"
        "| Core Test | Actual compressive strength | ±5% | High | IS 516 |\n"
        "| Rebar Locator | Cover, spacing, diameter | High | Medium | — |\n"
        "| Half-Cell Potential | Corrosion probability | Good | Medium | ASTM C876 |\n"
        "| Carbonation Test | Carbonation depth | High | Low | — |\n"
        "| Load Test | Actual load capacity | Definitive | High | IS 456 Cl. 17.6 |\n\n"
        "### UPV Quality Classification (IS 13311)\n"
        "| Velocity (km/s) | Quality |\n"
        "|-----------------|--------|\n"
        "| > 4.5 | Excellent |\n"
        "| 3.5–4.5 | Good |\n"
        "| 3.0–3.5 | Medium |\n"
        "| < 3.0 | Doubtful |\n\n"
        "### Next Step\n"
        "Tell me the structure type and concern — I'll recommend the right NDT combination.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Corrosion ────────────────────────────────────────────────────────

def _respond_corrosion() -> str:
    return (
        "## Rebar Corrosion — Prevention & Repair\n\n"
        "### Quick Answer\n"
        "Rebar corrosion is the #1 cause of concrete structure deterioration. "
        "Maintain **minimum cover** (IS 456 Table 16) and use **low W/C ratio**.\n\n"
        "### Why This Matters\n"
        "Corroding rebar expands 6× its volume, cracking concrete from within. "
        "Prevention during construction is 10× cheaper than repair.\n\n"
        "### Minimum Cover Requirements (IS 456:2000)\n"
        "| Exposure | Cover (mm) |\n"
        "|----------|------------|\n"
        "| Mild (interior) | 20 |\n"
        "| Moderate (sheltered exterior) | 30 |\n"
        "| Severe (coastal, industrial) | 45 |\n"
        "| Very severe (tidal zone) | 50 |\n"
        "| Extreme (chemical) | 75 |\n\n"
        "### Prevention Strategies\n"
        "1. **Adequate cover** — most important single factor\n"
        "2. **Low W/C ratio** (< 0.45) — reduces permeability\n"
        "3. **Proper curing** — minimum 7 days moist curing\n"
        "4. **Epoxy-coated rebar** — for aggressive environments\n"
        "5. **Corrosion inhibitors** — admixture during mixing\n\n"
        "### Repair Protocol\n"
        "1. Break out concrete 25mm beyond corroded zone\n"
        "2. Clean rebar to bright metal (sandblast/wire brush)\n"
        "3. If section loss > 15%: supplement with new rebar\n"
        "4. Apply zinc-rich primer + anti-corrosive coating\n"
        "5. Apply bonding agent to concrete surface\n"
        "6. Patch with polymer-modified mortar / micro-concrete\n"
        "7. Apply migrating corrosion inhibitor to surface\n\n"
        "### Next Step\n"
        "Describe the corrosion signs — I'll assess severity and recommend repair.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )
