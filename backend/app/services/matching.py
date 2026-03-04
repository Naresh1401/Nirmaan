"""
Supplier-order matching service.

Handles intelligent supplier selection when multiple suppliers
can fulfill the same order items.
"""

from dataclasses import dataclass
from uuid import UUID


@dataclass
class SupplierCandidate:
    supplier_id: str
    price: float
    distance_km: float
    rating: float
    stock_available: int
    is_verified: bool


@dataclass
class ItemAssignment:
    product_id: str
    supplier_id: str
    quantity: int
    unit_price: float
    total_price: float


def score_supplier(
    candidate: SupplierCandidate,
    already_assigned_suppliers: set[str],
    weights: dict | None = None,
) -> float:
    """
    Score a supplier for fulfilling a specific item.

    Factors:
    - Price competitiveness (35%)
    - Distance / delivery speed (25%)
    - Rating / trust (20%)
    - Consolidation bonus (20%) — prefer suppliers already in the order
    """
    if weights is None:
        weights = {
            "price": 0.35,
            "distance": 0.25,
            "rating": 0.20,
            "consolidation": 0.20,
        }

    # Normalize scores
    price_score = max(0, 1 - (candidate.price / 50000))  # Normalize against max
    distance_score = max(0, 1 - (candidate.distance_km / 50))
    rating_score = candidate.rating / 5.0

    # Consolidation: prefer suppliers already assigned to reduce deliveries
    consolidation_score = 1.0 if candidate.supplier_id in already_assigned_suppliers else 0.0

    # Verified supplier bonus
    verified_bonus = 0.1 if candidate.is_verified else 0.0

    total = (
        weights["price"] * price_score
        + weights["distance"] * distance_score
        + weights["rating"] * rating_score
        + weights["consolidation"] * consolidation_score
        + verified_bonus
    )

    return round(total, 4)


def assign_items_to_suppliers(
    items: list[dict],
    supplier_candidates: dict[str, list[SupplierCandidate]],
) -> list[ItemAssignment]:
    """
    Assign order items to suppliers optimally.

    Strategy:
    1. For each item, find all eligible suppliers
    2. Score each supplier considering consolidation
    3. Prefer fewer suppliers (reduces delivery complexity)
    4. If one supplier can fulfill 70%+ of items, prefer them heavily

    Args:
        items: List of {"product_id": str, "quantity": int}
        supplier_candidates: Map of product_id → list of SupplierCandidate

    Returns:
        List of ItemAssignment
    """
    assigned_suppliers: set[str] = set()
    assignments: list[ItemAssignment] = []

    # Sort items by number of available suppliers (fewest first — constraint propagation)
    sorted_items = sorted(
        items,
        key=lambda x: len(supplier_candidates.get(x["product_id"], [])),
    )

    for item in sorted_items:
        candidates = supplier_candidates.get(item["product_id"], [])

        if not candidates:
            raise ValueError(f"No supplier found for product {item['product_id']}")

        # Filter by stock
        eligible = [c for c in candidates if c.stock_available >= item["quantity"]]
        if not eligible:
            raise ValueError(
                f"Insufficient stock for product {item['product_id']} "
                f"(requested: {item['quantity']})"
            )

        # Score and rank
        scored = [
            (c, score_supplier(c, assigned_suppliers))
            for c in eligible
        ]
        scored.sort(key=lambda x: x[1], reverse=True)

        best = scored[0][0]
        assigned_suppliers.add(best.supplier_id)

        assignments.append(
            ItemAssignment(
                product_id=item["product_id"],
                supplier_id=best.supplier_id,
                quantity=item["quantity"],
                unit_price=best.price,
                total_price=best.price * item["quantity"],
            )
        )

    return assignments


def group_by_supplier(assignments: list[ItemAssignment]) -> dict[str, list[ItemAssignment]]:
    """Group item assignments by supplier for sub-order creation."""
    groups: dict[str, list[ItemAssignment]] = {}
    for assignment in assignments:
        if assignment.supplier_id not in groups:
            groups[assignment.supplier_id] = []
        groups[assignment.supplier_id].append(assignment)
    return groups
