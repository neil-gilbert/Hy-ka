from functools import lru_cache
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@lru_cache
def get_engine():
    settings = get_settings()
    return create_engine(settings.database_url, future=True, pool_pre_ping=True)


@lru_cache
def get_session_local():
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
