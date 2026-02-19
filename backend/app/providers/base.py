from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class ProviderUsage:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


@dataclass
class ProviderResult:
    raw_output: Optional[str]
    usage: ProviderUsage
    latency_ms: int
    cost_usd: float
    raw_response: dict
    error: Optional[str] = None


class ModelProvider(ABC):
    @abstractmethod
    def generate(self, task_input: str, model_config: dict) -> ProviderResult:
        raise NotImplementedError
