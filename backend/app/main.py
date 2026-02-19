from __future__ import annotations

import os
import logging

from sqlalchemy import text

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.api.experiments import router as experiments_router
from app.api.runs import router as runs_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import SessionLocal

settings = get_settings()
configure_logging()
logger = logging.getLogger("modeleval.api")

app = FastAPI(title=settings.app_name, version=settings.app_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(experiments_router)
app.include_router(runs_router)


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok", "version": settings.app_version, "commit": settings.app_commit}


@app.on_event("startup")
def startup_check() -> None:
    if os.getenv("MODELEVAL_SKIP_STARTUP_DB_CHECK") == "1":
        return
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required")
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY is not configured")
    if not settings.anthropic_api_key:
        logger.warning("ANTHROPIC_API_KEY is not configured")
    with SessionLocal() as session:
        session.execute(text("SELECT 1"))


@app.exception_handler(ValueError)
def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"error": "validation_error", "details": str(exc)})


@app.exception_handler(Exception)
def generic_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": "internal_error", "details": str(exc)})
