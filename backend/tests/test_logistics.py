"""Basic backend tests."""

import pytest
from app.services.logistics import (
    haversine_distance,
    Location,
    score_delivery_partner,
    optimize_pickup_route,
    select_vehicle_type,
    calculate_delivery_fee,
    estimate_delivery_time_minutes,
)


class TestHaversineDistance:
    def test_same_location(self):
        loc = Location(lat=18.9523, lng=79.5941)
        assert haversine_distance(loc, loc) == 0.0

    def test_peddapalli_to_karimnagar(self):
        peddapalli = Location(lat=18.6174, lng=79.3762)
        karimnagar = Location(lat=18.4386, lng=79.1288)
        distance = haversine_distance(peddapalli, karimnagar)
        assert 25 < distance < 40  # Approx 30 km

    def test_short_distance(self):
        loc1 = Location(lat=18.6174, lng=79.3762)
        loc2 = Location(lat=18.6200, lng=79.3800)
        distance = haversine_distance(loc1, loc2)
        assert distance < 1  # Less than 1 km


class TestDeliveryPartnerScoring:
    def test_close_partner_scores_higher(self):
        pickup = Location(lat=18.6174, lng=79.3762)

        close_partner = Location(lat=18.6180, lng=79.3770)
        far_partner = Location(lat=18.4386, lng=79.1288)

        score_close = score_delivery_partner(close_partner, pickup, 4.5, 95.0)
        score_far = score_delivery_partner(far_partner, pickup, 4.5, 95.0)

        assert score_close > score_far

    def test_higher_rating_helps(self):
        pickup = Location(lat=18.6174, lng=79.3762)
        partner = Location(lat=18.6180, lng=79.3770)

        score_high = score_delivery_partner(partner, pickup, 5.0, 95.0)
        score_low = score_delivery_partner(partner, pickup, 2.0, 95.0)

        assert score_high > score_low


class TestVehicleSelection:
    def test_sand_needs_tipper(self):
        assert select_vehicle_type(5000, ["Sand"]) == "tipper"

    def test_steel_needs_flatbed(self):
        assert select_vehicle_type(2000, ["TMT Steel Bars"]) == "flatbed"

    def test_light_load_gets_auto(self):
        assert select_vehicle_type(300, ["Paint", "Fittings"]) == "auto"

    def test_medium_load_gets_mini_truck(self):
        assert select_vehicle_type(1500, ["Cement Bags"]) == "mini_truck"

    def test_heavy_load_gets_truck(self):
        assert select_vehicle_type(8000, ["Bricks"]) == "truck"


class TestRouteOptimization:
    def test_single_pickup(self):
        pickups = [Location(18.62, 79.38)]
        delivery = Location(18.61, 79.37)
        start = Location(18.63, 79.39)
        result = optimize_pickup_route(pickups, delivery, start)
        assert result == [0]

    def test_multiple_pickups_nearest_first(self):
        start = Location(18.60, 79.37)
        pickups = [
            Location(18.65, 79.40),  # Far
            Location(18.61, 79.37),  # Close
            Location(18.63, 79.38),  # Medium
        ]
        delivery = Location(18.60, 79.36)
        result = optimize_pickup_route(pickups, delivery, start)
        assert result[0] == 1  # Closest first


class TestDeliveryFee:
    def test_minimum_fee(self):
        fee = calculate_delivery_fee(1, 100, "auto")
        assert fee >= 300

    def test_urgent_surcharge(self):
        standard = calculate_delivery_fee(20, 1000, "mini_truck", "standard")
        urgent = calculate_delivery_fee(20, 1000, "mini_truck", "urgent")
        assert urgent > standard

    def test_tipper_more_expensive(self):
        auto = calculate_delivery_fee(20, 400, "auto")
        tipper = calculate_delivery_fee(20, 10000, "tipper")
        assert tipper > auto


class TestETAEstimation:
    def test_minimum_time(self):
        eta = estimate_delivery_time_minutes(1, 1)
        assert eta >= 30

    def test_longer_distance_more_time(self):
        short = estimate_delivery_time_minutes(5, 1)
        long = estimate_delivery_time_minutes(30, 1)
        assert long > short

    def test_more_pickups_more_time(self):
        one = estimate_delivery_time_minutes(10, 1)
        three = estimate_delivery_time_minutes(10, 3)
        assert three > one
