"""
Smart Material Estimator — AI-powered construction material estimation.

Provides material quantity and cost estimates based on:
- House/building dimensions
- Number of floors
- Structure type (residential, commercial, etc.)
- Construction quality (economy, standard, premium)
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ── Material Rate Database (INR) ─────────────────────────
# Based on Telangana/AP market rates (2025-2026)
MATERIAL_RATES = {
    "cement_bag_50kg": {"economy": 340, "standard": 380, "premium": 420},
    "sand_cubic_ft": {"economy": 45, "standard": 55, "premium": 65},
    "bricks_piece": {"economy": 7, "standard": 9, "premium": 12},
    "steel_kg": {"economy": 55, "standard": 65, "premium": 75},
    "gravel_cubic_ft": {"economy": 35, "standard": 45, "premium": 55},
    "water_liter": {"economy": 0.5, "standard": 0.5, "premium": 0.5},
    "tiles_sqft": {"economy": 25, "standard": 45, "premium": 85},
    "paint_liter": {"economy": 180, "standard": 300, "premium": 500},
    "electrical_point": {"economy": 800, "standard": 1200, "premium": 2000},
    "plumbing_point": {"economy": 1500, "standard": 2500, "premium": 4000},
    "wood_cft": {"economy": 1200, "standard": 1800, "premium": 2800},
}

# ── Labor Cost per Sqft ──────────────────────────────────
LABOR_RATES_PER_SQFT = {
    "economy": 300,
    "standard": 500,
    "premium": 800,
}

# ── Construction Constants ───────────────────────────────
CONSTANTS = {
    "cement_bags_per_sqft": 0.4,
    "sand_cft_per_sqft": 1.25,
    "bricks_per_sqft": 8,
    "steel_kg_per_sqft_residential": 4,
    "steel_kg_per_sqft_commercial": 6,
    "gravel_cft_per_sqft": 0.75,
    "water_liters_per_sqft": 20,
    "tiles_sqft_per_sqft": 1.15,  # includes wastage
    "paint_liters_per_sqft": 0.18,
    "electrical_points_per_room": 8,
    "plumbing_points_per_bathroom": 6,
    "wood_cft_per_sqft": 0.15,
    "avg_room_sqft": 120,
}

# ── Structure Type Multipliers ───────────────────────────
STRUCTURE_MULTIPLIERS = {
    "residential_individual": 1.0,
    "residential_apartment": 0.85,
    "commercial_office": 1.15,
    "commercial_shop": 1.0,
    "warehouse": 0.7,
    "industrial": 1.3,
    "hospital": 1.5,
    "school": 0.9,
}


class EstimationInput(BaseModel):
    """Input for material estimation."""
    length_ft: float = Field(..., gt=0, description="Length of plot in feet")
    width_ft: float = Field(..., gt=0, description="Width of plot in feet")
    floors: int = Field(1, ge=1, le=20, description="Number of floors")
    structure_type: str = Field("residential_individual", description="Type of construction")
    quality: str = Field("standard", description="Construction quality: economy, standard, premium")
    num_bathrooms: int = Field(2, ge=1, description="Number of bathrooms")
    num_rooms: int = Field(0, description="Number of rooms (0=auto-calculate)")
    include_tiles: bool = Field(True, description="Include floor tiles")
    include_paint: bool = Field(True, description="Include painting")
    include_electrical: bool = Field(True, description="Include electrical work")
    include_plumbing: bool = Field(True, description="Include plumbing")


class MaterialEstimate(BaseModel):
    """Single material estimate."""
    material: str
    description: str
    quantity: float
    unit: str
    rate_per_unit: float
    total_cost: float


class EstimationResult(BaseModel):
    """Full estimation result."""
    # Input summary
    plot_area_sqft: float
    built_up_area_sqft: float
    carpet_area_sqft: float
    floors: int
    structure_type: str
    quality: str

    # Material estimates
    materials: List[MaterialEstimate]
    material_cost: float
    labor_cost: float
    total_estimated_cost: float

    # Breakdown
    cost_per_sqft: float
    timeline_months: int

    # Recommendations
    recommendations: List[str]


class ChatMessage(BaseModel):
    """Chat message for the estimation chatbot."""
    role: str  # user, assistant
    content: str


class ChatRequest(BaseModel):
    """Request to the estimation chatbot."""
    message: str
    context: Optional[Dict] = None  # previous estimation data


class ChatResponse(BaseModel):
    """Response from the estimation chatbot."""
    reply: str
    estimation: Optional[EstimationResult] = None
    suggestions: List[str] = []


def estimate_materials(input_data: EstimationInput) -> EstimationResult:
    """Calculate material estimates based on input parameters."""

    plot_area = input_data.length_ft * input_data.width_ft
    built_up_area = plot_area * input_data.floors
    carpet_area = built_up_area * 0.75  # 75% carpet area

    quality = input_data.quality if input_data.quality in MATERIAL_RATES["cement_bag_50kg"] else "standard"
    multiplier = STRUCTURE_MULTIPLIERS.get(input_data.structure_type, 1.0)

    # Auto-calculate rooms if not specified
    num_rooms = input_data.num_rooms if input_data.num_rooms > 0 else max(1, int(carpet_area / CONSTANTS["avg_room_sqft"]))

    materials: List[MaterialEstimate] = []
    total_material_cost = 0.0

    # 1. Cement
    cement_qty = round(built_up_area * CONSTANTS["cement_bags_per_sqft"] * multiplier)
    cement_rate = MATERIAL_RATES["cement_bag_50kg"][quality]
    cement_cost = cement_qty * cement_rate
    materials.append(MaterialEstimate(
        material="Cement (50kg bags)",
        description=f"OPC 53 / PPC grade cement, {quality} quality",
        quantity=cement_qty, unit="bags",
        rate_per_unit=cement_rate, total_cost=cement_cost
    ))
    total_material_cost += cement_cost

    # 2. Sand
    sand_qty = round(built_up_area * CONSTANTS["sand_cft_per_sqft"] * multiplier)
    sand_rate = MATERIAL_RATES["sand_cubic_ft"][quality]
    sand_cost = sand_qty * sand_rate
    materials.append(MaterialEstimate(
        material="River Sand",
        description="Fine aggregate for concrete and plastering",
        quantity=sand_qty, unit="cubic ft",
        rate_per_unit=sand_rate, total_cost=sand_cost
    ))
    total_material_cost += sand_cost

    # 3. Bricks
    brick_qty = round(built_up_area * CONSTANTS["bricks_per_sqft"] * multiplier)
    brick_rate = MATERIAL_RATES["bricks_piece"][quality]
    brick_cost = brick_qty * brick_rate
    materials.append(MaterialEstimate(
        material="Red Bricks / Fly Ash Bricks",
        description=f"Standard size bricks for walls",
        quantity=brick_qty, unit="pieces",
        rate_per_unit=brick_rate, total_cost=brick_cost
    ))
    total_material_cost += brick_cost

    # 4. Steel / TMT Bars
    steel_rate_key = "steel_kg_per_sqft_commercial" if "commercial" in input_data.structure_type else "steel_kg_per_sqft_residential"
    steel_qty = round(built_up_area * CONSTANTS[steel_rate_key] * multiplier)
    steel_rate = MATERIAL_RATES["steel_kg"][quality]
    steel_cost = steel_qty * steel_rate
    materials.append(MaterialEstimate(
        material="Steel TMT Bars (Fe 500D)",
        description="Primary reinforcement steel",
        quantity=steel_qty, unit="kg",
        rate_per_unit=steel_rate, total_cost=steel_cost
    ))
    total_material_cost += steel_cost

    # 5. Gravel / Aggregate
    gravel_qty = round(built_up_area * CONSTANTS["gravel_cft_per_sqft"] * multiplier)
    gravel_rate = MATERIAL_RATES["gravel_cubic_ft"][quality]
    gravel_cost = gravel_qty * gravel_rate
    materials.append(MaterialEstimate(
        material="Gravel / Coarse Aggregate",
        description="20mm aggregate for concrete",
        quantity=gravel_qty, unit="cubic ft",
        rate_per_unit=gravel_rate, total_cost=gravel_cost
    ))
    total_material_cost += gravel_cost

    # 6. Water
    water_qty = round(built_up_area * CONSTANTS["water_liters_per_sqft"])
    water_rate = MATERIAL_RATES["water_liter"][quality]
    water_cost = water_qty * water_rate
    materials.append(MaterialEstimate(
        material="Water",
        description="For mixing and curing",
        quantity=water_qty, unit="liters",
        rate_per_unit=water_rate, total_cost=water_cost
    ))
    total_material_cost += water_cost

    # 7. Tiles (optional)
    if input_data.include_tiles:
        tile_qty = round(carpet_area * CONSTANTS["tiles_sqft_per_sqft"])
        tile_rate = MATERIAL_RATES["tiles_sqft"][quality]
        tile_cost = tile_qty * tile_rate
        materials.append(MaterialEstimate(
            material="Floor Tiles",
            description=f"Vitrified / ceramic tiles — {quality} quality",
            quantity=tile_qty, unit="sq ft",
            rate_per_unit=tile_rate, total_cost=tile_cost
        ))
        total_material_cost += tile_cost

    # 8. Paint (optional)
    if input_data.include_paint:
        wall_area = built_up_area * 3.5  # approx wall area
        paint_qty = round(wall_area * CONSTANTS["paint_liters_per_sqft"])
        paint_rate = MATERIAL_RATES["paint_liter"][quality]
        paint_cost = paint_qty * paint_rate
        materials.append(MaterialEstimate(
            material="Paint",
            description=f"Interior & exterior — {quality} quality",
            quantity=paint_qty, unit="liters",
            rate_per_unit=paint_rate, total_cost=paint_cost
        ))
        total_material_cost += paint_cost

    # 9. Electrical (optional)
    if input_data.include_electrical:
        elec_points = num_rooms * CONSTANTS["electrical_points_per_room"]
        elec_rate = MATERIAL_RATES["electrical_point"][quality]
        elec_cost = elec_points * elec_rate
        materials.append(MaterialEstimate(
            material="Electrical Points",
            description="Switches, sockets, wiring, MCBs",
            quantity=elec_points, unit="points",
            rate_per_unit=elec_rate, total_cost=elec_cost
        ))
        total_material_cost += elec_cost

    # 10. Plumbing (optional)
    if input_data.include_plumbing:
        plumb_points = input_data.num_bathrooms * CONSTANTS["plumbing_points_per_bathroom"]
        plumb_rate = MATERIAL_RATES["plumbing_point"][quality]
        plumb_cost = plumb_points * plumb_rate
        materials.append(MaterialEstimate(
            material="Plumbing Points",
            description="Pipes, fittings, fixtures, drainage",
            quantity=plumb_points, unit="points",
            rate_per_unit=plumb_rate, total_cost=plumb_cost
        ))
        total_material_cost += plumb_cost

    # 11. Wood / Doors / Windows
    wood_qty = round(built_up_area * CONSTANTS["wood_cft_per_sqft"] * multiplier)
    wood_rate = MATERIAL_RATES["wood_cft"][quality]
    wood_cost = wood_qty * wood_rate
    materials.append(MaterialEstimate(
        material="Wood (Doors, Windows, Frames)",
        description=f"Teak / sal wood — {quality} quality",
        quantity=wood_qty, unit="cft",
        rate_per_unit=wood_rate, total_cost=wood_cost
    ))
    total_material_cost += wood_cost

    # Labor cost
    labor_rate = LABOR_RATES_PER_SQFT[quality]
    labor_cost = round(built_up_area * labor_rate)

    # Total
    total_cost = round(total_material_cost + labor_cost)
    cost_per_sqft = round(total_cost / built_up_area) if built_up_area > 0 else 0

    # Timeline estimate
    if built_up_area <= 1000:
        timeline = 6
    elif built_up_area <= 2000:
        timeline = 9
    elif built_up_area <= 5000:
        timeline = 12
    else:
        timeline = 18
    timeline += (input_data.floors - 1) * 2

    # Recommendations
    recommendations = _generate_recommendations(input_data, built_up_area, total_cost, quality)

    return EstimationResult(
        plot_area_sqft=round(plot_area, 2),
        built_up_area_sqft=round(built_up_area, 2),
        carpet_area_sqft=round(carpet_area, 2),
        floors=input_data.floors,
        structure_type=input_data.structure_type,
        quality=quality,
        materials=materials,
        material_cost=round(total_material_cost),
        labor_cost=labor_cost,
        total_estimated_cost=total_cost,
        cost_per_sqft=cost_per_sqft,
        timeline_months=timeline,
        recommendations=recommendations,
    )


def _generate_recommendations(
    input_data: EstimationInput,
    built_up_area: float,
    total_cost: float,
    quality: str,
) -> List[str]:
    """Generate smart recommendations based on the estimation."""
    recs = []

    if quality == "economy":
        recs.append("💡 Consider upgrading to standard quality for better durability — costs only 15-20% more.")
    if input_data.floors >= 3:
        recs.append("🏗️ For 3+ floors, consider using RCC frame structure with higher steel grade (Fe 500D).")
    if built_up_area > 2000:
        recs.append("📦 Bulk ordering through Nirmaan can save 5-12% on material costs.")
    if input_data.structure_type == "residential_individual":
        recs.append("🧱 Fly ash bricks are 15% cheaper than red bricks and better for environment.")
    if total_cost > 2000000:
        recs.append("💰 Apply for Nirmaan Credit — get up to ₹5 lakh construction finance at 0% for 30 days.")
    recs.append("🚚 Schedule deliveries in advance to avoid price hikes and ensure availability.")
    recs.append("📊 Compare prices from multiple suppliers on Nirmaan to get the best deals.")

    return recs


def process_chat_message(message: str, context: Optional[Dict] = None) -> ChatResponse:
    """Process a chatbot message and return an intelligent response."""

    msg = message.lower().strip()

    # Try to extract estimation parameters from natural language
    if any(kw in msg for kw in ["estimate", "cost", "build", "construct", "house", "material", "how much", "kitna", "budget"]):
        return _handle_estimation_query(msg, context)
    elif any(kw in msg for kw in ["cement", "sand", "brick", "steel", "gravel", "tile"]):
        return _handle_material_query(msg)
    elif any(kw in msg for kw in ["price", "rate", "cost of", "kitna hai", "daam"]):
        return _handle_price_query(msg)
    elif any(kw in msg for kw in ["hello", "hi", "hey", "start", "help", "namaste"]):
        return _handle_greeting()
    elif any(kw in msg for kw in ["delivery", "deliver", "shipping", "transport"]):
        return _handle_delivery_query(msg)
    elif any(kw in msg for kw in ["credit", "loan", "finance", "emi"]):
        return _handle_credit_query()
    else:
        return _handle_general_query(msg)


def _handle_greeting() -> ChatResponse:
    return ChatResponse(
        reply=(
            "🙏 Namaste! I'm Nirmaan AI — your construction assistant.\n\n"
            "I can help you with:\n"
            "• **Material Estimation** — Tell me your plot size and I'll calculate materials needed\n"
            "• **Cost Estimation** — Get approximate construction cost\n"
            "• **Material Prices** — Check current rates for cement, sand, steel, etc.\n"
            "• **Quantity Calculation** — How much of each material you need\n\n"
            "Try saying: *'Estimate materials for a 30x40 house with 2 floors'*"
        ),
        suggestions=[
            "Estimate for 30x40 plot, 2 floors",
            "What's the current cement price?",
            "How many bricks for 1000 sqft?",
            "Cost to build a 1500 sqft house",
        ],
    )


def _handle_estimation_query(msg: str, context: Optional[Dict] = None) -> ChatResponse:
    """Parse natural language for estimation params and compute."""
    import re

    # Try to extract dimensions
    dims = re.findall(r'(\d+)\s*[xX×]\s*(\d+)', msg)
    sqft_match = re.findall(r'(\d+)\s*(?:sq\s*ft|sqft|sft|square\s*f)', msg)
    floor_match = re.findall(r'(\d+)\s*(?:floor|story|storey|manzil)', msg)

    length, width, floors = 30.0, 40.0, 1  # defaults

    if dims:
        length, width = float(dims[0][0]), float(dims[0][1])
    elif sqft_match:
        area = float(sqft_match[0])
        import math
        length = math.sqrt(area)
        width = length

    if floor_match:
        floors = min(int(floor_match[0]), 20)

    # Detect quality
    quality = "standard"
    if any(w in msg for w in ["economy", "cheap", "budget", "sasta"]):
        quality = "economy"
    elif any(w in msg for w in ["premium", "luxury", "best", "high"]):
        quality = "premium"

    # Detect structure
    structure = "residential_individual"
    if any(w in msg for w in ["commercial", "office", "shop"]):
        structure = "commercial_office"
    elif any(w in msg for w in ["apartment", "flat"]):
        structure = "residential_apartment"
    elif any(w in msg for w in ["warehouse", "godown"]):
        structure = "warehouse"

    input_data = EstimationInput(
        length_ft=length,
        width_ft=width,
        floors=floors,
        structure_type=structure,
        quality=quality,
        num_bathrooms=max(1, floors),
    )

    result = estimate_materials(input_data)

    # Format response
    reply = f"## 🏠 Construction Estimate\n\n"
    reply += f"**Plot:** {length} × {width} ft ({result.plot_area_sqft} sq ft)\n"
    reply += f"**Built-up Area:** {result.built_up_area_sqft} sq ft ({floors} floor{'s' if floors > 1 else ''})\n"
    reply += f"**Quality:** {quality.capitalize()}\n\n"
    reply += f"### 📦 Materials Required\n\n"
    reply += "| Material | Quantity | Rate | Cost |\n"
    reply += "|----------|----------|------|------|\n"

    for m in result.materials:
        reply += f"| {m.material} | {m.quantity:,.0f} {m.unit} | ₹{m.rate_per_unit:,.0f}/{m.unit} | ₹{m.total_cost:,.0f} |\n"

    reply += f"\n### 💰 Cost Summary\n\n"
    reply += f"- **Material Cost:** ₹{result.material_cost:,.0f}\n"
    reply += f"- **Labor Cost:** ₹{result.labor_cost:,.0f}\n"
    reply += f"- **Total Estimated Cost:** ₹{result.total_estimated_cost:,.0f}\n"
    reply += f"- **Cost per Sq Ft:** ₹{result.cost_per_sqft:,.0f}/sqft\n"
    reply += f"- **Timeline:** ~{result.timeline_months} months\n\n"

    if result.recommendations:
        reply += "### 💡 Recommendations\n\n"
        for r in result.recommendations:
            reply += f"- {r}\n"

    return ChatResponse(
        reply=reply,
        estimation=result,
        suggestions=[
            f"Same estimate in {('premium' if quality != 'premium' else 'economy')} quality",
            "Break down cement requirement",
            "Show price trends for steel",
            "Order these materials now",
        ],
    )


def _handle_material_query(msg: str) -> ChatResponse:
    """Answer questions about specific materials."""
    material_info = {
        "cement": ("Cement (OPC 53 / PPC)", "bag (50kg)", MATERIAL_RATES["cement_bag_50kg"],
                   "Used for concrete, plastering, and masonry. OPC 53 grade is strongest. Need ~0.4 bags per sqft of construction."),
        "sand": ("River Sand", "cubic ft", MATERIAL_RATES["sand_cubic_ft"],
                 "Fine aggregate for concrete and plastering. M-sand is a good alternative. Need ~1.25 cft per sqft."),
        "brick": ("Bricks", "piece", MATERIAL_RATES["bricks_piece"],
                  "Red bricks or fly ash bricks for walls. Standard size: 9×4.5×3 inches. Need ~8 bricks per sqft."),
        "steel": ("Steel TMT Bars (Fe 500D)", "kg", MATERIAL_RATES["steel_kg"],
                  "TMT bars for reinforcement. Fe 500D is standard for residential. Need ~4 kg per sqft for residential."),
        "gravel": ("Gravel / Coarse Aggregate", "cubic ft", MATERIAL_RATES["gravel_cubic_ft"],
                   "20mm crushed stone aggregate for concrete. Need ~0.75 cft per sqft."),
        "tile": ("Floor Tiles", "sq ft", MATERIAL_RATES["tiles_sqft"],
                 "Vitrified or ceramic floor tiles. Add 10-15% extra for wastage."),
    }

    for key, (name, unit, rates, desc) in material_info.items():
        if key in msg:
            reply = f"## {name}\n\n"
            reply += f"{desc}\n\n"
            reply += f"### Current Market Rates\n\n"
            reply += f"| Quality | Rate per {unit} |\n"
            reply += f"|---------|----------------|\n"
            reply += f"| Economy | ₹{rates['economy']} |\n"
            reply += f"| Standard | ₹{rates['standard']} |\n"
            reply += f"| Premium | ₹{rates['premium']} |\n"
            return ChatResponse(
                reply=reply,
                suggestions=[
                    f"How much {key} for 1000 sqft house?",
                    "Compare prices from suppliers",
                    "Estimate full house materials",
                ],
            )

    return ChatResponse(
        reply="I can provide info on: Cement, Sand, Bricks, Steel, Gravel, Tiles. Which material are you interested in?",
        suggestions=["Cement rates", "Sand rates", "Steel rates", "Brick rates"],
    )


def _handle_price_query(msg: str) -> ChatResponse:
    reply = "## 📊 Current Material Rates (Telangana)\n\n"
    reply += "| Material | Economy | Standard | Premium |\n"
    reply += "|----------|---------|----------|----------|\n"
    reply += f"| Cement (50kg bag) | ₹{MATERIAL_RATES['cement_bag_50kg']['economy']} | ₹{MATERIAL_RATES['cement_bag_50kg']['standard']} | ₹{MATERIAL_RATES['cement_bag_50kg']['premium']} |\n"
    reply += f"| Sand (cft) | ₹{MATERIAL_RATES['sand_cubic_ft']['economy']} | ₹{MATERIAL_RATES['sand_cubic_ft']['standard']} | ₹{MATERIAL_RATES['sand_cubic_ft']['premium']} |\n"
    reply += f"| Bricks (piece) | ₹{MATERIAL_RATES['bricks_piece']['economy']} | ₹{MATERIAL_RATES['bricks_piece']['standard']} | ₹{MATERIAL_RATES['bricks_piece']['premium']} |\n"
    reply += f"| Steel (kg) | ₹{MATERIAL_RATES['steel_kg']['economy']} | ₹{MATERIAL_RATES['steel_kg']['standard']} | ₹{MATERIAL_RATES['steel_kg']['premium']} |\n"
    reply += f"| Gravel (cft) | ₹{MATERIAL_RATES['gravel_cubic_ft']['economy']} | ₹{MATERIAL_RATES['gravel_cubic_ft']['standard']} | ₹{MATERIAL_RATES['gravel_cubic_ft']['premium']} |\n"

    reply += "\n*Prices updated weekly. Bulk orders may qualify for discounts.*"
    return ChatResponse(
        reply=reply,
        suggestions=["Estimate for my house", "Will prices go up?", "Order materials now"],
    )


def _handle_delivery_query(msg: str) -> ChatResponse:
    return ChatResponse(
        reply=(
            "## 🚚 Delivery Information\n\n"
            "Nirmaan provides reliable delivery across Telangana:\n\n"
            "| Delivery Type | Timeline | Fee |\n"
            "|--------------|----------|-----|\n"
            "| Standard | 24-48 hours | ₹300-₹800 |\n"
            "| Express | 6-12 hours | ₹500-₹1500 |\n"
            "| Urgent | 2-4 hours | ₹1000-₹2500 |\n"
            "| Scheduled | Your chosen date | ₹300-₹600 |\n\n"
            "- **Live GPS tracking** for all deliveries\n"
            "- **Weight verification** at pickup and delivery\n"
            "- **Multi-material combined delivery** to save costs\n"
            "- **Fleet:** Mini trucks, lorries, tractors, sand loaders"
        ),
        suggestions=["Track my order", "Schedule a delivery", "Delivery to my area?"],
    )


def _handle_credit_query() -> ChatResponse:
    return ChatResponse(
        reply=(
            "## 💳 Nirmaan Credit\n\n"
            "Construction finance made easy:\n\n"
            "- **Credit Limit:** Up to ₹5,00,000\n"
            "- **0% Interest** for first 30 days\n"
            "- **Flexible Repayment** — 30/60/90 day terms\n"
            "- **Instant Approval** for verified contractors\n"
            "- **Digital Invoices** for all transactions\n\n"
            "**Eligibility:**\n"
            "- Registered contractor/builder\n"
            "- Minimum 3 orders on Nirmaan\n"
            "- Valid ID and business proof\n\n"
            "Apply now in the Nirmaan app!"
        ),
        suggestions=["Check my credit limit", "Apply for credit", "Repayment schedule"],
    )


def _handle_general_query(msg: str) -> ChatResponse:
    return ChatResponse(
        reply=(
            "I'm not sure I understood that. Here's what I can help with:\n\n"
            "🏠 **Material Estimation** — Tell me your plot size\n"
            "💰 **Cost Estimation** — Get construction budget\n"
            "📊 **Price Check** — Current material rates\n"
            "🚚 **Delivery Info** — Delivery times and tracking\n"
            "💳 **Credit** — Construction finance options\n\n"
            "Try: *'Estimate materials for a 30x40 plot with 2 floors'*"
        ),
        suggestions=[
            "Estimate for 30x40 plot",
            "Current cement price",
            "How to place an order",
            "Help",
        ],
    )
