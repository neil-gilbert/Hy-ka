from app.models.entities import ProviderType
from app.providers.azure_openai_provider import AzureOpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base import ModelProvider
from app.providers.mock import MockProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.openrouter_provider import OpenRouterProvider


def get_provider(provider_type: ProviderType) -> ModelProvider:
    if provider_type == ProviderType.OPENAI:
        return OpenAIProvider()
    if provider_type == ProviderType.ANTHROPIC:
        return AnthropicProvider()
    if provider_type == ProviderType.AZURE_OPENAI:
        return AzureOpenAIProvider()
    if provider_type == ProviderType.OPENROUTER:
        return OpenRouterProvider()
    return MockProvider()
