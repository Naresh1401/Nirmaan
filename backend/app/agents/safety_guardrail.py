"""Safety Guardrail Agent — adds disclaimers and warnings for high-risk responses."""

from typing import Optional

# Risk thresholds
_HIGH_RISK_INTENTS = {
    "structural_design", "foundation_design", "seismic_design",
    "retaining_wall", "bridge_design", "prestressed_concrete",
    "steel_structure_design", "failure_analysis",
}

_MEDIUM_RISK_INTENTS = {
    "mix_design", "waterproofing", "crack_diagnosis",
    "concrete_defects", "rebar_schedule", "soil_investigation",
    "ndt_testing", "load_calculation",
}


def apply_safety_guardrail(
    response: str,
    intent: str,
    risk_level: str,
    params: Optional[dict] = None,
) -> str:
    """Post-process a response to add safety warnings based on risk level.

    Args:
        response: The specialist agent's response text.
        intent: The classified intent string.
        risk_level: One of 'low', 'medium', 'high', 'critical'.
        params: Optional extracted parameters.

    Returns:
        Response with appropriate safety disclaimers appended/prepended.
    """
    if risk_level == "critical":
        return _wrap_critical(response, intent)
    if risk_level == "high" or intent in _HIGH_RISK_INTENTS:
        return _wrap_high(response, intent)
    if risk_level == "medium" or intent in _MEDIUM_RISK_INTENTS:
        return _wrap_medium(response)
    return response


def _wrap_critical(response: str, intent: str) -> str:
    """Wrap response with critical safety banner."""
    banner = (
        "---\n"
        "🚨 **CRITICAL SAFETY NOTICE**\n\n"
        "The information below is for **educational reference only**. "
        "This query involves structural safety that **directly affects human life**.\n\n"
        "**You MUST:**\n"
        "- Engage a licensed Structural Engineer (SE) for design and approval\n"
        "- Follow all applicable IS codes and local building regulations\n"
        "- Get designs vetted by the local municipal authority\n"
        "- Never use AI-generated calculations as final design values\n\n"
        "---\n\n"
    )
    footer = (
        "\n\n---\n"
        "🚨 *This is a reference calculation only. Actual structural design must be done by "
        "a licensed Structural Engineer per IS 456:2000, IS 1893:2016, and applicable codes. "
        "Nirmaan and SETU AI are not liable for design decisions.*\n"
        "---"
    )
    return banner + response + footer


def _wrap_high(response: str, intent: str) -> str:
    """Add high-risk disclaimer."""
    footer = (
        "\n\n---\n"
        "⚠️ **Important Disclaimer:** This calculation/recommendation is for "
        "**preliminary reference only**. Final design must be verified by a qualified "
        "Structural Engineer. Site-specific conditions (soil, seismic zone, loading) "
        "can significantly alter requirements. Always follow IS code provisions and "
        "get municipal approval before construction.\n"
        "---"
    )
    return response + footer


def _wrap_medium(response: str) -> str:
    """Add medium-risk note."""
    footer = (
        "\n\n---\n"
        "ℹ️ *Note: Recommendations are based on standard practice and IS codes. "
        "Consult a professional for site-specific conditions.*\n"
        "---"
    )
    return response + footer


def check_missing_inputs(intent: str, params: dict) -> Optional[str]:
    """Check if critical parameters are missing for high-risk calculations.

    Returns a follow-up question if inputs are insufficient, else None.
    """
    if intent in ("beam_design", "structural_design"):
        missing = []
        if not params.get("span_m"):
            missing.append("span length (in meters)")
        if not params.get("load_kn"):
            missing.append("load (in kN/m or total kN)")
        if missing:
            return (
                "To provide an accurate beam design calculation, I need:\n"
                + "\n".join(f"- **{m}**" for m in missing)
                + "\n\nPlease provide these values."
            )

    if intent in ("column_design",):
        if not params.get("load_kn"):
            return (
                "For column design, I need the **axial load (in kN)** "
                "the column needs to carry. Please share the load value."
            )

    if intent in ("slab_design",):
        if not params.get("span_m"):
            return (
                "For slab design, I need the **shorter span (in meters)**. "
                "Is it a one-way or two-way slab? Please share the dimensions."
            )

    if intent in ("footing_design", "foundation_design"):
        if not params.get("load_kn"):
            return (
                "For footing design, I need:\n"
                "- **Column load (in kN)**\n"
                "- **Soil bearing capacity (kN/m²)** — if known\n\n"
                "Please provide these values."
            )

    return None
