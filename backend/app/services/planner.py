from __future__ import annotations

import random

from app.models.entities import Experiment, Run, TaskInstance
from app.services.dataset_loader import DatasetBundle


SUPPORTED_WORKLOADS = {"pr_review", "ci_triage", "github_pr_shadow"}


def plan_task_instances(experiment: Experiment, run: Run, dataset: DatasetBundle) -> list[TaskInstance]:
    if experiment.workload_type.value not in SUPPORTED_WORKLOADS:
        raise ValueError(f"Unsupported workload_type: {experiment.workload_type.value}")

    sample_percent = float(experiment.sampling.get("sample_percent", 100))
    sample_percent = max(0.0, min(sample_percent, 100.0))
    percent_count = max(1, int(round(len(dataset.rows) * (sample_percent / 100.0)))) if dataset.rows else 0
    max_tasks = int(experiment.sampling.get("max_tasks", percent_count or len(dataset.rows)))
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
        input_payload = dict(row.get("input", {}))
        if experiment.workload_type.value == "github_pr_shadow":
            input_payload["validation_commands"] = [
                str(item) for item in experiment.sampling.get("validation_commands", [])
            ]
            input_payload["setup_commands"] = [
                str(item) for item in experiment.sampling.get("setup_commands", [])
            ]
            if experiment.sampling.get("runner_backend"):
                input_payload["runner_backend"] = str(experiment.sampling.get("runner_backend"))
            if experiment.sampling.get("runtime_profile"):
                input_payload["runtime_profile"] = str(experiment.sampling.get("runtime_profile"))
            if experiment.sampling.get("container_image"):
                input_payload["container_image"] = str(experiment.sampling.get("container_image"))
        task = TaskInstance(
            run_id=run.id,
            experiment_id=experiment.id,
            sequence_no=sequence_no,
            dataset_item_id=str(row.get("id", f"row-{row_index}")),
            workload_type=experiment.workload_type,
            input_payload=input_payload,
            expected_payload=row.get("expected", {}),
        )
        tasks.append(task)

    return tasks
