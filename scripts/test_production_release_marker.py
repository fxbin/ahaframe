#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ahaframe import build_meta  # noqa: E402
from smoke_production import wait_for_expected_commit  # noqa: E402

EXPECTED = "a" * 40
STALE = "b" * 40


def response(sha: str):
    return 200, json.dumps({"schemaVersion": 1, "gitCommitSha": sha}), {}


def test_build_marker() -> None:
    with tempfile.TemporaryDirectory() as tmp, patch.dict(
        "os.environ",
        {
            "AHAFRAME_BUILD_COMMIT_SHA": EXPECTED,
            "VERCEL_GIT_COMMIT_REF": "main",
            "VERCEL_ENV": "production",
        },
        clear=False,
    ):
        target = build_meta.apply(Path(tmp))
        payload = json.loads(target.read_text(encoding="utf-8"))
        assert payload == {
            "environment": "production",
            "gitCommitRef": "main",
            "gitCommitSha": EXPECTED,
            "schemaVersion": 1,
        }


def test_matching_marker() -> None:
    seen = []

    def requester(url: str):
        seen.append(url)
        return response(EXPECTED)

    payload = wait_for_expected_commit(
        "https://ahaframe.com",
        EXPECTED,
        timeout_seconds=0,
        poll_seconds=0,
        requester=requester,
        sleeper=lambda _seconds: None,
    )
    assert payload["gitCommitSha"] == EXPECTED
    assert len(seen) == 1
    assert "/assets/build-meta.json?" in seen[0]
    assert f"expected={EXPECTED}" in seen[0]


def test_stale_then_matching_marker() -> None:
    calls = 0

    def requester(_url: str):
        nonlocal calls
        calls += 1
        return response(STALE if calls == 1 else EXPECTED)

    payload = wait_for_expected_commit(
        "https://ahaframe.com",
        EXPECTED,
        timeout_seconds=1,
        poll_seconds=0,
        requester=requester,
        sleeper=lambda _seconds: None,
    )
    assert payload["gitCommitSha"] == EXPECTED
    assert calls == 2


def test_stale_marker_times_out_fail_closed() -> None:
    try:
        wait_for_expected_commit(
            "https://ahaframe.com",
            EXPECTED,
            timeout_seconds=0,
            poll_seconds=0,
            requester=lambda _url: response(STALE),
            sleeper=lambda _seconds: None,
        )
    except SystemExit as exc:
        message = str(exc)
        assert "release marker timeout" in message
        assert EXPECTED in message
        assert STALE in message
    else:
        raise AssertionError("stale production marker must fail closed")


def test_workflow_contract() -> None:
    workflow = (ROOT / ".github" / "workflows" / "production-smoke.yml").read_text(encoding="utf-8")
    assert "--expected-commit" in workflow
    assert "github.event.workflow_run.head_sha || github.sha" in workflow
    assert "--deployment-timeout-seconds 120" in workflow
    build_script = (ROOT / "scripts" / "build_site.py").read_text(encoding="utf-8")
    assert "build_meta.apply(SITE)" in build_script


def main() -> int:
    test_build_marker()
    test_matching_marker()
    test_stale_then_matching_marker()
    test_stale_marker_times_out_fail_closed()
    test_workflow_contract()
    print("PASS production release marker: emitted SHA, exact match, stale polling, fail-closed timeout, workflow binding")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
