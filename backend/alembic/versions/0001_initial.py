"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-02-18 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    workload_type = sa.Enum("pr_review", "ci_triage", name="workloadtype")
    provider_type = sa.Enum("openai", "anthropic", "mock", name="providertype")
    run_status = sa.Enum("queued", "running", "succeeded", "failed", name="runstatus")

    workload_type.create(op.get_bind(), checkfirst=True)
    provider_type.create(op.get_bind(), checkfirst=True)
    run_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "organizations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "experiments",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("organization_id", sa.String(length=36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("workload_type", workload_type, nullable=False),
        sa.Column("dataset_ref", sa.String(length=255), nullable=False),
        sa.Column("dataset_hash", sa.String(length=128), nullable=True),
        sa.Column("sampling", sa.JSON(), nullable=False),
        sa.Column("budget_usd", sa.Numeric(12, 4), nullable=False),
        sa.Column("seed", sa.Integer(), nullable=False, server_default="42"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "model_arms",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("experiment_id", sa.String(length=36), sa.ForeignKey("experiments.id"), nullable=False),
        sa.Column("provider", provider_type, nullable=False),
        sa.Column("model_name", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("config", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "runs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("experiment_id", sa.String(length=36), sa.ForeignKey("experiments.id"), nullable=False),
        sa.Column("status", run_status, nullable=False),
        sa.Column("seed", sa.Integer(), nullable=False),
        sa.Column("failure_threshold", sa.Float(), nullable=False),
        sa.Column("correlation_id", sa.String(length=36), nullable=False),
        sa.Column("summary_json", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "task_instances",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("run_id", sa.String(length=36), sa.ForeignKey("runs.id"), nullable=False),
        sa.Column("experiment_id", sa.String(length=36), sa.ForeignKey("experiments.id"), nullable=False),
        sa.Column("sequence_no", sa.Integer(), nullable=False),
        sa.Column("dataset_item_id", sa.String(length=255), nullable=False),
        sa.Column("workload_type", workload_type, nullable=False),
        sa.Column("input_payload", sa.JSON(), nullable=False),
        sa.Column("expected_payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("run_id", "sequence_no", name="uq_run_sequence"),
    )

    op.create_table(
        "attempts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("run_id", sa.String(length=36), sa.ForeignKey("runs.id"), nullable=False),
        sa.Column("task_instance_id", sa.String(length=36), sa.ForeignKey("task_instances.id"), nullable=False),
        sa.Column("model_arm_id", sa.String(length=36), sa.ForeignKey("model_arms.id"), nullable=False),
        sa.Column("raw_output", sa.Text(), nullable=True),
        sa.Column("raw_response", sa.JSON(), nullable=True),
        sa.Column("usage_prompt_tokens", sa.Integer(), nullable=False),
        sa.Column("usage_completion_tokens", sa.Integer(), nullable=False),
        sa.Column("usage_total_tokens", sa.Integer(), nullable=False),
        sa.Column("latency_ms", sa.Integer(), nullable=False),
        sa.Column("cost_usd", sa.Numeric(12, 6), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("run_id", "task_instance_id", "model_arm_id", name="uq_attempt_unique"),
    )

    op.create_table(
        "scores",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("run_id", sa.String(length=36), sa.ForeignKey("runs.id"), nullable=False),
        sa.Column("task_instance_id", sa.String(length=36), sa.ForeignKey("task_instances.id"), nullable=False),
        sa.Column("model_arm_id", sa.String(length=36), sa.ForeignKey("model_arms.id"), nullable=False),
        sa.Column("metric_name", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("scores")
    op.drop_table("attempts")
    op.drop_table("task_instances")
    op.drop_table("runs")
    op.drop_table("model_arms")
    op.drop_table("experiments")
    op.drop_table("organizations")

    run_status = sa.Enum("queued", "running", "succeeded", "failed", name="runstatus")
    provider_type = sa.Enum("openai", "anthropic", "mock", name="providertype")
    workload_type = sa.Enum("pr_review", "ci_triage", name="workloadtype")
    run_status.drop(op.get_bind(), checkfirst=True)
    provider_type.drop(op.get_bind(), checkfirst=True)
    workload_type.drop(op.get_bind(), checkfirst=True)
