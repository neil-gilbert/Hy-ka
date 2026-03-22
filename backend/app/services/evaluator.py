from __future__ import annotations

import json

from app.core.config import get_settings
from app.models.entities import Attempt, ProviderType, Score, TaskInstance
from app.providers.factory import get_provider


def _json_blob(text: str) -> dict:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1]
        stripped = stripped.rsplit("```", 1)[0]
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Evaluator response did not contain JSON")
    return json.loads(stripped[start : end + 1])


def _validation_score(attempt: Attempt) -> float:
    validation = attempt.raw_response.get("validation", []) if isinstance(attempt.raw_response, dict) else []
    if not validation:
        return 0.0 if attempt.error_message else 1.0
    passed = sum(1 for row in validation if int(row.get("exit_code", 1)) == 0)
    return passed / len(validation)


def _file_overlap(task: TaskInstance, attempt: Attempt) -> float:
    expected_files = task.expected_payload.get("reference_files", []) if isinstance(task.expected_payload, dict) else []
    attempt_files = attempt.raw_response.get("edited_files", []) if isinstance(attempt.raw_response, dict) else []
    expected = {str(item) for item in expected_files}
    actual = {str(item) for item in attempt_files}
    if not expected:
        return 0.0
    return len(expected.intersection(actual)) / len(expected)


def _heuristic_scores(task: TaskInstance, attempt: Attempt) -> tuple[float, float, float, str]:
    validation_score = _validation_score(attempt)
    overlap = _file_overlap(task, attempt)
    correctness = max(0.0, min(1.0, (validation_score * 0.75) + (overlap * 0.25)))
    quality = max(0.0, min(1.0, (correctness * 0.7) + (0.3 if attempt.raw_response.get("git_diff") else 0.0)))
    risk = max(0.0, min(1.0, 1.0 - ((validation_score * 0.6) + (overlap * 0.2) + 0.2)))
    summary = "heuristic fallback evaluator"
    return correctness, quality, risk, summary


def evaluate_attempt(task: TaskInstance, attempt: Attempt) -> list[Score]:
    if task.workload_type.value != "github_pr_shadow":
        return []

    correctness, quality, risk, summary = _heuristic_scores(task, attempt)
    settings = get_settings()
    if settings.evaluator_provider and settings.evaluator_model and attempt.error_message is None:
        try:
            provider = get_provider(ProviderType(settings.evaluator_provider))
            prompt = (
                "Evaluate the following code-change attempt. Return only JSON with keys "
                '{"correctness": number, "quality": number, "risk": number, "summary": string}.\n\n'
                f"Task title: {task.input_payload.get('title')}\n"
                f"Task body: {task.input_payload.get('body')}\n"
                f"Edited files: {json.dumps(attempt.raw_response.get('edited_files', []))}\n"
                f"Validation: {json.dumps(attempt.raw_response.get('validation', []))}\n"
                f"Patch:\n{attempt.raw_response.get('git_diff', '')}\n"
            )
            result = provider.generate(
                task_input=prompt,
                model_config={"model_name": settings.evaluator_model, "temperature": 0.0},
            )
            if not result.error and result.raw_output:
                parsed = _json_blob(result.raw_output)
                correctness = float(parsed.get("correctness", correctness))
                quality = float(parsed.get("quality", quality))
                risk = float(parsed.get("risk", risk))
                summary = str(parsed.get("summary", summary))
        except Exception:
            pass

    return [
        Score(
            run_id=attempt.run_id,
            task_instance_id=attempt.task_instance_id,
            model_arm_id=attempt.model_arm_id,
            metric_name="correctness",
            value=max(0.0, min(correctness, 1.0)),
            details={"summary": summary},
        ),
        Score(
            run_id=attempt.run_id,
            task_instance_id=attempt.task_instance_id,
            model_arm_id=attempt.model_arm_id,
            metric_name="evaluator_score",
            value=max(0.0, min(quality, 1.0)),
            details={"summary": summary},
        ),
        Score(
            run_id=attempt.run_id,
            task_instance_id=attempt.task_instance_id,
            model_arm_id=attempt.model_arm_id,
            metric_name="risk",
            value=max(0.0, min(risk, 1.0)),
            details={"summary": summary},
        ),
    ]
