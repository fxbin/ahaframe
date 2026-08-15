# AhaFrame Validation Alpha Metrics

Status: M2 metric contract for #62  
Parent: #60  
Depends on: #61

## Purpose

Turn raw Validation Alpha telemetry into deterministic product-evidence definitions before any operator console or Product Gate UI is built.

The rule is simple:

> The same cohort, analysis window, and dimension filters must produce the same product numbers for every operator.

This document is the semantic contract. SQL read models and fixture tests must implement it; UI/reporting code must not redefine it.

## Evidence sources

Primary production tables:

- `validation_events` — behavioral evidence;
- `aha_feedback` — self-reported mental-model shift;
- `validation_waitlist` — durable contact record, not the primary conversion counter.

### Stable semantic events

Current runtime derives these product events:

- `landing_viewed`
- `lab_viewed`
- `lab_started`
- `meaningful_interaction`
- `failure_tradeoff_observed`
- `second_lab_started`
- `aha_feedback_submitted`
- `capstone_viewed`
- `capstone_started`
- `capstone_completed`
- `pricing_viewed`
- `paid_intent_clicked`
- `waitlist_submitted`
- `return_visit`

Lower-level events such as `lab_action`, `*_changed`, `*_selected`, `*_preset_applied`, pricing CTA source events, etc. are implementation telemetry. They may explain behavior but are not Product Gate metrics unless promoted into this contract.

## Audit findings and interpretation rules

### 1. `lab_started` is activation, not `lab_viewed`

`lab_viewed` may be emitted for both Lab and interactive lesson surfaces. `lab_started` is emitted only after the first semantic interaction. Product activation therefore uses `lab_started`.

### 2. `failure_tradeoff_observed` is exposure, not understanding

The runtime emits `failure_tradeoff_observed` when a Lab reaches the meaningful-interaction threshold. It means the learner was exposed to the modeled trade-off. It must never be interpreted as proof of understanding.

Understanding remains a separate self-reported signal from `aha_feedback`.

### 3. Do not trust `second_lab_started` as the cohort truth

The browser keeps visited Labs across visits. A user may have started a Lab before entering the current cohort. Therefore Product Gate metrics must derive second-Lab and second-Layer continuation from cohort-scoped `lab_started` facts, not directly count `second_lab_started`.

The derived event remains useful as runtime diagnostic telemetry.

### 4. Do not use `return_visit` directly for cohort retention

`return_visit` reflects browser-lifetime visit count. It can be true on the first session inside a newly assigned cohort. Cohort retention must therefore be recomputed from cohort-scoped `session_id` and `event_ts`.

### 5. D7 uses persisted event time, not browser `firstSeenAt`

The browser validation context contains `firstSeenAt`, but the production event table does not persist that field. For Product Gate retention:

```text
cohort_first_seen_at = min(event_ts)
per cohort_id + anonymous_user_id
```

D7 is then derived from persisted events.

### 6. Waitlist conversion uses the success event

`validation_waitlist` is keyed/upserted by email and can therefore represent the latest durable contact attribution for that email. It is not an immutable conversion ledger.

The product metric `waitlist_conversion` uses `waitlist_submitted`, which is emitted only after the remote waitlist POST succeeds. The waitlist table is used for contact operations and data-health reconciliation.

### 7. Strong Aha is separate from behavioral engagement

Valid ratings:

```text
no
little
yes
aha
```

```text
Strong Aha = yes OR aha
```

Strong Aha is an internal product signal, not an academic efficacy claim.

## Reserved / non-product evidence

The following must be excluded from Product Gate metrics by default:

- `cohort_id = 'production-smoke'`;
- event `name = 'production_smoke_test'`;
- explicitly documented test fixtures.

Raw rows remain available for operational verification.

## Analysis window

Every Product Gate query accepts an explicit half-open interval:

```text
[window_start, window_end)
```

Events at `window_end` are excluded.

For a deliberately closed Alpha cohort, the final report should freeze the exact window in the Product Gate memo.

## Canonical dimensions

### Cohort

`cohort_id` is the experiment partition, not identity.

### Locale

Overall participant metrics deduplicate users across locales. Locale breakdowns use the locale at the relevant semantic grain:

- participant metrics: locale of the participant's first product event in the cohort/window;
- Lab metrics: locale of the first Lab start for that user × Lab;
- Aha metrics: locale of the feedback response.

Locale breakdowns are therefore not guaranteed to sum to an overall metric if a participant uses multiple locales.

### Layer / Lab

Use the stable `layer` and `lab_id` attached to semantic events. Lab-level metrics operate at user × Lab grain.

### Acquisition

At participant grain, acquisition source/medium/campaign are taken from the earliest persisted product event inside the cohort/window. `first_utm_source` may be retained as a lifetime-attribution diagnostic, but Product Gate cohort segmentation must remain reproducible from persisted cohort events.

### Device

Participant-level device breakdown uses the device class on the earliest product event in the cohort/window. Lab-level device breakdown uses the first Lab-start event for the user × Lab.

## Canonical grains

### Participant fact

```text
1 row = cohort_id × anonymous_user_id
```

### User-Lab fact

```text
1 row = cohort_id × anonymous_user_id × lab_id
```

### Feedback fact

For overall Strong Aha, deduplicate to the latest valid feedback per:

```text
cohort_id × anonymous_user_id × lab_id
```

A locale-specific Aha breakdown may use the latest valid feedback per:

```text
cohort_id × anonymous_user_id × lab_id × locale
```

This prevents repeated submissions from one participant from overweighting a Lab.

## Product Gate metrics

### 1. Unique Cohort Visitors

**Meaning:** number of distinct anonymous participants with product telemetry in the cohort/window.

**Numerator:** distinct `anonymous_user_id` with at least one eligible `validation_events` row.  
**Denominator:** none.  
**Grain:** participant.

### 2. Landing → Lab Start

**Meaning:** activation from landing into a real interactive learning experience.

**Numerator:** landing visitors who have a `lab_started` event later in the same cohort/window.  
**Denominator:** distinct participants with `landing_viewed`.  
**Grain:** participant.  
**Target hypothesis:** ≥ 40%.

Direct-to-Lab visitors are not part of this denominator; they remain visible in cohort visitor and Lab-start counts.

### 3. Meaningful Interaction Rate

**Meaning:** how often a started Lab becomes a substantive interaction.

**Numerator:** distinct user × Lab facts with `meaningful_interaction`.  
**Denominator:** distinct user × Lab facts with `lab_started`.  
**Grain:** user × Lab.  
**Target hypothesis:** ≥ 60%.

Capstone uses its own start/completion metrics and is excluded from this denominator.

### 4. Failure / Trade-off Exposure Rate

**Meaning:** share of started Lab experiences that reach the modeled trade-off threshold.

**Numerator:** distinct user × Lab facts with `failure_tradeoff_observed`.  
**Denominator:** distinct user × Lab facts with `lab_started`.  
**Grain:** user × Lab.  
**Target hypothesis:** ≥ 40%.

This is exposure only; do not combine it with Aha feedback into a learning-efficacy claim.

### 5. Strong Aha Rate

**Meaning:** share of valid deduplicated feedback responses reporting a meaningful mental-model shift.

**Numerator:** deduplicated feedback facts where `strong_aha = true`.  
**Denominator:** all valid deduplicated feedback facts.  
**Grain:** latest feedback per user × Lab.  
**Target hypothesis:** ≥ 60%.

Do not use all Lab starters as the denominator. Feedback response rate is a separate data-quality/product-UX diagnostic.

### 6. First Lab → Second Lab

**Meaning:** whether users continue beyond a single experience.

**Numerator:** participants with at least two distinct `lab_id` values among cohort-scoped `lab_started` events.  
**Denominator:** participants with at least one `lab_started`.  
**Grain:** participant.

Do not count the runtime `second_lab_started` event directly.

### 7. First Lab → Second Engineering Layer

**Meaning:** whether users continue across the broader AI-engineering system rather than only trying a second Lab in the same layer.

**Numerator:** participants with `lab_started` events in at least two distinct engineering layers.  
**Denominator:** participants with at least one `lab_started`.  
**Grain:** participant.  
**Target hypothesis:** ≥ 30%.

### 8. Users Engaging with ≥2 Labs

**Meaning:** breadth of real engagement.

**Numerator:** participants with at least two distinct Labs that each reached `meaningful_interaction`.  
**Denominator:** participants with at least one `lab_started`.  
**Grain:** participant.  
**Target hypothesis:** ≥ 25%.

This is intentionally stricter than merely starting two Labs.

### 9. Capstone Start Rate

**Numerator:** participants with `capstone_started`.  
**Denominator:** participants with at least one `lab_started`.  
**Grain:** participant.

### 10. Capstone Completion Rate

**Numerator:** participants with `capstone_completed`.  
**Denominator:** participants with `capstone_started`.  
**Grain:** participant.

`capstone_completed` must be based on the stable `data-decision='SHIP'` semantic state, never localized visible text.

### 11. Pricing Visit Rate

**Numerator:** participants with `pricing_viewed`.  
**Denominator:** unique cohort visitors.  
**Grain:** participant.  
**Target hypothesis:** ≥ 10%.

A secondary diagnostic may compute pricing visits among meaningful participants.

### 12. Paid / Founding Intent Rate

**Numerator:** participants with `paid_intent_clicked`.  
**Denominator:** unique cohort visitors.  
**Grain:** participant.  
**Target hypothesis:** ≥ 3%.

A secondary commercial-funnel diagnostic may use pricing visitors as denominator.

### 13. Waitlist Conversion

**Numerator:** participants with successful `waitlist_submitted` events.  
**Denominator:** unique cohort visitors.  
**Grain:** participant.

The durable waitlist table is a reconciliation source, not the immutable numerator ledger.

### 14. Any Return

**Numerator:** participants with at least two distinct cohort-scoped `session_id` values.  
**Denominator:** unique cohort visitors.  
**Grain:** participant.

This replaces direct use of the browser-lifetime `return_visit` flag.

### 15. D7 Return

**First seen:** earliest eligible event timestamp for the participant inside the cohort.  
**Returned:** at least one eligible event in:

```text
[first_seen_at + 7 days, first_seen_at + 8 days)
```

**Numerator:** D7-returned participants.  
**Denominator:** participants whose `first_seen_at < window_end - 7 days` so they had a complete opportunity to return.  
**Grain:** participant.  
**Target hypothesis:** ≥ 15%; ≥ 20% strong.

Participants who have not yet matured for seven days are excluded from the denominator, not counted as failures.

## Additional diagnostics

These are useful for M3 but are not standalone Product Gate pass/fail rules:

- feedback response rate;
- pricing → paid-intent conversion;
- paid-intent → waitlist conversion;
- D1 / D3 / D7+ return;
- strongest / weakest Labs by Strong Aha;
- meaningful interaction by Lab/layer;
- cohort / locale / source / device sample sizes;
- anonymous participants with conflicting or missing dimension data.

## `Want more Labs` target status

The roadmap currently lists `Want more Labs ≥ 40%`, but the production semantic event contract does not yet contain a dedicated immutable `want_more_labs` signal.

M2 must not invent this metric from unrelated clicks. Until a stable explicit signal is added or #64 defines a qualitative coding rule, report this target as **not directly measurable**.

This is a Product Gate caveat, not a reason to add speculative instrumentation during the cohort without review.

## Data-quality rules

At minimum, the M2 validator must flag:

### ERROR

- `meaningful_interaction` without a cohort-scoped Lab start for the same user × Lab;
- `failure_tradeoff_observed` without `meaningful_interaction` for the same user × Lab;
- `capstone_completed` without `capstone_started`;
- `strong_aha = true` with feedback rating outside `yes|aha`;
- feedback rating `yes|aha` with `strong_aha = false`;
- unsupported locale values in evidence rows;
- reserved smoke/test rows included in Product Gate results.

### WARNING

- multiple distinct feedback submissions for the same user × Lab;
- participant dimensions that change during a cohort;
- Lab events with missing `lab_id` or `layer`;
- feedback for a Lab with no observed Lab start in the analysis window;
- waitlist durable row exists but no matching successful `waitlist_submitted` event for the anonymous user/cohort;
- very small dimension slices that should not be interpreted comparatively.

## Read-model contract

M2 implementation should expose at least:

```text
validation_participant_facts_v1
validation_user_lab_facts_v1
```

and a deterministic metric query/function that accepts:

```text
cohort_id
window_start
window_end
```

Dimensioned analysis should be built from these facts rather than duplicating raw-event logic in M3.

## Versioning

Metric semantics are versioned. If a numerator, denominator, grain, or interpretation changes materially, create a new read-model/metric version rather than silently changing historical Product Gate numbers.

## Non-goals

- generic data warehouse;
- public `/admin` dashboard;
- predictive scoring;
- user profiling;
- broad clickstream capture;
- Auth/Billing/Entitlement dependencies;
- changing runtime event names merely to simplify SQL.
