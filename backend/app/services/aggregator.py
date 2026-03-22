from __future__ import annotations

from collections import defaultdict
from statistics import mean

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Attempt, Experiment, ModelArm, Run, RunStatus, Score, TaskInstance


def _percentile(values: list[int], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, int(round((len(ordered) - 1) * pct))))
    return float(ordered[index])


def aggregate_run(db: Session, run: Run, experiment: Experiment) -> dict:
    model_arms = db.scalars(
        select(ModelArm).where(ModelArm.experiment_id == experiment.id).order_by(ModelArm.display_name)
    ).all()
    attempts = db.scalars(select(Attempt).where(Attempt.run_id == run.id)).all()
    scores = db.scalars(select(Score).where(Score.run_id == run.id)).all()
    tasks = db.scalars(select(TaskInstance).where(TaskInstance.run_id == run.id).order_by(TaskInstance.sequence_no)).all()

    by_model_attempts: dict[str, list[Attempt]] = defaultdict(list)
    by_model_scores: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))

    for attempt in attempts:
        by_model_attempts[attempt.model_arm_id].append(attempt)
    for score in scores:
        by_model_scores[score.model_arm_id][score.metric_name].append(score.value)

    model_summaries: list[dict] = []
    total_errors = 0
    total_attempts = len(attempts)

    for arm in model_arms:
        arm_attempts = by_model_attempts.get(arm.id, [])
        arm_scores = by_model_scores.get(arm.id, {})
        latencies = [attempt.latency_ms for attempt in arm_attempts if attempt.latency_ms is not None]
        costs = [float(attempt.cost_usd or 0) for attempt in arm_attempts]
        error_count = sum(1 for attempt in arm_attempts if attempt.error_message)
        total_errors += error_count

        summary = {
            "model_arm_id": arm.id,
            "display_name": arm.display_name,
            "provider": arm.provider.value,
            "model_name": arm.model_name,
            "quality_avg": float(mean(arm_scores.get("quality", [0.0]))),
            "pass_rate": float(mean(arm_scores.get("pass", [0.0]))),
            "correctness_avg": float(mean(arm_scores.get("correctness", [0.0]))),
            "evaluator_score_avg": float(mean(arm_scores.get("evaluator_score", [0.0]))),
            "risk_avg": float(mean(arm_scores.get("risk", [0.0]))),
            "attempt_count": len(arm_attempts),
            "error_count": error_count,
            "latency_p50_ms": _percentile(latencies, 0.50),
            "latency_p95_ms": _percentile(latencies, 0.95),
            "total_cost_usd": round(sum(costs), 6),
        }
        model_summaries.append(summary)

    model_summaries.sort(
        key=lambda row: (-row["evaluator_score_avg"], -row["quality_avg"], row["total_cost_usd"])
    )

    def leaderboard(metric: str, reverse: bool) -> list[dict]:
        return sorted(
            [
                {
                    "model_arm_id": row["model_arm_id"],
                    "display_name": row["display_name"],
                    "provider": row["provider"],
                    "model_name": row["model_name"],
                    "value": row[metric],
                }
                for row in model_summaries
            ],
            key=lambda row: row["value"],
            reverse=reverse,
        )

    failure_ratio = (total_errors / total_attempts) if total_attempts else 1.0
    run.status = RunStatus.FAILED if failure_ratio > run.failure_threshold else RunStatus.SUCCEEDED
    payload = {
        "run_id": run.id,
        "models": model_summaries,
        "tasks": [
            {
                "task_instance_id": task.id,
                "dataset_item_id": task.dataset_item_id,
                "repo_ref": task.input_payload.get("repo_ref"),
                "pr_number": task.input_payload.get("pr_number"),
                "title": task.input_payload.get("title"),
                "html_url": task.input_payload.get("html_url"),
            }
            for task in tasks
        ],
        "leaderboards": {
            "correctness": leaderboard("correctness_avg", True),
            "evaluator_score": leaderboard("evaluator_score_avg", True),
            "speed": leaderboard("latency_p50_ms", False),
            "cost": leaderboard("total_cost_usd", False),
        },
        "failure_ratio": failure_ratio,
        "failure_threshold": run.failure_threshold,
        "total_attempts": total_attempts,
        "total_errors": total_errors,
    }
    run.summary_json = payload
    return payload
