from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import RunStatus


class RunCreate(BaseModel):
    seed: Optional[int] = None
    failure_threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class RunResponse(BaseModel):
    id: str
    experiment_id: str
    status: RunStatus
    seed: int
    failure_threshold: float
    correlation_id: str
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class AttemptResponse(BaseModel):
    id: str
    run_id: str
    task_instance_id: str
    model_arm_id: str
    raw_output: Optional[str]
    usage_prompt_tokens: int
    usage_completion_tokens: int
    usage_total_tokens: int
    latency_ms: int
    cost_usd: Decimal
    error_message: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RunSummaryResponse(BaseModel):
    run_id: str
    status: RunStatus
    summary: Optional[dict]
