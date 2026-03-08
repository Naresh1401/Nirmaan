"""
Nirmaan AI — The intelligent assistant for the Nirmaan construction platform.

Combines platform knowledge (materials, pricing, orders, suppliers, features)
with construction guidance for a unified premium chatbot experience.

Available to all paid membership tiers (Silver, Gold, Platinum, Enterprise).
"""

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

router = APIRouter(prefix="/api/v1/nirmaan-ai", tags=["Nirmaan AI"])

# ═══════════════════════════════════════════════════════════════════════════════
# NIRMAAN AI — SYSTEM IDENTITY & PERSONALITY
# ═══════════════════════════════════════════════════════════════════════════════

NIRMAAN_AI_IDENTITY = """
Nirmaan AI is the intelligent construction assistant for the Nirmaan platform.
Core traits: knowledgeable, helpful, precise, and grounded in Indian construction
standards and market realities. Speaks in a professional yet approachable tone.
Always provides actionable, specific information — never vague generalities.
References IS/IRC codes for engineering topics and Nirmaan platform features
for marketplace queries. Encourages users to verify critical designs with
licensed engineers and purchase materials through Nirmaan for the best prices.
"""

# ═══════════════════════════════════════════════════════════════════════════════
# MATERIAL & PRICE DATABASE  (Telangana / AP market, 2025-26)
# ═══════════════════════════════════════════════════════════════════════════════

MATERIAL_CATALOGUE = {
    "cement": {
        "description": "Ordinary Portland Cement (OPC) and Portland Pozzolana Cement (PPC)",
        "grades": ["OPC 33", "OPC 43", "OPC 53", "PPC (Fly Ash)", "PSC (Slag)"],
        "rate_range": "₹350–430 per 50 kg bag",
        "popular_brands": "UltraTech, ACC, Dalmia, Ramco, Prism",
        "usage": "RCC work, plastering, masonry, flooring",
        "is_code": "IS 8112 (OPC 43), IS 12269 (OPC 53), IS 1489 (PPC)",
        "buy_link": "/products?category=cement",
    },
    "steel": {
        "description": "TMT (Thermo-Mechanically Treated) reinforcement bars",
        "grades": ["Fe415", "Fe500", "Fe500D", "Fe550D", "CRS (Corrosion Resistant)"],
        "rate_range": "₹56,000–68,000 per MT (₹56–68 per kg)",
        "popular_brands": "TATA Tiscon, JSW Neosteel, SAIL, Vizag Steel, Shyam",
        "usage": "RCC frames, slabs, beams, columns, footings",
        "is_code": "IS 1786:2008",
        "buy_link": "/products?category=steel",
    },
    "sand": {
        "description": "River sand and Manufactured sand (M-Sand)",
        "grades": ["River sand (Zone II/III)", "M-Sand (IS 383)", "P-Sand (plastering)"],
        "rate_range": "River: ₹2,500–3,500/ton | M-Sand: ₹1,200–1,800/ton",
        "popular_brands": "Robo Sand, local quarries",
        "usage": "Concrete mix, plastering, brickwork mortar",
        "is_code": "IS 383:2016",
        "buy_link": "/products?category=sand",
    },
    "bricks": {
        "description": "Red clay bricks and AAC/Fly Ash blocks",
        "grades": ["1st Class Red Bricks", "AAC Blocks", "Fly Ash Bricks", "Hollow Concrete Blocks"],
        "rate_range": "Red bricks: ₹8–12 each | AAC blocks: ₹45–60 each | Fly ash: ₹6–8 each",
        "popular_brands": "Siporex, Aerocon (AAC), local kilns (red bricks)",
        "usage": "Masonry walls, partition walls, boundary walls",
        "is_code": "IS 1077 (red bricks), IS 2185 (concrete blocks)",
        "buy_link": "/products?category=bricks",
    },
    "aggregate": {
        "description": "Coarse aggregate (crushed stone / jelly) for concrete",
        "grades": ["6mm", "10mm", "20mm", "40mm (Plain concrete)"],
        "rate_range": "₹1,200–1,700 per ton",
        "popular_brands": "Local quarries (Karimnagar, Hyderabad region)",
        "usage": "Concrete mix design, road base, drainage fill",
        "is_code": "IS 383:2016, IS 2386",
        "buy_link": "/products?category=aggregate",
    },
    "tiles": {
        "description": "Ceramic, vitrified and granite floor/wall tiles",
        "grades": ["Ceramic floor (300×300 to 600×600)", "Vitrified (600×600 to 800×800)", "Granite slabs"],
        "rate_range": "Ceramic: ₹25–60/sqft | Vitrified: ₹50–150/sqft | Granite: ₹80–250/sqft",
        "popular_brands": "Kajaria, Somany, Orient, RAK, Johnson",
        "usage": "Flooring, wall cladding, bathroom tiles",
        "is_code": "IS 13630",
        "buy_link": "/products?category=tiles",
    },
    "paint": {
        "description": "Interior emulsion, exterior emulsion, and primer",
        "grades": ["Primer", "Interior emulsion", "Exterior emulsion", "Distemper", "Enamel"],
        "rate_range": "₹180–600 per litre depending on grade",
        "popular_brands": "Asian Paints, Berger, Nerolac, Dulux",
        "usage": "Wall finishing, exterior protection, woodwork",
        "is_code": "IS 5410 (cement paint), IS 15489 (emulsion)",
        "buy_link": "/products?category=paint",
    },
    "pipes": {
        "description": "PVC, CPVC, uPVC and CI pipes for plumbing and drainage",
        "grades": ["PVC (drainage)", "CPVC (hot/cold water)", "uPVC (pressure)", "CI (sewerage)"],
        "rate_range": "PVC: ₹80–350/metre | CPVC: ₹120–500/metre",
        "popular_brands": "Finolex, Supreme, Astral, Prince, Wavin",
        "usage": "Water supply, drainage, sewerage, rain water harvesting",
        "is_code": "IS 4985 (uPVC), IS 15778 (CPVC)",
        "buy_link": "/products?category=pipes",
    },
}

# ═══════════════════════════════════════════════════════════════════════════════
# NIRMAAN PLATFORM KNOWLEDGE BASE
# ═══════════════════════════════════════════════════════════════════════════════

PLATFORM_KB = {
    "ordering": (
        "## 🛒 How to Order on Nirmaan\n\n"
        "**Step-by-step ordering:**\n"
        "1. **Browse** materials at [/products](/products) or search by name\n"
        "2. **Compare** prices from multiple verified suppliers in your area\n"
        "3. **Add to cart** and select preferred delivery date\n"
        "4. **Pay** via UPI, Net Banking, Card, or Nirmaan Credit\n"
        "5. **Track** your order live with GPS tracking once dispatched\n\n"
        "**Minimum order values:** ₹500 for local delivery, ₹2,000 for outstation\n"
        "**Free delivery** on orders above ₹10,000\n"
        "**Delivery areas:** Peddapalli, Karimnagar, Ramagundam and surrounding districts\n\n"
        "💡 **Tip:** Place orders before 2 PM for same-day delivery (subject to stock)\n\n"
        "📦 Need to order in bulk? Nirmaan Premium members get **volume discounts** and "
        "**dedicated procurement support**."
    ),
    "delivery": (
        "## 🚚 Delivery & Logistics\n\n"
        "**How delivery works:**\n"
        "- Orders placed before **2:00 PM** — eligible for same-day delivery\n"
        "- **GPS tracking** — live location of your delivery vehicle\n"
        "- **Weight verification** at pickup point\n"
        "- **Digital proof of delivery** — photo + e-signature\n"
        "- Combine multiple materials in one delivery to **save transport cost**\n\n"
        "**Delivery charges:**\n"
        "| Order Value | Delivery Fee |\n"
        "|-------------|--------------|\n"
        "| Under ₹2,000 | ₹250 |\n"
        "| ₹2,000–₹10,000 | ₹150 |\n"
        "| Above ₹10,000 | **FREE** |\n\n"
        "**Service areas:** Peddapalli · Karimnagar · Ramagundam · Mancherial · Jagtial\n\n"
        "📞 Delivery issues? Contact support via [/help](/help)"
    ),
    "credit": (
        "## 💳 Nirmaan Credit — Construction Finance Made Easy\n\n"
        "**Credit Limit:** Up to ₹5,00,000\n"
        "**Interest:** 0% for first 30 days\n"
        "**Repayment terms:** 30 / 60 / 90 days\n"
        "**Approval:** Instant for verified contractors\n\n"
        "**Eligibility:**\n"
        "- Registered contractor or builder\n"
        "- Minimum 3 completed orders on Nirmaan\n"
        "- Valid business registration + ID\n\n"
        "**How to apply:** Go to [/credit](/credit) → Apply Now\n\n"
        "**Loyalty points:** Every ₹100 spent = 10 loyalty points. 100 points = ₹1 cashback.\n"
        "Premium members earn **2x–7x** loyalty multipliers.\n\n"
        "📋 *Credit subject to eligibility verification.*"
    ),
    "suppliers": (
        "## 🏭 Supplier Network on Nirmaan\n\n"
        "Nirmaan connects you with **verified, rated suppliers** in Telangana.\n\n"
        "**How suppliers are verified:**\n"
        "- GSTIN verification\n"
        "- Physical site inspection\n"
        "- Quality testing of samples\n"
        "- Rating system based on delivery & quality (1–5 stars)\n\n"
        "**Find suppliers by:**\n"
        "- Material category (cement, steel, sand, etc.)\n"
        "- Location (nearest to your site)\n"
        "- Rating (highest rated first)\n"
        "- Price (lowest cost option)\n\n"
        "Browse all suppliers at [/suppliers](/suppliers)\n\n"
        "💡 Want to **become a supplier?** Register at [/supplier](/supplier)"
    ),
    "premium": (
        "## 👑 Nirmaan Premium — Unlock the Full Power\n\n"
        "**Tiers available:**\n\n"
        "| Tier | Price | Best For |\n"
        "|------|-------|----------|\n"
        "| **Silver** | ₹999/mo | Individual contractors |\n"
        "| **Gold** | ₹2,499/mo | Construction firms |\n"
        "| **Platinum** | ₹4,999/mo | Infrastructure companies |\n"
        "| **Enterprise** | ₹14,999/mo | Governments & mega projects |\n\n"
        "**Key benefits (Silver+):**\n"
        "- ✅ Nirmaan AI chatbot (unlimited questions)\n"
        "- ✅ SETU Civil Engineering Consultant\n"
        "- ✅ Bulk procurement & volume discounts\n"
        "- ✅ Nirmaan Credit Line up to ₹5 lakhs\n"
        "- ✅ Priority customer support\n"
        "- ✅ Loyalty points multiplier (2x–7x)\n\n"
        "Upgrade now at [/premium](/premium)"
    ),
    "account": (
        "## 👤 Manage Your Nirmaan Account\n\n"
        "**Key account sections:**\n"
        "- **Orders** — Track active and past orders: [/orders](/orders)\n"
        "- **Profile** — Update contact info and preferences: [/profile](/profile)\n"
        "- **Credit** — Check credit limit and repayments: [/credit](/credit)\n"
        "- **Rewards** — View loyalty points balance\n"
        "- **Premium** — Upgrade or manage subscription: [/premium](/premium)\n\n"
        "**Need help?** Visit [/help](/help) or contact our support team."
    ),
}

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION COST DATA (Telangana, 2025-26)
# ═══════════════════════════════════════════════════════════════════════════════

CONSTRUCTION_COSTS = {
    "residential": {
        "economy": {"range": "₹1,300–1,600", "desc": "Basic finishes, standard materials"},
        "standard": {"range": "₹1,800–2,200", "desc": "Good finishes, branded materials"},
        "premium": {"range": "₹2,500–3,500", "desc": "Premium finishes, top brands"},
        "luxury": {"range": "₹4,000–6,000+", "desc": "Luxury finishes, imported materials"},
    },
    "commercial": {
        "standard": {"range": "₹2,000–2,800", "desc": "Standard commercial build"},
        "premium": {"range": "₹3,000–4,500", "desc": "Premium commercial space"},
    },
    "industrial": {
        "standard": {"range": "₹1,200–1,800", "desc": "Factory/warehouse construction"},
    },
}

MATERIAL_QUANTITIES_PER_100SQFT = {
    "standard": {
        "cement_bags": 40,
        "steel_kg": 400,
        "river_sand_cft": 125,
        "aggregate_20mm_cft": 75,
        "bricks": 800,
        "labour_cost": 50_000,
    }
}


# ═══════════════════════════════════════════════════════════════════════════════
# QUERY RESPONSE ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

def _build_response(question: str, tier: str) -> tuple[str, list[str]]:
    """
    Build a Nirmaan AI response.
    Returns (answer_text, suggestions_list).
    """
    q = question.lower().strip()

    # ── Helper: extract numbers ──
    def _num(pattern: str) -> Optional[float]:
        m = re.search(pattern, q)
        return float(m.group(1).replace(",", "")) if m else None

    sqft = _num(r"(\d[\d,]*)\s*(?:sq\.?\s*ft|sqft|sft|square\s*feet?)")
    floors = _num(r"(\d+)\s*(?:floor|storey|story|bhk)")
    length_ft = _num(r"(\d+)\s*[×x]\s*\d+")
    width_ft = _num(r"\d+\s*[×x]\s*(\d+)")
    budget_lakh = _num(r"(\d+(?:\.\d+)?)\s*lakh")

    # ══════════════════════════════════════════════════
    # 1. GREETING / WHO ARE YOU
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["hello", "hi", "namaste", "who are you", "what can you do",
                             "help me", "capabilities", "features", "introduce"]):
        answer = (
            "## 🙏 Namaste! I'm **Nirmaan AI** — your construction companion.\n\n"
            "I'm here to make your construction journey easier, smarter, and more cost-effective.\n\n"
            "**Here's what I can help you with:**\n\n"
            "🏗️ **Material Guidance** — Cement, steel, sand, bricks, tiles and more. "
            "Right grades, right quantities, right prices.\n\n"
            "💰 **Cost Estimation** — Approximate construction costs for houses, "
            "commercial buildings, roads and infrastructure.\n\n"
            "🛒 **Platform Help** — Ordering, delivery, tracking, Nirmaan Credit, "
            "suppliers and account management.\n\n"
            "📐 **Engineering Queries** — Structural guidance per IS codes, "
            "foundation types, seismic zones, mix designs.\n\n"
            "🏆 **Premium Features** — AI Civil Consultant (SETU), bulk procurement, "
            "digital twin, drone monitoring and more.\n\n"
            "Ask me anything — I'm ready to assist!"
        )
        suggestions = [
            "What materials do I need for a 1500 sqft house?",
            "Current cement prices",
            "How to place an order on Nirmaan",
            "Design a beam for 5m span",
        ]
        return answer, suggestions

    # ══════════════════════════════════════════════════
    # 2. MATERIAL INFORMATION QUERIES
    # ══════════════════════════════════════════════════
    for mat_key, mat_data in MATERIAL_CATALOGUE.items():
        if mat_key in q or (mat_key == "aggregate" and any(k in q for k in ["jelly", "stone chips", "crushed stone", "gravel", "coarse aggregate"])):
            answer = (
                f"## 🏗️ {mat_key.title()} — Nirmaan Guide\n\n"
                f"**What it is:** {mat_data['description']}\n\n"
                f"**Available grades/types:**\n"
            )
            for g in mat_data["grades"]:
                answer += f"- {g}\n"
            answer += (
                f"\n**Current market rate:** {mat_data['rate_range']}\n\n"
                f"**Popular brands:** {mat_data['popular_brands']}\n\n"
                f"**Common uses:** {mat_data['usage']}\n\n"
                f"**Relevant IS code:** {mat_data['is_code']}\n\n"
                f"📦 [Order {mat_key.title()} on Nirmaan]({mat_data['buy_link']})\n\n"
                f"💡 **Tip:** Compare prices from multiple suppliers on Nirmaan "
                f"to get the best rate in your area."
            )
            suggestions = [
                f"How much {mat_key} do I need for 1000 sqft?",
                f"Which brand of {mat_key} is best?",
                "Compare material prices",
                "Place an order",
            ]
            return answer, suggestions

    # ══════════════════════════════════════════════════
    # 3. QUANTITY / ESTIMATION QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["how much", "quantity", "how many", "materials needed",
                             "materials for", "estimate", "what do i need"]):
        area = sqft
        if not area and length_ft and width_ft:
            area = length_ft * width_ft * (floors or 1)
        elif not area:
            area = 1000  # default

        qty = MATERIAL_QUANTITIES_PER_100SQFT["standard"]
        factor = area / 100

        cement_bags = round(qty["cement_bags"] * factor)
        steel_kg = round(qty["steel_kg"] * factor)
        sand_cft = round(qty["river_sand_cft"] * factor)
        agg_cft = round(qty["aggregate_20mm_cft"] * factor)
        bricks = round(qty["bricks"] * factor)

        cost_cement = cement_bags * 390
        cost_steel = steel_kg * 63
        cost_sand = sand_cft * 50
        cost_agg = agg_cft * 45
        cost_bricks = bricks * 9
        cost_labour = round(qty["labour_cost"] * factor)
        total_material = cost_cement + cost_steel + cost_sand + cost_agg + cost_bricks
        grand_total = total_material + cost_labour

        answer = (
            f"## 📦 Material Estimate for {area:,.0f} sq ft Construction\n\n"
            f"*(Standard quality, single-floor residential)*\n\n"
            f"| Material | Quantity | Approx. Cost |\n"
            f"|----------|----------|--------------|\n"
            f"| Cement (OPC 53) | {cement_bags} bags (50 kg) | ₹{cost_cement:,} |\n"
            f"| TMT Steel (Fe500D) | {steel_kg:,} kg | ₹{cost_steel:,} |\n"
            f"| River Sand | {sand_cft:,} cft | ₹{cost_sand:,} |\n"
            f"| 20mm Aggregate | {agg_cft:,} cft | ₹{cost_agg:,} |\n"
            f"| Bricks (1st class) | {bricks:,} nos. | ₹{cost_bricks:,} |\n"
            f"| **Labour (approx.)** | — | ₹{cost_labour:,} |\n"
            f"| **Total (indicative)** | — | **₹{grand_total:,}** |\n\n"
            f"*(Tiles, paint, electrical, plumbing, doors & windows are additional — "
            f"typically adds 30–40% to the above.)*\n\n"
            f"💡 **Rates used:** Cement ₹390/bag · Steel ₹63/kg · Sand ₹50/cft · "
            f"Aggregate ₹45/cft · Bricks ₹9 each\n\n"
            f"📋 *Estimates are approximate (±10–15%). For a detailed BOQ, use the "
            f"[AI Estimator](/estimator) or consult an engineer.*"
        )
        suggestions = [
            "Order these materials on Nirmaan",
            "Get a detailed breakdown",
            "Compare standard vs premium quality",
            "Engineering consultant (SETU)",
        ]
        return answer, suggestions

    # ══════════════════════════════════════════════════
    # 4. COST / BUDGET QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["cost", "budget", "price per sqft", "rate", "how much to build",
                             "construction cost", "total cost", "build a house", "house cost"]):
        area = sqft or 1500
        fl = int(floors or 1)
        total_area = area * fl

        std_low = total_area * 1800
        std_high = total_area * 2200
        prem_low = total_area * 2500
        prem_high = total_area * 3500

        answer = (
            f"## 💰 Construction Cost Estimate\n\n"
            f"**For {total_area:,.0f} sq ft ({fl}-floor{'s' if fl > 1 else ''}), "
            f"Telangana 2025-26:**\n\n"
            f"| Quality | Rate/sqft | Total Cost |\n"
            f"|---------|-----------|------------|\n"
            f"| Economy | ₹1,300–1,600 | ₹{total_area*1300:,.0f} – ₹{total_area*1600:,.0f} |\n"
            f"| **Standard** | **₹1,800–2,200** | **₹{std_low:,.0f} – ₹{std_high:,.0f}** |\n"
            f"| Premium | ₹2,500–3,500 | ₹{prem_low:,.0f} – ₹{prem_high:,.0f} |\n"
            f"| Luxury | ₹4,000–6,000+ | ₹{total_area*4000:,.0f}+ |\n\n"
            f"**Standard build breakdown (approx.):**\n"
            f"| Component | % of Total | Estimated Cost |\n"
            f"|-----------|------------|----------------|\n"
            f"| Foundation & Structure (RCC) | 35–40% | ₹{int(std_low*0.375):,} |\n"
            f"| Masonry & Plastering | 12–15% | ₹{int(std_low*0.135):,} |\n"
            f"| Flooring & Tiling | 8–10% | ₹{int(std_low*0.09):,} |\n"
            f"| Doors & Windows | 5–7% | ₹{int(std_low*0.06):,} |\n"
            f"| Electrical & Plumbing | 15–18% | ₹{int(std_low*0.165):,} |\n"
            f"| Painting & Finishing | 5–8% | ₹{int(std_low*0.065):,} |\n\n"
            f"💡 Use the [AI Estimator](/estimator) for a detailed material-wise breakdown.\n\n"
            f"📋 *Costs vary by location, contractor, and site conditions (±10–15%).*"
        )
        suggestions = [
            f"Materials needed for {int(area)} sqft",
            "Nirmaan Credit for construction finance",
            "Engineering consultation (SETU)",
            "Find verified contractors",
        ]
        return answer, suggestions

    # ══════════════════════════════════════════════════
    # 5. ORDERING PROCESS
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["order", "buy", "purchase", "how to order", "place order",
                             "booking", "procure", "get materials"]):
        return PLATFORM_KB["ordering"], [
            "Check current material prices",
            "Free delivery threshold",
            "Nirmaan Credit for bulk orders",
            "Track my order",
        ]

    # ══════════════════════════════════════════════════
    # 6. DELIVERY QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["delivery", "shipping", "deliver", "transport", "logistics",
                             "track", "tracking", "when will", "how long"]):
        return PLATFORM_KB["delivery"], [
            "Order materials now",
            "Delivery areas",
            "Free delivery conditions",
            "Contact support",
        ]

    # ══════════════════════════════════════════════════
    # 7. CREDIT / FINANCE QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["credit", "finance", "loan", "payment", "emi", "installment",
                             "pay later", "credit limit", "credit line", "interest"]):
        return PLATFORM_KB["credit"], [
            "Apply for Nirmaan Credit",
            "Check eligibility",
            "Repayment schedule",
            "Loyalty points",
        ]

    # ══════════════════════════════════════════════════
    # 8. SUPPLIER QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["supplier", "vendor", "seller", "dealer", "manufacturer",
                             "who sells", "where to buy", "nearest", "local"]):
        return PLATFORM_KB["suppliers"], [
            "Find cement suppliers near me",
            "Best-rated steel supplier",
            "Become a supplier",
            "Verify a supplier",
        ]

    # ══════════════════════════════════════════════════
    # 9. PREMIUM / MEMBERSHIP QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["premium", "membership", "upgrade", "plan", "subscription",
                             "gold", "silver", "platinum", "enterprise", "benefits",
                             "what do i get", "tier"]):
        return PLATFORM_KB["premium"], [
            "Compare Silver vs Gold plan",
            "SETU Engineering Consultant",
            "Bulk procurement benefits",
            "Upgrade to Premium",
        ]

    # ══════════════════════════════════════════════════
    # 10. ACCOUNT / PLATFORM QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["account", "profile", "login", "register", "password",
                             "loyalty", "points", "rewards", "help", "support",
                             "contact", "track order", "my orders"]):
        return PLATFORM_KB["account"], [
            "Track my orders",
            "Check credit balance",
            "View loyalty points",
            "Contact support",
        ]

    # ══════════════════════════════════════════════════
    # 11. ENGINEERING — FOUNDATION / SOIL
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["foundation", "footing", "soil", "bearing capacity",
                             "spt", "geotechnical"]):
        answer = (
            "## 🪨 Foundation Guide (IS 1904 + IS 6403)\n\n"
            "**Foundation type vs. soil condition:**\n\n"
            "| Soil Type | SPT N | Safe Bearing Capacity | Foundation Type |\n"
            "|-----------|-------|----------------------|-----------------|\n"
            "| Hard rock | >50 | 3,000–5,000+ kN/m² | Isolated/Raft |\n"
            "| Dense gravel | 30–50 | 200–500 kN/m² | Isolated footing |\n"
            "| Dense sand | 15–30 | 150–300 kN/m² | Strip/Isolated |\n"
            "| Stiff clay | 8–15 | 100–200 kN/m² | Combined footing |\n"
            "| Soft clay | 2–8 | 50–150 kN/m² | Raft / Piles |\n"
            "| Loose sand | <10 | 50–100 kN/m² | Raft / Piles |\n"
            "| Black cotton soil | 5–15 | 80–150 kN/m² | Under-reamed piles |\n\n"
            "**Key principle:** Always conduct a **soil investigation (boring/SPT)** "
            "before finalising foundations.\n\n"
            "**Minimum foundation depth:** 1.5 m below natural ground level (IS 1904).\n\n"
            "💡 *For detailed calculations, visit [SETU AI Consultant](/civitas).*\n\n"
            "📋 *Relevant codes: IS 1904, IS 6403, IS 2911 (piles)*"
        )
        return answer, [
            "Foundation for soft clay soil",
            "Pile foundation design",
            "Footing size calculation",
            "SETU Engineering Consultant",
        ]

    # ══════════════════════════════════════════════════
    # 12. ENGINEERING — BEAM / STRUCTURAL
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["beam", "column", "slab", "rcc", "structural", "reinforcement",
                             "rebar", "stirrup", "is 456", "concrete design"]):
        answer = (
            "## 📐 Structural Design — Quick Reference (IS 456:2000)\n\n"
            "**Preliminary sizing rules:**\n\n"
            "| Member | Span-to-depth ratio | Minimum width |\n"
            "|--------|--------------------|--------------|\n"
            "| Simply supported beam | L/12 | 230 mm |\n"
            "| Continuous beam | L/15 | 230 mm |\n"
            "| Cantilever beam | L/7 | 230 mm |\n"
            "| Two-way slab | L/32 (short span) | 100 mm |\n"
            "| One-way slab | L/26 | 100 mm |\n\n"
            "**Standard column sizes (residential):**\n"
            "- G+1 buildings: 230×230 mm or 300×300 mm\n"
            "- G+2 buildings: 300×400 mm or 400×400 mm\n"
            "- G+3 buildings: 400×450 mm or 450×450 mm\n\n"
            "**Minimum concrete grade:** M20 for RCC (M15 for PCC/levelling)\n"
            "**Steel grade:** Fe500D recommended for seismic zones\n\n"
            "💡 *For step-by-step structural calculations with IS code references, "
            "use the [SETU Engineering Consultant](/civitas).*"
        )
        return answer, [
            "Beam design for 6m span",
            "Column size for 3-floor building",
            "Slab design guide",
            "SETU for detailed calculation",
        ]

    # ══════════════════════════════════════════════════
    # 13. SEISMIC / EARTHQUAKE
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["seismic", "earthquake", "is 1893", "zone", "ductile",
                             "is 13920", "tremor"]):
        answer = (
            "## 🌍 Seismic Zones in India (IS 1893:2016)\n\n"
            "| Zone | Zone Factor (Z) | Risk Level | Major Cities |\n"
            "|------|----------------|------------|-------------|\n"
            "| II | 0.10 | Low | Hyderabad, Bangalore, Chennai |\n"
            "| III | 0.16 | Moderate | Mumbai, Kolkata, Ahmedabad |\n"
            "| IV | 0.24 | High | Delhi, Patna, Chandigarh |\n"
            "| V | 0.36 | Very High | Guwahati, Srinagar, NE India |\n\n"
            "**Telangana:** Most districts fall in **Seismic Zone II** (Low risk, Z = 0.10)\n\n"
            "**For Zone II construction:**\n"
            "- Use Fe500D steel (ductile grade)\n"
            "- Closed stirrups in beams and columns\n"
            "- Lap splices NOT in potential hinge zones\n"
            "- Follow IS 13920:2016 for ductile detailing\n\n"
            "💡 *For detailed base shear calculation and ductile detailing, "
            "use the [SETU Engineering Consultant](/civitas).*"
        )
        return answer, [
            "Seismic zone for Karimnagar",
            "Ductile detailing requirements",
            "Base shear calculation",
            "IS 1893 guidance",
        ]

    # ══════════════════════════════════════════════════
    # 14. ROAD / INFRASTRUCTURE
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["road", "pavement", "highway", "bitumen", "asphalt",
                             "tar", "irc", "infrastructure"]):
        answer = (
            "## 🛣️ Road Construction Quick Guide\n\n"
            "**Material requirements per km of 3.75m wide road:**\n\n"
            "| Road Type | Bitumen (MT) | Aggregate (MT) | WBM Stone (MT) | Approx Cost |\n"
            "|-----------|-------------|----------------|----------------|-------------|\n"
            "| Gravel | — | — | 300 | ₹8–12 lakh |\n"
            "| WBM | — | — | 450 | ₹15–25 lakh |\n"
            "| BT (Tar) | 8–12 | 150 | 300 | ₹35–55 lakh |\n"
            "| CC (Rigid) | — | 280 | 200 | ₹60–90 lakh |\n\n"
            "**Recommended layers (BT road):**\n"
            "1. Subgrade compaction (500mm)\n"
            "2. GSB — Granular Sub-base (200mm)\n"
            "3. WMM — Wet Mix Macadam (250mm)\n"
            "4. DBM — Dense Bituminous Macadam (50mm)\n"
            "5. BC — Bituminous Concrete (25mm)\n\n"
            "**Applicable standards:** IRC:37-2018 (Flexible), IRC:58-2015 (Rigid)\n\n"
            "💡 *For detailed pavement design, visit [SETU Engineering Consultant](/civitas).*"
        )
        return answer, [
            "Road materials on Nirmaan",
            "Compare road types",
            "Bridge construction guide",
            "SETU for pavement design",
        ]

    # ══════════════════════════════════════════════════
    # 15. SUSTAINABILITY / GREEN BUILDING
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["sustainable", "green", "eco", "carbon", "igbc", "leed",
                             "energy efficient", "environment", "solar"]):
        answer = (
            "## 🌱 Sustainable Construction Guide\n\n"
            "**Green material choices:**\n"
            "- **AAC Blocks** instead of red bricks — 30% lighter, better insulation\n"
            "- **PPC Cement** (Fly Ash based) — reduces CO₂ by 30% vs OPC\n"
            "- **M-Sand** instead of river sand — eco-friendly alternative\n"
            "- **Fe500D steel** — higher strength = less material needed\n"
            "- **Double-glazed windows** — reduces heat gain by 40%\n\n"
            "**Green building ratings in India:**\n"
            "- **IGBC Green Homes** (Indian Green Building Council)\n"
            "- **GRIHA** (Green Rating for Integrated Habitat Assessment)\n"
            "- **BEE Star Rating** (Bureau of Energy Efficiency)\n\n"
            "**Quick wins for carbon reduction:**\n"
            "1. Use PPC/PSC cement instead of OPC\n"
            "2. Add fly ash to concrete mix (up to 30%)\n"
            "3. Use recycled aggregate for non-structural elements\n"
            "4. Install rainwater harvesting system\n"
            "5. Solar panels — payback in 4–6 years at current rates\n\n"
            "📋 *Nirmaan Gold/Platinum members get Carbon Tracking reports.*"
        )
        return answer, [
            "AAC blocks vs red bricks",
            "PPC vs OPC cement",
            "Solar panel installation cost",
            "Carbon tracking feature",
        ]

    # ══════════════════════════════════════════════════
    # 16. COMPARISON QUERIES
    # ══════════════════════════════════════════════════
    if "compare" in q or "vs" in q or "difference between" in q or "which is better" in q:
        # AAC vs bricks
        if any(k in q for k in ["aac", "block", "brick", "fly ash"]):
            answer = (
                "## ⚖️ AAC Blocks vs Red Bricks vs Fly Ash Bricks\n\n"
                "| Feature | Red Bricks | AAC Blocks | Fly Ash Bricks |\n"
                "|---------|-----------|------------|----------------|\n"
                "| Weight (kg/m³) | 1,800 | 550–650 | 1,200 |\n"
                "| Compressive strength | 5 MPa | 3–4 MPa | 7.5 MPa |\n"
                "| Thermal insulation | Low | Excellent | Moderate |\n"
                "| Water absorption | 10–15% | 10% | 6–12% |\n"
                "| Cost per unit | ₹8–12 | ₹45–60 | ₹6–8 |\n"
                "| Wall cost/sqft | ₹80–120 | ₹90–130 | ₹60–100 |\n"
                "| Eco-friendly | Low | High | High |\n"
                "| IS code | IS 1077 | IS 2185 Part 3 | IS 12894 |\n\n"
                "**When to choose:**\n"
                "- **Red bricks**: Traditional look, standard residential construction\n"
                "- **AAC blocks**: High-rise buildings, hot climates, energy efficiency\n"
                "- **Fly ash bricks**: Cost-effective, eco-friendly option\n\n"
                "💡 *For seismic zones, AAC blocks need additional structural care.*"
            )
            return answer, [
                "Order AAC blocks on Nirmaan",
                "Order fly ash bricks",
                "Compare cement grades",
                "Calculate brick quantity",
            ]
        # Cement grades
        if "cement" in q or "opc" in q or "ppc" in q:
            answer = (
                "## ⚖️ OPC vs PPC vs PSC Cement\n\n"
                "| Property | OPC 43 | OPC 53 | PPC | PSC |\n"
                "|----------|--------|--------|-----|-----|\n"
                "| 28-day strength | 43 MPa | 53 MPa | 33 MPa | 33 MPa |\n"
                "| Setting time (initial) | 30 min | 30 min | 30 min | 30 min |\n"
                "| Heat of hydration | High | Very High | Low | Low |\n"
                "| Durability | Good | Good | Excellent | Excellent |\n"
                "| CO₂ emissions | High | High | 30% lower | 40% lower |\n"
                "| Cost | ₹360–400 | ₹370–420 | ₹340–390 | ₹330–380 |\n"
                "| Best for | General RCC | High-strength | Plastering, mass | Marine/sulphate |\n\n"
                "**Recommendation:**\n"
                "- RCC structures: OPC 53 or PPC\n"
                "- Plastering: OPC 43 or PPC\n"
                "- Mass concrete (dams, rafts): PPC/PSC (low heat)\n"
                "- Marine / sulphate exposure: PSC\n"
            )
            return answer, [
                "Order OPC 53 cement",
                "Order PPC cement",
                "Which cement for slabs?",
                "Calculate cement quantity",
            ]

    # ══════════════════════════════════════════════════
    # 17. CONSTRUCTION TIPS / HOW-TO
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["tip", "advice", "guide", "how to build", "best practice",
                             "recommend", "suggestion", "what should", "checklist"]):
        answer = (
            "## ✅ Smart Construction Checklist\n\n"
            "**Before you start:**\n"
            "- [ ] Get site plan approved by local municipality\n"
            "- [ ] Conduct soil investigation (boring/SPT test)\n"
            "- [ ] Hire a licensed structural engineer for design\n"
            "- [ ] Get material quantities from an engineer's BOQ\n"
            "- [ ] Compare at least 3 supplier quotes\n\n"
            "**Material buying tips:**\n"
            "- Order cement in **batches of 4–6 weeks** supply (avoid long storage)\n"
            "- Buy steel after checking **mill test certificates**\n"
            "- Prefer **M-Sand** over river sand — eco-friendly and consistent quality\n"
            "- Use **AAC blocks** for upper floors to reduce dead load\n"
            "- Order materials via **Nirmaan** to get verified quality + best prices\n\n"
            "**Cost-saving tips:**\n"
            "- Place large orders through **Nirmaan Credit** to improve cash flow\n"
            "- Buy in bulk for **5–15% discounts** (available with Premium plans)\n"
            "- Monitor daily market prices on Nirmaan — prices fluctuate weekly\n\n"
            "💡 **Did you know?** Premium members save ₹8,000–₹40,000 per lakh "
            "on materials through bulk pricing and loyalty rewards."
        )
        return answer, [
            "Check cement prices today",
            "Apply for Nirmaan Credit",
            "Upgrade to Premium",
            "Find verified contractors",
        ]

    # ══════════════════════════════════════════════════
    # 18. PRICE QUERIES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["price", "rate", "cost of", "today's price", "current price",
                             "market rate", "how much does", "what is the price"]):
        answer = (
            "## 📊 Current Material Prices (Telangana, 2025-26)\n\n"
            "| Material | Unit | Economy | Standard | Premium |\n"
            "|----------|------|---------|----------|---------|\n"
            "| Cement OPC 53 | 50 kg bag | ₹350 | ₹380–400 | ₹420 |\n"
            "| Cement PPC | 50 kg bag | ₹330 | ₹360–380 | ₹400 |\n"
            "| TMT Steel Fe500D | per kg | ₹56 | ₹62–65 | ₹68 |\n"
            "| River Sand | per cft | ₹40 | ₹50–55 | ₹65 |\n"
            "| M-Sand | per cft | ₹22 | ₹28–32 | ₹38 |\n"
            "| 20mm Aggregate | per cft | ₹35 | ₹42–48 | ₹55 |\n"
            "| Red Bricks (1st class) | per 1000 | ₹7,000 | ₹9,000–10,000 | ₹12,000 |\n"
            "| AAC Blocks | per block | ₹45 | ₹52–55 | ₹60 |\n"
            "| Fly Ash Bricks | per 1000 | ₹6,000 | ₹7,500 | ₹8,500 |\n"
            "| Ceramic Tiles | per sqft | ₹22 | ₹35–45 | ₹60 |\n"
            "| Vitrified Tiles | per sqft | ₹45 | ₹70–90 | ₹150 |\n\n"
            "⚠️ *Prices are indicative and vary by supplier & quantity. "
            "Check live prices at [/products](/products).*\n\n"
            "💡 Nirmaan Premium members get **5–20% volume discounts** on bulk orders."
        )
        return answer, [
            "Order cement at this price",
            "Check prices on Nirmaan",
            "Bulk order discounts",
            "Calculate material quantity",
        ]

    # ══════════════════════════════════════════════════
    # 19. IS CODE REFERENCES
    # ══════════════════════════════════════════════════
    if any(k in q for k in ["is code", "is 456", "irc", "bis", "bureau", "standard",
                             "indian standard", "code reference", "which code"]):
        answer = (
            "## 📋 Key IS/IRC Codes for Construction\n\n"
            "**Structural & Concrete:**\n"
            "- IS 456:2000 — Plain & Reinforced Concrete\n"
            "- IS 875 Parts 1–5 — Dead, Live, Wind, Snow & Special Loads\n"
            "- IS 1893:2016 — Earthquake Design (Parts 1–4)\n"
            "- IS 13920:2016 — Ductile Detailing of RCC\n"
            "- IS 800:2007 — Steel Structures (LSM)\n"
            "- IS 10262:2019 — Concrete Mix Design\n\n"
            "**Materials:**\n"
            "- IS 8112 — OPC 43 Grade Cement\n"
            "- IS 12269 — OPC 53 Grade Cement\n"
            "- IS 1786:2008 — TMT Steel Bars (Fe415/500/550D)\n"
            "- IS 383:2016 — Aggregates for Concrete\n"
            "- IS 1077 — Common Burnt Clay Bricks\n\n"
            "**Foundations:**\n"
            "- IS 1904:1986 — Foundation Design\n"
            "- IS 2911 Part 1 — Pile Foundation Design\n"
            "- IS 6403:1981 — Bearing Capacity of Shallow Foundations\n\n"
            "**Roads & Bridges:**\n"
            "- IRC:37-2018 — Flexible Pavement Design\n"
            "- IRC:58-2015 — Rigid Pavement Design\n"
            "- IRC:6-2017 — Road Bridge Loads\n\n"
            "**Building:**\n"
            "- NBC 2016 — National Building Code of India\n"
            "- IS 1172:1993 — Basic Water Supply Requirements\n\n"
            "💡 *For code-based calculations, use [SETU Engineering Consultant](/civitas).*"
        )
        return answer, [
            "IS 456 beam design",
            "IS 1893 seismic design",
            "Foundation design codes",
            "SETU for calculations",
        ]

    # ══════════════════════════════════════════════════
    # 20. DEFAULT — GENERAL HELP
    # ══════════════════════════════════════════════════
    answer = (
        "## 🏗️ Nirmaan AI — How Can I Help?\n\n"
        "I'm your construction platform assistant. Here's what I know:\n\n"
        "**Platform Help:**\n"
        "- 🛒 How to order materials, delivery info, tracking\n"
        "- 💳 Nirmaan Credit — construction finance\n"
        "- 🏭 Finding verified suppliers near you\n"
        "- 👑 Premium plans and features\n\n"
        "**Construction Guidance:**\n"
        "- 📦 Material quantities and cost estimation\n"
        "- 💰 Construction budgets (residential, commercial)\n"
        "- 🔧 Material comparisons (cement grades, brick types)\n"
        "- 📋 Current market prices for key materials\n\n"
        "**Engineering (Quick Reference):**\n"
        "- 🏗️ Structural sizing rules per IS 456\n"
        "- 🪨 Foundation types by soil condition\n"
        "- 🌍 Seismic zones across India\n\n"
        "💡 *For in-depth structural calculations, try [SETU AI Consultant](/civitas).*\n\n"
        "What would you like to know?"
    )
    suggestions = [
        "Cement prices today",
        "Materials for 1500 sqft house",
        "How to order on Nirmaan",
        "Foundation for soft clay",
    ]
    return answer, suggestions


# ═══════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000,
                         description="User's question or message")
    context: Optional[str] = Field(None, max_length=2000,
                                   description="Optional conversation context")


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]
    is_premium: bool
    tier: str
    queries_remaining: int


class CapabilitiesResponse(BaseModel):
    name: str
    description: str
    domains: List[str]
    system_identity: str


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/capabilities", response_model=CapabilitiesResponse)
async def get_capabilities():
    """Return Nirmaan AI capabilities."""
    return CapabilitiesResponse(
        name="Nirmaan AI",
        description="Intelligent construction assistant for the Nirmaan platform",
        domains=[
            "Materials marketplace (cement, steel, sand, bricks, tiles, pipes, paint)",
            "Order placement and delivery tracking",
            "Nirmaan Credit and construction finance",
            "Verified supplier network",
            "Material cost and quantity estimation",
            "Construction budget planning",
            "Structural design guidance (IS 456)",
            "Foundation and geotechnical guidance",
            "Seismic zone information (IS 1893)",
            "Road and infrastructure construction",
            "Sustainable and green building",
            "IS/IRC code references",
            "Premium membership features",
        ],
        system_identity=NIRMAAN_AI_IDENTITY.strip(),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Nirmaan AI — Premium chatbot for construction platform assistance."""
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # ── Fetch or create membership ──
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

    if is_admin:
        tier = MembershipTier.ENTERPRISE
        is_premium = True

    # ── Enforce premium access ──
    if not is_premium:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Nirmaan AI is available exclusively for Premium subscribers. "
                "Upgrade at /premium to unlock unlimited AI assistance, "
                "bulk procurement, and advanced engineering tools."
            ),
        )

    benefits = TIER_BENEFITS[tier]
    daily_limit = benefits["ai_queries_per_day"]

    # ── Reset counter if new day ──
    now = datetime.now(timezone.utc)
    reset_date = membership.ai_queries_reset_date
    if reset_date.tzinfo is None:
        reset_date = reset_date.replace(tzinfo=timezone.utc)
    if (now - reset_date).days >= 1:
        membership.ai_queries_today = 0
        membership.ai_queries_reset_date = now

    # ── Check daily quota (admins exempt) ──
    if not is_admin and daily_limit != -1 and membership.ai_queries_today >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Daily query limit reached ({daily_limit} queries/day on {tier.value} plan). "
                "Upgrade to a higher tier for more daily AI queries."
            ),
        )

    # ── Generate response ──
    reply, suggestions = _build_response(message, tier.value)

    # ── Tier header for premium response ──
    tier_labels = {
        "silver": "Professional",
        "gold": "Business",
        "platinum": "Premium",
        "enterprise": "Enterprise",
    }
    label = tier_labels.get(tier.value, tier.value.capitalize())
    reply = f"🤖 **Nirmaan AI** — *{label} Plan*\n\n" + reply

    # ── Increment usage counter ──
    membership.ai_queries_today += 1
    await db.commit()

    remaining = (daily_limit - membership.ai_queries_today) if daily_limit != -1 else -1

    return ChatResponse(
        reply=reply,
        suggestions=suggestions,
        is_premium=is_premium,
        tier=tier.value,
        queries_remaining=remaining,
    )
