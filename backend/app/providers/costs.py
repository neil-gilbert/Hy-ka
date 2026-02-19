from __future__ import annotations


def estimate_cost_usd(prompt_tokens: int, completion_tokens: int, model_config: dict) -> float:
    input_cost_per_1k = float(model_config.get("input_cost_per_1k", 0.0))
    output_cost_per_1k = float(model_config.get("output_cost_per_1k", 0.0))
    return (prompt_tokens / 1000.0 * input_cost_per_1k) + (
        completion_tokens / 1000.0 * output_cost_per_1k
    )
