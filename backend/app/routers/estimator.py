"""AI Estimation Chatbot & Material Calculator API."""

from fastapi import APIRouter

from app.services.estimator import (
    EstimationInput,
    EstimationResult,
    ChatRequest,
    ChatResponse,
    estimate_materials,
    process_chat_message,
)

router = APIRouter()


@router.post("/estimate", response_model=EstimationResult)
async def get_estimation(input_data: EstimationInput):
    """Calculate material and cost estimates for construction."""
    return estimate_materials(input_data)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the AI construction assistant."""
    return process_chat_message(request.message, request.context)


@router.get("/rates")
async def get_material_rates():
    """Get current material rates across quality tiers."""
    from app.services.estimator import MATERIAL_RATES, LABOR_RATES_PER_SQFT
    return {
        "material_rates": MATERIAL_RATES,
        "labor_rates_per_sqft": LABOR_RATES_PER_SQFT,
        "currency": "INR",
        "region": "Telangana",
    }


@router.get("/structure-types")
async def get_structure_types():
    """Get supported structure types."""
    from app.services.estimator import STRUCTURE_MULTIPLIERS
    types = []
    labels = {
        "residential_individual": "Individual House",
        "residential_apartment": "Apartment Building",
        "commercial_office": "Commercial Office",
        "commercial_shop": "Shop / Showroom",
        "warehouse": "Warehouse / Godown",
        "industrial": "Industrial Building",
        "hospital": "Hospital / Clinic",
        "school": "School / Educational",
    }
    for key, mult in STRUCTURE_MULTIPLIERS.items():
        types.append({"id": key, "label": labels.get(key, key), "multiplier": mult})
    return {"structure_types": types}
