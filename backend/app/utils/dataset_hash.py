from __future__ import annotations

import hashlib


def sha256_bytes(content: bytes) -> str:
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()
