# M1-T01 GitHub App And Sampling

## Summary

Create the GitHub ingestion layer for merged PR events and experiment-driven sampling.

## Scope

- Register GitHub App installation per organization/repository.
- Receive and verify webhook events for pull requests.
- Support experiment settings for:
  - repository selection
  - branch filters
  - sample rate, such as 10 percent
- Make sampling deterministic and auditable.

## Deliverables

- GitHub App install/config model
- Webhook ingestion endpoint
- PR event persistence
- Sampling service with deterministic decision logging

## Acceptance Criteria

- A repository can be connected from the dashboard or API.
- A merged PR webhook can be ingested exactly once.
- The system can record whether a PR was sampled and why.
- Sampling decisions are reproducible for the same experiment configuration.

## Dependencies

- None

## Out Of Scope

- Commenting on PRs
- Modifying GitHub checks
- Running on open PRs
