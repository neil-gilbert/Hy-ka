from __future__ import annotations

import re

from app.models.entities import Attempt, Score, TaskInstance


WORD_RE = re.compile(r"\w+")


def _as_string(payload: dict | str | list) -> str:
    if isinstance(payload, str):
        return payload
    if isinstance(payload, list):
        return " ".join(str(item) for item in payload)
    if isinstance(payload, dict):
        if "text" in payload:
            return str(payload["text"])
        if "prompt" in payload:
            return str(payload["prompt"])
        return " ".join(f"{k}:{v}" for k, v in payload.items())
    return str(payload)


def _token_overlap(output: str, expected_terms: list[str]) -> float:
    if not expected_terms:
        return 0.0
    output_tokens = {token.lower() for token in WORD_RE.findall(output)}
    expected_tokens = {token.lower() for term in expected_terms for token in WORD_RE.findall(term)}
    if not expected_tokens:
        return 0.0
    hits = len(output_tokens.intersection(expected_tokens))
    return hits / len(expected_tokens)


def score_attempt(task: TaskInstance, attempt: Attempt) -> list[Score]:
    output_text = attempt.raw_output or ""
    expected_payload = task.expected_payload

    expected_terms: list[str] = []
    if isinstance(expected_payload, dict):
        keywords = expected_payload.get("keywords")
        if isinstance(keywords, list):
            expected_terms.extend(str(item) for item in keywords)
        if expected_text := expected_payload.get("text"):
            expected_terms.append(str(expected_text))
        if expected_label := expected_payload.get("label"):
            expected_terms.append(str(expected_label))
    else:
        expected_terms.append(_as_string(expected_payload))

    quality = _token_overlap(output_text, expected_terms)
    pass_value = 1.0 if quality >= 0.6 and attempt.error_message is None else 0.0

    quality_score = Score(
        run_id=attempt.run_id,
        task_instance_id=attempt.task_instance_id,
        model_arm_id=attempt.model_arm_id,
        metric_name="quality",
        value=quality,
        details={"expected_terms": expected_terms},
    )
    pass_score = Score(
        run_id=attempt.run_id,
        task_instance_id=attempt.task_instance_id,
        model_arm_id=attempt.model_arm_id,
        metric_name="pass",
        value=pass_value,
        details={"threshold": 0.6},
    )
    return [quality_score, pass_score]
