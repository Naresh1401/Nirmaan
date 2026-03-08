"""Engagement Composer Agent — platform knowledge, greetings, and response polish."""


def handle_engagement(intent: str, params: dict) -> str:
    """Dispatch platform knowledge and engagement queries."""
    q = params.get("_question", "")

    # Greetings
    if any(w in q for w in ("hello", "hi", "hey", "namaste", "good morning",
                             "good evening", "good afternoon")):
        return _respond_greeting()

    # Platform knowledge
    if "about nirmaan" in q or "what is nirmaan" in q:
        return _respond_about_nirmaan()
    if "why nirmaan" in q or "why choose" in q:
        return _respond_why_nirmaan()
    if "how to use" in q or "how does nirmaan" in q or "how nirmaan" in q:
        return _respond_how_to_use()
    if "premium" in q or "subscription" in q or "plan" in q:
        return _respond_premium()
    if "workforce" in q or "labour" in q or "labor" in q or "worker" in q:
        return _respond_workforce()
    if "equipment" in q or "machinery" in q or "crane" in q:
        return _respond_equipment()
    if "delivery" in q or "transport" in q or "logistics" in q:
        return _respond_delivery()
    if "credit" in q or "loan" in q or "financ" in q:
        return _respond_credit()
    if "digital twin" in q or "3d model" in q:
        return _respond_digital_twin()
    if "design studio" in q:
        return _respond_design_studio()
    if "supplier" in q or "vendor" in q or "register" in q:
        return _respond_supplier()
    if "thank" in q:
        return _respond_thanks()
    if any(w in q for w in ("who are you", "what are you", "your name",
                             "veda", "about you")):
        return _respond_about_veda()

    return _respond_general_help()


# ── Greetings ────────────────────────────────────────────────────────

def _respond_greeting() -> str:
    return (
        "## Namaste! 🏗️\n\n"
        "I'm **Veda**, Nirmaan's AI Civil Engineering Intelligence.\n\n"
        "I can help you with:\n"
        "- 🧮 **Structural Calculations** — beam, column, slab, footing design\n"
        "- 📐 **Building Planning** — room sizes, layout, ventilation as per NBC 2016\n"
        "- 🧱 **Material Selection** — cement, brick, steel comparisons\n"
        "- 💰 **Cost Estimation** — per sqft rates, material quantities\n"
        "- 🔍 **Defect Diagnosis** — cracks, waterproofing, concrete problems\n"
        "- 📋 **Project Planning** — timelines, stages, milestones\n\n"
        "**Ask me anything about construction!** For example:\n"
        "- *\"Design a beam for 5m span with 20 kN/m load\"*\n"
        "- *\"Cost estimate for 1200 sqft house\"*\n"
        "- *\"What cement is best for foundation?\"*\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_about_veda() -> str:
    return (
        "## About Veda 🧠\n\n"
        "I'm **Veda** — Nirmaan's AI-powered Civil Engineering Intelligence.\n\n"
        "### What I Do\n"
        "- Structural design calculations (IS 456, IS 1893 compliant)\n"
        "- Material selection and comparison\n"
        "- Cost estimation and BOQ preparation\n"
        "- Building planning as per NBC 2016\n"
        "- Defect diagnosis and repair guidance\n"
        "- Construction project planning\n\n"
        "### How I Work\n"
        "I use a **multi-agent architecture** with specialist modules for each "
        "domain. Every response follows Indian Standard codes and is tailored for "
        "Telangana/South Indian construction practices.\n\n"
        "### Important\n"
        "My calculations are for **preliminary reference**. Always get final designs "
        "verified by a licensed Structural Engineer.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


# ── Platform Knowledge ──────────────────────────────────────────────

def _respond_about_nirmaan() -> str:
    return (
        "## About Nirmaan 🏗️\n\n"
        "### Quick Answer\n"
        "**Nirmaan** is India's AI-powered construction technology platform "
        "connecting homebuilders with verified materials, suppliers, and services.\n\n"
        "### What Nirmaan Offers\n"
        "| Service | Description |\n"
        "|---------|-------------|\n"
        "| 🧱 Materials Marketplace | 50,000+ construction products at competitive prices |\n"
        "| 🤖 Veda AI Consultant | Engineering calculations, cost estimation, expert guidance |\n"
        "| 🏠 Design Studio | Browse and customize home designs |\n"
        "| 📦 Doorstep Delivery | Materials delivered to your construction site |\n"
        "| 💳 Construction Credit | Flexible financing for material purchases |\n"
        "| 🔧 Equipment Rental | Machinery on rent at best rates |\n"
        "| 👷 Workforce Connect | Find verified contractors and skilled labor |\n"
        "| 🌐 Digital Twin | 3D visualization for your project |\n\n"
        "### Next Step\n"
        "Explore our products at **nirmaan.com** or ask me any construction question!\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_why_nirmaan() -> str:
    return (
        "## Why Choose Nirmaan? 🏗️\n\n"
        "### Quick Answer\n"
        "Nirmaan saves **15–20% on construction costs** through direct supplier connections, "
        "AI-powered guidance, and transparent pricing.\n\n"
        "### Key Advantages\n"
        "| Benefit | How |\n"
        "|---------|-----|\n"
        "| 💰 Cost Savings | Direct from manufacturer, no middlemen |\n"
        "| ✅ Quality Assured | All suppliers verified, materials tested |\n"
        "| 🤖 AI Guidance | Veda AI for instant engineering support |\n"
        "| 📦 Doorstep Delivery | Hassle-free logistics to your site |\n"
        "| 💳 Easy Credit | Buy now, pay later for materials |\n"
        "| 📊 Transparent Pricing | Real-time market rates, no hidden costs |\n\n"
        "### Next Step\n"
        "Browse products or ask me about materials for your project!\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_how_to_use() -> str:
    return (
        "## How to Use Nirmaan 📱\n\n"
        "### Quick Start\n"
        "1. **Register** — Create your account on nirmaan.com\n"
        "2. **Browse Products** — Search 50,000+ construction materials\n"
        "3. **Get AI Help** — Ask Veda for engineering guidance\n"
        "4. **Place Orders** — Add to cart, checkout with delivery\n"
        "5. **Track Delivery** — Real-time tracking to your site\n\n"
        "### Pro Tips\n"
        "- Use **Veda AI** for cost estimates before purchasing\n"
        "- Compare suppliers for best rates\n"
        "- Upgrade to **Premium** for unlimited AI consultations\n"
        "- Apply for **Construction Credit** for flexible payments\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_premium() -> str:
    return (
        "## Nirmaan Premium Plans 👑\n\n"
        "### Quick Answer\n"
        "Premium gives you **unlimited Veda AI consultations**, priority delivery, "
        "and exclusive discounts.\n\n"
        "### Plans Comparison\n"
        "| Feature | Free | Premium |\n"
        "|---------|------|--------|\n"
        "| Veda AI Queries | 10/day | Unlimited |\n"
        "| Engineering Calculations | Basic | Advanced |\n"
        "| Material Discounts | — | Up to 5% |\n"
        "| Priority Delivery | — | ✅ |\n"
        "| Dedicated Support | — | ✅ |\n"
        "| Project Dashboard | — | ✅ |\n"
        "| BOQ Generator | — | ✅ |\n\n"
        "### Next Step\n"
        "Visit the **Premium** section in your account to upgrade.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_workforce() -> str:
    return (
        "## Workforce Connect 👷\n\n"
        "Nirmaan connects you with **verified contractors and skilled labor** "
        "for your construction project.\n\n"
        "### Available Services\n"
        "- Mason / Bricklayer teams\n"
        "- Electricians and plumbers\n"
        "- Carpenters and painters\n"
        "- Steel fixing / bar bending teams\n"
        "- Site supervisors\n"
        "- General construction laborers\n\n"
        "### How It Works\n"
        "1. Post your requirement with project details\n"
        "2. Get quotes from verified professionals\n"
        "3. Review ratings and past work\n"
        "4. Hire and track through the platform\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_equipment() -> str:
    return (
        "## Equipment Rental 🔧\n\n"
        "Rent construction equipment at competitive rates through Nirmaan.\n\n"
        "### Available Equipment\n"
        "- Concrete mixers (0.5 bag to 2 bag capacity)\n"
        "- JCB / Excavators\n"
        "- Tower cranes and mobile cranes\n"
        "- Scaffolding systems\n"
        "- Vibrators and compactors\n"
        "- Survey instruments\n"
        "- Bar bending and cutting machines\n\n"
        "### Next Step\n"
        "Check the **Equipment** section for availability in your area.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_delivery() -> str:
    return (
        "## Doorstep Delivery 📦\n\n"
        "### How It Works\n"
        "- Materials delivered directly to your construction site\n"
        "- Real-time tracking of your orders\n"
        "- Scheduled delivery to match your construction timeline\n"
        "- Damage-free handling guaranteed\n\n"
        "### Delivery Areas\n"
        "Currently serving major cities in Telangana and Andhra Pradesh.\n\n"
        "### Next Step\n"
        "Place an order and select your delivery slot at checkout.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_credit() -> str:
    return (
        "## Construction Credit 💳\n\n"
        "### Quick Answer\n"
        "Nirmaan offers **Buy Now, Pay Later** credit for material purchases. "
        "Get instant approval based on your profile.\n\n"
        "### Features\n"
        "- Credit limits up to ₹10 lakhs\n"
        "- Flexible repayment: 30/60/90 days\n"
        "- Competitive interest rates\n"
        "- Instant digital approval\n"
        "- No collateral for smaller limits\n\n"
        "### How to Apply\n"
        "1. Go to **Credit** section in your account\n"
        "2. Submit basic documents (PAN, Aadhaar, bank statement)\n"
        "3. Get instant approval decision\n"
        "4. Start purchasing on credit immediately\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_digital_twin() -> str:
    return (
        "## Digital Twin / 3D Visualization 🌐\n\n"
        "Nirmaan's Digital Twin lets you visualize your construction project in 3D "
        "before building begins.\n\n"
        "### Features\n"
        "- 3D walkthrough of your planned building\n"
        "- Material visualization and color selection\n"
        "- Structural layout overlay\n"
        "- Progress tracking against 3D model\n\n"
        "### Next Step\n"
        "Upload your floor plan to get started with Digital Twin.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_design_studio() -> str:
    return (
        "## Design Studio 📐\n\n"
        "Browse and customize home designs through Nirmaan's Design Studio.\n\n"
        "### Features\n"
        "- Pre-designed floor plans for various plot sizes\n"
        "- Vastu-compliant layouts available\n"
        "- Customization options for rooms and finishes\n"
        "- Direct cost estimation integration\n\n"
        "### Next Step\n"
        "Visit the **Design Studio** section to explore designs for your plot.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_supplier() -> str:
    return (
        "## Supplier / Vendor Registration 🤝\n\n"
        "### For Suppliers\n"
        "Join Nirmaan's marketplace and reach thousands of homebuilders.\n\n"
        "### Registration Steps\n"
        "1. Visit nirmaan.com/supplier\n"
        "2. Submit business details and GST information\n"
        "3. Upload product catalog with pricing\n"
        "4. Verification and onboarding (2–3 business days)\n"
        "5. Start receiving orders\n\n"
        "### Benefits\n"
        "- Access to large customer base\n"
        "- Digital catalog management\n"
        "- Automated order processing\n"
        "- Timely payments\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_thanks() -> str:
    return (
        "You're welcome! 🙏\n\n"
        "Feel free to ask any other construction-related questions. "
        "I'm here to help with calculations, material selection, cost estimates, "
        "and more.\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )


def _respond_general_help() -> str:
    return (
        "## How Can I Help? 🏗️\n\n"
        "I'm **Veda**, your AI Civil Engineering consultant. Here's what I can assist with:\n\n"
        "### Engineering\n"
        "- 🧮 Structural calculations (beam, column, slab, footing)\n"
        "- 📐 Building layout planning (NBC 2016 compliant)\n"
        "- 🔬 Mix design (IS 10262)\n"
        "- 🔍 Defect diagnosis and repair\n\n"
        "### Project\n"
        "- 💰 Construction cost estimation\n"
        "- 📊 Material quantity (BOQ) calculation\n"
        "- 📋 Project timeline and planning\n"
        "- 🧱 Material selection and comparison\n\n"
        "### Platform\n"
        "- 🛒 How to use Nirmaan\n"
        "- 👑 Premium features\n"
        "- 📦 Delivery and logistics\n"
        "- 💳 Construction credit\n\n"
        "**Try asking:** *\"Design a beam for 6m span\"* or *\"Cost for 1500 sqft house\"*\n\n"
        "📋 *Veda — Nirmaan Civil Engineering Intelligence*"
    )
