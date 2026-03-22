from __future__ import annotations

import hashlib
import json
import time

from app.providers.base import ModelProvider, ProviderResult, ProviderUsage
from app.providers.costs import estimate_cost_usd


class MockProvider(ModelProvider):
    def generate(self, task_input: str, model_config: dict) -> ProviderResult:
        started = time.perf_counter()
        if mock_error := model_config.get("mock_error"):
            return ProviderResult(
                raw_output=None,
                usage=ProviderUsage(),
                latency_ms=1,
                cost_usd=0,
                raw_response={"provider": "mock", "echo": json.dumps(model_config)},
                error=str(mock_error),
            )
        digest = hashlib.sha256(task_input.encode("utf-8")).hexdigest()[:8]
        response = str(model_config.get("mock_response") or f"mock-response:{digest}:{task_input[:140]}")
        prompt_tokens = max(1, len(task_input.split()))
        completion_tokens = max(1, len(response.split()))
        usage = ProviderUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
        )
        latency_ms = int((time.perf_counter() - started) * 1000)
        cost_usd = estimate_cost_usd(prompt_tokens, completion_tokens, model_config)
        return ProviderResult(
            raw_output=response,
            usage=usage,
            latency_ms=max(latency_ms, 1),
            cost_usd=cost_usd,
            raw_response={"provider": "mock", "echo": json.dumps(model_config)},
            error=None,
        )
