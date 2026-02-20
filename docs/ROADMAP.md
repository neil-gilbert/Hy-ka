# Roadmap

## Phase 1: Local Evaluation (current)

- Deterministic dataset runs
- Basic provider support
- Baseline scoring and dashboard summary

## Phase 2: Multi-Provider Benchmarking

- Add Azure OpenAI and OpenRouter adapters
- Provider-aware experiment setup and reporting
- Cross-provider latency/cost/quality comparison
- Enforce org-level provider allowlists and credentials

## Phase 3: PR Shadow Evaluation

- Ingest PR tasks and generate patch attempts per model arm
- Capture run artifacts needed for downstream quality assessment
- Keep execution non-invasive (no direct repo writes in customer systems)

## Phase 4: Evaluator Agent and Ranking

- Internal evaluator agent rates each PR attempt
- Keep evaluator rationale internal; expose final evaluator scores only
- Pairwise and separate leaderboard comparison across runs
- Stable rubric/versioning for reproducible rankings

## Phase 5: Multi-Org + Production Readiness

- Org-level controls and quota/budget management
- Reliability hardening, observability, and replay tooling
- Governance features for evaluator and provider audit trails
