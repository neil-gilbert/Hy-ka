from app.models.entities import Experiment, Run, WorkloadType
from app.services.dataset_loader import DatasetBundle
from app.services.planner import plan_task_instances


def test_planner_is_deterministic():
    experiment = Experiment(
        id="exp-1",
        organization_id="org-1",
        name="determinism",
        workload_type=WorkloadType.PR_REVIEW,
        dataset_ref="pr_review/v1.jsonl",
        sampling={"max_tasks": 2},
        budget_usd=10,
        seed=17,
    )
    rows = [
        {"id": "a", "input": {"prompt": "A"}, "expected": {"keywords": ["A"]}},
        {"id": "b", "input": {"prompt": "B"}, "expected": {"keywords": ["B"]}},
        {"id": "c", "input": {"prompt": "C"}, "expected": {"keywords": ["C"]}},
    ]
    dataset = DatasetBundle(dataset_ref="test", dataset_hash="hash", rows=rows)

    run_1 = Run(id="run-1", experiment_id=experiment.id, seed=17, failure_threshold=0.5)
    run_2 = Run(id="run-2", experiment_id=experiment.id, seed=17, failure_threshold=0.5)

    task_ids_1 = [task.dataset_item_id for task in plan_task_instances(experiment, run_1, dataset)]
    task_ids_2 = [task.dataset_item_id for task in plan_task_instances(experiment, run_2, dataset)]

    assert task_ids_1 == task_ids_2
