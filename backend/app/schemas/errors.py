from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None
