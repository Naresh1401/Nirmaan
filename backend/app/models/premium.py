"""Premium membership and loyalty models."""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, ForeignKey
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MembershipTier(str, enum.Enum):
    FREE = "free"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    ENTERPRISE = "enterprise"


TIER_PRICING = {
    MembershipTier.FREE: {"monthly": 0, "annual": 0},
    MembershipTier.SILVER: {"monthly": 999, "annual": 9990},          # ₹999/mo or ₹9,990/yr (2 months free)
    MembershipTier.GOLD: {"monthly": 2499, "annual": 24990},          # ₹2,499/mo or ₹24,990/yr
    MembershipTier.PLATINUM: {"monthly": 4999, "annual": 49990},      # ₹4,999/mo or ₹49,990/yr
    MembershipTier.ENTERPRISE: {"monthly": 14999, "annual": 149990},  # ₹14,999/mo or ₹1,49,990/yr
}

TIER_BENEFITS = {
    MembershipTier.FREE: {
        "label": "Starter",
        "tagline": "Get started with basic marketplace access",
        "ai_queries_per_day": 5,
        "discount_pct": 0,
        "priority_support": False,
        # Construction Marketplace
        "marketplace_access": True,
        "bulk_procurement": False,
        "logistics_optimization": False,
        # AI Civil Engineering Intelligence
        "basic_estimator": True,
        "advanced_ai_consultant": False,
        "structural_calculations": False,
        "load_analysis": False,
        "soil_suitability": False,
        "cost_prediction": False,
        "risk_detection": False,
        # Infrastructure Project Marketplace
        "project_marketplace": False,
        "contractor_bidding": False,
        "milestone_payments": False,
        # Workforce Economy
        "workforce_hiring": False,
        "worker_verification": False,
        "geo_based_hiring": False,
        # Equipment Sharing Economy
        "equipment_rental": False,
        # Architecture & Design Studio
        "design_studio": False,
        "floor_plan_generation": False,
        "ai_design_suggestions": False,
        # AI Construction Planning Engine
        "ai_planning_engine": False,
        "budget_forecasting": False,
        "resource_allocation": False,
        # Digital Twin Technology
        "digital_twin": False,
        "iot_sensor_integration": False,
        "maintenance_prediction": False,
        # Construction Finance
        "construction_finance": False,
        "material_credit": False,
        "escrow_protection": False,
        # Government & Infrastructure
        "government_tenders": False,
        "infrastructure_analytics": False,
        # Sustainability
        "carbon_tracking": False,
        "green_building_reports": False,
        # Advanced
        "drone_monitoring": False,
        "smart_city_analytics": False,
        "custom_api_access": False,
        "dedicated_account_manager": False,
        "white_label": False,
        # Loyalty
        "loyalty_multiplier": 1,
    },
    MembershipTier.SILVER: {
        "label": "Professional",
        "tagline": "For contractors & small builders",
        "ai_queries_per_day": 50,
        "discount_pct": 5,
        "priority_support": True,
        "marketplace_access": True,
        "bulk_procurement": True,
        "logistics_optimization": True,
        "basic_estimator": True,
        "advanced_ai_consultant": True,
        "structural_calculations": True,
        "load_analysis": True,
        "soil_suitability": False,
        "cost_prediction": True,
        "risk_detection": False,
        "project_marketplace": True,
        "contractor_bidding": True,
        "milestone_payments": True,
        "workforce_hiring": True,
        "worker_verification": True,
        "geo_based_hiring": True,
        "equipment_rental": True,
        "design_studio": False,
        "floor_plan_generation": False,
        "ai_design_suggestions": False,
        "ai_planning_engine": False,
        "budget_forecasting": False,
        "resource_allocation": False,
        "digital_twin": False,
        "iot_sensor_integration": False,
        "maintenance_prediction": False,
        "construction_finance": True,
        "material_credit": True,
        "escrow_protection": True,
        "government_tenders": False,
        "infrastructure_analytics": False,
        "carbon_tracking": False,
        "green_building_reports": False,
        "drone_monitoring": False,
        "smart_city_analytics": False,
        "custom_api_access": False,
        "dedicated_account_manager": False,
        "white_label": False,
        "loyalty_multiplier": 2,
    },
    MembershipTier.GOLD: {
        "label": "Business",
        "tagline": "For construction firms & large projects",
        "ai_queries_per_day": 200,
        "discount_pct": 10,
        "priority_support": True,
        "marketplace_access": True,
        "bulk_procurement": True,
        "logistics_optimization": True,
        "basic_estimator": True,
        "advanced_ai_consultant": True,
        "structural_calculations": True,
        "load_analysis": True,
        "soil_suitability": True,
        "cost_prediction": True,
        "risk_detection": True,
        "project_marketplace": True,
        "contractor_bidding": True,
        "milestone_payments": True,
        "workforce_hiring": True,
        "worker_verification": True,
        "geo_based_hiring": True,
        "equipment_rental": True,
        "design_studio": True,
        "floor_plan_generation": True,
        "ai_design_suggestions": True,
        "ai_planning_engine": True,
        "budget_forecasting": True,
        "resource_allocation": True,
        "digital_twin": False,
        "iot_sensor_integration": False,
        "maintenance_prediction": False,
        "construction_finance": True,
        "material_credit": True,
        "escrow_protection": True,
        "government_tenders": True,
        "infrastructure_analytics": True,
        "carbon_tracking": True,
        "green_building_reports": True,
        "drone_monitoring": False,
        "smart_city_analytics": False,
        "custom_api_access": False,
        "dedicated_account_manager": False,
        "white_label": False,
        "loyalty_multiplier": 3,
    },
    MembershipTier.PLATINUM: {
        "label": "Premium",
        "tagline": "For infrastructure companies & developers",
        "ai_queries_per_day": -1,  # unlimited
        "discount_pct": 15,
        "priority_support": True,
        "marketplace_access": True,
        "bulk_procurement": True,
        "logistics_optimization": True,
        "basic_estimator": True,
        "advanced_ai_consultant": True,
        "structural_calculations": True,
        "load_analysis": True,
        "soil_suitability": True,
        "cost_prediction": True,
        "risk_detection": True,
        "project_marketplace": True,
        "contractor_bidding": True,
        "milestone_payments": True,
        "workforce_hiring": True,
        "worker_verification": True,
        "geo_based_hiring": True,
        "equipment_rental": True,
        "design_studio": True,
        "floor_plan_generation": True,
        "ai_design_suggestions": True,
        "ai_planning_engine": True,
        "budget_forecasting": True,
        "resource_allocation": True,
        "digital_twin": True,
        "iot_sensor_integration": True,
        "maintenance_prediction": True,
        "construction_finance": True,
        "material_credit": True,
        "escrow_protection": True,
        "government_tenders": True,
        "infrastructure_analytics": True,
        "carbon_tracking": True,
        "green_building_reports": True,
        "drone_monitoring": True,
        "smart_city_analytics": False,
        "custom_api_access": True,
        "dedicated_account_manager": True,
        "white_label": False,
        "loyalty_multiplier": 5,
    },
    MembershipTier.ENTERPRISE: {
        "label": "Enterprise",
        "tagline": "For governments, smart cities & mega projects",
        "ai_queries_per_day": -1,  # unlimited
        "discount_pct": 20,
        "priority_support": True,
        "marketplace_access": True,
        "bulk_procurement": True,
        "logistics_optimization": True,
        "basic_estimator": True,
        "advanced_ai_consultant": True,
        "structural_calculations": True,
        "load_analysis": True,
        "soil_suitability": True,
        "cost_prediction": True,
        "risk_detection": True,
        "project_marketplace": True,
        "contractor_bidding": True,
        "milestone_payments": True,
        "workforce_hiring": True,
        "worker_verification": True,
        "geo_based_hiring": True,
        "equipment_rental": True,
        "design_studio": True,
        "floor_plan_generation": True,
        "ai_design_suggestions": True,
        "ai_planning_engine": True,
        "budget_forecasting": True,
        "resource_allocation": True,
        "digital_twin": True,
        "iot_sensor_integration": True,
        "maintenance_prediction": True,
        "construction_finance": True,
        "material_credit": True,
        "escrow_protection": True,
        "government_tenders": True,
        "infrastructure_analytics": True,
        "carbon_tracking": True,
        "green_building_reports": True,
        "drone_monitoring": True,
        "smart_city_analytics": True,
        "custom_api_access": True,
        "dedicated_account_manager": True,
        "white_label": True,
        "loyalty_multiplier": 7,
    },
}


# Feature groupings for the API (used by /tiers and /check-feature)
FEATURE_GROUPS = {
    "Construction Marketplace": [
        ("marketplace_access", "Materials Marketplace Access"),
        ("bulk_procurement", "Bulk Procurement & Volume Discounts"),
        ("logistics_optimization", "Logistics Optimization & Route Planning"),
    ],
    "AI Civil Engineering Intelligence": [
        ("basic_estimator", "Basic Material Estimator"),
        ("advanced_ai_consultant", "Advanced AI Civil Consultant"),
        ("structural_calculations", "Structural Calculations & IS Code"),
        ("load_analysis", "Load Analysis & Foundation Recommendations"),
        ("soil_suitability", "Soil Suitability Analysis"),
        ("cost_prediction", "AI Cost Prediction"),
        ("risk_detection", "Construction Risk Detection"),
    ],
    "Project Marketplace": [
        ("project_marketplace", "Post & Browse Infrastructure Projects"),
        ("contractor_bidding", "Contractor Bidding System"),
        ("milestone_payments", "Milestone-Based Payments"),
    ],
    "Workforce Economy": [
        ("workforce_hiring", "Hire Verified Workers"),
        ("worker_verification", "Skill Verification & Ratings"),
        ("geo_based_hiring", "Geo-Based Hiring"),
    ],
    "Equipment Sharing": [
        ("equipment_rental", "Equipment Rental Marketplace"),
    ],
    "Architecture & Design Studio": [
        ("design_studio", "Architecture & Design Studio"),
        ("floor_plan_generation", "AI Floor Plan Generation"),
        ("ai_design_suggestions", "AI Design Suggestions & 3D Visualization"),
    ],
    "AI Construction Planning": [
        ("ai_planning_engine", "AI Construction Planning Engine"),
        ("budget_forecasting", "Budget Forecasting"),
        ("resource_allocation", "Resource Allocation Optimization"),
    ],
    "Digital Twin Technology": [
        ("digital_twin", "3D Building Digital Twins"),
        ("iot_sensor_integration", "IoT Sensor Integration"),
        ("maintenance_prediction", "Predictive Maintenance"),
    ],
    "Construction Finance": [
        ("construction_finance", "Construction Loans & Finance"),
        ("material_credit", "Material Credit Lines"),
        ("escrow_protection", "Escrow Payment Protection"),
    ],
    "Government & Infrastructure": [
        ("government_tenders", "Government Tender Access"),
        ("infrastructure_analytics", "Infrastructure Analytics Dashboard"),
    ],
    "Sustainability": [
        ("carbon_tracking", "Carbon Footprint Tracking"),
        ("green_building_reports", "Green Building Certification Reports"),
    ],
    "Advanced Technology": [
        ("drone_monitoring", "Drone Site Monitoring"),
        ("smart_city_analytics", "Smart City Analytics"),
        ("custom_api_access", "Custom API Access"),
        ("dedicated_account_manager", "Dedicated Account Manager"),
        ("white_label", "White-Label Platform"),
    ],
}


class PremiumMembership(Base):
    """Tracks user premium subscription."""

    __tablename__ = "premium_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True
    )
    tier: Mapped[MembershipTier] = mapped_column(
        SAEnum(MembershipTier), default=MembershipTier.FREE
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    total_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    total_points_redeemed: Mapped[int] = mapped_column(Integer, default=0)
    ai_queries_today: Mapped[int] = mapped_column(Integer, default=0)
    ai_queries_reset_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="premium_membership")


class LoyaltyTransaction(Base):
    """Loyalty points transaction log."""

    __tablename__ = "loyalty_transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)  # positive = earned, negative = redeemed
    description: Mapped[str] = mapped_column(String(255))
    reference_type: Mapped[str] = mapped_column(String(50), nullable=True)  # order, referral, bonus, etc.
    reference_id: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
