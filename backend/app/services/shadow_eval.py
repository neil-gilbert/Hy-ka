from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from app.models.entities import ModelArm, TaskInstance
from app.providers.base import ProviderResult, ProviderUsage
from app.providers.factory import get_provider
from app.services.github_source import build_authenticated_clone_url
from app.services.runtime_runner import RunnerCommandResult, build_workspace_runner


def _clone_workspace(clone_url: str, base_sha: str) -> Path:
    workspace = Path(tempfile.mkdtemp(prefix="modeleval-shadow-"))
    auth_clone_url = build_authenticated_clone_url(clone_url)
    env = os.environ.copy()
    env["GIT_TERMINAL_PROMPT"] = "0"
    try:
        subprocess.run(
            ["git", "clone", "--quiet", auth_clone_url, str(workspace)],
            cwd=workspace.parent,
            capture_output=True,
            text=True,
            check=True,
            env=env,
        )
        subprocess.run(
            ["git", "checkout", "--quiet", base_sha],
            cwd=workspace,
            capture_output=True,
            text=True,
            check=True,
            env=env,
        )
        return workspace
    except Exception:
        shutil.rmtree(workspace, ignore_errors=True)
        raise


def _truncate_text(value: str, max_chars: int) -> str:
    if len(value) <= max_chars:
        return value
    return value[: max_chars - 17] + "\n...[truncated]"


def _collect_file_context(workspace: Path, changed_files: list[str], max_files: int, max_chars: int) -> str:
    sections: list[str] = []
    remaining = max_chars
    for path_str in changed_files[:max_files]:
        path = workspace / path_str
        if not path.exists() or not path.is_file():
            sections.append(f"FILE: {path_str}\n<missing at base commit>")
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        chunk = f"FILE: {path_str}\n{_truncate_text(content, min(remaining, 6000))}"
        sections.append(chunk)
        remaining -= len(chunk)
        if remaining <= 0:
            break
    return "\n\n".join(sections)


def build_solver_prompt(task: TaskInstance, workspace: Path, model_config: dict) -> str:
    input_payload = task.input_payload
    changed_files = [str(item) for item in input_payload.get("changed_files", [])]
    validation_commands = [str(item) for item in input_payload.get("validation_commands", [])]
    context = _collect_file_context(
        workspace,
        changed_files=changed_files,
        max_files=int(model_config.get("max_context_files", 4)),
        max_chars=int(model_config.get("max_context_chars", 16000)),
    )
    body = str(input_payload.get("body") or "").strip()
    prompt_body = body if body else "No PR body was provided."
    return (
        "You are solving a GitHub pull-request shadow task.\n"
        "Infer the intended fix from the task description and repository context.\n"
        "Do not ask questions. Do not describe what the original human patch did.\n"
        "Return only JSON using this schema:\n"
        '{"summary": "short summary", "edits": [{"path": "relative/path", "content": "full file contents"}]}\n\n'
        f"Repository: {input_payload.get('repo_ref')}\n"
        f"Pull Request: #{input_payload.get('pr_number')}\n"
        f"Title: {input_payload.get('title')}\n"
        f"Problem statement:\n{prompt_body}\n\n"
        f"Candidate files:\n{json.dumps(changed_files)}\n\n"
        f"Validation commands:\n{json.dumps(validation_commands)}\n\n"
        f"Base file context:\n{context}\n"
    )


def _extract_json_blob(text: str) -> dict:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1]
        stripped = stripped.rsplit("```", 1)[0]
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Model response did not contain a JSON object")
    return json.loads(stripped[start : end + 1])


def _apply_edits(workspace: Path, payload: dict) -> list[str]:
    edits = payload.get("edits", [])
    if not isinstance(edits, list):
        raise ValueError("Solver response edits must be a list")
    changed_paths: list[str] = []
    for row in edits:
        if not isinstance(row, dict):
            raise ValueError("Solver edit entries must be objects")
        path_str = str(row.get("path") or "").strip()
        if not path_str:
            raise ValueError("Solver edit path is required")
        content = row.get("content")
        if not isinstance(content, str):
            raise ValueError("Solver edit content must be a string")
        target = workspace / path_str
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        changed_paths.append(path_str)
    return changed_paths


def _git_diff(workspace: Path) -> str:
    result = subprocess.run(
        ["git", "diff", "--no-ext-diff", "--unified=3"],
        cwd=workspace,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout


def _runner_rows(results: list[RunnerCommandResult]) -> list[dict]:
    return [
        {
            "command": row.command,
            "exit_code": row.exit_code,
            "stdout": row.stdout,
            "stderr": row.stderr,
            "duration_ms": row.duration_ms,
        }
        for row in results
    ]


def run_shadow_attempt(task: TaskInstance, arm: ModelArm) -> ProviderResult:
    input_payload = task.input_payload
    workspace = _clone_workspace(str(input_payload["clone_url"]), str(input_payload["base_sha"]))
    try:
        runner = build_workspace_runner(workspace, input_payload)
        setup_results = [
            runner.run(command, timeout_seconds=int(input_payload.get("command_timeout_seconds", 600)))
            for command in [str(item) for item in input_payload.get("setup_commands", [])]
        ]
        prompt = build_solver_prompt(task, workspace, arm.config)
        provider = get_provider(arm.provider)
        provider_result = provider.generate(
            task_input=prompt,
            model_config={**arm.config, "model_name": arm.model_name},
        )
        metadata = {
            "task": {
                "repo_ref": input_payload.get("repo_ref"),
                "pr_number": input_payload.get("pr_number"),
                "title": input_payload.get("title"),
                "html_url": input_payload.get("html_url"),
            },
            "solver_prompt": prompt,
            "runner": runner.metadata(),
            "setup": _runner_rows(setup_results),
            "validation": [],
            "edited_files": [],
            "git_diff": "",
        }
        setup_error = next((row for row in setup_results if row.exit_code != 0), None)
        if setup_error is not None:
            return ProviderResult(
                raw_output=None,
                usage=ProviderUsage(),
                latency_ms=1,
                cost_usd=0,
                raw_response=metadata,
                error=f"shadow_eval_setup_error: command failed: {setup_error.command}",
            )
        if provider_result.error:
            provider_result.raw_response = {**provider_result.raw_response, **metadata}
            return provider_result

        parsed = _extract_json_blob(provider_result.raw_output or "")
        edited_files = _apply_edits(workspace, parsed)
        validation_results = [
            runner.run(command, timeout_seconds=int(input_payload.get("command_timeout_seconds", 600)))
            for command in [str(item) for item in input_payload.get("validation_commands", [])]
        ]
        metadata["validation"] = _runner_rows(validation_results)
        metadata["edited_files"] = edited_files
        metadata["git_diff"] = _git_diff(workspace)
        metadata["summary"] = parsed.get("summary")
        provider_result.raw_response = {**provider_result.raw_response, **metadata}
        return provider_result
    except Exception as exc:  # noqa: BLE001
        return ProviderResult(
            raw_output=None,
            usage=provider_result.usage if "provider_result" in locals() else ProviderUsage(),
            latency_ms=provider_result.latency_ms if "provider_result" in locals() else 1,
            cost_usd=provider_result.cost_usd if "provider_result" in locals() else 0,
            raw_response={"task": input_payload, "validation": [], "edited_files": [], "git_diff": ""},
            error=f"shadow_eval_error: {exc}",
        )
    finally:
        shutil.rmtree(workspace, ignore_errors=True)
