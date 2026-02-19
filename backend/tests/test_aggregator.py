from decimal import Decimal

from app.models.entities import (
    Attempt,
    Experiment,
    ModelArm,
    Organization,
    ProviderType,
    Run,
    Score,
    WorkloadType,
)
from app.services.aggregator import aggregate_run


def test_aggregator_summary_ordering(db_session):
    org = Organization(id="org-1", name="default")
    experiment = Experiment(
        id="exp-1",
        organization_id=org.id,
        name="Eval",
        workload_type=WorkloadType.PR_REVIEW,
        dataset_ref="pr_review/v1.jsonl",
        sampling={"max_tasks": 2},
        budget_usd=Decimal("10.0"),
        seed=1,
    )
    arm_a = ModelArm(
        id="arm-a",
        experiment_id=experiment.id,
        provider=ProviderType.MOCK,
        model_name="mock-a",
        display_name="Model A",
        config={},
    )
    arm_b = ModelArm(
        id="arm-b",
        experiment_id=experiment.id,
        provider=ProviderType.MOCK,
        model_name="mock-b",
        display_name="Model B",
        config={},
    )
    run = Run(id="run-1", experiment_id=experiment.id, seed=1, failure_threshold=1.0)

    db_session.add_all([org, experiment, arm_a, arm_b, run])
    db_session.flush()

    db_session.add_all(
        [
            Attempt(
                id="a-1",
                run_id=run.id,
                task_instance_id="t-1",
                model_arm_id=arm_a.id,
                raw_output="ok",
                raw_response={},
                usage_prompt_tokens=1,
                usage_completion_tokens=1,
                usage_total_tokens=2,
                latency_ms=10,
                cost_usd=Decimal("0.001"),
            ),
            Attempt(
                id="a-2",
                run_id=run.id,
                task_instance_id="t-2",
                model_arm_id=arm_b.id,
                raw_output="ok",
                raw_response={},
                usage_prompt_tokens=1,
                usage_completion_tokens=1,
                usage_total_tokens=2,
                latency_ms=20,
                cost_usd=Decimal("0.001"),
            ),
            Score(
                id="s-1",
                run_id=run.id,
                task_instance_id="t-1",
                model_arm_id=arm_a.id,
                metric_name="quality",
                value=0.9,
                details={},
            ),
            Score(
                id="s-2",
                run_id=run.id,
                task_instance_id="t-1",
                model_arm_id=arm_a.id,
                metric_name="pass",
                value=1.0,
                details={},
            ),
            Score(
                id="s-3",
                run_id=run.id,
                task_instance_id="t-2",
                model_arm_id=arm_b.id,
                metric_name="quality",
                value=0.2,
                details={},
            ),
            Score(
                id="s-4",
                run_id=run.id,
                task_instance_id="t-2",
                model_arm_id=arm_b.id,
                metric_name="pass",
                value=0.0,
                details={},
            ),
        ]
    )
    db_session.commit()

    summary = aggregate_run(db_session, run, experiment)
    assert summary["models"][0]["model_arm_id"] == arm_a.id
    assert summary["models"][1]["model_arm_id"] == arm_b.id
    assert summary["models"][0]["quality_avg"] > summary["models"][1]["quality_avg"]
