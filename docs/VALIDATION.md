# AhaFrame Validation Alpha

Date: 2026-08-15  
Status: active validation source of truth

## Purpose

AhaFrame has passed the v1 Conceptual Closure Gate. The current question is not whether more Labs can be built; it is whether qualified software developers form stronger, useful AI-engineering mental models when they use the existing product.

Validation therefore measures product value before account, billing, entitlement, credits, or full SaaS-platform work resumes.

Current execution:

```text
M1 cohort attribution             COMPLETE
M2 product-decision read models   COMPLETE
M3 operator Validation Console    COMPLETE
M4A Product Gate memo system      COMPLETE
M5 #19 developer Alpha            READY / CURRENT
M4B final Product Gate decision   AFTER COHORT
```

## Primary product outcome

> **Did this change how you think about this system?**

Aha feedback values:

```text
no      = No
little  = A little
yes     = Yes
aha     = Oh, I finally get it.
```

```text
Strong Aha = yes + aha
```

Strong Aha is an internal product signal, not an academic learning assessment.

## Validation funnel

```text
landing_viewed
      ↓
lab_viewed
      ↓
lab_started
      ↓
meaningful_interaction
      ↓
failure_tradeoff_observed
      ↓
aha_feedback_submitted
      ↓
second_lab_started
      ↓
capstone_started / capstone_completed
      ↓
pricing_viewed / paid_intent_clicked
      ↓
waitlist_submitted
      ↓
return / D7
```

### `lab_started`

Emitted on the first actual Lab interaction, not merely on page load.

### `meaningful_interaction`

Emitted once per Lab/session after either at least two semantic state-changing interactions or a meaningful preset/failure-injection action.

This is intentionally stricter than click count.

### `failure_tradeoff_observed`

Currently emitted at the same runtime threshold as meaningful interaction in failure/trade-off Labs. It means exposure to the modeled trade-off, not proof of understanding.

**Do not double-weight `meaningful_interaction` and `failure_tradeoff_observed` as independent evidence in the first Alpha.**

### `second_lab_started`

The runtime event is useful diagnostic evidence, but Product Gate continuation metrics are recomputed cohort-scoped by M2 so browser history from before the cohort cannot contaminate the result.

### `capstone_completed`

Emitted once when the integrated Build first reaches its modeled `SHIP` state.

## Anonymous cohort context

Semantic validation context includes:

```text
schemaVersion
eventId
anonymousUserId
sessionId
cohortId
visitCount
returnVisit
pageType
layer
labId
labVersion
locale
utmSource
utmMedium
utmCampaign
firstUtmSource
referrer
deviceClass
path
ts
```

`anonymousUserId` is browser-persisted; `sessionId` is session-scoped. No authentication is required.

Cohort attribution is experiment context, not identity. Stable first cohort:

```text
alpha-2026-08
```

Tracked entry URLs:

```text
https://ahaframe.com/en/?cohort=alpha-2026-08
https://ahaframe.com/zh-cn/?cohort=alpha-2026-08
```

No email is added to ordinary analytics events. Waitlist email is confined to the dedicated waitlist payload.

## Attribution

The runtime stores cohort, locale, first-touch UTM source, current-session UTM source/medium/campaign, referrer and device class as independent dimensions.

This is enough for the small deliberately recruited Alpha. It is not a general marketing attribution system.

## Aha feedback payload

Qualitative text is separated from ordinary analytics properties.

```text
feedbackId
anonymousUserId
sessionId
cohortId
locale
layer
labId
labVersion
path
rating
strongAha
note
submittedAt
deviceClass
attribution
```

The optional note is bounded user-submitted content. Operator reporting must not expose participant IDs and generated share-safer reports may use `--redact-notes`.

## Runtime endpoints

Build-time public endpoint URLs:

```text
AHAFRAME_ANALYTICS_ENDPOINT
AHAFRAME_FEEDBACK_ENDPOINT
AHAFRAME_WAITLIST_ENDPOINT
```

They are URLs, not secrets. All three may point to `validation-ingest`; the server distinguishes event, feedback and waitlist payloads.

## Production Supabase boundary

Production truth:

```text
project: ahaframe-validation
ref:     swzddvprnyjrrgpzcsgp
region:  ap-southeast-1
```

Canonical migrations:

```text
supabase/migrations/20260814023253_validation_alpha.sql
supabase/migrations/20260815000100_validation_locale.sql
supabase/migrations/20260815071500_validation_cohort.sql
supabase/migrations/20260815092200_validation_read_models.sql
```

Do not use historical short migration names or stale project refs.

Tables:

```text
validation_events
aha_feedback
validation_waitlist
```

All tables enable RLS and expose no direct `anon`/`authenticated` access. Browser writes go through:

```text
supabase/functions/validation-ingest/index.ts
```

The function is intentionally deployed with JWT verification disabled because the Alpha is anonymous. Origin validation, method/payload validation, bounds and server-side service role form the public-abuse boundary. Do not move the service-role credential into Vercel browser config, GitHub CI, generated reports, or ChatGPT.

## M2 Product Gate semantic layer

Raw tables are not the Product Gate API.

Stable read models:

```text
validation_product_events_v1
validation_feedback_latest_v1
validation_user_lab_facts_v1
validation_participant_facts_v1
validation_data_quality_issues_v1
validation_product_metrics_v1(...)
```

See `docs/VALIDATION_METRICS.md` for numerator/denominator/grain definitions and fixture-backed regression.

Key invariants:

- `production-smoke` / `production_smoke_test` are excluded from Product Gate evidence;
- D7 is based on cohort-scoped first evidence time and only users with a full seven-day opportunity are eligible;
- second-Lab / second-layer metrics are recomputed inside the cohort;
- latest feedback is deduplicated by the M2 semantic model;
- waitlist contact storage is not treated as a perfect immutable attribution fact;
- `Want more Labs` remains **not directly measurable** in the semantic event contract.

## M3 operator Validation Console

Use:

```bash
python3 scripts/validation_report.py \
  --cohort alpha-2026-08 \
  --days 14 \
  --env-file .env.local
```

or the documented operator-equivalent evidence path where appropriate.

The Console shows:

- Product Gate metrics and target hypotheses;
- numerator / denominator / rate;
- locale/source/device mix;
- Strong Aha by Lab/layer/locale with response counts;
- qualitative review queue without participant identifiers;
- data-health ERROR/WARNING;
- evidence freshness;
- dynamic production-smoke exclusion status.

See `docs/VALIDATION_CONSOLE.md`.

## Data health

Product decisions must not silently ignore evidence-integrity failures.

Current known production debt before formal recruitment:

```text
ERROR    0
WARNING  1 historical unattributed feedback_without_start
```

The historical WARNING is visible evidence debt but is not a current production-contract blocker.

Unresolved ERROR evidence should stop Product Gate interpretation until investigated.

## Production release evidence

Code CI is not sufficient evidence that production is serving the same release.

Production Smoke first checks:

```text
/assets/build-meta.json.gitCommitSha
== exact triggering main SHA
```

It polls every 5 seconds for at most 120 seconds and fails closed if production remains stale. Only after exact identity is proven does it execute the bilingual route and event/feedback/waitlist smoke.

See `docs/PRODUCTION_RELEASE_GATE.md`.

## Initial internal decision signals

| Signal | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% |
| First Lab → Second Layer | ≥ 30% |
| Users engaging with ≥2 Labs | ≥ 25% |
| Strong Aha Rate | ≥ 60% |
| Want more Labs | ≥ 40% *(hypothesis; not directly measurable yet)* |
| Pricing visit | ≥ 10% |
| Paid / founding intent | ≥ 3% |
| D7 Return | ≥ 15%; ≥20% strong |

These are internal hypotheses, not industry benchmarks and not automatic pass/fail rules.

## Privacy / data-minimization boundary

Validation Alpha intentionally does not require:

- account identity;
- social profile;
- precise location;
- browser fingerprinting;
- IP storage in application tables;
- full clickstream capture;
- prompt contents or user-entered Lab data in ordinary analytics events.

The optional Aha note is user content and should be handled as such.

## Running the cohort

The canonical operating protocol is `docs/VALIDATION_ALPHA_RUNBOOK.md` and GitHub issue #19.

Core rules:

- recruit deliberately, not broadly;
- preserve natural product use instead of forcing a Lab order;
- record cohort start/end timestamps;
- do not change product mechanics or metric semantics mid-cohort except documented P0/P1 intervention;
- monitor data health rather than optimizing metrics during the run;
- allow D7 eligibility to mature before final interpretation;
- deliberately close the cohort window.

## M4 Product Gate

M4A (memo process/system) is complete. The final M4B decision occurs only after #19 closes the real cohort window.

Generate a draft/final memo with:

```bash
python3 scripts/product_gate_memo.py \
  --cohort alpha-2026-08 \
  --from <COHORT_START_ISO> \
  --to <COHORT_END_ISO> \
  --version 1
```

The tool pre-fills reproducible M2/M3 evidence but does **not** auto-select the business decision.

The operator must review quantitative evidence, qualitative themes, contradictory evidence, data caveats, platform demand, reasons against the alternatives and next-phase plan before choosing exactly one:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

Auth, Billing, Entitlement, Credits, full Next.js production migration and Live Mode remain paused unless the reviewed decision is `GO PLATFORM`.
