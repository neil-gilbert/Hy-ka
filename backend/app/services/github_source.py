from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

import httpx

from app.core.config import get_settings
from app.utils.dataset_hash import sha256_bytes


@dataclass
class GitHubPullRequestCandidate:
    repo_ref: str
    pr_number: int
    title: str
    body: str
    html_url: str
    clone_url: str
    base_sha: str
    head_sha: str
    merged_at: str | None
    changed_files: list[str]
    labels: list[str]


def parse_github_dataset_ref(dataset_ref: str) -> tuple[str, str]:
    if not dataset_ref.startswith("github://"):
        raise ValueError(f"Unsupported GitHub dataset_ref: {dataset_ref}")
    repo_ref = dataset_ref.removeprefix("github://").strip("/")
    owner, _, repo = repo_ref.partition("/")
    if not owner or not repo:
        raise ValueError(f"Invalid GitHub dataset_ref: {dataset_ref}")
    return owner, repo


def _headers() -> dict[str, str]:
    settings = get_settings()
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


def _api_base() -> str:
    return get_settings().github_api_url.rstrip("/")


def _clone_url_from_repo_payload(payload: dict[str, Any]) -> str:
    clone_url = str(payload.get("clone_url") or "")
    if clone_url:
        return clone_url
    html_url = str(payload.get("html_url") or "")
    if html_url:
        return f"{html_url}.git"
    raise ValueError("GitHub repository payload is missing clone_url")


def list_merged_pull_requests(dataset_ref: str, lookback_limit: int = 30) -> list[GitHubPullRequestCandidate]:
    owner, repo = parse_github_dataset_ref(dataset_ref)
    limit = max(1, min(int(lookback_limit), 100))
    headers = _headers()
    with httpx.Client(timeout=30.0, headers=headers) as client:
        repo_response = client.get(f"{_api_base()}/repos/{owner}/{repo}")
        repo_response.raise_for_status()
        clone_url = _clone_url_from_repo_payload(repo_response.json())

        pulls_response = client.get(
            f"{_api_base()}/repos/{owner}/{repo}/pulls",
            params={"state": "closed", "sort": "updated", "direction": "desc", "per_page": limit},
        )
        pulls_response.raise_for_status()
        pulls = pulls_response.json()

        candidates: list[GitHubPullRequestCandidate] = []
        for pull in pulls:
            if not pull.get("merged_at"):
                continue
            number = int(pull["number"])
            files_response = client.get(
                f"{_api_base()}/repos/{owner}/{repo}/pulls/{number}/files",
                params={"per_page": 100},
            )
            files_response.raise_for_status()
            changed_files = [str(row.get("filename")) for row in files_response.json() if row.get("filename")]
            labels = [str(label.get("name")) for label in pull.get("labels", []) if label.get("name")]
            candidates.append(
                GitHubPullRequestCandidate(
                    repo_ref=f"{owner}/{repo}",
                    pr_number=number,
                    title=str(pull.get("title") or ""),
                    body=str(pull.get("body") or ""),
                    html_url=str(pull.get("html_url") or ""),
                    clone_url=clone_url,
                    base_sha=str(pull.get("base", {}).get("sha") or ""),
                    head_sha=str(pull.get("head", {}).get("sha") or ""),
                    merged_at=str(pull.get("merged_at") or ""),
                    changed_files=changed_files,
                    labels=labels,
                )
            )
        return candidates


def github_candidates_dataset_hash(candidates: list[GitHubPullRequestCandidate]) -> str:
    rows = [
        {
            "repo_ref": row.repo_ref,
            "pr_number": row.pr_number,
            "title": row.title,
            "body": row.body,
            "html_url": row.html_url,
            "base_sha": row.base_sha,
            "head_sha": row.head_sha,
            "merged_at": row.merged_at,
            "changed_files": row.changed_files,
            "labels": row.labels,
        }
        for row in candidates
    ]
    return sha256_bytes(json.dumps(rows, sort_keys=True).encode("utf-8"))


def build_authenticated_clone_url(clone_url: str) -> str:
    token = get_settings().github_token
    if not token:
        return clone_url
    parsed = urlparse(clone_url)
    if parsed.scheme != "https":
        return clone_url
    if parsed.netloc != "github.com":
        return clone_url
    return f"https://x-access-token:{token}@github.com{parsed.path}"
