from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException

from app.db.session import get_db
from app.models.entities import Attempt, Run
from app.schemas.runs import AttemptResponse, RunResponse, RunSummaryResponse

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("/{run_id}", response_model=RunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)) -> RunResponse:
    run = db.scalar(select(Run).where(Run.id == run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunResponse.model_validate(run)


@router.get("/{run_id}/summary", response_model=RunSummaryResponse)
def get_run_summary(run_id: str, db: Session = Depends(get_db)) -> RunSummaryResponse:
    run = db.scalar(select(Run).where(Run.id == run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunSummaryResponse(run_id=run.id, status=run.status, summary=run.summary_json)


@router.get("/{run_id}/attempts", response_model=list[AttemptResponse])
def list_attempts(
    run_id: str,
    model_arm_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> list[AttemptResponse]:
    run = db.scalar(select(Run).where(Run.id == run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    stmt = select(Attempt).where(Attempt.run_id == run_id).order_by(Attempt.created_at.asc())
    if model_arm_id:
        stmt = stmt.where(Attempt.model_arm_id == model_arm_id)
    attempts = db.scalars(stmt).all()
    return [AttemptResponse.model_validate(attempt) for attempt in attempts]
