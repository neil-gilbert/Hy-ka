from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from app.services.github_source import github_candidates_dataset_hash, list_merged_pull_requests
from app.utils.dataset_hash import sha256_bytes

DATASET_ROOT = Path(__file__).resolve().parents[3] / "datasets"


@dataclass
class DatasetBundle:
    dataset_ref: str
    dataset_hash: str
    rows: list[dict]


def load_dataset(dataset_ref: str, sampling: dict | None = None) -> DatasetBundle:
    if dataset_ref.startswith("github://"):
        lookback_limit = int((sampling or {}).get("lookback_limit", 30))
        candidates = list_merged_pull_requests(dataset_ref, lookback_limit=lookback_limit)
        rows = [
            {
                "id": f"pr-{candidate.pr_number}",
                "input": {
                    "repo_ref": candidate.repo_ref,
                    "pr_number": candidate.pr_number,
                    "title": candidate.title,
                    "body": candidate.body,
                    "html_url": candidate.html_url,
                    "clone_url": candidate.clone_url,
                    "base_sha": candidate.base_sha,
                    "head_sha": candidate.head_sha,
                    "changed_files": candidate.changed_files,
                    "labels": candidate.labels,
                },
                "expected": {
                    "reference_files": candidate.changed_files,
                    "html_url": candidate.html_url,
                    "merged_at": candidate.merged_at,
                },
            }
            for candidate in candidates
        ]
        if not rows:
            raise ValueError(f"No merged pull requests found for: {dataset_ref}")
        return DatasetBundle(
            dataset_ref=dataset_ref,
            dataset_hash=github_candidates_dataset_hash(candidates),
            rows=rows,
        )

    dataset_path = DATASET_ROOT / dataset_ref
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset does not exist: {dataset_ref}")

    content = dataset_path.read_bytes()
    lines = content.decode("utf-8").strip().splitlines()
    rows = [json.loads(line) for line in lines if line.strip()]
    if not rows:
        raise ValueError(f"Dataset is empty: {dataset_ref}")
    return DatasetBundle(dataset_ref=dataset_ref, dataset_hash=sha256_bytes(content), rows=rows)
