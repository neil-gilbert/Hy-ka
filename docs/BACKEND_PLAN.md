# Backend Implementation Plan

Backend stack:

- FastAPI
- Postgres
- Worker process

## Phase 1: Core Baseline (done)

- Experiment CRUD
- Run lifecycle
- Task instances
- Attempt execution
- Rule-based scoring
- Run aggregation

## Phase 2: Provider Expansion

Goal: benchmark provider + model combinations, not only models.

Implementation:

- Extend `ProviderType` to include:
  - `azure_openai`
  - `openrouter`
- Add provider adapters with the existing `ModelProvider` contract.
- Standardize provider error taxonomy and retry policy.
- Add org-scoped provider credentials and endpoint configuration.
- Add org-level provider allowlist policy checks during experiment/run validation.
- Add contract tests for each provider adapter.

## Phase 3: PR Artifact Capture

Goal: capture enough structured data for robust PR-quality evaluation.

Implementation:

- Persist generated patch/diff (or normalized output artifact).
- Persist validation artifacts (lint/test/build status when available).
- Track attempt timestamps for:
  - queue start
  - model response
  - optional validation completion
- Ensure all artifacts are queryable per task and model arm.

## Phase 4: Evaluator Agent

Goal: internal, consistent rating of PR change quality across attempts.

Implementation:

- Introduce evaluator profile configuration:
  - evaluator provider/model
  - rubric version
  - prompt template version
- Create evaluator service that consumes attempt artifacts.
- Store evaluator outputs as structured scores and rationale (internal visibility).
- Keep evaluator platform-owned in v1 (not user-editable).
- Expose only final evaluator scores on customer-facing APIs/dashboards.

## Phase 5: Comparative Ranking

Goal: rank attempts and model/provider arms reliably (Model A vs Model B).

Implementation:

- Publish separate leaderboards:
  - quality
  - speed/latency
  - cost
  - evaluator score
- Support pairwise comparisons on the same task instance.
- Add confidence/bounds metadata when sample size is low.
- Emit run-level leaderboard fields for dashboard/API.

## Phase 6: Hardening and Observability

Goal: make provider and evaluator features production-ready.

Implementation:

- Add tracing/logging for provider and evaluator calls.
- Add failure isolation so one provider outage does not fail whole run.
- Add backfill/replay tooling for rerunning evaluator on historic attempts.
- Add regression tests for ranking stability.
