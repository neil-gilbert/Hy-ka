import subprocess
import sys

from app.services.github_source import GitHubPullRequestCandidate


def _commit_repo(path, message):
    subprocess.run(["git", "init"], cwd=path, check=True, capture_output=True, text=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "ModelEval Test"], cwd=path, check=True)
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-m", message], cwd=path, check=True, capture_output=True, text=True)
    sha = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=path,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    return sha


def test_github_shadow_run_uses_local_clone_and_validation(client, monkeypatch, tmp_path):
    repo_dir = tmp_path / "demo-repo"
    repo_dir.mkdir()
    (repo_dir / "app.py").write_text('def greet():\n    return "broken"\n', encoding="utf-8")
    base_sha = _commit_repo(repo_dir, "base state")

    def fake_candidates(dataset_ref: str, lookback_limit: int = 30):
        assert dataset_ref == "github://acme/demo"
        assert lookback_limit == 1
        return [
            GitHubPullRequestCandidate(
                repo_ref="acme/demo",
                pr_number=17,
                title="Fix greet output",
                body="greet should return fixed",
                html_url="https://github.com/acme/demo/pull/17",
                clone_url=str(repo_dir),
                base_sha=base_sha,
                head_sha="unused",
                merged_at="2026-03-22T00:00:00Z",
                changed_files=["app.py"],
                labels=["bug"],
            )
        ]

    monkeypatch.setattr("app.services.dataset_loader.list_merged_pull_requests", fake_candidates)

    payload = {
        "name": "GitHub Shadow Eval",
        "workload_type": "github_pr_shadow",
        "dataset_ref": "github://acme/demo",
        "sampling": {
            "max_tasks": 1,
            "sample_percent": 100,
            "lookback_limit": 1,
            "runner_backend": "local",
            "validation_commands": [
                f"{sys.executable} -c \"ns={{}}; exec(open('app.py').read(), ns); assert ns['greet']() == 'fixed'\""
            ],
        },
        "budget_usd": "9.00",
        "seed": 13,
        "model_arms": [
            {
                "provider": "mock",
                "model_name": "mock-shadow",
                "display_name": "Mock Shadow",
                "config": {
                    "mock_response": (
                        '{"summary":"fix greet","edits":[{"path":"app.py",'
                        '"content":"def greet():\\n    return \\"fixed\\"\\n"}]}'
                    )
                },
            }
        ],
    }

    create_response = client.post("/experiments", json=payload)
    assert create_response.status_code == 201
    experiment_id = create_response.json()["id"]

    run_response = client.post(f"/experiments/{experiment_id}/runs", json={"failure_threshold": 1.0})
    assert run_response.status_code == 201
    run_id = run_response.json()["id"]
    assert run_response.json()["status"] == "succeeded"

    summary_response = client.get(f"/runs/{run_id}/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()["summary"]
    assert summary["total_attempts"] == 1
    assert summary["tasks"][0]["pr_number"] == 17
    assert summary["models"][0]["quality_avg"] >= 0.9
    assert summary["models"][0]["correctness_avg"] >= 0.9
    assert summary["models"][0]["evaluator_score_avg"] > 0
    assert summary["leaderboards"]["correctness"][0]["display_name"] == "Mock Shadow"

    attempts_response = client.get(f"/runs/{run_id}/attempts")
    assert attempts_response.status_code == 200
    attempts = attempts_response.json()
    assert len(attempts) == 1
    assert attempts[0]["error_message"] is None
