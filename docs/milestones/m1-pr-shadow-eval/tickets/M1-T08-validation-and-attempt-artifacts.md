# M1-T08 Validation And Attempt Artifacts

## Summary

Capture the outputs needed to judge whether the solver actually fixed the same problem.

## Scope

- Persist normalized attempt artifacts:
  - generated patch
  - files changed
  - command logs
  - timing data
  - token and cost usage
- Run deterministic validation:
  - tests
  - lint
  - build
  - typecheck where configured
- Store validation outcomes per attempt.

## Deliverables

- Attempt-artifact schema
- Validation runner integration
- Structured result payloads for downstream evaluator and leaderboard stages

## Acceptance Criteria

- Every solver run records a complete attempt artifact or explicit failure state.
- Deterministic validation results are attached to the attempt.
- The system can distinguish model failure from validation failure.

## Dependencies

- [M1-T07 Solver Agent Harness](./M1-T07-solver-agent-harness.md)

## Out Of Scope

- Full semantic proof of correctness from deterministic checks alone
