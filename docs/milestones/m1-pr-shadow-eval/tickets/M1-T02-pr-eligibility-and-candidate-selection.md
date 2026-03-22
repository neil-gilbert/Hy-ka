# M1-T02 PR Eligibility And Candidate Selection

## Summary

Filter sampled PRs down to benchmarkable candidates.

## Scope

- Restrict v1 to merged PRs only.
- Add eligibility rules for:
  - code-changing PRs
  - bug-fix oriented changes
  - bounded size and file count
  - adequate textual context in PR title/body or linked issue
- Skip low-signal PRs such as docs-only, mass refactors, or dependency bumps unless explicitly allowed.

## Deliverables

- Candidate classifier service
- Stored eligibility decision and reason codes
- Configurable thresholds for size and file-count filters

## Acceptance Criteria

- Sampled PRs can be marked eligible or ineligible with explicit reasons.
- The system can exclude obviously noisy PR categories.
- Eligibility decisions can be inspected for audit/debugging.

## Dependencies

- [M1-T01 GitHub App And Sampling](./M1-T01-github-app-and-sampling.md)

## Out Of Scope

- Perfect automatic classification of all PRs
- Historical backfill of all past PRs
