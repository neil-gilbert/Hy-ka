# M1-T07 Solver Agent Harness

## Summary

Implement the platform-owned coding harness that runs the same solve loop across providers.

## Scope

- Define a common agent loop and tool contract for all solver arms.
- Support file read/search/edit plus test/lint/build command execution in the isolated workspace.
- Ensure prompts, stop conditions, and artifact capture are consistent across providers.
- Route model/provider arms through the existing provider abstraction.

## Deliverables

- Solver harness service
- Standard solve prompt template and tool protocol
- Provider routing integration for all supported model arms

## Acceptance Criteria

- The same task card can be attempted by multiple providers/models under the same harness contract.
- Solver runs produce structured artifacts: patch, logs, tool traces, and token/cost usage.
- The harness can run without ever reading the original human patch.

## Dependencies

- [M1-T05 Runner Workspace And Base Checkout](./M1-T05-runner-workspace-and-base-checkout.md)
- [M1-T06 Provider Governance And Credentials](./M1-T06-provider-governance-and-credentials.md)

## Out Of Scope

- Using external coding products as the benchmark engine
- Provider-specific custom solve logic that breaks comparability
