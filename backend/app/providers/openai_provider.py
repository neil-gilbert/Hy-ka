from __future__ import annotations

import time

from openai import OpenAI

from app.core.config import get_settings
from app.providers.base import ModelProvider, ProviderResult, ProviderUsage
from app.providers.costs import estimate_cost_usd


class OpenAIProvider(ModelProvider):
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.openai_api_key

    def generate(self, task_input: str, model_config: dict) -> ProviderResult:
        started = time.perf_counter()
        if not self._api_key:
            return ProviderResult(
                raw_output=None,
                usage=ProviderUsage(),
                latency_ms=0,
                cost_usd=0,
                raw_response={},
                error="OPENAI_API_KEY is not configured",
            )

        try:
            client = OpenAI(api_key=self._api_key)
            messages = [{"role": "user", "content": task_input}]
            if system_prompt := model_config.get("system_prompt"):
                messages.insert(0, {"role": "system", "content": system_prompt})

            completion = client.chat.completions.create(
                model=model_config.get("model_name_override") or model_config.get("model_name", "gpt-4o-mini"),
                messages=messages,
                temperature=float(model_config.get("temperature", 0.0)),
            )
            content = completion.choices[0].message.content if completion.choices else ""
            usage_obj = completion.usage
            prompt_tokens = int(getattr(usage_obj, "prompt_tokens", 0) or 0)
            completion_tokens = int(getattr(usage_obj, "completion_tokens", 0) or 0)
            total_tokens = int(getattr(usage_obj, "total_tokens", prompt_tokens + completion_tokens) or 0)
            usage = ProviderUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
            )
            latency_ms = int((time.perf_counter() - started) * 1000)
            cost_usd = estimate_cost_usd(prompt_tokens, completion_tokens, model_config)
            return ProviderResult(
                raw_output=content,
                usage=usage,
                latency_ms=max(latency_ms, 1),
                cost_usd=cost_usd,
                raw_response=completion.model_dump(),
                error=None,
            )
        except Exception as exc:  # noqa: BLE001
            latency_ms = int((time.perf_counter() - started) * 1000)
            return ProviderResult(
                raw_output=None,
                usage=ProviderUsage(),
                latency_ms=max(latency_ms, 1),
                cost_usd=0,
                raw_response={},
                error=f"openai_error: {exc}",
            )
