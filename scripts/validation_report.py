#!/usr/bin/env python3
"""Generate an operator-only Validation Alpha report.

The report consumes the M2 read-model contract. Core Product Gate metrics come from
`validation_product_metrics_v1`; this tool does not redefine those metric formulas.

Production credentials stay local/server-side. Generated reports may contain
qualitative user notes and must remain outside version control.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

RESERVED_COHORTS = {"production-smoke", "production_smoke_test"}
SMOKE_PROBE_COHORT = "production-smoke"
LOW_SAMPLE_N = 5

METRIC_ORDER = [
    "unique_cohort_visitors",
    "landing_to_lab_start",
    "meaningful_interaction_rate",
    "failure_tradeoff_exposure_rate",
    "strong_aha_rate",
    "second_lab_rate",
    "second_layer_rate",
    "two_meaningful_labs_rate",
    "capstone_start_rate",
    "capstone_completion_rate",
    "pricing_visit_rate",
    "paid_intent_rate",
    "waitlist_conversion_rate",
    "any_return_rate",
    "d7_return_rate",
]

METRIC_LABELS = {
    "unique_cohort_visitors": "Cohort visitors",
    "landing_to_lab_start": "Landing → Lab start",
    "meaningful_interaction_rate": "Meaningful interaction",
    "failure_tradeoff_exposure_rate": "Failure / trade-off exposure",
    "strong_aha_rate": "Strong Aha",
    "second_lab_rate": "Second Lab",
    "second_layer_rate": "Second engineering layer",
    "two_meaningful_labs_rate": "≥2 meaningful Labs",
    "capstone_start_rate": "Capstone start",
    "capstone_completion_rate": "Capstone completion",
    "pricing_visit_rate": "Pricing visit",
    "paid_intent_rate": "Paid / founding intent",
    "waitlist_conversion_rate": "Waitlist conversion",
    "any_return_rate": "Any return",
    "d7_return_rate": "D7 return",
}

# Internal hypotheses from #60/#19. They are references, not automatic ship gates.
TARGETS = {
    "landing_to_lab_start": 0.40,
    "meaningful_interaction_rate": 0.60,
    "failure_tradeoff_exposure_rate": 0.40,
    "strong_aha_rate": 0.60,
    "second_layer_rate": 0.30,
    "two_meaningful_labs_rate": 0.25,
    "pricing_visit_rate": 0.10,
    "paid_intent_rate": 0.03,
    "d7_return_rate": 0.15,
}

CORE_CAVEATS = [
    "Strong Aha is an internal self-reported product signal, not an academic learning-efficacy claim.",
    "Current runtime emits meaningful_interaction and failure_tradeoff_observed together at the same threshold; do not double-weight their present-day rates.",
    "Second-Lab/second-layer and retention metrics use M2 cohort-scoped semantics, not browser-lifetime diagnostic events.",
    "D7 denominator includes only participants who had a full seven-day opportunity to return inside the selected analysis window.",
    "Want more Labs is not directly measurable in the current semantic event contract; do not infer it from unrelated CTA clicks.",
    "production-smoke and production_smoke_test evidence are excluded by the M2 product read models.",
]


def parse_iso(value: str) -> datetime:
    value = value.strip()
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def pct(value: Any) -> str:
    if value is None:
        return "—"
    try:
        return f"{float(value) * 100:.1f}%"
    except (TypeError, ValueError):
        return "—"


def safe_text(value: Any) -> str:
    return "" if value is None else str(value)


def md_cell(value: Any) -> str:
    return safe_text(value).replace("|", "\\|").replace("\n", " ").strip()


def normalize_cohort(value: str) -> str:
    value = value.strip().lower()
    if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,79}", value):
        raise ValueError("cohort must match [a-z0-9][a-z0-9._-]{0,79}")
    return value


def load_env_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"env file not found: {path}")
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


class SupabaseRestClient:
    def __init__(self, base_url: str, service_role_key: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.key = service_role_key

    def _request(
        self,
        method: str,
        path: str,
        params: list[tuple[str, str]] | None = None,
        payload: dict[str, Any] | None = None,
    ) -> Any:
        query = f"?{urlencode(params or [])}" if params else ""
        url = f"{self.base_url}/rest/v1/{path}{query}"
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Accept": "application/json",
        }
        if body is not None:
            headers["Content-Type"] = "application/json"
        req = Request(url, data=body, headers=headers, method=method)
        try:
            with urlopen(req, timeout=30) as response:  # nosec: operator supplies trusted Supabase URL
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase REST {exc.code}: {detail[:500]}") from exc
        except URLError as exc:
            raise RuntimeError(f"Supabase REST connection failed: {exc.reason}") from exc

    def metrics(self, cohort: str, start: datetime, end: datetime) -> list[dict[str, Any]]:
        result = self._request(
            "POST",
            "rpc/validation_product_metrics_v1",
            payload={
                "p_cohort_id": cohort,
                "p_window_start": iso(start),
                "p_window_end": iso(end),
            },
        )
        return list(result or [])

    def select(
        self,
        view: str,
        fields: str,
        filters: Iterable[tuple[str, str]],
        order: str | None = None,
        limit: int = 1000,
    ) -> list[dict[str, Any]]:
        params: list[tuple[str, str]] = [("select", fields)]
        params.extend(filters)
        if order:
            params.append(("order", order))
        params.append(("limit", str(limit)))
        result = self._request("GET", view, params=params)
        return list(result or [])


@dataclass(frozen=True)
class EvidenceBundle:
    metrics: list[dict[str, Any]]
    participants: list[dict[str, Any]]
    feedback: list[dict[str, Any]]
    quality: list[dict[str, Any]]
    smoke_metrics: list[dict[str, Any]] | None = None
    smoke_raw_present: bool | None = None


def fetch_evidence(client: SupabaseRestClient, cohort: str, start: datetime, end: datetime) -> EvidenceBundle:
    cohort_filter = ("cohort_id", f"eq.{cohort}")
    participants = client.select(
        "validation_participant_facts_v1",
        "cohort_id,first_seen_at,last_seen_at,first_locale,acquisition_utm_source,acquisition_utm_medium,acquisition_utm_campaign,first_device_class",
        [cohort_filter, ("first_seen_at", f"lt.{iso(end)}"), ("last_seen_at", f"gte.{iso(start)}")],
        order="first_seen_at.asc",
    )
    feedback = client.select(
        "validation_feedback_latest_v1",
        "cohort_id,locale,layer,lab_id,rating,strong_aha,note,submitted_at,device_class",
        [cohort_filter, ("submitted_at", f"gte.{iso(start)}"), ("submitted_at", f"lt.{iso(end)}")],
        order="submitted_at.desc",
    )

    # Include target-cohort issues plus unattributed/global issues. Missing cohort is
    # itself a data-health condition, so filtering only by the target cohort would
    # hide exactly the evidence the operator needs to see.
    quality_candidates = client.select(
        "validation_data_quality_issues_v1",
        "severity,issue_code,cohort_id,lab_id,observed_at,detail",
        [("observed_at", f"gte.{iso(start)}"), ("observed_at", f"lt.{iso(end)}")],
        order="observed_at.desc",
    )
    quality = [
        row
        for row in quality_candidates
        if safe_text(row.get("cohort_id")).strip() in {"", cohort}
    ]

    # A report must not claim smoke exclusion passed just because the SQL contract
    # says so. Exercise the canonical production-smoke cohort in the same window:
    # raw smoke evidence must exist and every Product Gate metric must stay zero.
    smoke_raw_rows = client.select(
        "validation_events",
        "cohort_id",
        [
            ("cohort_id", f"eq.{SMOKE_PROBE_COHORT}"),
            ("event_ts", f"gte.{iso(start)}"),
            ("event_ts", f"lt.{iso(end)}"),
        ],
        limit=1,
    )

    return EvidenceBundle(
        metrics=client.metrics(cohort, start, end),
        participants=participants,
        feedback=feedback,
        quality=quality,
        smoke_metrics=client.metrics(SMOKE_PROBE_COHORT, start, end),
        smoke_raw_present=bool(smoke_raw_rows),
    )


def load_fixture(path: Path) -> EvidenceBundle:
    data = json.loads(path.read_text(encoding="utf-8"))
    return EvidenceBundle(
        metrics=list(data.get("metrics", [])),
        participants=list(data.get("participants", [])),
        feedback=list(data.get("feedback", [])),
        quality=list(data.get("quality", [])),
        smoke_metrics=list(data.get("smoke_metrics", [])) if "smoke_metrics" in data else None,
        smoke_raw_present=bool(data.get("smoke_raw_present")) if "smoke_raw_present" in data else None,
    )


def count_mix(rows: list[dict[str, Any]], key: str, empty_label: str = "Direct / unknown") -> list[dict[str, Any]]:
    counts = Counter((safe_text(row.get(key)).strip() or empty_label) for row in rows)
    total = sum(counts.values())
    return [
        {"label": label, "count": count, "share": (count / total if total else None)}
        for label, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    ]


def aha_groups(feedback: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in feedback:
        label = safe_text(row.get(key)).strip() or "Unknown"
        groups[label].append(row)
    output = []
    for label, rows in groups.items():
        strong = sum(1 for row in rows if row.get("strong_aha") is True)
        n = len(rows)
        output.append(
            {
                "label": label,
                "responses": n,
                "strong": strong,
                "rate": strong / n if n else None,
                "low_sample": n < LOW_SAMPLE_N,
            }
        )
    return sorted(output, key=lambda row: (-(row["rate"] if row["rate"] is not None else -1), -row["responses"], row["label"]))


def latest_timestamp(participants: list[dict[str, Any]], feedback: list[dict[str, Any]], quality: list[dict[str, Any]]) -> datetime | None:
    values: list[datetime] = []
    for rows, key in ((participants, "last_seen_at"), (feedback, "submitted_at"), (quality, "observed_at")):
        for row in rows:
            raw = row.get(key)
            if raw:
                try:
                    values.append(parse_iso(str(raw)))
                except ValueError:
                    pass
    return max(values) if values else None


def smoke_exclusion_status(bundle: EvidenceBundle) -> str:
    if bundle.smoke_raw_present is None or bundle.smoke_metrics is None:
        return "NOT CHECKED"
    if not bundle.smoke_raw_present:
        return "NOT EXERCISED"
    if not bundle.smoke_metrics:
        return "UNKNOWN"
    has_unique_visitor_metric = any(
        safe_text(row.get("metric_key")) == "unique_cohort_visitors"
        for row in bundle.smoke_metrics
    )
    any_nonzero = any(
        int(row.get("numerator") or 0) != 0 or int(row.get("denominator") or 0) != 0
        for row in bundle.smoke_metrics
    )
    return "PASS" if has_unique_visitor_metric and not any_nonzero else "FAIL"


def build_model(
    bundle: EvidenceBundle,
    cohort: str,
    start: datetime,
    end: datetime,
    generated_at: datetime,
    stale_hours: int = 24,
) -> dict[str, Any]:
    metrics_by_key = {safe_text(row.get("metric_key")): row for row in bundle.metrics}
    metrics = []
    for key in METRIC_ORDER:
        row = metrics_by_key.get(key, {"metric_key": key, "numerator": 0, "denominator": None, "rate": None})
        metrics.append(
            {
                "key": key,
                "label": METRIC_LABELS[key],
                "numerator": row.get("numerator"),
                "denominator": row.get("denominator"),
                "rate": row.get("rate"),
                "target": TARGETS.get(key),
                "coupled": key == "failure_tradeoff_exposure_rate",
            }
        )

    quality_counts = Counter((safe_text(row.get("severity")), safe_text(row.get("issue_code"))) for row in bundle.quality)
    quality_summary = [
        {"severity": severity, "issue_code": issue_code, "count": count}
        for (severity, issue_code), count in sorted(
            quality_counts.items(), key=lambda item: (item[0][0] != "ERROR", item[0][1])
        )
    ]
    error_count = sum(row["count"] for row in quality_summary if row["severity"] == "ERROR")
    warning_count = sum(row["count"] for row in quality_summary if row["severity"] == "WARNING")
    unattributed_quality_count = sum(
        1 for row in bundle.quality if not safe_text(row.get("cohort_id")).strip()
    )

    # Global/unattributed quality warnings should be visible, but must not make an
    # empty cohort look fresh. Freshness tracks evidence attributable to the cohort.
    cohort_quality = [
        row for row in bundle.quality if safe_text(row.get("cohort_id")).strip() == cohort
    ]
    latest = latest_timestamp(bundle.participants, bundle.feedback, cohort_quality)
    freshness_hours = None
    if latest:
        freshness_hours = max(0.0, (generated_at - latest).total_seconds() / 3600)

    smoke_status = smoke_exclusion_status(bundle)
    report_warnings = []
    visitor_metric = metrics_by_key.get("unique_cohort_visitors", {})
    visitor_count = int(visitor_metric.get("numerator") or 0)
    if visitor_count == 0:
        report_warnings.append("No Product Gate evidence exists for this cohort/window.")
    elif visitor_count < 20:
        report_warnings.append(f"Cohort has {visitor_count} visitors; interpret percentages cautiously below the planned ~20–30 participant Alpha size.")
    if freshness_hours is not None and freshness_hours > stale_hours:
        report_warnings.append(f"Latest evidence is {freshness_hours:.1f}h old (stale threshold: {stale_hours}h).")
    if error_count:
        report_warnings.append(f"Data health contains {error_count} ERROR occurrence(s); investigate before using this report for Product Gate decisions.")
    if warning_count:
        report_warnings.append(f"Data health contains {warning_count} WARNING occurrence(s); review caveats before interpreting evidence.")
    if unattributed_quality_count:
        report_warnings.append(
            f"Data health includes {unattributed_quality_count} unattributed/global issue occurrence(s); these are shown because missing cohort attribution can itself invalidate evidence."
        )
    if smoke_status == "FAIL":
        report_warnings.append("Smoke exclusion probe FAILED: reserved production-smoke evidence reached Product Gate metrics.")
    elif smoke_status == "UNKNOWN":
        report_warnings.append("Smoke exclusion probe is UNKNOWN because the Product Gate metric function returned no probe rows.")
    elif smoke_status == "NOT EXERCISED":
        report_warnings.append("Smoke exclusion probe was not exercised because no raw production-smoke event exists in this analysis window.")
    elif smoke_status == "NOT CHECKED":
        report_warnings.append("Smoke exclusion probe was not checked by this evidence source.")
    if cohort in RESERVED_COHORTS:
        report_warnings.append("This is a reserved smoke/test cohort. Product metrics are expected to be zero by design.")

    notes = []
    for row in bundle.feedback:
        note = safe_text(row.get("note")).strip()
        if not note:
            continue
        notes.append(
            {
                "rating": safe_text(row.get("rating")),
                "strong_aha": row.get("strong_aha") is True,
                "layer": safe_text(row.get("layer")),
                "lab_id": safe_text(row.get("lab_id")),
                "locale": safe_text(row.get("locale")),
                "submitted_at": safe_text(row.get("submitted_at")),
                "note": note,
            }
        )

    return {
        "cohort": cohort,
        "window_start": iso(start),
        "window_end": iso(end),
        "generated_at": iso(generated_at),
        "metrics": metrics,
        "participants_in_mix": len(bundle.participants),
        "locale_mix": count_mix(bundle.participants, "first_locale", "Unknown"),
        "source_mix": count_mix(bundle.participants, "acquisition_utm_source"),
        "device_mix": count_mix(bundle.participants, "first_device_class", "Unknown"),
        "aha_by_lab": aha_groups(bundle.feedback, "lab_id"),
        "aha_by_layer": aha_groups(bundle.feedback, "layer"),
        "aha_by_locale": aha_groups(bundle.feedback, "locale"),
        "notes": notes,
        "quality_summary": quality_summary,
        "quality_rows": bundle.quality,
        "quality_errors": error_count,
        "quality_warnings": warning_count,
        "unattributed_quality_count": unattributed_quality_count,
        "latest_evidence_at": iso(latest) if latest else None,
        "freshness_hours": freshness_hours,
        "report_warnings": report_warnings,
        "caveats": list(CORE_CAVEATS),
        "smoke_exclusion": smoke_status,
        "want_more_labs": "NOT DIRECTLY MEASURABLE",
    }


def metric_markdown(model: dict[str, Any]) -> str:
    lines = ["| Metric | Numerator | Denominator | Rate | Target hypothesis |", "|---|---:|---:|---:|---:|"]
    for row in model["metrics"]:
        denominator = "—" if row["denominator"] is None else str(row["denominator"])
        target = pct(row["target"]) if row["target"] is not None else "—"
        label = row["label"] + (" †" if row["coupled"] else "")
        lines.append(f"| {md_cell(label)} | {row['numerator']} | {denominator} | {pct(row['rate'])} | {target} |")
    return "\n".join(lines)


def mix_markdown(title: str, rows: list[dict[str, Any]]) -> str:
    lines = [f"### {title}", "", "| Segment | Count | Share |", "|---|---:|---:|"]
    if not rows:
        lines.append("| No data | 0 | — |")
    else:
        for row in rows:
            lines.append(f"| {md_cell(row['label'])} | {row['count']} | {pct(row['share'])} |")
    return "\n".join(lines)


def aha_markdown(title: str, rows: list[dict[str, Any]]) -> str:
    lines = [f"### {title}", "", "| Segment | Responses | Strong Aha | Rate | Sample |", "|---|---:|---:|---:|---|"]
    if not rows:
        lines.append("| No feedback | 0 | 0 | — | — |")
    else:
        for row in rows:
            sample = "LOW" if row["low_sample"] else "OK"
            lines.append(f"| {md_cell(row['label'])} | {row['responses']} | {row['strong']} | {pct(row['rate'])} | {sample} |")
    return "\n".join(lines)


def render_markdown(model: dict[str, Any], redact_notes: bool = False) -> str:
    warnings = model["report_warnings"] or ["No report-level warnings."]
    lines = [
        "# AhaFrame Validation Alpha Report",
        "",
        f"- **Cohort:** `{model['cohort']}`",
        f"- **Window:** `{model['window_start']}` → `{model['window_end']}`",
        f"- **Generated:** `{model['generated_at']}`",
        f"- **Latest cohort evidence:** `{model['latest_evidence_at'] or 'none'}`",
        f"- **Smoke exclusion probe:** **{model['smoke_exclusion']}**",
        "",
        "## Operator warnings",
        "",
    ]
    lines.extend(f"- {warning}" for warning in warnings)
    lines.extend(["", "## Product funnel / decision metrics", "", metric_markdown(model)])
    lines.extend(["", "† Current failure/trade-off exposure is structurally coupled to meaningful interaction; do not double-weight it."])
    lines.extend(["", "## Cohort mix", "", f"Participants represented in mix views: **{model['participants_in_mix']}**", ""])
    lines.append(mix_markdown("Locale", model["locale_mix"]))
    lines.extend(["", mix_markdown("Acquisition source", model["source_mix"]), "", mix_markdown("Device", model["device_mix"])])
    lines.extend(["", "## Learning evidence", "", aha_markdown("Strong Aha by Lab", model["aha_by_lab"])])
    lines.extend(["", aha_markdown("Strong Aha by layer", model["aha_by_layer"]), "", aha_markdown("Strong Aha by locale", model["aha_by_locale"])])
    lines.extend(["", "## Qualitative queue", ""])
    if not model["notes"]:
        lines.append("No qualitative notes in this cohort/window.")
    else:
        for item in model["notes"]:
            note = "[REDACTED]" if redact_notes else item["note"]
            strength = "Strong Aha" if item["strong_aha"] else "Weak / no Aha"
            lines.extend([
                f"### {md_cell(item['lab_id'] or 'unknown')} · {md_cell(item['locale'] or 'unknown')} · {strength}",
                "",
                f"- Rating: `{md_cell(item['rating'])}`",
                f"- Layer: `{md_cell(item['layer'])}`",
                f"- Submitted: `{md_cell(item['submitted_at'])}`",
                "",
                note,
                "",
            ])
    lines.extend([
        "## Data health",
        "",
        f"- ERROR occurrences: **{model['quality_errors']}**",
        f"- WARNING occurrences: **{model['quality_warnings']}**",
        f"- Unattributed/global occurrences included: **{model['unattributed_quality_count']}**",
        "",
    ])
    if not model["quality_summary"]:
        lines.append("No cohort-specific or unattributed data-quality issues in this window.")
    else:
        lines.extend(["| Severity | Issue | Count |", "|---|---|---:|"])
        for row in model["quality_summary"]:
            lines.append(f"| {row['severity']} | {md_cell(row['issue_code'])} | {row['count']} |")
    lines.extend(["", "## Evidence caveats", ""])
    lines.extend(f"- {item}" for item in model["caveats"])
    lines.extend(["", "## Known unmeasured signal", "", f"`Want more Labs`: **{model['want_more_labs']}**", ""])
    return "\n".join(lines).rstrip() + "\n"


def html_table(headers: list[str], rows: list[list[Any]], empty: str = "No data") -> str:
    head = "".join(f"<th>{html.escape(str(value))}</th>" for value in headers)
    if rows:
        body = "".join("<tr>" + "".join(f"<td>{html.escape(str(value))}</td>" for value in row) + "</tr>" for row in rows)
    else:
        body = f'<tr><td colspan="{len(headers)}" class="muted">{html.escape(empty)}</td></tr>'
    return f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def render_html(model: dict[str, Any], redact_notes: bool = False) -> str:
    metric_rows = []
    for row in model["metrics"]:
        metric_rows.append([
            row["label"] + (" †" if row["coupled"] else ""),
            row["numerator"],
            "—" if row["denominator"] is None else row["denominator"],
            pct(row["rate"]),
            pct(row["target"]) if row["target"] is not None else "—",
        ])
    warning_html = "".join(f"<li>{html.escape(item)}</li>" for item in (model["report_warnings"] or ["No report-level warnings."]))
    caveat_html = "".join(f"<li>{html.escape(item)}</li>" for item in model["caveats"])

    def mix(rows: list[dict[str, Any]]) -> list[list[Any]]:
        return [[row["label"], row["count"], pct(row["share"])] for row in rows]

    def aha(rows: list[dict[str, Any]]) -> list[list[Any]]:
        return [[row["label"], row["responses"], row["strong"], pct(row["rate"]), "LOW" if row["low_sample"] else "OK"] for row in rows]

    note_cards = []
    for item in model["notes"]:
        note = "[REDACTED]" if redact_notes else item["note"]
        strength = "Strong Aha" if item["strong_aha"] else "Weak / no Aha"
        note_cards.append(
            '<article class="note">'
            f"<div class=\"note-meta\">{html.escape(item['lab_id'] or 'unknown')} · {html.escape(item['locale'] or 'unknown')} · {html.escape(strength)} · {html.escape(item['submitted_at'])}</div>"
            f"<div class=\"note-rating\">rating: {html.escape(item['rating'])} · layer: {html.escape(item['layer'])}</div>"
            f"<p>{html.escape(note)}</p>"
            "</article>"
        )
    notes_html = "".join(note_cards) or '<p class="muted">No qualitative notes in this cohort/window.</p>'
    quality_rows = [[row["severity"], row["issue_code"], row["count"]] for row in model["quality_summary"]]
    smoke_class = "health-ok" if model["smoke_exclusion"] == "PASS" else ("health-error" if model["smoke_exclusion"] == "FAIL" else "muted")

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AhaFrame Validation Report · {html.escape(model['cohort'])}</title>
<style>
:root{{--bg:#f7f6f1;--card:#fff;--ink:#171915;--muted:#6b7168;--line:#dedfd8;--accent:#087f6a;--warn:#8a5a00;--err:#a93232}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}}
main{{max-width:1120px;margin:0 auto;padding:36px 22px 80px}} h1{{font-size:34px;margin:0 0 8px}} h2{{margin-top:36px;font-size:22px}} h3{{font-size:16px;margin:22px 0 8px}}
.meta,.muted{{color:var(--muted)}} .card{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin:14px 0}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}} .stat strong{{display:block;font-size:26px;margin-top:4px}}
table{{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}} th,td{{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}} th{{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}} tr:last-child td{{border-bottom:0}}
ul{{padding-left:22px}} .warning{{border-left:4px solid var(--warn)}} .health-ok{{color:var(--accent)}} .health-error{{color:var(--err)}}
.note{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;margin:10px 0}} .note-meta{{font-weight:650}} .note-rating{{font-size:12px;color:var(--muted)}} .note p{{white-space:pre-wrap}}
code{{background:#eceee9;border-radius:5px;padding:2px 5px}} footer{{margin-top:48px;color:var(--muted);font-size:12px}}
</style>
</head>
<body><main>
<h1>AhaFrame Validation Alpha Report</h1>
<div class="meta">Cohort <code>{html.escape(model['cohort'])}</code> · {html.escape(model['window_start'])} → {html.escape(model['window_end'])}</div>
<div class="grid">
  <div class="card stat"><span class="muted">Cohort visitors</span><strong>{next((m['numerator'] for m in model['metrics'] if m['key']=='unique_cohort_visitors'), 0)}</strong></div>
  <div class="card stat"><span class="muted">Latest cohort evidence</span><strong style="font-size:16px">{html.escape(model['latest_evidence_at'] or 'none')}</strong></div>
  <div class="card stat"><span class="muted">Data health</span><strong class="{'health-error' if model['quality_errors'] else 'health-ok'}">{model['quality_errors']} error / {model['quality_warnings']} warning</strong></div>
  <div class="card stat"><span class="muted">Smoke exclusion probe</span><strong class="{smoke_class}">{html.escape(model['smoke_exclusion'])}</strong></div>
</div>
<section class="card warning"><h2 style="margin-top:0">Operator warnings</h2><ul>{warning_html}</ul></section>
<h2>Product funnel / decision metrics</h2>
{html_table(['Metric','Numerator','Denominator','Rate','Target hypothesis'], metric_rows)}
<p class="muted">† Current failure/trade-off exposure is structurally coupled to meaningful interaction; do not double-weight it.</p>
<h2>Cohort mix</h2><p class="muted">Participants represented in mix views: {model['participants_in_mix']}</p>
<h3>Locale</h3>{html_table(['Segment','Count','Share'], mix(model['locale_mix']))}
<h3>Acquisition source</h3>{html_table(['Segment','Count','Share'], mix(model['source_mix']))}
<h3>Device</h3>{html_table(['Segment','Count','Share'], mix(model['device_mix']))}
<h2>Learning evidence</h2>
<h3>Strong Aha by Lab</h3>{html_table(['Segment','Responses','Strong Aha','Rate','Sample'], aha(model['aha_by_lab']))}
<h3>Strong Aha by layer</h3>{html_table(['Segment','Responses','Strong Aha','Rate','Sample'], aha(model['aha_by_layer']))}
<h3>Strong Aha by locale</h3>{html_table(['Segment','Responses','Strong Aha','Rate','Sample'], aha(model['aha_by_locale']))}
<h2>Qualitative queue</h2>{notes_html}
<h2>Data health</h2>
<p><strong>{model['quality_errors']}</strong> ERROR occurrence(s) · <strong>{model['quality_warnings']}</strong> WARNING occurrence(s) · <strong>{model['unattributed_quality_count']}</strong> unattributed/global occurrence(s)</p>
{html_table(['Severity','Issue','Count'], quality_rows, 'No cohort-specific or unattributed data-quality issues in this window.')}
<h2>Evidence caveats</h2><ul>{caveat_html}</ul>
<h2>Known unmeasured signal</h2><p><code>Want more Labs</code>: <strong>{html.escape(model['want_more_labs'])}</strong></p>
<footer>Generated {html.escape(model['generated_at'])}. Operator-only evidence artifact; do not publish qualitative notes.</footer>
</main></body></html>"""


def resolve_window(args: argparse.Namespace, now: datetime) -> tuple[datetime, datetime]:
    end = parse_iso(args.to) if args.to else now
    start = parse_iso(args.from_) if args.from_ else end - timedelta(days=args.days)
    if start >= end:
        raise ValueError("analysis window start must be before end")
    return start, end


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate an internal AhaFrame Validation Alpha report")
    parser.add_argument("--cohort", required=True, help="Validation cohort id, e.g. alpha-2026-08")
    parser.add_argument("--days", type=int, default=14, help="Lookback days when --from is omitted (default: 14)")
    parser.add_argument("--from", dest="from_", help="UTC/ISO window start")
    parser.add_argument("--to", help="UTC/ISO window end (default: now)")
    parser.add_argument("--output-dir", default=".artifacts/validation", help="Operator-only report directory")
    parser.add_argument("--format", choices=("both", "html", "md"), default="both")
    parser.add_argument("--env-file", help="Optional local env file containing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    parser.add_argument("--fixture", help="Offline JSON evidence fixture; bypasses Supabase network access")
    parser.add_argument("--redact-notes", action="store_true", help="Redact qualitative note text in generated artifacts")
    parser.add_argument("--stale-hours", type=int, default=24, help="Warn when latest evidence is older than this threshold")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        cohort = normalize_cohort(args.cohort)
        if args.days <= 0:
            raise ValueError("--days must be positive")
        if args.env_file:
            load_env_file(Path(args.env_file))
        now = datetime.now(timezone.utc)
        start, end = resolve_window(args, now)

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
        prefix = f"{cohort}-{end.strftime('%Y%m%d')}"
        written: list[Path] = []
        if args.format in ("both", "md"):
            path = output_dir / f"{prefix}.md"
            path.write_text(render_markdown(model, redact_notes=args.redact_notes), encoding="utf-8")
            written.append(path)
        if args.format in ("both", "html"):
            path = output_dir / f"{prefix}.html"
            path.write_text(render_html(model, redact_notes=args.redact_notes), encoding="utf-8")
            written.append(path)

        print(json.dumps({
            "ok": True,
            "cohort": cohort,
            "window": {"start": iso(start), "end": iso(end)},
            "quality": {
                "errors": model["quality_errors"],
                "warnings": model["quality_warnings"],
                "unattributed": model["unattributed_quality_count"],
            },
            "smoke_exclusion": model["smoke_exclusion"],
            "outputs": [str(path) for path in written],
        }, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:  # operator CLI: concise fail-closed message
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
