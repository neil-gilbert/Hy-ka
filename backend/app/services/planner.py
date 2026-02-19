from __future__ import annotations

import random

from app.models.entities import Experiment, Run, TaskInstance
from app.services.dataset_loader import DatasetBundle


SUPPORTED_WORKLOADS = {"pr_review", "ci_triage"}


def plan_task_instances(experiment: Experiment, run: Run, dataset: DatasetBundle) -> list[TaskInstance]:
    if experiment.workload_type.value not in SUPPORTED_WORKLOADS:
        raise ValueError(f"Unsupported workload_type: {experiment.workload_type.value}")

    max_tasks = int(experiment.sampling.get("max_tasks", len(dataset.rows)))
    max_tasks = min(max_tasks, len(dataset.rows))
    rng = random.Random(run.seed)
    candidate_indexes = list(range(len(dataset.rows)))
    if max_tasks < len(candidate_indexes):
        selected_indexes = rng.sample(candidate_indexes, k=max_tasks)
    else:
        selected_indexes = candidate_indexes

    tasks: list[TaskInstance] = []
    for sequence_no, row_index in enumerate(selected_indexes, start=1):
        row = dataset.rows[row_index]
        task = TaskInstance(
            run_id=run.id,
            experiment_id=experiment.id,
            sequence_no=sequence_no,
            dataset_item_id=str(row.get("id", f"row-{row_index}")),
            workload_type=experiment.workload_type,
            input_payload=row.get("input", {}),
            expected_payload=row.get("expected", {}),
        )
        tasks.append(task)

    return tasks
