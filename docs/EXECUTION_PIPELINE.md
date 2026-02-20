# Execution Pipeline

## Stage 1: Experiment Setup

- Experiment is created with:
  - workload type
  - dataset/PR source
  - model arms (`provider + model_name + config`)
- Arm validation enforces org-level provider allowlist and credential availability.

## Stage 2: Run Launch

- Run is started with a fixed seed and evaluator profile version.

## Stage 3: Task Planning

- Planner materializes deterministic `TaskInstance` records from workload input.
- For PR workloads, each task contains:
  - PR context/input prompt
  - expected validation signals (tests, labels, constraints)

## Stage 4: Attempt Generation (Per Arm)

- Executor iterates task x model arm.
- Provider gateway calls the selected provider adapter:
  - OpenAI
  - Anthropic
  - Azure OpenAI
  - OpenRouter
  - Mock
- Attempt artifacts are stored:
  - generated output/patch
  - provider raw response
  - latency/cost/token usage
  - execution errors

## Stage 5: Deterministic Scoring

- Rule-based scorer computes baseline metrics (quality/pass/etc).

## Stage 6: Evaluator Agent Scoring

- Internal evaluator agent analyzes each attempt artifact and returns:
  - patch quality rating
  - correctness confidence
  - risk level
  - explanatory rationale
- Same evaluator profile is reused across all attempts for comparability.
- Evaluator rationale is retained internally; user-facing outputs expose only final evaluator scores.

## Stage 7: Ranking and Comparison

- Aggregator merges deterministic + evaluator scores.
- Models/providers are ranked per run.
- For reruns with a different model/provider, evaluator is run again and used for direct comparison (Model A vs Model B) on the same PR tasks.
- Rankings are emitted as separate leaderboards (quality, speed, cost, evaluator score), not a single composite score.

## Stage 8: Run Summary

- Final summary includes:
  - quality leaderboard
  - speed/latency leaderboard
  - cost leaderboard
  - evaluator-score leaderboard
  - failure ratio and run status
