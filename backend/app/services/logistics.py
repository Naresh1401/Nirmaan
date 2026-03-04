"""
Logistics optimization service.

Handles:
- Delivery partner matching & assignment
- Route optimization for multi-pickup orders
- Delivery fee calculation
- ETA estimation
"""

import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class Location:
    lat: float
    lng: float


@dataclass
class PartnerScore:
    partner_id: str
    distance_km: float
    rating: float
    completion_rate: float
    total_score: float


def haversine_distance(loc1: Location, loc2: Location) -> float:
    """Calculate distance in km between two coordinates using Haversine formula."""
    R = 6371  # Earth radius in km

    lat1, lat2 = math.radians(loc1.lat), math.radians(loc2.lat)
    dlat = math.radians(loc2.lat - loc1.lat)
    dlng = math.radians(loc2.lng - loc1.lng)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def score_delivery_partner(
    partner_location: Location,
    pickup_location: Location,
    partner_rating: float,
    partner_completion_rate: float,
    partner_rate_per_km: float = 15.0,
    weights: Optional[dict] = None,
) -> float:
    """
    Score a delivery partner for an order assignment.

    Scoring factors:
    - Distance to pickup (35%) — closer is better
    - Rating (25%) — higher is better
    - Reliability / completion rate (25%) — higher is better
    - Cost efficiency (15%) — lower rate is better

    Returns a score between 0 and 1.
    """
    if weights is None:
        weights = {
            "distance": 0.35,
            "rating": 0.25,
            "reliability": 0.25,
            "cost": 0.15,
        }

    distance = haversine_distance(partner_location, pickup_location)

    # Normalize scores (0-1, higher is better)
    distance_score = max(0, 1 - (distance / 50))  # 50km max radius
    rating_score = partner_rating / 5.0
    reliability_score = partner_completion_rate / 100.0
    cost_score = max(0, 1 - (partner_rate_per_km / 30))  # ₹30/km max

    total = (
        weights["distance"] * distance_score
        + weights["rating"] * rating_score
        + weights["reliability"] * reliability_score
        + weights["cost"] * cost_score
    )

    return round(total, 4)


def optimize_pickup_route(
    pickups: list[Location],
    delivery: Location,
    start: Location,
) -> list[int]:
    """
    Optimize multi-pickup route using nearest-neighbor heuristic.

    For orders requiring materials from multiple suppliers,
    determines the optimal pickup sequence.

    Returns ordered indices of pickups.
    """
    if len(pickups) <= 1:
        return list(range(len(pickups)))

    visited = []
    remaining = list(range(len(pickups)))
    current = start

    while remaining:
        # Find nearest unvisited pickup
        nearest_idx = min(
            remaining,
            key=lambda i: haversine_distance(current, pickups[i]),
        )
        visited.append(nearest_idx)
        remaining.remove(nearest_idx)
        current = pickups[nearest_idx]

    return visited


def calculate_delivery_fee(
    distance_km: float,
    weight_kg: float,
    vehicle_type: str,
    priority: str = "standard",
) -> float:
    """
    Calculate delivery fee based on distance, weight, vehicle, and priority.

    Base rates per vehicle type (₹/km):
    - auto: ₹12/km
    - mini_truck: ₹18/km
    - lcv: ₹20/km
    - truck: ₹25/km
    - tractor: ₹22/km
    - tipper: ₹28/km
    - flatbed: ₹26/km
    """
    base_rates = {
        "auto": 12,
        "mini_truck": 18,
        "lcv": 20,
        "truck": 25,
        "tractor": 22,
        "tipper": 28,
        "flatbed": 26,
    }

    rate = base_rates.get(vehicle_type, 20)
    base_fee = max(300, distance_km * rate)

    # Weight surcharge (for overweight loads)
    weight_limits = {
        "auto": 500,
        "mini_truck": 2000,
        "lcv": 2500,
        "truck": 10000,
        "tractor": 5000,
        "tipper": 12000,
        "flatbed": 10000,
    }
    limit = weight_limits.get(vehicle_type, 2000)
    if weight_kg > limit:
        base_fee *= 1.3  # 30% overweight surcharge

    # Priority surcharge
    priority_multipliers = {
        "standard": 1.0,
        "express": 1.5,
        "urgent": 2.0,
        "scheduled": 1.0,
    }
    base_fee *= priority_multipliers.get(priority, 1.0)

    return round(base_fee, 2)


def estimate_delivery_time_minutes(
    distance_km: float,
    num_pickups: int = 1,
    priority: str = "standard",
) -> int:
    """
    Estimate delivery time in minutes.

    Assumptions:
    - Average speed: 25 km/h in city
    - Loading time: 15 min per pickup
    - Buffer: 15 min
    """
    travel_time = (distance_km / 25) * 60
    loading_time = num_pickups * 15
    buffer = 15

    total = travel_time + loading_time + buffer

    # Priority doesn't truly reduce physical time, but we can model it
    # as the dispatch being faster
    if priority == "urgent":
        total *= 0.8
    elif priority == "express":
        total *= 0.9

    return max(30, int(total))


def select_vehicle_type(
    total_weight_kg: float,
    material_types: list[str],
) -> str:
    """
    Select the appropriate vehicle type based on order weight and material types.

    Rules:
    - Sand/gravel always needs tipper
    - Steel/TMT bars always need flatbed
    - < 500 kg and small items → auto
    - 500-2000 kg → mini_truck
    - 2000-5000 kg → lcv or tractor
    - > 5000 kg → truck
    """
    # Material-specific vehicle requirements
    special_materials = {
        "sand": "tipper",
        "gravel": "tipper",
        "aggregate": "tipper",
        "soil": "tipper",
        "steel": "flatbed",
        "tmt": "flatbed",
        "pipes": "flatbed",
    }

    for mat in material_types:
        mat_lower = mat.lower()
        for keyword, vehicle in special_materials.items():
            if keyword in mat_lower:
                return vehicle

    # Weight-based selection
    if total_weight_kg <= 500:
        return "auto"
    elif total_weight_kg <= 2000:
        return "mini_truck"
    elif total_weight_kg <= 5000:
        return "lcv"
    else:
        return "truck"
