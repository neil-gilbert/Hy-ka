from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.session import get_db
from app.models.entities import Experiment, ModelArm, Run
from app.schemas.experiments import (
    ExperimentCreate,
    ExperimentResponse,
    ExperimentUpdate,
    ModelArmResponse,
)
from app.schemas.runs import RunCreate, RunResponse
from app.services.execution import ExecutionError, execute_run
from app.services.organizations import get_or_create_default_org
from app.services.planner import SUPPORTED_WORKLOADS

router = APIRouter(prefix="/experiments", tags=["experiments"])


def _to_experiment_response(experiment: Experiment) -> ExperimentResponse:
    arms = [
        ModelArmResponse(
            id=arm.id,
            provider=arm.provider,
            model_name=arm.model_name,
            display_name=arm.display_name,
            config=arm.config,
        )
        for arm in sorted(experiment.model_arms, key=lambda a: a.display_name)
    ]
    return ExperimentResponse(
        id=experiment.id,
        organization_id=experiment.organization_id,
        name=experiment.name,
        workload_type=experiment.workload_type,
        dataset_ref=experiment.dataset_ref,
        dataset_hash=experiment.dataset_hash,
        sampling=experiment.sampling,
        budget_usd=experiment.budget_usd,
        seed=experiment.seed,
        model_arms=arms,
        created_at=experiment.created_at,
        updated_at=experiment.updated_at,
    )


@router.post("", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED)
def create_experiment(payload: ExperimentCreate, db: Session = Depends(get_db)) -> ExperimentResponse:
    if payload.workload_type.value not in SUPPORTED_WORKLOADS:
        raise HTTPException(status_code=400, detail="Unsupported workload_type")
    if not payload.model_arms:
        raise HTTPException(status_code=400, detail="At least one model arm is required")

    organization = get_or_create_default_org(db)
    experiment = Experiment(
        organization_id=organization.id,
        name=payload.name,
        workload_type=payload.workload_type,
        dataset_ref=payload.dataset_ref,
        sampling=payload.sampling,
        budget_usd=payload.budget_usd,
        seed=payload.seed,
    )
    db.add(experiment)
    db.flush()

    for arm_payload in payload.model_arms:
        arm = ModelArm(
            experiment_id=experiment.id,
            provider=arm_payload.provider,
            model_name=arm_payload.model_name,
            display_name=arm_payload.display_name or arm_payload.model_name,
            config=arm_payload.config,
        )
        db.add(arm)

    db.commit()
    db.refresh(experiment)
    experiment = db.scalar(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .where(Experiment.id == experiment.id)
    )
    return _to_experiment_response(experiment)


@router.get("", response_model=list[ExperimentResponse])
def list_experiments(db: Session = Depends(get_db)) -> list[ExperimentResponse]:
    experiments = db.scalars(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .order_by(Experiment.created_at.desc())
    ).all()
    return [_to_experiment_response(experiment) for experiment in experiments]


@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)) -> ExperimentResponse:
    experiment = db.scalar(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .where(Experiment.id == experiment_id)
    )
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return _to_experiment_response(experiment)


@router.patch("/{experiment_id}", response_model=ExperimentResponse)
def update_experiment(
    experiment_id: str, payload: ExperimentUpdate, db: Session = Depends(get_db)
) -> ExperimentResponse:
    experiment = db.scalar(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .where(Experiment.id == experiment_id)
    )
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if payload.workload_type and payload.workload_type.value not in SUPPORTED_WORKLOADS:
        raise HTTPException(status_code=400, detail="Unsupported workload_type")

    if payload.name is not None:
        experiment.name = payload.name
    if payload.dataset_ref is not None:
        experiment.dataset_ref = payload.dataset_ref
    if payload.sampling is not None:
        experiment.sampling = payload.sampling
    if payload.budget_usd is not None:
        experiment.budget_usd = payload.budget_usd
    if payload.seed is not None:
        experiment.seed = payload.seed

    if payload.workload_type is not None:
        experiment.workload_type = payload.workload_type

    if payload.model_arms is not None:
        experiment.model_arms.clear()
        db.flush()
        for arm_payload in payload.model_arms:
            arm = ModelArm(
                experiment_id=experiment.id,
                provider=arm_payload.provider,
                model_name=arm_payload.model_name,
                display_name=arm_payload.display_name or arm_payload.model_name,
                config=arm_payload.config,
            )
            db.add(arm)

    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    experiment = db.scalar(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .where(Experiment.id == experiment.id)
    )
    return _to_experiment_response(experiment)


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(experiment_id: str, db: Session = Depends(get_db)) -> None:
    experiment = db.scalar(select(Experiment).where(Experiment.id == experiment_id))
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(experiment)
    db.commit()


@router.post("/{experiment_id}/runs", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
def launch_run(experiment_id: str, payload: RunCreate, db: Session = Depends(get_db)) -> RunResponse:
    experiment = db.scalar(
        select(Experiment)
        .options(selectinload(Experiment.model_arms))
        .where(Experiment.id == experiment_id)
    )
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    run = Run(
        experiment_id=experiment.id,
        seed=payload.seed if payload.seed is not None else experiment.seed,
        failure_threshold=payload.failure_threshold,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    try:
        run = execute_run(db, run, experiment, list(experiment.model_arms))
    except ExecutionError as exc:
        raise HTTPException(status_code=500, detail=f"Run execution failed: {exc}") from exc

    return RunResponse.model_validate(run)
