# M1-T09 Evaluator Agent And Blind Scoring

## Summary

Add the internal evaluation layer that judges attempt quality beyond raw test results.

## Scope

- Implement a fixed evaluator profile:
  - provider/model
  - rubric version
  - prompt template version
- Score attempts on:
  - correctness confidence
  - solution quality
  - implementation risk
  - completeness
- Blind evaluator inputs to provider/model identity.
- Keep evaluator rationale internal-only.

## Deliverables

- Evaluator profile model
- Evaluator execution service
- Evaluator score persistence and internal rationale storage

## Acceptance Criteria

- Attempts receive deterministic metrics plus evaluator-agent scores.
- Evaluator inputs do not reveal which provider/model produced the patch.
- Customer-facing APIs expose scores but not evaluator rationale.

## Dependencies

- [M1-T08 Validation And Attempt Artifacts](./M1-T08-validation-and-attempt-artifacts.md)

## Out Of Scope

- User-configurable evaluator prompts in v1
- Replacing deterministic checks with judge-only scoring
