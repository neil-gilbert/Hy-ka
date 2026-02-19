from enum import Enum


class WorkloadType(str, Enum):
    PR_REVIEW = "pr_review"
    CI_TRIAGE = "ci_triage"


class ProviderType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    MOCK = "mock"


class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
