from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkloadType(str, enum.Enum):
    PR_REVIEW = "pr_review"
    CI_TRIAGE = "ci_triage"


class ProviderType(str, enum.Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    MOCK = "mock"


class RunStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


def enum_values(enum_cls: type[enum.Enum]) -> list[str]:
    return [member.value for member in enum_cls]


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    experiments: Mapped[list[Experiment]] = relationship(back_populates="organization")


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    workload_type: Mapped[WorkloadType] = mapped_column(
        Enum(WorkloadType, values_callable=enum_values, name="workloadtype"), nullable=False
    )
    dataset_ref: Mapped[str] = mapped_column(String(255), nullable=False)
    dataset_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    sampling: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    budget_usd: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    seed: Mapped[int] = mapped_column(Integer, nullable=False, default=42)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    organization: Mapped[Organization] = relationship(back_populates="experiments")
    model_arms: Mapped[list[ModelArm]] = relationship(
        back_populates="experiment", cascade="all, delete-orphan"
    )
    runs: Mapped[list[Run]] = relationship(back_populates="experiment", cascade="all, delete-orphan")


class ModelArm(Base):
    __tablename__ = "model_arms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id: Mapped[str] = mapped_column(String(36), ForeignKey("experiments.id"), nullable=False)
    provider: Mapped[ProviderType] = mapped_column(
        Enum(ProviderType, values_callable=enum_values, name="providertype"), nullable=False
    )
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    config: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    experiment: Mapped[Experiment] = relationship(back_populates="model_arms")


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id: Mapped[str] = mapped_column(String(36), ForeignKey("experiments.id"), nullable=False)
    status: Mapped[RunStatus] = mapped_column(
        Enum(RunStatus, values_callable=enum_values, name="runstatus"),
        nullable=False,
        default=RunStatus.QUEUED,
    )
    seed: Mapped[int] = mapped_column(Integer, nullable=False)
    failure_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    correlation_id: Mapped[str] = mapped_column(String(36), nullable=False, default=lambda: str(uuid.uuid4()))
    summary_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    experiment: Mapped[Experiment] = relationship(back_populates="runs")
    task_instances: Mapped[list[TaskInstance]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )
    attempts: Mapped[list[Attempt]] = relationship(back_populates="run", cascade="all, delete-orphan")
    scores: Mapped[list[Score]] = relationship(back_populates="run", cascade="all, delete-orphan")


class TaskInstance(Base):
    __tablename__ = "task_instances"
    __table_args__ = (UniqueConstraint("run_id", "sequence_no", name="uq_run_sequence"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id"), nullable=False)
    experiment_id: Mapped[str] = mapped_column(String(36), ForeignKey("experiments.id"), nullable=False)
    sequence_no: Mapped[int] = mapped_column(Integer, nullable=False)
    dataset_item_id: Mapped[str] = mapped_column(String(255), nullable=False)
    workload_type: Mapped[WorkloadType] = mapped_column(
        Enum(WorkloadType, values_callable=enum_values, name="workloadtype"), nullable=False
    )
    input_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    expected_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run: Mapped[Run] = relationship(back_populates="task_instances")


class Attempt(Base):
    __tablename__ = "attempts"
    __table_args__ = (
        UniqueConstraint("run_id", "task_instance_id", "model_arm_id", name="uq_attempt_unique"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id"), nullable=False)
    task_instance_id: Mapped[str] = mapped_column(String(36), ForeignKey("task_instances.id"), nullable=False)
    model_arm_id: Mapped[str] = mapped_column(String(36), ForeignKey("model_arms.id"), nullable=False)
    raw_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_response: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    usage_prompt_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    usage_completion_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    usage_total_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cost_usd: Mapped[Decimal] = mapped_column(Numeric(12, 6), nullable=False, default=Decimal("0"))
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run: Mapped[Run] = relationship(back_populates="attempts")


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id: Mapped[str] = mapped_column(String(36), ForeignKey("runs.id"), nullable=False)
    task_instance_id: Mapped[str] = mapped_column(String(36), ForeignKey("task_instances.id"), nullable=False)
    model_arm_id: Mapped[str] = mapped_column(String(36), ForeignKey("model_arms.id"), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run: Mapped[Run] = relationship(back_populates="scores")
