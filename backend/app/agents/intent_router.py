"""Intent Router Agent — classifies user queries into domains and identifies missing inputs.

Routes to the correct specialist agent and extracts key parameters from the query.
"""

import re
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class IntentResult:
    """Result of intent classification."""
    intent: str  # primary intent label
    agent: str  # target agent module name
    confidence: float  # 0.0 - 1.0
    extracted_params: dict = field(default_factory=dict)
    missing_inputs: list = field(default_factory=list)
    risk_level: str = "low"  # low / medium / high / critical
    sub_intent: Optional[str] = None  # more specific classification


# ─── Pattern groups for intent classification ────────────────────────────────

_STRUCTURAL_DESIGN_PATTERNS = [
    r"\bbeam\b.*(?:size|design|span|calculate|dimension|what)",
    r"\bcolumn\b.*(?:size|design|load|calculate|dimension|what)",
    r"\bslab\b.*(?:size|design|thickness|calculate|span|what|for)",
    r"\bfooting\b.*(?:design|size|calculate|what|for)",
    r"\bfoundation\b.*(?:design|size|calculate|what|for|type|recommend)",
    r"\bretaining\b.*\bwall\b",
    r"\b(?:bbs|bar\s+bending|bending\s+schedule|reinforcement\s+schedule)\b",
]

_MIX_DESIGN_PATTERNS = [
    r"\bmix\s+design\b",
    r"\bconcrete\s+mix\b",
    r"\bmix\s+proportion\b",
]

_CONSTRUCTION_STAGES_PATTERNS = [
    r"\bconstruction\s+stage",
    r"\bbuilding\s+stage",
    r"\bbuilding\s+process",
    r"\bconstruction\s+(?:process|sequence)",
    r"\bhouse\s+construction\b",
    r"\bstart\s+to\s+finish\b",
    r"\bstep\s+by\s+step\b",
    r"\bformwork\b",
    r"\bshuttering\b",
    r"\bdpc\b",
    r"\banti[- ]termite\b",
    r"\bcuring\s+period\b",
    r"\bstages?\s+of\b",
]

_CEMENT_PATTERNS = [
    r"\bwhich\s+cement\b",
    r"\bcement\s+(?:type|for|grade|select)\b",
    r"\bopc\s+(?:vs|43|53)\b",
    r"\bppc\s+(?:vs|or)\b",
    r"\bpsc\b",
    r"\brapid\s+hardening\b",
    r"\bsulphate\s+resist\b",
    r"\bbest\s+cement\b",
    r"\btype\s+of\s+cement\b",
]

_BRICK_PATTERNS = [
    r"\bwhich\s+brick\b",
    r"\bbrick\s+(?:type|for|compare)\b",
    r"\bred\s+brick\b",
    r"\bfly\s+ash\s+brick\b",
    r"\baac\s+(?:block|vs)\b",
    r"\bhollow\s+block\b",
    r"\bbrick\s+vs\b",
    r"\bclay\s+brick\b",
    r"\bbest\s+brick\b",
    r"\btype\s+of\s+brick\b",
]

_STEEL_TMT_PATTERNS = [
    r"\btmt\b",
    r"\bfe\s*(?:415|500|550|600)\b",
    r"\bwhich\s+steel\b",
    r"\bsteel\s+(?:grade|for)\b",
    r"\brebar\b",
    r"\breinforcement\s+bar\b",
    r"\bbar\s+(?:weight|diameter)\b",
]

_COST_PATTERNS = [
    r"\bcost\b",
    r"\bbudget\b",
    r"\bprice\b",
    r"\brate\b",
    r"\bestimate\b",
    r"\bsq\.?\s*ft\b",
    r"\bsqft\b",
    r"\bsft\b",
    r"\bsquare\s+feet\b",
]

_QUANTITY_PATTERNS = [
    r"\bmaterial\b",
    r"\bquantity\b",
    r"\bboq\b",
    r"\bbill\s+of\s+quantit",
    r"\btake[\s-]*off\b",
]

_WATERPROOFING_PATTERNS = [
    r"\bwater\s*proof\b",
    r"\bdamp\s*proof\b",
    r"\bterrace\s+leak\b",
    r"\broof\s+leak\b",
    r"\bbathroom\s+leak\b",
    r"\bseepage\b",
    r"\bdampness\b",
    r"\bdamp\s+wall\b",
    r"\bmoisture\s+barrier\b",
    r"\bmembrane\b",
    r"\bleak(?:ing)?\s+in\b",
]

_CRACK_PATTERNS = [
    r"\bcrack\s+in\s+wall\b",
    r"\bwall\s+crack\b",
    r"\bplaster\s+crack\b",
    r"\bceiling\s+crack\b",
    r"\bfloor\s+crack\b",
    r"\btile\s+crack\b",
    r"\bcrack\s+(?:in\s+plaster|diagnosis|cause|repair)\b",
]

_SOIL_PATTERNS = [
    r"\bsoil\b",
    r"\bbearing\s+capacity\b",
    r"\bstrata\b",
    r"\bgeotechnical\b",
    r"\bspt\b",
    r"\bbore\b",
]

_SEISMIC_PATTERNS = [
    r"\bseismic\b",
    r"\bearthquake\b",
    r"\bzone\b",
    r"\bis\s+1893\b",
    r"\bductile\b",
    r"\bis\s+13920\b",
]

_LOAD_PATTERNS = [
    r"\b(?:dead|live|wind)\s+load\b",
    r"\bload\s+combination\b",
    r"\bis\s+875\b",
    r"\bload\b",
]

_BUILDING_PLAN_PATTERNS = [
    r"\broom\s+(?:size|dimension|layout)\b",
    r"\bventilat\b",
    r"\bstaircase\s+(?:design|rule|dimension)\b",
    r"\b(?:carpet|built[\s-]?up|super\s+built)\s+area\b",
    r"\bkitchen\s+(?:size|plan)\b",
    r"\bbathroom\s+(?:size|plan)\b",
    r"\bbuilding\s+plan\b",
    r"\bminimum\s+room\b",
    r"\bnbc\s+room\b",
]

_PLASTERING_PATTERNS = [
    r"\bplaster\b",
    r"\bmortar\s+(?:ratio|mix)\b",
    r"\bmasonry\s+work\b",
    r"\bhow\s+to\s+plaster\b",
    r"\bplastering\s+(?:method|thickness)\b",
    r"\bbrick\s+laying\b",
    r"\bbrickwork\b",
]

_CONCRETE_CURING_PATTERNS = [
    r"\bcuring\b",
    r"\bconcrete\s+defect\b",
    r"\bhoneycomb\b",
    r"\bbleeding\b",
    r"\bsegregation\b",
    r"\bcold\s+joint\b",
    r"\bwater\s+cement\s+ratio\b",
    r"\bw/c\s+ratio\b",
    r"\bconcrete\s+(?:technology|problem)\b",
    r"\bslump\s+test\b",
    r"\bworkability\b",
]

_ROAD_PATTERNS = [
    r"\broad\b",
    r"\bhighway\b",
    r"\bpavement\b",
    r"\bbitumen\b",
    r"\basphalt\b",
    r"\btar\b",
    r"\birc\b",
]

_BRIDGE_PATTERNS = [
    r"\bbridge\b",
    r"\bculvert\b",
    r"\bflyover\b",
    r"\bviaduct\b",
]

_HYDRAULIC_PATTERNS = [
    r"\bwater\b",
    r"\bpipe\b",
    r"\bdrain\b",
    r"\bsewer\b",
    r"\btank\b",
    r"\bhydraulic\b",
    r"\bmanning\b",
    r"\bflow\b",
]

_STEEL_STRUCTURE_PATTERNS = [
    r"\bsteel\b",
    r"\bis\s+800\b",
    r"\bismc\b",
    r"\bismb\b",
    r"\btruss\b",
    r"\bpeb\b",
    r"\bwelded\b",
    r"\bbolted\b",
]

_IS_CODE_PATTERNS = [
    r"\bis\s+code\b",
    r"\bis\s+456\b",
    r"\bcode\s+reference\b",
    r"\bstandard\b",
    r"\bwhich\s+code\b",
    r"\bnbc\b",
]

_PRESTRESS_PATTERNS = [
    r"\bprestress\b",
    r"\bpost[\s\-]?tension\b",
    r"\bpre[\s\-]?tension\b",
    r"\bis\s+1343\b",
]

_ENVIRONMENT_PATTERNS = [
    r"\benvironment\b",
    r"\bcarbon\b",
    r"\bgreen\b",
    r"\bleed\b",
    r"\bigbc\b",
    r"\bsustainability\b",
    r"\beia\b",
]

_PROJECT_MGMT_PATTERNS = [
    r"\bschedule\b",
    r"\bcpm\b",
    r"\bpert\b",
    r"\bgantt\b",
    r"\bproject\s+management\b",
    r"\bearned\s+value\b",
    r"\beva\b",
]

_NDT_QUALITY_PATTERNS = [
    r"\bndt\b",
    r"\brebound\b",
    r"\bupv\b",
    r"\btest\b",
    r"\bquality\b",
    r"\bcube\b",
    r"\bslump\b",
]

_FAILURE_PATTERNS = [
    r"\bfailure\b",
    r"\bcollapse\b",
    r"\bdefect\b",
    r"\bdamage\b",
    r"\brepair\b",
    r"\bretrofit\b",
    r"\bsettle\b",
]

_SURVEY_PATTERNS = [
    r"\bsurvey\b",
    r"\blevelling\b",
    r"\btheodolite\b",
    r"\btotal\s+station\b",
    r"\bgps\b",
    r"\bcontour\b",
    r"\bsetting\s+out\b",
]

_3D_BIM_PATTERNS = [
    r"\b3d\b",
    r"\bbim\b",
    r"\brevit\b",
    r"\bvisualization\b",
    r"\brender\b",
    r"\b3d\s+(?:image|model)\b",
    r"\bdigital\s+twin\b",
    r"\bthree\s+dimensional\b",
    r"\bimage\b",
    r"\bpicture\b",
    r"\bphoto\b",
    r"\bvisual\b",
    r"\bdrawing\b",
    r"\bsketch\b",
    r"\billustration\b",
    r"\barchitect\b",
]

_SOFTWARE_PATTERNS = [
    r"\bsoftware\b",
    r"\btool\b",
    r"\bstaad\b",
    r"\betabs\b",
    r"\bautocad\b",
    r"\bprimavera\b",
    r"\brevit\b",
    r"\btekla\b",
    r"\bsap2000\b",
    r"\bsafe\b",
    r"\bmidas\b",
    r"\bansys\b",
    r"\bplaxis\b",
    r"\bgeo5\b",
    r"\bprokon\b",
]

# ─── Platform-related patterns ────────────────────────────────────────────────

_PLATFORM_ABOUT = [r"\bwhat\s+is\s+nirmaan\b", r"\babout\s+nirmaan\b", r"\bnirmaan\s+platform\b",
                   r"\byour\s+(?:platform|company)\b", r"\bwhat\s+(?:do\s+you\s+do|can\s+you\s+do)\b",
                   r"\bwho\s+are\s+you\b", r"\bwhat\s+are\s+you\b"]

_PLATFORM_WHY = [r"\bwhy\s+(?:nirmaan|choose|trust|use\s+nirmaan)\b", r"\badvantage\b",
                 r"\bbenefit\b", r"\bdifferent\s+from\b", r"\bunique\b", r"\breliable\b"]

_PLATFORM_HOW = [r"\bhow\s+(?:does\s+nirmaan|to\s+use|to\s+start|to\s+order|to\s+buy|do\s+i)\b",
                 r"\bgetting\s+started\b", r"\bnew\s+here\b", r"\bfirst\s+time\b",
                 r"\bsign\s+up\b", r"\bregister\b"]

_PREMIUM_PATTERNS = [r"\bpremium\b", r"\bmembership\b", r"\bupgrade\b", r"\bplan\b",
                     r"\bsubscription\b", r"\btier\b", r"\bsilver\s+plan\b", r"\bgold\s+plan\b",
                     r"\bplatinum\b", r"\benterprise\s+plan\b", r"\bunlock\b"]

_WORKFORCE_PATTERNS = [r"\bhire\s+worker\b", r"\bfind\s+(?:mason|electrician|plumber|carpenter)\b",
                       r"\bworkforce\b", r"\bmanpower\b", r"\blabo[u]r\b",
                       r"\bneed\s+(?:mason|plumber|electrician|welder|painter)\b", r"\bhire\b"]

_EQUIPMENT_PATTERNS = [r"\bequipment\s+rent\b", r"\brent\s+(?:jcb|crane|excavat|mixer)\b",
                       r"\bmachinery\b", r"\bheavy\s+equipment\b", r"\bequipment\s+hire\b",
                       r"\b(?:jcb|crane)\s+rate\b"]

_DELIVERY_PATTERNS = [r"\bdelivery\b", r"\bshipping\b", r"\btransport\b",
                      r"\btrack.*delivery\b", r"\bgps\s+track\b", r"\bdelivery.*area\b"]

_CREDIT_PATTERNS = [r"\bcredit\b", r"\bloan\b", r"\bemi\b", r"\bpay\s+later\b",
                    r"\bbuy\s+now\b", r"\bfinance\b", r"\brepay\b", r"\bcredit\s+line\b"]

_DT_DRONE_PATTERNS = [r"\bdigital\s+twin\b", r"\biot\s+sensor\b", r"\bstructural\s+monitoring\b",
                      r"\bdrone\b", r"\bpredictive\s+maintenance\b", r"\breal[\s-]*time\s+monitor\b"]

_DESIGN_STUDIO_PATTERNS = [r"\bdesign\s+studio\b", r"\bfloor\s+plan\b", r"\binterior\s+design\b",
                           r"\barchitect\b", r"\b3d\s+design\b", r"\blandscape\s+design\b",
                           r"\brenovation\s+design\b"]

_SUPPLIER_PATTERNS = [r"\bbecome\s+supplier\b", r"\bsupplier\s+register\b",
                      r"\bsell\s+on\s+nirmaan\b", r"\bjoin\s+marketplace\b",
                      r"\blist\s+product\b", r"\bregister\s+as\s+supplier\b"]


# ─── Compiled patterns with priorities ────────────────────────────────────────

_INTENT_MAP = [
    # (patterns, intent, agent, risk_level, priority)
    # Higher priority = checked first. Structural design first, then materials, etc.

    # Structural Design (calculators)
    (_STRUCTURAL_DESIGN_PATTERNS, "structural_design", "civil_engineering", "high", 100),
    (_MIX_DESIGN_PATTERNS, "mix_design", "civil_engineering", "medium", 99),

    # Construction process
    (_CONSTRUCTION_STAGES_PATTERNS, "construction_stages", "project_planning", "low", 90),

    # Material selection
    (_CEMENT_PATTERNS, "cement_selection", "material_recommendation", "low", 85),
    (_BRICK_PATTERNS, "brick_selection", "material_recommendation", "low", 85),
    (_STEEL_TMT_PATTERNS, "steel_selection", "material_recommendation", "medium", 85),

    # Defect/crack diagnosis
    (_CRACK_PATTERNS, "crack_diagnosis", "defect_diagnosis", "medium", 82),
    (_WATERPROOFING_PATTERNS, "waterproofing", "defect_diagnosis", "medium", 80),
    (_FAILURE_PATTERNS, "failure_analysis", "defect_diagnosis", "high", 80),

    # Building planning
    (_BUILDING_PLAN_PATTERNS, "building_planning", "building_layout", "low", 75),

    # Concrete / curing
    (_CONCRETE_CURING_PATTERNS, "concrete_technology", "civil_engineering", "medium", 73),

    # Cost & quantity
    (_COST_PATTERNS, "cost_estimation", "cost_estimation", "low", 70),
    (_QUANTITY_PATTERNS, "quantity_estimation", "quantity_estimation", "low", 70),

    # Geotechnical
    (_SOIL_PATTERNS, "soil_geotechnical", "civil_engineering", "high", 68),
    (_SEISMIC_PATTERNS, "seismic_design", "civil_engineering", "high", 68),
    (_LOAD_PATTERNS, "load_analysis", "civil_engineering", "medium", 65),

    # Infrastructure
    (_ROAD_PATTERNS, "road_engineering", "civil_engineering", "medium", 60),
    (_BRIDGE_PATTERNS, "bridge_engineering", "civil_engineering", "high", 60),
    (_HYDRAULIC_PATTERNS, "hydraulic_engineering", "civil_engineering", "medium", 55),

    # Plastering / masonry
    (_PLASTERING_PATTERNS, "plastering_masonry", "civil_engineering", "low", 53),

    # Structural steel
    (_STEEL_STRUCTURE_PATTERNS, "steel_structure", "civil_engineering", "high", 50),
    (_IS_CODE_PATTERNS, "is_code_reference", "civil_engineering", "low", 48),
    (_PRESTRESS_PATTERNS, "prestressed_concrete", "civil_engineering", "high", 47),

    # Sustainability
    (_ENVIRONMENT_PATTERNS, "sustainability", "civil_engineering", "low", 45),
    (_PROJECT_MGMT_PATTERNS, "project_management", "project_planning", "low", 43),
    (_NDT_QUALITY_PATTERNS, "ndt_quality", "civil_engineering", "medium", 42),

    # Survey
    (_SURVEY_PATTERNS, "surveying", "civil_engineering", "low", 40),

    # 3D / BIM / Software
    (_3D_BIM_PATTERNS, "3d_bim", "civil_engineering", "low", 35),
    (_SOFTWARE_PATTERNS, "software_tools", "civil_engineering", "low", 33),

    # ── Platform queries ──
    (_PLATFORM_ABOUT, "platform_about", "engagement", "low", 20),
    (_PLATFORM_WHY, "platform_why", "engagement", "low", 20),
    (_PLATFORM_HOW, "platform_how", "engagement", "low", 20),
    (_PREMIUM_PATTERNS, "premium_plans", "engagement", "low", 20),
    (_WORKFORCE_PATTERNS, "workforce_hire", "engagement", "low", 20),
    (_EQUIPMENT_PATTERNS, "equipment_rental", "engagement", "low", 20),
    (_DELIVERY_PATTERNS, "delivery_info", "engagement", "low", 20),
    (_CREDIT_PATTERNS, "credit_info", "engagement", "low", 20),
    (_DT_DRONE_PATTERNS, "digital_twin", "engagement", "low", 20),
    (_DESIGN_STUDIO_PATTERNS, "design_studio", "engagement", "low", 20),
    (_SUPPLIER_PATTERNS, "supplier_register", "engagement", "low", 20),
]

# Sort by priority (highest first)
_INTENT_MAP.sort(key=lambda x: x[4], reverse=True)


def _extract_params(q: str) -> dict:
    """Extract numerical and categorical parameters from the query."""
    params = {}

    # Span / distance in meters
    m = re.search(r"(\d+\.?\d*)\s*(?:m\b|meter|metre)", q)
    if m:
        params["span_m"] = float(m.group(1))

    # Load in kN
    m = re.search(r"(\d+\.?\d*)\s*(?:kn|kilo\s*newton)", q)
    if m:
        params["load_kn"] = float(m.group(1))

    # Height
    m = re.search(r"(\d+\.?\d*)\s*(?:m\b|meter|metre)?\s*(?:high|height|tall)", q)
    if m:
        params["height_m"] = float(m.group(1))

    # Area in sqft
    m = re.search(r"(\d[\d,]*)\s*(?:sq\.?\s*ft|sqft|sft|square\s*feet?)", q)
    if m:
        params["sqft"] = float(m.group(1).replace(",", ""))

    # Concrete grade
    m = re.search(r"\bm\s*(\d{2})\b", q)
    if m:
        params["grade"] = f"M{m.group(1)}"

    # Support type
    if "cantilever" in q:
        params["support"] = "cantilever"
    elif "continuous" in q:
        params["support"] = "continuous"
    elif "fixed" in q:
        params["support"] = "fixed"

    # Slab type
    if "one" in q and "way" in q:
        params["slab_type"] = "one_way"
    elif "flat" in q:
        params["slab_type"] = "flat_slab"

    # Soil type
    for soil in ["hard_rock", "weathered_rock", "dense_gravel", "dense_sand",
                 "stiff_clay", "soft_clay", "loose_sand", "filled_ground",
                 "marine_clay", "expansive_black_cotton"]:
        if soil.replace("_", " ") in q or soil.replace("_", "") in q:
            params["soil_type"] = soil
            break
    if "black cotton" in q:
        params["soil_type"] = "expansive_black_cotton"
    elif "loose" in q and "sand" in q:
        params["soil_type"] = "loose_sand"
    elif "soft" in q and "clay" in q:
        params["soil_type"] = "soft_clay"

    # Number of floors
    m = re.search(r"(\d+)\s*(?:floor|storey|story|level)", q)
    if m:
        params["floors"] = int(m.group(1))

    # G+N pattern
    m = re.search(r"g\s*\+\s*(\d+)", q)
    if m:
        params["floors"] = int(m.group(1)) + 1

    return params


def classify_intent(question: str) -> IntentResult:
    """Classify a user question into an intent + target agent.

    Uses regex pattern matching with priority ordering.
    Returns IntentResult with intent label, agent name, confidence, extracted params.
    """
    q = question.lower().strip()
    extracted = _extract_params(q)

    for patterns, intent, agent, risk, _priority in _INTENT_MAP:
        matches = sum(1 for p in patterns if re.search(p, q))
        if matches > 0:
            confidence = min(1.0, 0.5 + matches * 0.15)
            return IntentResult(
                intent=intent,
                agent=agent,
                confidence=confidence,
                extracted_params=extracted,
                risk_level=risk,
            )

    # Fallback — general greeting or unknown
    if any(w in q for w in ["hi", "hello", "hey", "good morning", "good evening", "namaste"]):
        return IntentResult(
            intent="greeting",
            agent="engagement",
            confidence=0.9,
            extracted_params=extracted,
            risk_level="low",
        )

    return IntentResult(
        intent="general",
        agent="engagement",
        confidence=0.3,
        extracted_params=extracted,
        risk_level="low",
    )
