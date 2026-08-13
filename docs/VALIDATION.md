# AhaFrame Validation Alpha

Date: 2026-08-13  
Status: active validation source of truth

## Purpose

AhaFrame has passed the v1 Conceptual Closure Gate. The next question is not whether more Labs can be built. It is whether qualified software developers actually form stronger AI-engineering mental models when they use the existing experiences.

The validation system therefore measures behavior and learning outcomes before account, billing, or full SaaS platform work resumes.

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

A Strong Aha is an internal product signal, not an academic learning assessment.

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
return_visit
```

### `lab_started`

Emitted on the first actual Lab interaction, not merely on page load.

### `meaningful_interaction`

Emitted once per Lab/session after either:

- at least two semantic interactions; or
- a meaningful preset / failure injection action.

This is intentionally stricter than click count.

### `failure_tradeoff_observed`

For Validation Alpha, this is emitted when the learner reaches the meaningful-interaction threshold in a failure/trade-off Lab. It represents exposure to the Lab's modeled trade-off, not proof that the learner understood it. Aha feedback is the separate learning-outcome signal.

### `second_lab_started`

Emitted when an anonymous learner starts a different Lab after previously starting at least one other Lab. The event also records whether the transition crosses an engineering layer.

### `capstone_completed`

Emitted once when the integrated Build first reaches its modeled `SHIP` state.

## Anonymous context

Every semantic analytics event receives the same shared context:

```text
schemaVersion
eventId
anonymousUserId
sessionId
firstSeenAt
visitCount
returnVisit
pageType
layer
labId
labVersion
utmSource
utmMedium
utmCampaign
firstUtmSource
referrer
deviceClass
path
ts
```

### Identity model

`anonymousUserId` is generated in the browser and persisted locally.

`sessionId` is session-scoped.

No email address is added to ordinary analytics events. Waitlist email is sent only in the dedicated waitlist payload.

No authentication is required for Validation Alpha.

## Attribution

The runtime stores:

- first-touch UTM source;
- current-session UTM source / medium / campaign;
- referrer;
- device class.

This is sufficient for the initial small-cohort experiment. It is not intended to become a full marketing attribution system.

## Aha feedback payload

Qualitative text is deliberately separated from ordinary event properties.

```text
feedbackId
anonymousUserId
sessionId
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

The optional note is capped at 1,200 characters.

When no remote feedback endpoint is configured, feedback is saved only in the current browser and the UI explicitly says **Demo mode**. It must never claim remote success.

## Runtime endpoints

Build-time public endpoint URLs:

```text
AHAFRAME_ANALYTICS_ENDPOINT
AHAFRAME_FEEDBACK_ENDPOINT
AHAFRAME_WAITLIST_ENDPOINT
```

They are URLs, not secrets.

All three can point to the same validation-ingest endpoint because the server distinguishes event, feedback, and waitlist payload shapes.

## Provider boundary

Browser Labs depend only on the AhaFrame endpoint contract.

```text
Lab Adapter
     ↓
AhaFrame.track / submitFeedback
     ↓
provider-neutral HTTP endpoint
     ↓
Validation storage
```

The first Alpha storage implementation is Supabase Postgres + one Edge Function. A later analytics product can consume the same event contract without rewriting Lab code.

## Supabase storage

Migration:

```text
supabase/migrations/202608130001_validation_alpha.sql
```

Tables:

```text
validation_events
aha_feedback
validation_waitlist
```

All three tables enable Row Level Security and expose no direct `anon` or `authenticated` table access. Browser writes go through the Edge Function; the service credential remains server-side.

The ingest function is:

```text
supabase/functions/validation-ingest/index.ts
```

It:

- accepts only configured origins;
- handles CORS preflight;
- accepts POST only;
- bounds payload size and string lengths;
- validates required event / feedback / waitlist fields;
- normalizes waitlist email;
- uses event and feedback IDs for idempotent writes;
- never returns database rows to public callers.

The function must be deployed with JWT verification disabled because Validation Alpha is anonymous. Origin checks and payload validation are therefore part of the endpoint's public-abuse boundary.

## Initial dashboard queries

### Unique visitors who started a Lab

```sql
select count(distinct anonymous_user_id)
from validation_events
where name = 'lab_started';
```

### Meaningful interaction rate

```sql
with starters as (
  select distinct anonymous_user_id, lab_id from validation_events where name = 'lab_started'
), meaningful as (
  select distinct anonymous_user_id, lab_id from validation_events where name = 'meaningful_interaction'
)
select
  count(*) filter (where meaningful.lab_id is not null)::numeric / nullif(count(*), 0) as rate
from starters
left join meaningful using (anonymous_user_id, lab_id);
```

### Strong Aha rate

```sql
select
  count(*) filter (where strong_aha)::numeric / nullif(count(*), 0) as strong_aha_rate
from aha_feedback;
```

### Second-Lab rate

```sql
select
  count(distinct anonymous_user_id) filter (where name = 'second_lab_started')::numeric
  / nullif(count(distinct anonymous_user_id) filter (where name = 'lab_started'), 0) as second_lab_rate
from validation_events;
```

### Strongest / weakest Labs by Aha

```sql
select
  lab_id,
  count(*) as responses,
  avg(case when strong_aha then 1 else 0 end) as strong_aha_rate
from aha_feedback
group by lab_id
order by strong_aha_rate desc, responses desc;
```

### Qualitative review queue

```sql
select submitted_at, layer, lab_id, rating, note
from aha_feedback
where note <> ''
order by submitted_at desc;
```

## Initial internal decision signals

These are decision rules for the first cohort, not industry benchmarks:

| Signal | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% |
| First Lab → Second Layer | ≥ 30% |
| Users completing ≥2 Labs | ≥ 25% |
| Strong Aha Rate | ≥ 60% |
| Want more Labs | ≥ 40% |
| Pricing visit | ≥ 10% |
| Paid / founding intent | ≥ 3% |
| D7 Return | ≥ 15%; ≥20% strong |

## Privacy / data-minimization boundary

Validation Alpha intentionally does not require:

- account identity;
- social profile;
- precise location;
- browser fingerprinting;
- IP storage in the application tables;
- full clickstream capture;
- prompt contents or user-entered Lab data in ordinary analytics events.

The optional Aha note is user-submitted qualitative text and should be treated as user content.

## Product Gate

After the first qualified cohort, choose one:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

A `GO PLATFORM` decision should be supported by meaningful Aha, cross-layer continuation, return/future-use intent, credible payment intent, and no unresolved trust issue around deterministic educational metrics.
