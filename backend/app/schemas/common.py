from enum import Enum


class WorkloadType(str, Enum):
    PR_REVIEW = "pr_review"
    CI_TRIAGE = "ci_triage"
    GITHUB_PR_SHADOW = "github_pr_shadow"


class ProviderType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE_OPENAI = "azure_openai"
    OPENROUTER = "openrouter"
    MOCK = "mock"


class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
