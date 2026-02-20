# Tickets

Concrete backlog for the next implementation cycle.

## Conventions

- Priority: `P1` (highest) to `P3` (lowest)
- Status: `todo`, `in_progress`, `done`
- Ticket IDs are ordered for implementation sequence.

## Provider Expansion and Governance

### P1-100 Extend ProviderType and Migrations

- Priority: `P1`
- Status: `todo`
- Scope:
  - Add `azure_openai` and `openrouter` to provider enum.
  - Add Alembic migration for enum update.
- Acceptance:
  - DB migration applies/rolls back cleanly.
  - Experiments can persist model arms using new providers.

### P1-110 Org Provider Policy Model

- Priority: `P1`
- Status: `todo`
- Scope:
  - Add org-scoped provider allowlist entity/table.
  - Add org-scoped provider credential references and endpoint settings.
- Acceptance:
  - Policy can enable/disable providers per org.
  - Credential references are stored without exposing secret values in API payloads.

### P1-120 Provider Policy API

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-110`
- Scope:
  - Add endpoints to read/update org provider allowlist and provider settings.
  - Validate payload shape and provider-specific config fields.
- Acceptance:
  - API enforces provider enum and org isolation.
  - Unauthorized org updates are rejected.

### P1-130 Experiment/Run Validation Hooks

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-110`, `P1-120`
- Scope:
  - Validate each model arm against org allowlist at experiment create/update.
  - Validate credential availability before run execution.
- Acceptance:
  - Disallowed providers fail fast with clear error.
  - Missing credentials fail run start before attempts execute.

### P1-140 Azure OpenAI Provider Adapter

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-100`
- Scope:
  - Implement Azure OpenAI adapter using existing `ModelProvider` contract.
  - Normalize output, usage, latency, and error mapping.
- Acceptance:
  - Adapter passes provider contract tests.
  - Errors return mapped `error` string without crashing executor.

### P1-150 OpenRouter Provider Adapter

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-100`
- Scope:
  - Implement OpenRouter adapter using existing `ModelProvider` contract.
  - Normalize output, usage, latency, and error mapping.
- Acceptance:
  - Adapter passes provider contract tests.
  - Cost/latency fields are populated consistently.

### P1-160 Provider Integration Test Matrix

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-140`, `P1-150`
- Scope:
  - Add tests for provider factory routing and validation behavior.
  - Add negative tests (allowlist block, missing credentials).
- Acceptance:
  - CI validates all configured provider types and policy checks.

## PR Artifact Capture

### P1-200 Attempt Artifact Schema

- Priority: `P1`
- Status: `todo`
- Scope:
  - Add attempt artifact fields for normalized patch/output and validation metadata.
  - Add timing fields for queue start, model response, and optional validation completion.
- Acceptance:
  - Attempt records can store structured artifacts for evaluator consumption.

### P1-210 Executor Artifact Persistence

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-200`
- Scope:
  - Persist normalized generation artifact from provider output.
  - Persist validation metadata when available.
- Acceptance:
  - Every attempt has a consistent artifact shape (or explicit null markers).

## Evaluator Agent

### P1-300 Evaluator Profile Model

- Priority: `P1`
- Status: `todo`
- Scope:
  - Add evaluator profile entity with provider/model, rubric version, prompt template version.
  - Attach evaluator profile to run metadata.
- Acceptance:
  - Runs are reproducible against a fixed evaluator profile.

### P1-310 Evaluator Service

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-200`, `P1-300`
- Scope:
  - Implement evaluator execution service that scores each attempt artifact.
  - Return structured evaluator metrics and rationale.
- Acceptance:
  - Evaluator outputs are persisted for all non-error attempts.
  - Failures in evaluator stage are captured with structured errors.

### P1-320 Evaluator Score Persistence

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-310`
- Scope:
  - Add evaluator score model/table (or typed score convention) for quality/risk/confidence.
  - Persist rationale as internal-only payload.
- Acceptance:
  - Evaluator scores are queryable by run/task/model arm.

### P1-330 Evaluator Visibility Guardrails

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-320`
- Scope:
  - Restrict customer-facing API responses to final evaluator scores only.
  - Keep rationale/details internal.
- Acceptance:
  - Public run endpoints never expose evaluator rationale fields.

## Ranking and Aggregation

### P1-400 Separate Leaderboards in Aggregator

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-320`
- Scope:
  - Emit separate run leaderboards:
    - quality
    - speed/latency
    - cost
    - evaluator score
  - Remove composite ranking assumption.
- Acceptance:
  - Run summary includes all four leaderboards.

### P1-410 Pairwise Comparison Engine

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-400`
- Scope:
  - Compute task-level pairwise outcomes between model arms.
  - Track margin and winner/loser metadata.
- Acceptance:
  - Model A vs Model B comparison can be computed for same task set.

### P1-420 Confidence and Sample-Size Metadata

- Priority: `P2`
- Status: `todo`
- Depends on: `P1-400`
- Scope:
  - Add confidence/bounds metadata to leaderboard results.
  - Flag low-sample scenarios.
- Acceptance:
  - Run summary includes machine-readable confidence metadata.

## API and Dashboard

### P1-500 Run Summary API Contract Update

- Priority: `P1`
- Status: `todo`
- Depends on: `P1-400`, `P1-410`
- Scope:
  - Update run summary schemas for separate leaderboards and pairwise sections.
  - Keep backward compatibility strategy explicit (versioning or migration window).
- Acceptance:
  - Frontend can consume new summary without reading internal evaluator details.

### P1-510 Dashboard Leaderboards UI

- Priority: `P2`
- Status: `todo`
- Depends on: `P1-500`
- Scope:
  - Render separate leaderboard views (quality, speed, cost, evaluator score).
  - Add pairwise comparison view for selected model/provider arms.
- Acceptance:
  - User can compare Model A vs Model B on same run/tasks.

### P1-520 Org Provider Governance UI

- Priority: `P2`
- Status: `todo`
- Depends on: `P1-120`
- Scope:
  - Admin UI for org provider allowlist and provider config management.
- Acceptance:
  - Disabled providers cannot be selected in experiment creation UI.

## Reliability and Ops

### P1-600 Provider/Evaluator Observability

- Priority: `P2`
- Status: `todo`
- Scope:
  - Add structured logs/metrics/tracing for provider calls and evaluator calls.
- Acceptance:
  - Run diagnostics show per-stage failures and latency.

### P1-610 Failure Isolation and Retry Policy

- Priority: `P2`
- Status: `todo`
- Scope:
  - Ensure provider outages do not crash whole run orchestration unexpectedly.
  - Add retry/backoff policy where safe.
- Acceptance:
  - Partial failures are reported; run summary remains computable.

### P1-620 Evaluator Replay Tooling

- Priority: `P3`
- Status: `todo`
- Depends on: `P1-320`
- Scope:
  - Add tooling to rerun evaluator on historical attempts with a new rubric/profile.
- Acceptance:
  - Replay creates auditable comparison between old and new evaluator profiles.
