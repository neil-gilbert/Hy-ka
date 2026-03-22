"""expand enums for shadow evaluation

Revision ID: 0002_expand_shadow_eval_enums
Revises: 0001_initial
Create Date: 2026-03-22 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_expand_shadow_eval_enums"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


WORKLOAD_VALUES = ("pr_review", "ci_triage", "github_pr_shadow")
PROVIDER_VALUES = ("openai", "anthropic", "azure_openai", "openrouter", "mock")


def _enum_sql(values: tuple[str, ...]) -> str:
    return ", ".join(f"'{value}'" for value in values)


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    if dialect == "mysql":
        op.execute(
            f"ALTER TABLE experiments MODIFY workload_type ENUM({_enum_sql(WORKLOAD_VALUES)}) NOT NULL"
        )
        op.execute(
            f"ALTER TABLE task_instances MODIFY workload_type ENUM({_enum_sql(WORKLOAD_VALUES)}) NOT NULL"
        )
        op.execute(
            f"ALTER TABLE model_arms MODIFY provider ENUM({_enum_sql(PROVIDER_VALUES)}) NOT NULL"
        )
    elif dialect == "sqlite":
        return
    else:
        workload_type = sa.Enum(*WORKLOAD_VALUES, name="workloadtype")
        provider_type = sa.Enum(*PROVIDER_VALUES, name="providertype")
        workload_type.create(bind, checkfirst=True)
        provider_type.create(bind, checkfirst=True)


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    if dialect == "mysql":
        op.execute("ALTER TABLE experiments MODIFY workload_type ENUM('pr_review', 'ci_triage') NOT NULL")
        op.execute("ALTER TABLE task_instances MODIFY workload_type ENUM('pr_review', 'ci_triage') NOT NULL")
        op.execute("ALTER TABLE model_arms MODIFY provider ENUM('openai', 'anthropic', 'mock') NOT NULL")
    elif dialect == "sqlite":
        return
