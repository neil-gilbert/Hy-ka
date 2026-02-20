# Architecture Overview

System consists of 6 layers:

1. Dashboard (React)
2. Backend API (FastAPI)
3. Run Orchestrator (planner + executor)
4. Provider Gateway (OpenAI, Anthropic, Azure OpenAI, OpenRouter, Mock)
5. Evaluation Engine (rule scorer + evaluator agent)
6. Storage and Analytics (Postgres + run summaries)

## Core Runtime Flow

1. Experiment defines workload + model/provider arms.
2. Run orchestrator generates task instances from dataset/PR ingestion.
3. Provider gateway executes each arm against each task.
4. Evaluation engine scores each attempt:
   - deterministic rubric metrics
   - evaluator-agent metrics (quality/risk/explanation)
5. Aggregator produces per-run rankings and cross-model comparisons.
   - quality leaderboard
   - speed/latency leaderboard
   - cost leaderboard
   - evaluator-score leaderboard

## Provider Benchmarking Design

`ModelArm` is provider-aware:

- `provider`: openai | anthropic | azure_openai | openrouter | mock
- `model_name`: provider-native model id
- `config`: provider/model-specific runtime settings

Provider gateway responsibilities:

- Normalize request/response contract across providers
- Handle retries, timeouts, and error mapping consistently
- Capture usage, latency, and cost in a common format
- Enforce org-level provider allowlists before execution
- Resolve provider credentials from org-scoped secure configuration

## Evaluator Agent Design

Evaluator agent is internal and platform-controlled (not customer-configurable in v1).

Responsibilities:

- Inspect each generated PR patch/result artifact
- Rate technical quality, correctness confidence, and change risk
- Produce a structured score payload for ranking and comparison

Guardrails:

- Fixed evaluator profile per benchmark window (model + prompt + rubric version)
- Blind evaluation inputs (no provider/model identity)
- Versioned rubrics for reproducibility and auditability
- Evaluator rationale/details are internal-only; customer surfaces expose final scores only

## Design Principles

- Reproducible: same run seed, evaluator profile, and dataset inputs
- Auditable: raw provider responses and evaluator decisions are stored
- Provider-agnostic: adding providers does not change planner/scorer contracts
- Comparable: all model/provider arms are judged by the same evaluator rubric
- Governed access: provider usage is constrained by org allowlists and credentials
