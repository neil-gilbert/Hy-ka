# M1-T10 Leaderboards Dashboard And Ops

## Summary

Publish the PR shadow evaluation results in a form customers can act on safely.

## Scope

- Add separate leaderboards for:
  - correctness
  - evaluator score
  - speed
  - cost
- Add pairwise model/provider comparison on the same task set.
- Surface run provenance:
  - repository
  - PR number
  - base SHA
  - evaluator profile version
- Add basic observability for ingestion, solver, validation, and evaluator stages.

## Deliverables

- Run summary API updates
- Dashboard views for leaderboards and pairwise comparisons
- Operational metrics and logs for shadow-eval stages

## Acceptance Criteria

- Customers can view per-run and cross-run comparisons without seeing evaluator rationale.
- Users can compare Model A vs Model B on the same sampled PR tasks.
- Operators can diagnose failures by stage without inspecting raw customer code manually.

## Dependencies

- [M1-T09 Evaluator Agent And Blind Scoring](./M1-T09-evaluator-agent-and-blind-scoring.md)

## Out Of Scope

- Automated rollout decisions
- Auto-merge or code-push workflows
