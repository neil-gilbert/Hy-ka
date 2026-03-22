# M1-T03 Intent Reconstruction And Task Card Builder

## Summary

Reconstruct the problem statement from PR context without leaking the final implementation.

## Scope

- Build a normalized task card using:
  - PR title and description
  - linked issue/ticket text
  - review discussion
  - CI failures and logs
  - failing tests or validation signals
  - repository context at the base commit
- Produce structured task fields:
  - problem statement
  - acceptance criteria
  - repo/setup instructions
  - optional hints and affected areas
- Redact or exclude content that would reveal the final human solution.

## Deliverables

- Task-card schema
- Intent reconstruction service
- Prompt assembly rules for solver input

## Acceptance Criteria

- A selected PR can be turned into a task card with no raw diff exposure.
- Task cards are versioned and stored for reproducibility.
- Reconstruction failures are explicit and do not silently produce low-quality tasks.

## Dependencies

- [M1-T02 PR Eligibility And Candidate Selection](./M1-T02-pr-eligibility-and-candidate-selection.md)

## Out Of Scope

- Fully autonomous issue understanding without repository metadata
- Using the original human patch as solver input
