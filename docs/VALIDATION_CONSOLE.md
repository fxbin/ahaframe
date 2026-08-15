# AhaFrame Validation Console

Status: M3 operator workflow for #63  
Depends on: M2 read models from #62

## Purpose

The Validation Console is an **operator-only evidence report generator** for the first 20–30 developer Validation Alpha.

It is intentionally not a public dashboard and does not add Auth, a `/admin` route, or a BI platform.

The console consumes the M2 semantic layer:

- `validation_product_metrics_v1(...)` for Product Gate metrics;
- `validation_participant_facts_v1` for cohort/acquisition mix and freshness;
- `validation_feedback_latest_v1` for latest qualitative/Strong-Aha evidence;
- `validation_data_quality_issues_v1` for evidence-health warnings;
- the raw `validation_events` table only for a bounded `production-smoke` presence probe, never for Product Gate metric calculation.

The console must not redefine the Product Gate formulas from `docs/VALIDATION_METRICS.md`.

## Credential boundary

Production mode requires local/server-only environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Do not:

- commit these values;
- put the service-role key in browser code;
- embed credentials in generated HTML/Markdown;
- publish generated reports containing qualitative notes.

`.artifacts/validation/` is gitignored by default.

## Generate a report

Example:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --days 14
```

This writes Markdown and self-contained HTML to:

```text
.artifacts/validation/
```

You may use an explicit local env file:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --days 14 \
  --env-file .env.local
```

For an exact analysis window:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --from 2026-08-15T00:00:00Z \
  --to 2026-08-29T00:00:00Z
```

For a share-safer internal artifact with qualitative text removed:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --days 14 \
  --redact-notes
```

## Offline fixture mode

No production credentials are required for fixture regression or local preview:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-fixture \
  --from 2026-08-01T00:00:00Z \
  --to 2026-08-12T00:00:00Z \
  --fixture scripts/fixtures/validation_console_fixture.json
```

## Report sections

### Cohort snapshot

Shows:

- analysis window;
- cohort visitors from the M2 metric function;
- latest **cohort-attributed** evidence timestamp;
- smoke exclusion probe status;
- data-health summary.

The smoke status is not a hard-coded badge. In production mode the report checks whether raw `production-smoke` events exist in the selected window and independently calls `validation_product_metrics_v1(...)` for that reserved cohort. The probe is `PASS` only when raw smoke evidence exists while every Product Gate numerator/denominator remains zero. If no smoke event exists in the window the report says `NOT EXERCISED`; fixture/offline evidence without a probe says `NOT CHECKED`.

### Product funnel / decision metrics

Every Product Gate rate is displayed with:

- numerator;
- denominator;
- rate;
- initial internal target hypothesis where one exists.

Targets are references, not automatic pass/fail rules.

### Cohort mix

Descriptive acquisition/first-touch views:

- locale;
- acquisition source;
- first device class.

These are descriptive slices, not replacements for core Product Gate metric formulas.

### Learning evidence

Strong Aha is grouped by:

- Lab;
- engineering layer;
- locale.

Response count is always shown next to the rate. Groups with fewer than 5 responses are marked `LOW` sample.

### Qualitative queue

Uses latest feedback per cohort × anonymous user × Lab from the M2 read model and shows only the context required for operator review:

- rating / Strong-Aha class;
- layer;
- Lab;
- locale;
- submitted time;
- optional note.

The report intentionally does not expose anonymous-user identifiers.

### Data health

Surfaces M2 evidence-health issues and highlights ERROR/WARNING counts.

The report includes both:

- issues attributable to the selected cohort; and
- unattributed/global issues in the selected time window.

The second class is deliberate: a missing cohort can itself be the data-quality failure, so filtering it away would create a false-green report. Unattributed/global issues are counted explicitly and **do not** advance the target cohort's freshness timestamp.

Product Gate decisions should stop for investigation when unresolved ERROR evidence is present.

## Required interpretation caveats

The report always reminds the operator that:

1. Strong Aha is a self-reported product signal, not an academic learning assessment.
2. `meaningful_interaction` and `failure_tradeoff_observed` are currently emitted together at the same runtime threshold; do not double-weight them.
3. second-Lab / second-layer / retention metrics use cohort-scoped M2 semantics rather than browser-lifetime diagnostics.
4. D7 includes only participants with a full seven-day opportunity to return.
5. `Want more Labs` is currently **not directly measurable** and must not be inferred from unrelated CTA clicks.
6. `production-smoke` and `production_smoke_test` are excluded from the Product Gate evidence layer.

## Production verification record — 2026-08-15

Production project: `ahaframe-validation` (`swzddvprnyjrrgpzcsgp`).

An authenticated operator-side database check over the preceding 14 days verified the assumptions used by the production report path without exposing service credentials or participant identifiers:

```text
raw production-smoke events = 3
Product Gate metric rows     = 15
smoke numerator sum          = 0
smoke denominator sum        = 0
Data Health ERROR            = 0
Data Health WARNING          = 1
unattributed/global issues   = 1
```

The intended first recruitment cohort `alpha-2026-08` currently has zero Product Gate visitors/evidence, which is valid before #19 recruitment begins. The historical warning is `feedback_without_start` with no cohort attribution; the Console must surface it as global evidence debt without treating it as fresh evidence for the empty Alpha cohort.

This production check validates the database/read-model side of the operator flow. It intentionally does **not** record or expose `SUPABASE_SERVICE_ROLE_KEY`. The exact local CLI + local service-role environment invocation remains an operator-machine smoke gate; passing that gate must not require moving the secret into CI, browser code, ChatGPT, or repository files.

## Tests

```bash
python3 scripts/test_validation_report.py
```

The regression covers:

- deterministic metric presentation;
- zero-row cohort rendering;
- low-sample warnings;
- cohort + unattributed data-health warnings;
- global warnings not faking cohort freshness;
- production fetch semantics for target/global quality rows;
- raw smoke probe selection without participant IDs;
- real smoke-probe PASS/FAIL semantics;
- reserved smoke cohort handling;
- HTML escaping of user-submitted notes;
- qualitative redaction;
- fixture-driven Markdown/HTML generation.

## Non-goals

- public analytics/admin surface;
- real-time streaming dashboard;
- generic warehouse/BI system;
- authentication implementation;
- exposing participant-level raw event streams;
- changing M2 metric semantics inside presentation code.
