#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULE_PATH = ROOT / "scripts" / "validation_report.py"
FIXTURE_PATH = ROOT / "scripts" / "fixtures" / "validation_console_fixture.json"

spec = importlib.util.spec_from_file_location("validation_report", MODULE_PATH)
validation_report = importlib.util.module_from_spec(spec)
sys.modules["validation_report"] = validation_report
assert spec.loader is not None
spec.loader.exec_module(validation_report)


class ValidationReportTests(unittest.TestCase):
    def setUp(self):
        self.start = datetime(2026, 8, 1, tzinfo=timezone.utc)
        self.end = datetime(2026, 8, 12, tzinfo=timezone.utc)
        self.now = datetime(2026, 8, 12, 12, tzinfo=timezone.utc)
        self.bundle = validation_report.load_fixture(FIXTURE_PATH)
        self.model = validation_report.build_model(
            self.bundle,
            "alpha-fixture",
            self.start,
            self.end,
            self.now,
            stale_hours=24,
        )

    def metric(self, key):
        return next(item for item in self.model["metrics"] if item["key"] == key)

    def test_core_metrics_are_presented_without_redefinition(self):
        self.assertEqual(self.metric("unique_cohort_visitors")["numerator"], 6)
        self.assertAlmostEqual(float(self.metric("landing_to_lab_start")["rate"]), 2 / 3, places=6)
        self.assertAlmostEqual(float(self.metric("strong_aha_rate")["rate"]), 2 / 3, places=6)
        self.assertAlmostEqual(float(self.metric("d7_return_rate")["rate"]), 0.25, places=6)
        self.assertTrue(self.metric("failure_tradeoff_exposure_rate")["coupled"])

    def test_mix_learning_and_quality_views_are_summarized(self):
        self.assertEqual(self.model["participants_in_mix"], 6)
        locale_counts = {row["label"]: row["count"] for row in self.model["locale_mix"]}
        self.assertEqual(locale_counts, {"en": 3, "zh-CN": 3})
        self.assertEqual(self.model["quality_errors"], 0)
        self.assertEqual(self.model["quality_warnings"], 1)
        self.assertEqual(self.model["unattributed_quality_count"], 1)
        self.assertEqual(self.model["quality_summary"][0]["issue_code"], "feedback_without_start")
        self.assertEqual(self.model["want_more_labs"], "NOT DIRECTLY MEASURABLE")
        self.assertEqual(self.model["smoke_exclusion"], "PASS")

    def test_fetch_evidence_keeps_global_quality_and_probes_smoke(self):
        class FakeClient:
            def __init__(self):
                self.select_calls = []
                self.metric_calls = []

            def metrics(self, cohort, start, end):
                self.metric_calls.append(cohort)
                if cohort == "production-smoke":
                    return [{
                        "metric_key": "unique_cohort_visitors",
                        "numerator": 0,
                        "denominator": None,
                        "rate": None,
                    }]
                return [{
                    "metric_key": "unique_cohort_visitors",
                    "numerator": 1,
                    "denominator": None,
                    "rate": None,
                }]

            def select(self, view, fields, filters, order=None, limit=1000):
                self.select_calls.append({
                    "view": view,
                    "fields": fields,
                    "filters": list(filters),
                    "order": order,
                    "limit": limit,
                })
                if view == "validation_participant_facts_v1":
                    return []
                if view == "validation_feedback_latest_v1":
                    return []
                if view == "validation_data_quality_issues_v1":
                    return [
                        {
                            "severity": "WARNING",
                            "issue_code": "target_warning",
                            "cohort_id": "alpha-fixture",
                            "lab_id": "rag-failure",
                            "observed_at": "2026-08-04T10:00:00Z",
                            "detail": "target cohort warning",
                        },
                        {
                            "severity": "WARNING",
                            "issue_code": "missing_cohort",
                            "cohort_id": "",
                            "lab_id": "instruction-conflict",
                            "observed_at": "2026-08-05T10:00:00Z",
                            "detail": "unattributed warning",
                        },
                        {
                            "severity": "ERROR",
                            "issue_code": "other_cohort_only",
                            "cohort_id": "other-alpha",
                            "lab_id": "agent-reliability",
                            "observed_at": "2026-08-06T10:00:00Z",
                            "detail": "must not leak into selected cohort report",
                        },
                    ]
                if view == "validation_events":
                    return [{"cohort_id": "production-smoke"}]
                raise AssertionError(f"unexpected view: {view}")

        client = FakeClient()
        bundle = validation_report.fetch_evidence(
            client,
            "alpha-fixture",
            self.start,
            self.end,
        )

        self.assertEqual([row["cohort_id"] for row in bundle.quality], ["alpha-fixture", ""])
        self.assertTrue(bundle.smoke_raw_present)
        self.assertEqual(bundle.smoke_metrics[0]["metric_key"], "unique_cohort_visitors")
        self.assertEqual(client.metric_calls, ["alpha-fixture", "production-smoke"])

        smoke_call = next(call for call in client.select_calls if call["view"] == "validation_events")
        self.assertEqual(smoke_call["fields"], "cohort_id")
        self.assertEqual(smoke_call["limit"], 1)
        self.assertIn(("cohort_id", "eq.production-smoke"), smoke_call["filters"])

    def test_low_sample_and_operator_warnings_are_visible(self):
        self.assertTrue(any("interpret percentages cautiously" in item for item in self.model["report_warnings"]))
        self.assertTrue(any("WARNING" in item for item in self.model["report_warnings"]))
        self.assertTrue(any("unattributed/global" in item for item in self.model["report_warnings"]))
        self.assertTrue(all(row["low_sample"] for row in self.model["aha_by_lab"]))

    def test_qualitative_notes_can_be_redacted(self):
        markdown = validation_report.render_markdown(self.model, redact_notes=True)
        html = validation_report.render_html(self.model, redact_notes=True)
        self.assertIn("[REDACTED]", markdown)
        self.assertIn("[REDACTED]", html)
        self.assertNotIn("instruction hierarchy is an engineering boundary", markdown)
        self.assertNotIn("instruction hierarchy is an engineering boundary", html)

    def test_html_escapes_user_content(self):
        mutated = json.loads(json.dumps(self.model))
        mutated["notes"] = [{
            "rating": "aha",
            "strong_aha": True,
            "layer": "Prompt",
            "lab_id": "instruction-conflict",
            "locale": "en",
            "submitted_at": "2026-08-03T10:00:00Z",
            "note": "<script>alert('x')</script>",
        }]
        output = validation_report.render_html(mutated)
        self.assertNotIn("<script>alert", output)
        self.assertIn("&lt;script&gt;", output)

    def test_zero_row_report_is_valid(self):
        empty = validation_report.EvidenceBundle(metrics=[], participants=[], feedback=[], quality=[])
        model = validation_report.build_model(empty, "empty-alpha", self.start, self.end, self.now)
        self.assertEqual(next(row for row in model["metrics"] if row["key"] == "unique_cohort_visitors")["numerator"], 0)
        self.assertEqual(model["smoke_exclusion"], "NOT CHECKED")
        self.assertTrue(any("No Product Gate evidence" in item for item in model["report_warnings"]))
        self.assertIn("No qualitative notes", validation_report.render_markdown(model))
        self.assertIn("No cohort-specific or unattributed data-quality issues", validation_report.render_html(model))

    def test_unattributed_quality_does_not_fake_cohort_freshness(self):
        global_only = validation_report.EvidenceBundle(
            metrics=[],
            participants=[],
            feedback=[],
            quality=[{
                "severity": "WARNING",
                "issue_code": "feedback_without_start",
                "cohort_id": "",
                "lab_id": "legacy",
                "observed_at": "2026-08-12T11:59:00Z",
                "detail": "global warning",
            }],
        )
        model = validation_report.build_model(global_only, "empty-alpha", self.start, self.end, self.now)
        self.assertIsNone(model["latest_evidence_at"])
        self.assertEqual(model["unattributed_quality_count"], 1)

    def test_smoke_probe_fails_when_reserved_evidence_reaches_metrics(self):
        contaminated = validation_report.EvidenceBundle(
            metrics=[],
            participants=[],
            feedback=[],
            quality=[],
            smoke_metrics=[{
                "metric_key": "unique_cohort_visitors",
                "numerator": 1,
                "denominator": None,
                "rate": None,
            }],
            smoke_raw_present=True,
        )
        model = validation_report.build_model(contaminated, "empty-alpha", self.start, self.end, self.now)
        self.assertEqual(model["smoke_exclusion"], "FAIL")
        self.assertTrue(any("Smoke exclusion probe FAILED" in item for item in model["report_warnings"]))

    def test_reserved_smoke_cohort_is_explicitly_warned(self):
        empty = validation_report.EvidenceBundle(metrics=[], participants=[], feedback=[], quality=[])
        model = validation_report.build_model(empty, "production-smoke", self.start, self.end, self.now)
        self.assertTrue(any("reserved smoke/test cohort" in item for item in model["report_warnings"]))

    def test_cli_fixture_generates_gitignored_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            rc = validation_report.main([
                "--cohort", "alpha-fixture",
                "--from", "2026-08-01T00:00:00Z",
                "--to", "2026-08-12T00:00:00Z",
                "--fixture", str(FIXTURE_PATH),
                "--output-dir", tmp,
            ])
            self.assertEqual(rc, 0)
            md = Path(tmp) / "alpha-fixture-20260812.md"
            report_html = Path(tmp) / "alpha-fixture-20260812.html"
            self.assertTrue(md.exists())
            self.assertTrue(report_html.exists())
            self.assertIn("Landing → Lab start", md.read_text(encoding="utf-8"))
            self.assertIn("Smoke exclusion probe", md.read_text(encoding="utf-8"))
            self.assertIn("AhaFrame Validation Alpha Report", report_html.read_text(encoding="utf-8"))

    def test_invalid_cohort_fails_closed(self):
        with self.assertRaises(ValueError):
            validation_report.normalize_cohort("Alpha Cohort / bad")


if __name__ == "__main__":
    unittest.main()
