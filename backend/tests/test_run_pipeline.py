def _sample_payload() -> dict:
    return {
        "name": "CI Triage Eval",
        "workload_type": "ci_triage",
        "dataset_ref": "ci_triage/v1.jsonl",
        "sampling": {"max_tasks": 2},
        "budget_usd": "8.00",
        "seed": 12,
        "model_arms": [
            {
                "provider": "mock",
                "model_name": "mock-a",
                "display_name": "Mock A",
                "config": {"input_cost_per_1k": 0.001, "output_cost_per_1k": 0.002},
            },
            {
                "provider": "mock",
                "model_name": "mock-b",
                "display_name": "Mock B",
                "config": {"input_cost_per_1k": 0.001, "output_cost_per_1k": 0.002},
            },
        ],
    }


def test_sync_run_execution(client):
    create_response = client.post("/experiments", json=_sample_payload())
    assert create_response.status_code == 201
    experiment_id = create_response.json()["id"]

    run_response = client.post(f"/experiments/{experiment_id}/runs", json={"failure_threshold": 1.0})
    assert run_response.status_code == 201
    run_id = run_response.json()["id"]
    assert run_response.json()["status"] in {"succeeded", "failed"}

    summary_response = client.get(f"/runs/{run_id}/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()["summary"]
    assert summary["total_attempts"] == 4
    assert len(summary["models"]) == 2

    attempts_response = client.get(f"/runs/{run_id}/attempts")
    assert attempts_response.status_code == 200
    attempts = attempts_response.json()
    assert len(attempts) == 4
    assert all("latency_ms" in row for row in attempts)
    assert all("cost_usd" in row for row in attempts)
