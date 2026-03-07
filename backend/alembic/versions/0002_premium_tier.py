"""Premium tier — add membership_tier to users and create premium tables.

This migration is required after merging PR #1 (NirmaaN Premium tier).
It adds the `membership_tier` column to the existing `users` table and
creates the five new premium-related tables.

Revision ID: 0002_premium_tier
Revises: 0001_initial_schema
Create Date: 2026-03-07 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002_premium_tier"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


membership_tier_enum = sa.Enum(
    "free", "silver", "gold", "platinum",
    name="membershiptier",
    create_type=True,
)
membership_status_enum = sa.Enum(
    "active", "expired", "cancelled", "suspended",
    name="membershipstatus",
    create_type=True,
)
loyalty_tx_type_enum = sa.Enum(
    "earned", "redeemed", "expired", "bonus",
    name="loyaltytransactiontype",
    create_type=True,
)
loyalty_source_enum = sa.Enum(
    "order", "referral", "review", "signup_bonus", "tier_upgrade",
    name="loyaltysource",
    create_type=True,
)


def upgrade() -> None:
    # ── Add membership_tier column to existing users table ───────────
    # Uses server_default so existing rows get "free" automatically.
    op.add_column(
        "users",
        sa.Column(
            "membership_tier",
            sa.String(20),
            nullable=False,
            server_default="free",
        ),
    )

    # ── premium_memberships ──────────────────────────────────────────
    op.create_table(
        "premium_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            index=True,
            nullable=False,
        ),
        sa.Column("tier", membership_tier_enum, nullable=False, server_default="free"),
        sa.Column("status", membership_status_enum, nullable=False, server_default="active"),
        sa.Column(
            "start_date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("auto_renew", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("amount_paid", sa.Float(), nullable=False, server_default="0"),
        sa.Column("payment_id", sa.String(100), nullable=True),
        sa.Column("billing_cycle", sa.String(20), nullable=False, server_default="monthly"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # ── loyalty_points ───────────────────────────────────────────────
    op.create_table(
        "loyalty_points",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            unique=True,
            index=True,
            nullable=False,
        ),
        sa.Column("total_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("redeemed_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("available_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tier_bonus_multiplier", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("last_earned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # ── loyalty_transactions ─────────────────────────────────────────
    op.create_table(
        "loyalty_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "loyalty_account_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("loyalty_points.id"),
            index=True,
            nullable=False,
        ),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("transaction_type", loyalty_tx_type_enum, nullable=False),
        sa.Column("source", loyalty_source_enum, nullable=False),
        sa.Column("reference_id", sa.String(100), nullable=True),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # ── premium_benefits ─────────────────────────────────────────────
    op.create_table(
        "premium_benefits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tier", membership_tier_enum, nullable=False),
        sa.Column("benefit_name", sa.String(100), nullable=False),
        sa.Column("benefit_description", sa.Text(), nullable=True),
        sa.Column("benefit_category", sa.String(50), nullable=False),
        sa.Column("value", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
    )

    # ── referral_codes ───────────────────────────────────────────────
    op.create_table(
        "referral_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            index=True,
            nullable=False,
        ),
        sa.Column("code", sa.String(20), unique=True, index=True, nullable=False),
        sa.Column("uses_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_uses", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("reward_points", sa.Integer(), nullable=False, server_default="200"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("referral_codes")
    op.drop_table("premium_benefits")
    op.drop_table("loyalty_transactions")
    op.drop_table("loyalty_points")
    op.drop_table("premium_memberships")
    op.drop_column("users", "membership_tier")

    for enum_type in [
        loyalty_source_enum, loyalty_tx_type_enum,
        membership_status_enum, membership_tier_enum,
    ]:
        enum_type.drop(op.get_bind(), checkfirst=True)
