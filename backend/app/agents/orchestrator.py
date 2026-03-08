"""Orchestrator — ties intent router, specialist agents, safety guardrail together.

Pipeline:  classify_intent → check_missing_inputs → route_to_agent → safety_guardrail
"""

from app.agents.intent_router import classify_intent, IntentResult
from app.agents.civil_engineering import handle_civil_engineering
from app.agents.project_planning import handle_project_planning
from app.agents.building_layout import handle_building_layout
from app.agents.material_recommendation import handle_material_recommendation
from app.agents.quantity_estimation import handle_quantity_estimation
from app.agents.cost_estimation import handle_cost_estimation
from app.agents.defect_diagnosis import handle_defect_diagnosis
from app.agents.engagement_composer import handle_engagement
from app.agents.safety_guardrail import apply_safety_guardrail, check_missing_inputs


# Agent module name → handler function
_AGENT_DISPATCH = {
    "civil_engineering": handle_civil_engineering,
    "project_planning": handle_project_planning,
    "building_layout": handle_building_layout,
    "material_recommendation": handle_material_recommendation,
    "quantity_estimation": handle_quantity_estimation,
    "cost_estimation": handle_cost_estimation,
    "defect_diagnosis": handle_defect_diagnosis,
    "engagement": handle_engagement,
}


def process_query(question: str, context: str | None = None, tier: str = "free") -> str:
    """Main entry point for Veda AI query processing.

    Args:
        question: The user's question text.
        context: Optional conversation context.
        tier: User's membership tier (free/silver/gold/platinum/enterprise).

    Returns:
        Final formatted response string.
    """
    # Step 1: Classify intent
    result: IntentResult = classify_intent(question)

    # Step 2: Inject the raw question into params for sub-routing
    params = result.extracted_params
    params["_question"] = question.lower().strip()
    if context:
        params["_context"] = context

    # Step 3: Check for missing critical inputs
    missing_prompt = check_missing_inputs(result.intent, params)
    if missing_prompt:
        return missing_prompt

    # Step 4: Route to specialist agent
    handler = _AGENT_DISPATCH.get(result.agent, handle_engagement)
    response = handler(result.intent, params)

    # Step 5: Apply safety guardrail (post-process)
    response = apply_safety_guardrail(
        response=response,
        intent=result.intent,
        risk_level=result.risk_level,
        params=params,
    )

    return response
