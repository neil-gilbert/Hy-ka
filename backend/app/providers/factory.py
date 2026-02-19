from app.models.entities import ProviderType
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base import ModelProvider
from app.providers.mock import MockProvider
from app.providers.openai_provider import OpenAIProvider


def get_provider(provider_type: ProviderType) -> ModelProvider:
    if provider_type == ProviderType.OPENAI:
        return OpenAIProvider()
    if provider_type == ProviderType.ANTHROPIC:
        return AnthropicProvider()
    return MockProvider()
