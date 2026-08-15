from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path

SHA40 = re.compile(r"^[0-9a-f]{40}$", re.I)


def _valid_sha(value: str | None) -> str | None:
    value = (value or "").strip().lower()
    return value if SHA40.fullmatch(value) else None


def resolve_git_commit_sha() -> str:
    """Resolve the commit represented by this build without requiring a provider token."""
    for key in ("AHAFRAME_BUILD_COMMIT_SHA", "VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA"):
        resolved = _valid_sha(os.environ.get(key))
        if resolved:
            return resolved
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            timeout=5,
        )
        resolved = _valid_sha(result.stdout)
        if resolved:
            return resolved
    except (OSError, subprocess.SubprocessError):
        pass
    return "unknown"


def release_metadata() -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "gitCommitSha": resolve_git_commit_sha(),
        "gitCommitRef": (
            os.environ.get("VERCEL_GIT_COMMIT_REF")
            or os.environ.get("GITHUB_REF_NAME")
            or ""
        ),
        "environment": os.environ.get("VERCEL_ENV") or "local",
    }


def apply(site: Path) -> Path:
    target = site / "assets" / "build-meta.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(release_metadata(), separators=(",", ":"), sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return target
