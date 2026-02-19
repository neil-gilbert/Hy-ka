from app.providers.mock import MockProvider


def test_mock_provider_contract():
    provider = MockProvider()
    result = provider.generate(
        task_input="Review this snippet for null guard",
        model_config={"input_cost_per_1k": 0.001, "output_cost_per_1k": 0.002},
    )
    assert result.error is None
    assert result.raw_output is not None
    assert result.usage.prompt_tokens > 0
    assert result.usage.completion_tokens > 0
    assert result.usage.total_tokens == result.usage.prompt_tokens + result.usage.completion_tokens
    assert result.latency_ms >= 1
    assert result.cost_usd >= 0
