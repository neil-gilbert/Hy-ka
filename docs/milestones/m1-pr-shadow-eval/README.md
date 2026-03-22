# Milestone M1: GitHub PR Shadow Evaluation

## Goal

Build the first customer-facing GitHub PR shadow evaluation workflow.

Customer outcome:

- Connect a GitHub repository to ModelEval.
- Configure an experiment such as "run on 10% of merged PRs".
- Reconstruct the original task intent from PR metadata and repository state.
- Run alternative model/provider arms in an isolated workspace.
- Evaluate the generated change with deterministic checks and an internal judge.
- Show separate leaderboards in the dashboard without touching the original PR.

## Hard Rules

- Never update the original PR.
- Never push commits back to the customer repository.
- Solver models must not see the original PR diff or final human patch.
- The original PR is a hidden oracle used only for candidate selection and internal analysis.
- Evaluator rationale is internal-only; customer-facing surfaces expose scores only.

## Milestone Scope

Version 1 is for merged PRs only.

Why:

- We need the final merged PR as a hidden reference.
- We need a known base commit to recreate the pre-fix repository state.
- This keeps the benchmark reproducible before attempting live PR workflows.

## End-to-End Flow

1. GitHub App/webhook ingests merged PR events.
2. Sampling and eligibility logic decides whether the PR becomes a benchmark candidate.
3. Intent reconstruction builds a task card from PR metadata, issue context, CI signals, and base-repo state.
4. Runner creates an isolated workspace at the pre-merge base SHA.
5. Solver harness runs the selected provider/model arms with the same tool contract.
6. Validation runs tests, lint, and build checks where configured.
7. Evaluator agent scores correctness, quality, and risk.
8. Leaderboards and pairwise comparisons are published to the dashboard.

## Exit Criteria

- A customer can enable PR shadow evaluation on a connected repository.
- A configurable sample of merged PRs can be selected deterministically.
- A selected PR can be reconstructed into a task card without exposing the original patch.
- At least two model/provider arms can run against the same task in isolated workspaces.
- Deterministic validation and evaluator-agent scoring are persisted per attempt.
- The dashboard shows separate leaderboards for correctness, speed, cost, and evaluator score.

## Non-Goals

- Live PR comments or check runs on open pull requests
- Automatic commits or automated code merges
- Exposing evaluator rationale to customers
- Scoring primarily on patch similarity to the original human diff

## Ticket Order

- [M1-T01 GitHub App And Sampling](./tickets/M1-T01-github-app-and-sampling.md)
- [M1-T02 PR Eligibility And Candidate Selection](./tickets/M1-T02-pr-eligibility-and-candidate-selection.md)
- [M1-T03 Intent Reconstruction And Task Card Builder](./tickets/M1-T03-intent-reconstruction-and-task-card-builder.md)
- [M1-T04 Hidden Oracle Boundary](./tickets/M1-T04-hidden-oracle-boundary.md)
- [M1-T05 Runner Workspace And Base Checkout](./tickets/M1-T05-runner-workspace-and-base-checkout.md)
- [M1-T06 Provider Governance And Credentials](./tickets/M1-T06-provider-governance-and-credentials.md)
- [M1-T07 Solver Agent Harness](./tickets/M1-T07-solver-agent-harness.md)
- [M1-T08 Validation And Attempt Artifacts](./tickets/M1-T08-validation-and-attempt-artifacts.md)
- [M1-T09 Evaluator Agent And Blind Scoring](./tickets/M1-T09-evaluator-agent-and-blind-scoring.md)
- [M1-T10 Leaderboards Dashboard And Ops](./tickets/M1-T10-leaderboards-dashboard-and-ops.md)
