# Logistics Design — Nirmaan

## Overview

Construction material delivery is fundamentally different from e-commerce logistics:
- **Heavy loads** (sand: 2–10 tons, cement: 50kg bags, steel: long rods)
- **Specialized vehicles** required per material type
- **Time-sensitive** — construction delays cost ₹10,000+/day
- **Last-mile challenges** — construction sites in remote/narrow areas

---

## Vehicle Fleet Design

### Vehicle Categories

| Vehicle Type | Capacity | Materials | Cost/Trip (avg) |
|-------------|----------|-----------|----------------|
| Auto/3-wheeler | 500 kg | Paint, fittings, small orders | ₹200–400 |
| Mini Truck (Tata Ace) | 1–2 tons | Cement (20–40 bags), tiles | ₹400–800 |
| LCV (Bolero Pickup) | 1.5–2.5 tons | Mixed materials | ₹500–1,000 |
| Medium Truck | 5–10 tons | Bricks, cement (bulk) | ₹1,000–2,000 |
| Tractor-Trolley | 3–5 tons | Sand, gravel, soil | ₹800–1,500 |
| Sand Truck (Tipper) | 8–12 tons | Sand, aggregate | ₹1,500–3,000 |
| Flatbed Truck | 5–10 tons | Steel, TMT bars, pipes | ₹1,200–2,500 |

### Fleet Model

**Phase 1**: Asset-light — Partner with local vehicle operators
- Onboard independent truck/tractor owners
- Revenue share: 70% driver / 30% platform
- No vehicle ownership required

**Phase 2+**: Hybrid model
- Continue partner fleet for surge capacity
- Lease dedicated vehicles for high-demand routes
- Branded Nirmaan vehicles for trust building

---

## Delivery Assignment Algorithm

```
ALGORITHM: AssignDeliveryPartner(order)

INPUT:
  - order: { items, pickup_locations[], delivery_location, urgency }
  
STEP 1: Determine vehicle requirement
  - Calculate total weight and volume
  - Identify material type constraints (e.g., sand needs tipper)
  - Select eligible vehicle categories

STEP 2: Find available delivery partners
  - Query partners within 15km of pickup location
  - Filter by: vehicle_type, availability, active_status
  - Exclude partners with ongoing deliveries (unless multi-stop)

STEP 3: Score each partner
  FOR each eligible partner:
    distance_score = 1 / distance_to_pickup (normalized)
    rating_score = partner.avg_rating / 5.0
    reliability_score = partner.completion_rate
    cost_score = 1 / partner.rate_per_km (normalized)
    
    total_score = (
      0.35 * distance_score +
      0.25 * rating_score +
      0.25 * reliability_score +
      0.15 * cost_score
    )

STEP 4: Assign top-scoring partner
  - Send delivery request to top 3 partners simultaneously
  - First to accept gets the assignment
  - If no response in 3 minutes, expand search radius by 5km
  - If no response in 10 minutes, alert operations team

STEP 5: Optimize route
  - If multi-supplier order: calculate optimal pickup sequence
  - Use Google Maps Directions API for route + ETA
  - Account for loading time (15 min per pickup)

OUTPUT: assigned_partner, estimated_pickup_time, estimated_delivery_time
```

---

## Route Optimization

### Multi-Supplier Order Handling

When an order requires materials from multiple suppliers:

```
ALGORITHM: OptimizeMultiPickupRoute(pickups[], delivery_point)

1. Generate all pickup permutations
2. For each permutation, calculate total distance
3. Select permutation with minimum total distance
4. For orders with > 5 pickups, use nearest-neighbor heuristic:
   a. Start from delivery partner's current location
   b. Visit nearest unvisited pickup
   c. Repeat until all pickups complete
   d. Navigate to delivery point

OPTIMIZATION CONSTRAINTS:
- Total route time < 4 hours
- If route > 4 hours, split into multiple deliveries
- Priority pickups (urgent items) scheduled first
- Loading dock availability considered
```

### Delivery Scheduling

| Priority | SLA | Surcharge |
|----------|-----|-----------|
| Standard | 24–48 hours | None |
| Express | 4–8 hours | +₹500 |
| Urgent | 2–4 hours | +₹1,000 |
| Scheduled | Specific date/time | None |

---

## Order Fulfillment Workflow

```
┌─────────────────┐
│ Customer places  │
│     order        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ System checks    │
│ supplier stock   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Single  │ Multi-supplier?
    │ supplier│
    └────┬────┘
         │          ┌──────────────┐
         │    YES   │ Split order  │
         ├─────────►│ by supplier  │
         │          └──────┬───────┘
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│ Supplier         │ │ Each supplier    │
│ confirms order   │ │ confirms portion │
└────────┬────────┘ └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────┐
│ Delivery partner assigned       │
│ (optimal vehicle selected)      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Partner picks up materials       │
│ (weight verified at pickup)      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ In-transit tracking              │
│ (real-time GPS updates)          │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Delivery completed               │
│ - Photo proof uploaded           │
│ - Customer confirms receipt      │
│ - Weight verification            │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Payment settled                  │
│ - Customer charged               │
│ - Supplier paid (T+2)           │
│ - Delivery partner paid (daily)  │
└─────────────────────────────────┘
```

### Multi-Supplier Order Splitting Logic

```python
def split_order(order_items, available_suppliers):
    """
    Split order across suppliers to minimize cost and delivery time.
    
    Strategy:
    1. For each item, find all suppliers with stock
    2. Score suppliers on: price, distance, rating, stock level
    3. Assign items to minimize number of suppliers (reduce deliveries)
    4. If single supplier can fulfill > 70% of order, prefer them
    5. Generate sub-orders per supplier
    """
    supplier_assignments = {}
    
    for item in order_items:
        eligible = find_suppliers(item, available_suppliers)
        best = score_and_rank(eligible, weights={
            'price': 0.35,
            'distance': 0.25,
            'rating': 0.20,
            'consolidation_bonus': 0.20  # bonus for already-assigned suppliers
        })
        supplier_assignments[item] = best[0]
    
    # Consolidate into sub-orders
    sub_orders = group_by_supplier(supplier_assignments)
    return sub_orders
```

---

## Delivery Partner App Features

1. **Order Queue**: View assigned deliveries with pickup/drop details
2. **Navigation**: In-app Google Maps navigation
3. **Pickup Checklist**: Verify items and quantities at supplier
4. **Weight Verification**: Photo + weight entry at pickup
5. **Delivery Proof**: Photo of delivered materials at site
6. **Earnings Dashboard**: Daily/weekly/monthly earnings view
7. **Availability Toggle**: Go online/offline
8. **Route Overview**: See full route for multi-pickup orders
