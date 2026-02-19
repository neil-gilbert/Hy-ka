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
        default="postgresql+psycopg://modeleval:modeleval@localhost:5432/modeleval"
    )

    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None


default_settings = Settings()


@lru_cache
def get_settings() -> Settings:
    return default_settings
