# Data Model

## Core Entities

- `Organization`
- `Experiment`
- `Run`
- `TaskInstance`
- `ModelArm`
- `Attempt`
- `Score`

## New/Extended Entities for Next Iteration

- `ModelArm` (extended):
  - provider-aware arms (`openai`, `anthropic`, `azure_openai`, `openrouter`, `mock`)
  - provider/model config per arm
- `AttemptArtifact`:
  - normalized patch/output content
  - optional validation metadata (tests/lint/build results)
- `EvaluatorProfile`:
  - evaluator provider/model identity
  - rubric version
  - prompt template version
- `EvaluatorScore`:
  - quality/risk/confidence ratings for an attempt
  - rationale payload for auditability (internal-only visibility)
- `PairwiseComparison` (derived or persisted):
  - task-level winner/loser across two arms
  - reason codes and margin
- `OrgProviderPolicy`:
  - organization allowlist of enabled providers
  - provider credential references and endpoint settings per org

## Relationship Notes

- One `Run` has many `TaskInstance`.
- One `TaskInstance` has many `Attempt` (one per model arm).
- One `Attempt` has deterministic `Score` and evaluator `EvaluatorScore`.
- Run summary aggregates both deterministic and evaluator metrics for ranking.
- User-facing summaries expose evaluator final scores, not evaluator rationale.
