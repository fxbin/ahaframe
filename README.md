# AhaFrame — Interactive AI Engineering

AhaFrame is an interactive learning product for experienced software developers becoming AI engineers.

> **Understand AI by seeing it work.**

Learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Product invariant:

> **Anonymous First, Account Enhanced.**

## AI Engineering Stack

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

The v1 Conceptual Closure Gate is complete. AhaFrame is now in **Validation Alpha**, not content expansion or SaaS-platform completion.

## Current experiences

### Foundations

- **Token Playground** — next-token prediction, sampling, temperature.
- **Context Window Lab** — context budgets, overflow, summarization, retrieval, memory.
- **Agent Loop Simulator** — act, observe, retry, recover, terminate.

### Failure / trade-off Labs

- **Instruction Conflict Lab** — Prompt authority and the Prompt → Harness / Evaluation boundary.
- **RAG Failure Lab** — retrieval recall/precision, context pressure, latency, cost, quality.
- **Context Compression Lab** — token savings versus critical-information retention.
- **Agent Reliability Lab** — retries, validation, approval, termination, safety, latency, cost.
- **Agent Workflow Graph Lab** — topology, state boundaries, retry scope, joins and failure propagation.
- **Evaluation Failure Lab** — coverage, regressions, safety vetoes and `SHIP / BLOCK / INCONCLUSIVE`.

### Integrated Build

- **Reliable Support Agent Build** — composes Prompt, Context, Harness, Loop, Graph and Evaluation into one release architecture challenge.

All modeled metrics are deterministic educational quantities unless a future Live Mode explicitly reports real execution evidence.

## Public routes

AhaFrame ships equivalent `en` and `zh-CN` surfaces, including:

```text
/en/                              /zh-cn/
/en/lessons/...                   /zh-cn/lessons/...
/en/labs/...                      /zh-cn/labs/...
/en/build/reliable-support-agent/ /zh-cn/build/reliable-support-agent/
/en/pricing/                      /zh-cn/pricing/
/en/early-access/                 /zh-cn/early-access/
```

The desktop language control preserves equivalent-route switching; mobile exposes direct locale rows.

## Validation Alpha — current phase

Current execution issue: **#19 — Run 20–30 developer Validation Alpha**.

Stable cohort:

```text
alpha-2026-08
```

Tracked entry URLs:

```text
https://ahaframe.com/en/?cohort=alpha-2026-08
https://ahaframe.com/zh-cn/?cohort=alpha-2026-08
```

The cohort is deliberately recruited from qualified software developers moving toward AI engineering. Broad launch and vanity traffic are not the experiment.

Primary outcome:

> **Did this change how you think about this system?**

```text
no      = No
little  = A little
yes     = Yes
aha     = Oh, I finally get it.

Strong Aha = yes + aha
```

Strong Aha is a product signal, not an academic learning-efficacy claim.

Validation funnel:

```text
landing_viewed
→ lab_started
→ meaningful_interaction
→ failure_tradeoff_observed
→ aha_feedback_submitted
→ second_lab_started
→ capstone_started / capstone_completed
→ pricing_viewed / paid_intent_clicked
→ waitlist_submitted
→ return / D7
```

Important interpretation constraints:

- `meaningful_interaction` and `failure_tradeoff_observed` are currently structurally coupled; do not double-weight them.
- `Want more Labs` remains an internal target hypothesis but is **not directly measurable** in the current semantic contract.
- `production-smoke` evidence is excluded from Product Gate metrics.

See:

- `docs/VALIDATION.md` — evidence contract and semantic boundaries;
- `docs/VALIDATION_METRICS.md` — deterministic M2 Product Gate metric definitions;
- `docs/VALIDATION_CONSOLE.md` — operator-only M3 reporting workflow;
- `docs/PRODUCT_GATE_MEMO.md` — M4 decision-memo process;
- `docs/VALIDATION_ALPHA_RUNBOOK.md` — current cohort operating protocol.

## Anonymous validation runtime

Semantic events carry provider-neutral context including:

```text
anonymousUserId
sessionId
cohortId
visitCount / returnVisit
pageType
layer
labId / labVersion
locale
UTM attribution
referrer
deviceClass
```

No login is required. Ordinary analytics events do not contain email. Waitlist email is confined to the dedicated waitlist payload.

## Production validation backend

Production project:

```text
Supabase project: ahaframe-validation
project ref:      swzddvprnyjrrgpzcsgp
Edge Function:    validation-ingest
```

Canonical migrations:

```text
supabase/migrations/20260814023253_validation_alpha.sql
supabase/migrations/20260815000100_validation_locale.sql
supabase/migrations/20260815071500_validation_cohort.sql
supabase/migrations/20260815092200_validation_read_models.sql
```

Storage:

```text
validation_events
aha_feedback
validation_waitlist
```

Direct browser table access is denied. RLS is enabled; public table roles are revoked; the service credential remains server-side. The anonymous `validation-ingest` function is deployed with JWT verification disabled by design, while origin and payload validation form the public endpoint boundary.

Public build-time endpoint URLs are configuration, not secrets:

```bash
AHAFRAME_ANALYTICS_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_FEEDBACK_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_WAITLIST_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_BASE_URL=https://ahaframe.com \
python3 scripts/build_site.py
```

## Evidence system

```text
Raw events / feedback / waitlist
        ↓
M2 stable Postgres read models
        ↓
validation_product_metrics_v1
        ↓
M3 operator Validation Console
        ↓
M4 Product Gate decision memo
```

M1–M3 and M4A are complete. M4B remains open until the real #19 cohort closes and a final decision is reviewed.

## Production release gate

A successful CI run is not production evidence by itself.

Every static production build publishes:

```text
/assets/build-meta.json
```

Production Smoke first requires the marker's full Git SHA to match the exact `main` commit that triggered it. It polls for up to 120 seconds, then fails closed if production remains stale. Only after an exact match does it run the bilingual route and validation event/feedback/waitlist smoke.

See `docs/PRODUCTION_RELEASE_GATE.md`.

## Analytics

Production also includes:

- Vercel Web Analytics;
- GA4 (`G-EWPR5QXGWJ`);
- AhaFrame's own semantic Validation Alpha evidence pipeline.

GA4/Vercel analytics describe traffic and acquisition. They do **not** replace AhaFrame's Product Gate evidence model.

## Lab / Simulation Engine

AhaFrame uses a dependency-free deterministic browser runtime:

```text
Scenario
  ↓
State
  ↓
Action
  ↓
Reducer
  ↓
Derived Metrics
  ↓
DOM Adapter
```

Reusable primitives include History, Checkpoint, Compare, Replay, Reset and Failure Injection. The integrated Build reuses existing layer scenarios rather than duplicating formulas.

See `docs/LAB_ENGINE.md`.

## Run locally

```bash
python3 scripts/build_site.py
python3 -m http.server 8080 --directory site
```

Open:

```text
http://localhost:8080/en/
```

Production-style static build:

```bash
AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/build_site.py
```

## Validation / CI

Primary checks are wired into GitHub Actions. Useful focused commands include:

```bash
node scripts/test_lab_engine.js
node scripts/test_integrated_build.js
node scripts/test_validation_runtime.js
python3 scripts/test_validation_report.py
python3 scripts/test_product_gate_memo.py
python3 scripts/test_production_release_marker.py
python3 scripts/build_site.py
python3 scripts/validate.py
python3 scripts/test_validation_build.py
```

Feature-branch pushes do not run duplicate remote CI. PRs into `main` run the PR Gate; `main` runs the Main Gate; successful main CI triggers one exact-commit Production Smoke.

## Pricing hypothesis

```text
Free                       $0
AI Engineer Foundations    $39 one-time hypothesis
Production Labs            $12/month future hypothesis
```

The two paid products are separate entitlements: Foundations is a one-time lifetime learning path; Production Labs is a continuing subscription for new advanced production incidents and workflows and does not include the Foundations purchase.

No real payment is collected during Validation Alpha.

## Platform architecture — accepted but paused

Accepted future architecture:

```text
Next.js App Router + TypeScript
→ reusable Product Foundation
→ Anonymous-First Supabase identity/application layer
→ durable progress + Entitlement
→ Waffo billing adapter
→ optional credits / Live Mode later
```

The `web/` Next.js bootstrap remains green in CI. Full production migration, Auth, Entitlement, Waffo and Credits remain paused until a reviewed M4B Product Gate produces **GO PLATFORM**.

## Current execution order

```text
Conceptual Closure                         DONE
#16 validation instrumentation/storage     DONE
#17/#65 Alpha ops readiness                DONE
#59 language switcher                      DONE
#61 M1 cohort attribution                  DONE
#62 M2 decision read models                DONE
#63 M3 Validation Console                  DONE
#64 M4A memo system                        DONE
#78 exact production release gate          DONE

#19 Developer Validation Alpha             READY / CURRENT
#64 M4B final Product Gate decision        AFTER COHORT

GO PLATFORM ?
  yes → resume conditional platform path
  no  → validate again / reframe / content-brand / stop
```

See `docs/ROADMAP.md` and GitHub master issue #22 for the active execution plan.
