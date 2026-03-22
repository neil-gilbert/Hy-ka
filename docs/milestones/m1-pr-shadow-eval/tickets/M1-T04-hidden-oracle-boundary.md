# M1-T04 Hidden Oracle Boundary

## Summary

Store the original PR artifacts for internal comparison while preventing solver access.

## Scope

- Persist the original PR diff, changed files, and merge metadata in a restricted internal store.
- Enforce a boundary between:
  - hidden oracle artifacts
  - solver-visible task card inputs
- Add audit logging for any internal access to hidden oracle data.

## Deliverables

- Hidden-oracle storage model
- Access-control rules in task building and solver execution paths
- Boundary tests that prove solver prompts do not contain human diff content

## Acceptance Criteria

- The original PR patch is available for internal analysis only.
- Solver inputs never contain raw diff hunks or copied implementation text.
- Access to hidden oracle data is auditable.

## Dependencies

- [M1-T03 Intent Reconstruction And Task Card Builder](./M1-T03-intent-reconstruction-and-task-card-builder.md)

## Out Of Scope

- Customer-facing views of the original diff inside evaluation results
