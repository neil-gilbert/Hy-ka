def _sample_payload() -> dict:
    return {
        "name": "PR Review Eval",
        "workload_type": "pr_review",
        "dataset_ref": "pr_review/v1.jsonl",
        "sampling": {"max_tasks": 2},
        "budget_usd": "12.50",
        "seed": 7,
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


def test_experiment_crud(client):
    create_response = client.post("/experiments", json=_sample_payload())
    assert create_response.status_code == 201
    experiment = create_response.json()
    experiment_id = experiment["id"]

    list_response = client.get("/experiments")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    get_response = client.get(f"/experiments/{experiment_id}")
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "PR Review Eval"

    update_response = client.patch(
        f"/experiments/{experiment_id}",
        json={"name": "Updated Eval", "sampling": {"max_tasks": 1}},
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Eval"

    delete_response = client.delete(f"/experiments/{experiment_id}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/experiments/{experiment_id}")
    assert missing_response.status_code == 404
