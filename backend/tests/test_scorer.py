from app.models.entities import Attempt, TaskInstance, WorkloadType
from app.services.scorer import score_attempt


def test_scorer_is_stable_for_expected_keywords():
    task = TaskInstance(
        id="task-1",
        run_id="run-1",
        experiment_id="exp-1",
        sequence_no=1,
        dataset_item_id="item-1",
        workload_type=WorkloadType.PR_REVIEW,
        input_payload={"prompt": "Analyze risk"},
        expected_payload={"keywords": ["null", "guard", "profile"]},
    )
    attempt = Attempt(
        id="att-1",
        run_id="run-1",
        task_instance_id="task-1",
        model_arm_id="arm-1",
        raw_output="Add a null guard around profile access.",
        raw_response={},
        usage_prompt_tokens=10,
        usage_completion_tokens=20,
        usage_total_tokens=30,
        latency_ms=25,
        cost_usd=0,
    )

    scores = score_attempt(task, attempt)
    assert len(scores) == 2
    quality = next(score for score in scores if score.metric_name == "quality")
    passed = next(score for score in scores if score.metric_name == "pass")

    assert 0.0 <= quality.value <= 1.0
    assert passed.value in {0.0, 1.0}
