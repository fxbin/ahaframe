#!/usr/bin/env python3
"""Generate a versioned Product Gate decision-memo draft from M3 evidence.

The tool deliberately does not make the business decision. It reuses the
Validation Console / M2 semantic model, pre-fills reproducible evidence, and
leaves qualitative synthesis + the final decision to the operator.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from validation_report import (
    EvidenceBundle,
    SupabaseRestClient,
    build_model,
    fetch_evidence,
    iso,
    load_env_file,
    load_fixture,
    normalize_cohort,
    parse_iso,
    pct,
)

DECISIONS = (
    "GO PLATFORM",
    "VALIDATE AGAIN",
    "REFRAME",
    "CONTENT / BRAND ASSET",
    "STOP",
)
MEMO_VERSION = 1


def metric_map(model: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {row["key"]: row for row in model["metrics"]}


def hypothesis_status(row: dict[str, Any]) -> str:
    if row.get("rate") is None:
        return "NO DATA"
    target = row.get("target")
    if target is None:
        return "OBSERVE"
    return "AT / ABOVE" if float(row["rate"]) >= float(target) else "BELOW"


def evidence_readiness(model: dict[str, Any]) -> str:
    """Describe whether evidence is reviewable without choosing a product decision."""
    if model["quality_errors"] > 0:
        return "BLOCKED — DATA HEALTH ERROR"
    if model["smoke_exclusion"] == "FAIL":
        return "BLOCKED — SMOKE EXCLUSION FAILURE"
    visitors = int(metric_map(model).get("unique_cohort_visitors", {}).get("numerator") or 0)
    if visitors == 0:
        return "NO COHORT EVIDENCE"
    if visitors < 20:
        return "EARLY / LOW SAMPLE"
    return "REVIEWABLE"


def _aha_table(title: str, rows: list[dict[str, Any]]) -> list[str]:
    lines = [
        f"### {title}",
        "",
        "| Segment | Responses | Strong Aha | Rate | Sample |",
        "|---|---:|---:|---:|---|",
    ]
    if not rows:
        lines.append("| No feedback | 0 | 0 | — | — |")
        return lines
    for row in rows:
        lines.append(
            f"| {row['label']} | {row['responses']} | {row['strong']} | {pct(row['rate'])} | "
            f"{'LOW' if row['low_sample'] else 'OK'} |"
        )
    return lines


def _mix_table(title: str, rows: list[dict[str, Any]]) -> list[str]:
    lines = [f"### {title}", "", "| Segment | Count | Share |", "|---|---:|---:|"]
    if not rows:
        lines.append("| No data | 0 | — |")
        return lines
    for row in rows:
        lines.append(f"| {row['label']} | {row['count']} | {pct(row['share'])} |")
    return lines


def render_memo(model: dict[str, Any], version: int = MEMO_VERSION) -> str:
    note_count = len(model["notes"])
    strong_note_count = sum(1 for note in model["notes"] if note["strong_aha"])
    weak_note_count = note_count - strong_note_count

    lines = [
        "# AhaFrame Product Gate Decision Memo",
        "",
        f"**Memo version:** v{version}",
        f"**Cohort:** `{model['cohort']}`",
        f"**Evidence window:** `{model['window_start']}` → `{model['window_end']}`",
        f"**Generated:** `{model['generated_at']}`",
        f"**Evidence readiness:** **{evidence_readiness(model)}**",
        "**Decision:** **PENDING OPERATOR REVIEW**",
        "",
        "> This memo is a decision aid, not an automatic scorecard. Initial targets are internal hypotheses. "
        "The operator must review quantitative evidence, contradictory qualitative evidence, data caveats, "
        "and observed product demand before selecting exactly one final decision.",
        "",
        "## 1. Evidence integrity",
        "",
        f"- Latest cohort-attributed evidence: `{model['latest_evidence_at'] or 'none'}`",
        f"- Smoke exclusion probe: **{model['smoke_exclusion']}**",
        f"- Data Health ERROR: **{model['quality_errors']}**",
        f"- Data Health WARNING: **{model['quality_warnings']}**",
        f"- Unattributed/global quality issues: **{model['unattributed_quality_count']}**",
        "",
        "### Required caveats",
        "",
    ]
    lines.extend(f"- {item}" for item in model["caveats"])

    lines.extend([
        "",
        "## 2. Quantitative Product Gate evidence",
        "",
        "| Metric | Numerator | Denominator | Rate | Target hypothesis | Hypothesis status |",
        "|---|---:|---:|---:|---:|---|",
    ])
    for row in model["metrics"]:
        denominator = "—" if row["denominator"] is None else str(row["denominator"])
        target = "—" if row["target"] is None else pct(row["target"])
        label = row["label"] + (" †" if row["coupled"] else "")
        lines.append(
            f"| {label} | {row['numerator']} | {denominator} | {pct(row['rate'])} | {target} | "
            f"{hypothesis_status(row)} |"
        )
    lines.extend([
        "",
        "† Failure/trade-off exposure is currently structurally coupled to meaningful interaction; do not treat both as independent evidence.",
        "",
        "### Demand signals",
        "",
        f"- `Want more Labs`: **{model['want_more_labs']}**",
        "- Save / sync / account demand: **TODO — synthesize from qualitative evidence after the cohort**",
        "- Cross-device demand: **TODO — synthesize from qualitative evidence after the cohort**",
        "",
        "## 3. Learning evidence",
        "",
    ])
    lines.extend(_aha_table("Strong Aha by Lab", model["aha_by_lab"]))
    lines.append("")
    lines.extend(_aha_table("Strong Aha by engineering layer", model["aha_by_layer"]))
    lines.append("")
    lines.extend(_aha_table("Strong Aha by locale", model["aha_by_locale"]))

    lines.extend(["", "## 4. Acquisition / cohort mix", ""])
    lines.extend(_mix_table("Locale mix", model["locale_mix"]))
    lines.append("")
    lines.extend(_mix_table("Acquisition source", model["source_mix"]))

    lines.extend([
        "",
        "## 5. Qualitative synthesis — OPERATOR REVIEW REQUIRED",
        "",
        f"- Qualitative notes available in the M3 operator report: **{note_count}**",
        f"- Notes attached to Strong Aha responses: **{strong_note_count}**",
        f"- Notes attached to weak / no-Aha responses: **{weak_note_count}**",
        "",
        "### Strong-value themes",
        "",
        "TODO — summarize recurring reasons users found the product valuable. Do not paste participant identifiers.",
        "",
        "### Weak / confusing themes",
        "",
        "TODO — summarize recurring confusion, friction, missing context, or reasons the experience failed to create value.",
        "",
        "### Contradictory evidence",
        "",
        "TODO — explicitly record evidence that argues against the preferred decision.",
        "",
        "### Product / UX friction",
        "",
        "TODO — capture material friction observed during the cohort. Separate P0/P1 trust failures from ordinary UX requests.",
        "",
        "## 6. Platform-demand review",
        "",
        "Before `GO PLATFORM`, answer with evidence:",
        "",
        "- Is save/sync/account demand observed, or merely assumed?",
        "- Is there credible demand for more Labs beyond generic CTA activity?",
        "- Is paid/founding intent credible at this sample size?",
        "- Would Auth/Billing/Entitlement solve observed user demand, or just increase platform completeness?",
        "",
        "Operator synthesis:",
        "",
        "TODO — write the observed platform-demand case here.",
        "",
        "## 7. Decision",
        "",
        "Choose **exactly one** after review:",
        "",
    ])
    lines.extend(f"- [ ] **{decision}**" for decision in DECISIONS)
    lines.extend([
        "",
        "### Decision rationale",
        "",
        "TODO — state the decision and the 3–5 strongest reasons.",
        "",
        "### Why not the alternatives?",
        "",
        "| Alternative | Why it is not the selected decision |",
        "|---|---|",
    ])
    lines.extend(f"| {decision} | TODO |" for decision in DECISIONS)
    lines.extend([
        "",
        "## 8. Next-phase plan",
        "",
        "TODO — define the concrete next phase tied to the selected decision. Do not resume Auth/Billing/Entitlement/Credits unless the final evidence supports `GO PLATFORM`.",
        "",
        "## 9. Operator sign-off",
        "",
        "- Reviewed by: **TODO**",
        "- Review date: **TODO**",
        "- Final decision: **TODO — exactly one value from the decision set**",
        "- Evidence exceptions accepted: **TODO / none**",
        "",
        "## Appendix A — Report warnings",
        "",
    ])
    lines.extend(f"- {warning}" for warning in (model["report_warnings"] or ["No report-level warnings."]))
    lines.extend([
        "",
        "## Appendix B — Reproduction",
        "",
        "This draft was generated from the same M2/M3 semantic model used by `scripts/validation_report.py`.",
        "Re-run the Product Gate command with the same cohort and time window to reproduce the pre-filled quantitative sections.",
        "",
    ])
    return "\n".join(lines)


def resolve_window(args: argparse.Namespace, now: datetime) -> tuple[datetime, datetime]:
    end = parse_iso(args.to) if args.to else now
    start = parse_iso(args.from_) if args.from_ else end - timedelta(days=args.days)
    if start >= end:
        raise ValueError("analysis window start must be before end")
    return start, end


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate an AhaFrame Product Gate memo draft")
    parser.add_argument("--cohort", required=True)
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--from", dest="from_")
    parser.add_argument("--to")
    parser.add_argument("--version", type=int, default=MEMO_VERSION)
    parser.add_argument("--output-dir", default=".artifacts/product-gate")
    parser.add_argument("--env-file")
    parser.add_argument("--fixture")
    parser.add_argument("--stale-hours", type=int, default=24)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        cohort = normalize_cohort(args.cohort)
        if args.days <= 0:
            raise ValueError("--days must be positive")
        if args.version <= 0:
            raise ValueError("--version must be positive")
        if args.env_file:
            load_env_file(Path(args.env_file))

        now = datetime.now(timezone.utc)
        start, end = resolve_window(args, now)
        bundle: EvidenceBundle
        if args.fixture:
            bundle = load_fixture(Path(args.fixture))
        else:
            base_url = os.environ.get("SUPABASE_URL", "").strip()
            service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
            if not base_url or not service_key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required unless --fixture is used")
            bundle = fetch_evidence(SupabaseRestClient(base_url, service_key), cohort, start, end)

        model = build_model(bundle, cohort, start, end, now, stale_hours=args.stale_hours)
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / f"{cohort}-{end.strftime('%Y%m%d')}-decision-memo-v{args.version}.md"
        path.write_text(render_memo(model, args.version), encoding="utf-8")

        print(json.dumps({
            "ok": True,
            "cohort": cohort,
            "window": {"start": iso(start), "end": iso(end)},
            "evidence_readiness": evidence_readiness(model),
            "decision": "PENDING OPERATOR REVIEW",
            "quality": {
                "errors": model["quality_errors"],
                "warnings": model["quality_warnings"],
                "unattributed": model["unattributed_quality_count"],
            },
            "smoke_exclusion": model["smoke_exclusion"],
            "output": str(path),
        }, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
