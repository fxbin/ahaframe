#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from product_gate_memo import DECISIONS, evidence_readiness, render_memo  # noqa: E402
from validation_report import build_model, load_fixture, parse_iso  # noqa: E402

FIXTURE = ROOT / "scripts" / "fixtures" / "validation_console_fixture.json"


def main() -> int:
    bundle = load_fixture(FIXTURE)
    start = parse_iso("2026-08-01T00:00:00Z")
    end = parse_iso("2026-08-12T00:00:00Z")
    generated = datetime(2026, 8, 12, 1, 0, 0, tzinfo=timezone.utc)
    model = build_model(bundle, "alpha-fixture", start, end, generated)
    memo = render_memo(model)

    assert evidence_readiness(model) == "EARLY / LOW SAMPLE"
    assert "Decision:** **PENDING OPERATOR REVIEW" in memo
    assert "This memo is a decision aid, not an automatic scorecard" in memo
    assert "Landing → Lab start" in memo
    assert "AT / ABOVE" in memo
    assert "Data Health ERROR: **0**" in memo
    assert "Data Health WARNING: **1**" in memo
    assert "Want more Labs`: **NOT DIRECTLY MEASURABLE**" in memo
    assert "Save / sync / account demand: **TODO" in memo
    assert "Contradictory evidence" in memo
    assert "Why not the alternatives?" in memo
    assert "Do not resume Auth/Billing/Entitlement/Credits unless" in memo

    for decision in DECISIONS:
        assert f"- [ ] **{decision}**" in memo
        assert f"| {decision} | TODO |" in memo

    # Pre-filling evidence must never auto-select a decision even when multiple
    # fixture metrics exceed their initial target hypotheses.
    assert "- [x] **" not in memo
    assert "Decision:** **GO PLATFORM" not in memo

    # The decision memo summarizes note counts but never copies raw participant
    # note text or identity/security-sensitive fields from the operator report.
    assert "I now see why instruction hierarchy" not in memo
    assert "anonymous_user_id" not in memo
    assert "anonymousUserId" not in memo
    assert "SUPABASE_SERVICE_ROLE_KEY" not in memo

    with tempfile.TemporaryDirectory() as tmp:
        cmd = [
            sys.executable,
            str(ROOT / "scripts" / "product_gate_memo.py"),
            "--cohort",
            "alpha-fixture",
            "--from",
            "2026-08-01T00:00:00Z",
            "--to",
            "2026-08-12T00:00:00Z",
            "--fixture",
            str(FIXTURE),
            "--output-dir",
            tmp,
        ]
        result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, check=False)
        assert result.returncode == 0, result.stderr
        payload = json.loads(result.stdout)
        assert payload["ok"] is True
        assert payload["decision"] == "PENDING OPERATOR REVIEW"
        assert payload["evidence_readiness"] == "EARLY / LOW SAMPLE"
        assert payload["smoke_exclusion"] == "PASS"
        output = Path(payload["output"])
        assert output.name == "alpha-fixture-20260812-decision-memo-v1.md"
        assert output.exists()
        generated_text = output.read_text(encoding="utf-8")
        assert generated_text == memo

    print("PASS Product Gate memo: deterministic evidence prefill, no auto-decision, qualitative privacy boundary, versioned output")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
