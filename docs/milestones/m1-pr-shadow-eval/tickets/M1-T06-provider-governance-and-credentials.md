# M1-T06 Provider Governance And Credentials

## Summary

Allow organizations to choose which providers/models can be used for shadow evaluation.

## Scope

- Add org-level provider allowlists.
- Add org-scoped credentials and endpoint configuration for:
  - OpenAI
  - Anthropic
  - Azure OpenAI
  - OpenRouter
- Validate provider access before any solver run starts.

## Deliverables

- Provider policy model
- Credential/config storage references
- Validation hooks during experiment setup and run launch

## Acceptance Criteria

- An org can allow or block providers independently.
- Runs fail fast if required provider credentials are missing.
- Credentials are never exposed through customer-facing result APIs.

## Dependencies

- None

## Out Of Scope

- Fine-grained model-level quota management
- Customer-managed secret stores in v1
