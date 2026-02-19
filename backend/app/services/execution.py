from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.entities import Attempt, Experiment, ModelArm, Run, RunStatus
from app.providers.factory import get_provider
from app.services.aggregator import aggregate_run
from app.services.dataset_loader import load_dataset
from app.services.planner import plan_task_instances
from app.services.scorer import score_attempt

logger = logging.getLogger("modeleval.execution")


class ExecutionError(RuntimeError):
    pass


def _task_prompt(input_payload: dict) -> str:
    if isinstance(input_payload, dict):
        if "prompt" in input_payload:
            return str(input_payload["prompt"])
        return json.dumps(input_payload)
    return str(input_payload)


def execute_run(db: Session, run: Run, experiment: Experiment, model_arms: list[ModelArm]) -> Run:
    run.status = RunStatus.RUNNING
    run.started_at = datetime.now(timezone.utc)
    db.add(run)
    db.commit()
    db.refresh(run)
    logger.info("run_started", extra={"correlation_id": run.correlation_id})

    try:
        dataset = load_dataset(experiment.dataset_ref)
        experiment.dataset_hash = dataset.dataset_hash
        db.add(experiment)
        db.commit()

        tasks = plan_task_instances(experiment, run, dataset)
        for task in tasks:
            db.add(task)
        db.commit()

        for task in tasks:
            task_input = _task_prompt(task.input_payload)
            for arm in model_arms:
                provider = get_provider(arm.provider)
                config = {**arm.config, "model_name": arm.model_name}
                result = provider.generate(task_input=task_input, model_config=config)

                attempt = Attempt(
                    run_id=run.id,
                    task_instance_id=task.id,
                    model_arm_id=arm.id,
                    raw_output=result.raw_output,
                    raw_response=result.raw_response,
                    usage_prompt_tokens=result.usage.prompt_tokens,
                    usage_completion_tokens=result.usage.completion_tokens,
                    usage_total_tokens=result.usage.total_tokens,
                    latency_ms=result.latency_ms,
                    cost_usd=Decimal(str(result.cost_usd)),
                    error_message=result.error,
                )
                db.add(attempt)
                db.flush()

                scores = score_attempt(task, attempt)
                for score in scores:
                    db.add(score)

            db.commit()

        aggregate_run(db, run, experiment)
        run.completed_at = datetime.now(timezone.utc)
        db.add(run)
        db.commit()
        db.refresh(run)
        logger.info("run_completed", extra={"correlation_id": run.correlation_id})
        return run
    except Exception as exc:  # noqa: BLE001
        run.status = RunStatus.FAILED
        run.error_message = str(exc)
        run.completed_at = datetime.now(timezone.utc)
        db.add(run)
        db.commit()
        db.refresh(run)
        logger.error("run_failed", extra={"correlation_id": run.correlation_id})
        raise ExecutionError(str(exc)) from exc
