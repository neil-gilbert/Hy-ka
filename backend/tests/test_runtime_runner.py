from pathlib import Path

from app.services.runtime_runner import (
    PodmanWorkspaceRunner,
    build_workspace_runner,
    detect_runtime_profile,
)


def test_detect_runtime_profile_prefers_dotnet(tmp_path):
    (tmp_path / "demo.csproj").write_text("<Project />", encoding="utf-8")
    assert detect_runtime_profile(tmp_path) == "dotnet"


def test_build_workspace_runner_returns_podman_runner(tmp_path):
    runner = build_workspace_runner(
        tmp_path,
        {
            "runner_backend": "podman",
            "runtime_profile": "python",
            "container_image": "python:3.12-slim",
        },
    )
    assert isinstance(runner, PodmanWorkspaceRunner)
    assert runner.metadata()["container_image"] == "python:3.12-slim"


def test_podman_runner_builds_container_command(monkeypatch, tmp_path):
    calls = []

    def fake_run(cmd, capture_output, text, timeout, env):
        calls.append(cmd)

        class Result:
            returncode = 0
            stdout = "ok"
            stderr = ""

        return Result()

    monkeypatch.setattr("app.services.runtime_runner.subprocess.run", fake_run)
    runner = PodmanWorkspaceRunner(
        workspace=Path(tmp_path),
        runtime_profile="python",
        image="python:3.11-slim",
        command_name="podman",
    )
    result = runner.run("python -V", timeout_seconds=30)
    assert result.exit_code == 0
    assert calls[0][0:4] == ["podman", "run", "--rm", "--workdir"]
    assert "python:3.11-slim" in calls[0]
    assert calls[0][-3:] == ["sh", "-lc", "python -V"]
