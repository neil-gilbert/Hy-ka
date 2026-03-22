from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "ModelEval"
    app_version: str = "0.1.0"
    app_commit: str = "dev"
    cors_origins: str = "http://localhost:5173"

    database_url: str = Field(
        default="mysql+pymysql://modeleval:modeleval@localhost:3306/modeleval"
    )

    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    azure_openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    azure_openai_api_version: str = "2024-10-21"
    openrouter_api_key: Optional[str] = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    github_token: Optional[str] = None
    github_api_url: str = "https://api.github.com"
    evaluator_provider: Optional[str] = None
    evaluator_model: Optional[str] = None
    runner_backend: str = "local"
    runner_command: str = "podman"
    runner_image_python: str = "python:3.11-slim"
    runner_image_node: str = "node:20-bookworm-slim"
    runner_image_dotnet: str = "mcr.microsoft.com/dotnet/sdk:8.0"
    runner_image_java: str = "eclipse-temurin:21-jdk"
    runner_image_polyglot: str = "ubuntu:24.04"


default_settings = Settings()


@lru_cache
def get_settings() -> Settings:
    return default_settings
