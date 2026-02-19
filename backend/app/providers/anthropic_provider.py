from __future__ import annotations

import time

from anthropic import Anthropic

from app.core.config import get_settings
from app.providers.base import ModelProvider, ProviderResult, ProviderUsage
from app.providers.costs import estimate_cost_usd


class AnthropicProvider(ModelProvider):
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.anthropic_api_key

    def generate(self, task_input: str, model_config: dict) -> ProviderResult:
        started = time.perf_counter()
        if not self._api_key:
            return ProviderResult(
                raw_output=None,
                usage=ProviderUsage(),
                latency_ms=0,
                cost_usd=0,
                raw_response={},
                error="ANTHROPIC_API_KEY is not configured",
            )

        try:
            client = Anthropic(api_key=self._api_key)
            message = client.messages.create(
                model=model_config.get("model_name_override") or model_config.get("model_name", "claude-3-5-haiku-latest"),
                max_tokens=int(model_config.get("max_tokens", 512)),
                temperature=float(model_config.get("temperature", 0.0)),
                system=model_config.get("system_prompt", ""),
                messages=[{"role": "user", "content": task_input}],
            )
            text_parts = [part.text for part in message.content if getattr(part, "type", "") == "text"]
            content = "\n".join(text_parts)
            usage_obj = message.usage
            prompt_tokens = int(getattr(usage_obj, "input_tokens", 0) or 0)
            completion_tokens = int(getattr(usage_obj, "output_tokens", 0) or 0)
            usage = ProviderUsage(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=prompt_tokens + completion_tokens,
            )
            latency_ms = int((time.perf_counter() - started) * 1000)
            cost_usd = estimate_cost_usd(prompt_tokens, completion_tokens, model_config)
            return ProviderResult(
                raw_output=content,
                usage=usage,
                latency_ms=max(latency_ms, 1),
                cost_usd=cost_usd,
                raw_response=message.model_dump(),
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
                error=f"anthropic_error: {exc}",
            )
