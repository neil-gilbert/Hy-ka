from __future__ import annotations

import os
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

from app.core.config import get_settings


RunnerBackend = str
RuntimeProfile = str

DEFAULT_PROFILE = "polyglot"
DEFAULT_IMAGES = {
    "python": "python:3.11-slim",
    "node": "node:20-bookworm-slim",
    "dotnet": "mcr.microsoft.com/dotnet/sdk:8.0",
    "java": "eclipse-temurin:21-jdk",
    "polyglot": "ubuntu:24.04",
}


@dataclass
class RunnerCommandResult:
    command: str
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int


class WorkspaceRunner:
    backend: RunnerBackend
    runtime_profile: RuntimeProfile

    def __init__(self, workspace: Path, runtime_profile: RuntimeProfile) -> None:
        self.workspace = workspace
        self.runtime_profile = runtime_profile

    def run(self, command: str, timeout_seconds: int = 600) -> RunnerCommandResult:
        raise NotImplementedError

    def metadata(self) -> dict[str, str]:
        return {"backend": self.backend, "runtime_profile": self.runtime_profile}


class LocalWorkspaceRunner(WorkspaceRunner):
    backend = "local"

    def run(self, command: str, timeout_seconds: int = 600) -> RunnerCommandResult:
        started = time.perf_counter()
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        completed = subprocess.run(
            command,
            shell=True,
            cwd=self.workspace,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env=env,
        )
        duration_ms = int((time.perf_counter() - started) * 1000)
        return RunnerCommandResult(
            command=command,
            exit_code=completed.returncode,
            stdout=completed.stdout,
            stderr=completed.stderr,
            duration_ms=max(duration_ms, 1),
        )


class PodmanWorkspaceRunner(WorkspaceRunner):
    backend = "podman"

    def __init__(self, workspace: Path, runtime_profile: RuntimeProfile, image: str, command_name: str) -> None:
        super().__init__(workspace, runtime_profile)
        self.image = image
        self.command_name = command_name

    def run(self, command: str, timeout_seconds: int = 600) -> RunnerCommandResult:
        started = time.perf_counter()
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        completed = subprocess.run(
            [
                self.command_name,
                "run",
                "--rm",
                "--workdir",
                "/workspace",
                "-v",
                f"{self.workspace.resolve()}:/workspace",
                self.image,
                "sh",
                "-lc",
                command,
            ],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env=env,
        )
        duration_ms = int((time.perf_counter() - started) * 1000)
        return RunnerCommandResult(
            command=command,
            exit_code=completed.returncode,
            stdout=completed.stdout,
            stderr=completed.stderr,
            duration_ms=max(duration_ms, 1),
        )

    def metadata(self) -> dict[str, str]:
        return {**super().metadata(), "container_image": self.image, "runner_command": self.command_name}


def detect_runtime_profile(workspace: Path) -> RuntimeProfile:
    if any(workspace.glob("*.csproj")) or any(workspace.rglob("*.csproj")):
        return "dotnet"
    if (workspace / "package.json").exists():
        return "node"
    if (workspace / "pyproject.toml").exists() or (workspace / "requirements.txt").exists():
        return "python"
    if (workspace / "pom.xml").exists() or (workspace / "build.gradle").exists():
        return "java"
    return DEFAULT_PROFILE


def _runtime_profile_from_sampling(workspace: Path, sampling: dict) -> RuntimeProfile:
    configured = str(sampling.get("runtime_profile") or "").strip().lower()
    if configured:
        return configured
    return detect_runtime_profile(workspace)


def _image_for_profile(runtime_profile: RuntimeProfile, sampling: dict) -> str:
    if configured := str(sampling.get("container_image") or "").strip():
        return configured
    settings = get_settings()
    configured_image = getattr(settings, f"runner_image_{runtime_profile}", "")
    if configured_image:
        return str(configured_image)
    return DEFAULT_IMAGES.get(runtime_profile, DEFAULT_IMAGES[DEFAULT_PROFILE])


def build_workspace_runner(workspace: Path, sampling: dict) -> WorkspaceRunner:
    settings = get_settings()
    backend = str(sampling.get("runner_backend") or settings.runner_backend).strip().lower()
    runtime_profile = _runtime_profile_from_sampling(workspace, sampling)
    if backend == "podman":
        return PodmanWorkspaceRunner(
            workspace=workspace,
            runtime_profile=runtime_profile,
            image=_image_for_profile(runtime_profile, sampling),
            command_name=settings.runner_command,
        )
    return LocalWorkspaceRunner(workspace=workspace, runtime_profile=runtime_profile)
