# M1-T05 Runner Workspace And Base Checkout

## Summary

Run each benchmark attempt in an isolated workspace created from the pre-fix repository state.

## Scope

- Create ephemeral runner workspaces for selected PR tasks.
- Checkout the repository at the pre-merge base SHA.
- Support repository preparation steps such as dependency install and test bootstrap.
- Add timeouts, cleanup, and workspace retention policy for debugging.

## Deliverables

- Runner job model
- Workspace lifecycle manager
- Base-checkout logic for selected repositories and SHAs

## Acceptance Criteria

- A solver run can start from the repository state before the human PR fix landed.
- Workspaces are isolated per run and are cleaned up automatically.
- Failures in checkout/setup are reported as run-stage errors.

## Dependencies

- [M1-T01 GitHub App And Sampling](./M1-T01-github-app-and-sampling.md)
- [M1-T04 Hidden Oracle Boundary](./M1-T04-hidden-oracle-boundary.md)

## Out Of Scope

- Running inside the customer production network by default
- Persisting mutable long-lived workspaces per experiment
