from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

import httpx
import typer

app = typer.Typer(no_args_is_help=True)
experiments_app = typer.Typer(no_args_is_help=True)
runs_app = typer.Typer(no_args_is_help=True)
app.add_typer(experiments_app, name="experiments")
app.add_typer(runs_app, name="runs")


def _base_url() -> str:
    return os.getenv("MODELEVAL_API_URL", "http://localhost:8000")


def _request(method: str, path: str, payload: Optional[dict] = None) -> Any:
    url = f"{_base_url().rstrip('/')}{path}"
    with httpx.Client(timeout=300) as client:
        response = client.request(method=method, url=url, json=payload)
    if response.status_code >= 400:
        typer.echo(f"Request failed ({response.status_code}): {response.text}")
        raise typer.Exit(code=1)
    return response.json() if response.content else None


def _print(data: Any) -> None:
    typer.echo(json.dumps(data, indent=2, sort_keys=True, default=str))


@experiments_app.command("list")
def list_experiments() -> None:
    _print(_request("GET", "/experiments"))


@experiments_app.command("get")
def get_experiment(experiment_id: str) -> None:
    _print(_request("GET", f"/experiments/{experiment_id}"))


@experiments_app.command("create")
def create_experiment(file: Path = typer.Option(..., "--file", "-f", exists=True)) -> None:
    payload = json.loads(file.read_text(encoding="utf-8"))
    _print(_request("POST", "/experiments", payload=payload))


@runs_app.command("launch")
def launch_run(
    experiment_id: str,
    seed: Optional[int] = typer.Option(None, "--seed"),
    failure_threshold: float = typer.Option(0.5, "--failure-threshold", min=0.0, max=1.0),
) -> None:
    payload: dict[str, Any] = {"failure_threshold": failure_threshold}
    if seed is not None:
        payload["seed"] = seed
    _print(_request("POST", f"/experiments/{experiment_id}/runs", payload=payload))


@runs_app.command("get")
def get_run(run_id: str) -> None:
    _print(_request("GET", f"/runs/{run_id}"))


@runs_app.command("summary")
def run_summary(run_id: str) -> None:
    _print(_request("GET", f"/runs/{run_id}/summary"))


if __name__ == "__main__":
    app()
