from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import ProviderType, WorkloadType


class ModelArmCreate(BaseModel):
    provider: ProviderType
    model_name: str = Field(min_length=1)
    display_name: Optional[str] = None
    config: dict = Field(default_factory=dict)


class ModelArmResponse(BaseModel):
    id: str
    provider: ProviderType
    model_name: str
    display_name: str
    config: dict

    model_config = ConfigDict(from_attributes=True)


class ExperimentCreate(BaseModel):
    name: str = Field(min_length=1)
    workload_type: WorkloadType
    dataset_ref: str = Field(min_length=1)
    sampling: dict = Field(default_factory=lambda: {"max_tasks": 20})
    budget_usd: Decimal = Field(gt=0)
    seed: int = 42
    model_arms: list[ModelArmCreate] = Field(min_length=1)

    @field_validator("sampling")
    @classmethod
    def validate_sampling(cls, value: dict) -> dict:
        max_tasks = value.get("max_tasks", 1)
        if not isinstance(max_tasks, int) or max_tasks <= 0:
            raise ValueError("sampling.max_tasks must be a positive integer")
        if "sample_percent" in value:
            sample_percent = value["sample_percent"]
            if not isinstance(sample_percent, (int, float)) or sample_percent <= 0 or sample_percent > 100:
                raise ValueError("sampling.sample_percent must be between 0 and 100")
        if "lookback_limit" in value:
            lookback_limit = value["lookback_limit"]
            if not isinstance(lookback_limit, int) or lookback_limit <= 0:
                raise ValueError("sampling.lookback_limit must be a positive integer")
        if "validation_commands" in value:
            commands = value["validation_commands"]
            if not isinstance(commands, list) or not all(isinstance(item, str) and item.strip() for item in commands):
                raise ValueError("sampling.validation_commands must be a list of non-empty strings")
        if "setup_commands" in value:
            commands = value["setup_commands"]
            if not isinstance(commands, list) or not all(isinstance(item, str) and item.strip() for item in commands):
                raise ValueError("sampling.setup_commands must be a list of non-empty strings")
        if "runner_backend" in value:
            runner_backend = str(value["runner_backend"])
            if runner_backend not in {"local", "podman"}:
                raise ValueError("sampling.runner_backend must be one of: local, podman")
        if "runtime_profile" in value:
            runtime_profile = str(value["runtime_profile"])
            if runtime_profile not in {"python", "node", "dotnet", "java", "polyglot"}:
                raise ValueError("sampling.runtime_profile must be one of: python, node, dotnet, java, polyglot")
        if "container_image" in value:
            container_image = value["container_image"]
            if not isinstance(container_image, str) or not container_image.strip():
                raise ValueError("sampling.container_image must be a non-empty string")
        return value


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    workload_type: Optional[WorkloadType] = None
    dataset_ref: Optional[str] = None
    sampling: Optional[dict] = None
    budget_usd: Optional[Decimal] = Field(default=None, gt=0)
    seed: Optional[int] = None
    model_arms: Optional[list[ModelArmCreate]] = None


class ExperimentResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    workload_type: WorkloadType
    dataset_ref: str
    dataset_hash: Optional[str]
    sampling: dict
    budget_usd: Decimal
    seed: int
    model_arms: list[ModelArmResponse]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
