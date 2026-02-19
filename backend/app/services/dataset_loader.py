from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from app.utils.dataset_hash import sha256_bytes

DATASET_ROOT = Path(__file__).resolve().parents[3] / "datasets"


@dataclass
class DatasetBundle:
    dataset_ref: str
    dataset_hash: str
    rows: list[dict]


def load_dataset(dataset_ref: str) -> DatasetBundle:
    dataset_path = DATASET_ROOT / dataset_ref
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset does not exist: {dataset_ref}")

    content = dataset_path.read_bytes()
    lines = content.decode("utf-8").strip().splitlines()
    rows = [json.loads(line) for line in lines if line.strip()]
    if not rows:
        raise ValueError(f"Dataset is empty: {dataset_ref}")
    return DatasetBundle(dataset_ref=dataset_ref, dataset_hash=sha256_bytes(content), rows=rows)
