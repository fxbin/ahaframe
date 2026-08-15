# AhaFrame Development Roadmap

Date: 2026-08-15  
Version: v0.7 — Validation Alpha Ready  
Status: active execution roadmap

## Product direction

AhaFrame is an **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

Learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principles:

> **Simulate the concept. Spend compute only to validate reality.**

> **Do not let platform completeness outrun product evidence.**

> **Anonymous First, Account Enhanced.**

The v1 mental model is conceptually closed. Content expansion stops by default. The current job is to determine whether the existing product creates durable product value for qualified developers.

## Execution sources of truth

- `docs/ROADMAP.md` — phase order and stop lines;
- GitHub issue #22 — master execution state;
- GitHub issue #19 — current Validation Alpha run;
- GitHub issue #60 — cohort/evidence-system Epic;
- GitHub issue #64 — Product Gate M4B final decision;
- `docs/VALIDATION.md` — validation/evidence contract;
- `docs/VALIDATION_METRICS.md` — M2 metric definitions;
- `docs/VALIDATION_CONSOLE.md` — M3 operator workflow;
- `docs/PRODUCT_GATE_MEMO.md` — M4 decision process;
- `docs/VALIDATION_ALPHA_RUNBOOK.md` — current cohort protocol;
- `docs/PRODUCTION_RELEASE_GATE.md` — exact-production release evidence.

---

# Phase 0 — Product Foundation

**Status: COMPLETE**

Foundation experiences:

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done
```

Failure / production experiences:

```text
Instruction Conflict Lab       done
RAG Failure Lab                done
Context Compression Lab        done
Agent Reliability Lab          done
Agent Workflow Graph Lab       done
Evaluation Failure Lab         done
```

Integrated Build:

```text
Reliable Support Agent Build   done
```

Foundation infrastructure includes AhaFrame brand/domain, deterministic Lab Engine, static production build, bilingual `en`/`zh-CN` surface, SEO/GEO, Vercel Web Analytics, GA4, Early Access signup, and a paused Next.js migration bootstrap kept green in CI.

---

# Phase 1 — Conceptual Closure v1

**Status: PASSED**

Goal:

> Give each engineering responsibility at least one meaningful failure/trade-off experience and connect all six once.

| Layer | Responsibility | Closure experience | Status |
|---|---|---|---|
| Prompt | Behavior / instruction authority | Instruction Conflict Lab | Done |
| Context | Knowledge / retrieval / compression | Context Window + RAG + Context Compression | Done |
| Harness | Runtime reliability / validation / approval | Agent Reliability Lab | Done |
| Loop | Iteration / recovery / termination | Agent Loop Simulator | Done |
| Graph | Workflow topology / state / retry / joins | Agent Workflow Graph Lab | Done |
| Evaluation | Evidence / release decision | Evaluation Failure Lab | Done |

Integration:

```text
Prompt + Context + Harness + Loop + Graph + Evaluation
                         ↓
             Reliable Support Agent Build
                         ↓
              SHIP / BLOCK / INCONCLUSIVE
```

## Content stop line

> **STOP CONTENT EXPANSION BY DEFAULT.**

New topics resume only when validation shows a real comprehension gap, repeated user demand, a paid-outcome dependency, or an incomplete six-layer mental model.

---

# Phase 2 — Validation Foundation

**Status: COMPLETE — #16 / #42 / #58**

AhaFrame now has:

- anonymous user/session context;
- locale-neutral semantic events;
- Strong Aha feedback;
- waitlist / paid-intent capture;
- durable Supabase persistence;
- `en` + `zh-CN` production parity;
- stable cohort attribution;
- production validation ingest.

Production Supabase truth:

```text
project: ahaframe-validation
ref:     swzddvprnyjrrgpzcsgp
```

Canonical migrations:

```text
20260814023253_validation_alpha.sql
20260815000100_validation_locale.sql
20260815071500_validation_cohort.sql
20260815092200_validation_read_models.sql
```

Do not use stale project refs or old migration filenames from historical notes.

---

# Phase 3 — Validation Operations

**Status: COMPLETE — #17 / #65 / #59 / #71 / #72 / #78**

Minimum trustworthy Alpha operations now include:

- `ahaframe.com` HTTPS + Vercel production;
- event / feedback / waitlist production persistence;
- Vercel deployment/runtime visibility;
- Supabase Edge Function logs;
- rollback procedure;
- P0/P1 Alpha stop rules;
- stable desktop/mobile language switching;
- production-ready Early Access conversion flow;
- bounded GitHub Actions trigger model;
- exact production commit identity before Production Smoke can pass.

## Exact production release invariant

Every production build publishes `/assets/build-meta.json`. Production Smoke must match its `gitCommitSha` against the exact triggering `main` SHA before route and POST smoke executes.

`Vercel READY` alone is not sufficient production evidence.

---

# Phase 4 — Validation Evidence System

**Status: M1–M4A COMPLETE — #60**

## M1 — #61 Cohort attribution — COMPLETE

Stable anonymous `cohortId`, persisted and propagated through event / feedback / waitlist without conflating locale or UTM attribution.

## M2 — #62 Product-decision read models — COMPLETE

Stable Postgres evidence layer:

```text
validation_product_events_v1
validation_feedback_latest_v1
validation_user_lab_facts_v1
validation_participant_facts_v1
validation_data_quality_issues_v1
validation_product_metrics_v1(...)
```

Every Product Gate metric has a defined numerator, denominator and grain with fixture-backed PostgreSQL regression.

`production-smoke` is excluded from Product Gate evidence.

Important semantics:

- D7 and continuation are cohort-scoped;
- `meaningful_interaction` and `failure_tradeoff_observed` are currently structurally coupled and cannot be double-weighted;
- `Want more Labs` is currently **not directly measurable**.

## M3 — #63 Internal Validation Console — COMPLETE

Operator-only local Markdown/HTML reporting:

- funnel and target hypotheses;
- strongest/weakest Labs/layers;
- locale/source/device mix;
- qualitative feedback review;
- data-health warnings;
- smoke-exclusion and evidence freshness.

No public `/admin` surface and no participant anonymous IDs in qualitative output.

## M4A — #64 Product Gate memo system — COMPLETE

A versioned memo generator now pre-fills M2/M3 evidence while leaving the final business decision to operator review.

It never auto-selects a decision from thresholds.

M4B remains pending until the real #19 cohort closes.

---

# Phase 5 — Validation Alpha

**Status: CURRENT / READY TO RECRUIT — #19**

Cohort:

> approximately **20–30 deliberately recruited software developers moving toward AI engineering**.

Stable cohort ID:

```text
alpha-2026-08
```

Tracked entry URLs:

```text
https://ahaframe.com/en/?cohort=alpha-2026-08
https://ahaframe.com/zh-cn/?cohort=alpha-2026-08
```

The cohort is intentionally not a broad Product Hunt / Hacker News / Reddit launch. The goal is interpretable product evidence, not traffic volume.

## Run rule

Ask participants to use AhaFrame naturally. Do not force a fixed Lab order. Do not change product mechanics, event semantics, metric formulas, or add new Labs during the cohort unless a documented P0/P1 evidence-integrity problem requires intervention.

See `docs/VALIDATION_ALPHA_RUNBOOK.md`.

## Primary evidence

- Landing → Lab Start;
- Meaningful Interaction;
- failure/trade-off exposure;
- Strong Aha with response counts;
- second Lab / second engineering layer;
- ≥2 meaningful Labs;
- integrated Build start/completion;
- return / D7;
- pricing / paid intent / waitlist conversion;
- qualitative save/sync/account/cross-device demand;
- strongest and weakest Labs/layers.

Initial hypotheses:

| Signal | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% |
| First Lab → Second Layer | ≥ 30% |
| Users engaging with ≥2 Labs | ≥ 25% |
| Strong Aha Rate | ≥ 60% |
| Want more Labs | ≥ 40% *(not directly measurable yet)* |
| Pricing visit | ≥ 10% |
| Paid / founding intent | ≥ 3% |
| D7 Return | ≥ 15%; ≥20% strong |

These are internal hypotheses, not industry benchmarks and not automatic pass/fail rules.

---

# Phase 6 — Product Gate / M4B

**Status: PENDING #19 COHORT CLOSE — #64**

After the cohort window is deliberately closed and D7-eligible users have had enough time to mature:

```text
final M3 operator report
        ↓
M4B versioned Product Gate memo
        ↓
quantitative + qualitative + contradictory evidence review
        ↓
choose exactly one decision
```

Decision set:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

A `GO PLATFORM` decision should normally require meaningful Aha, cross-layer continuation, return/future-use intent, credible demand, clean evidence integrity, and observed reasons that account/save/sync/platform capabilities solve actual user demand.

Do not reinterpret “software is deployable” as `GO PLATFORM`.

---

# Conditional Platform Path — PAUSED

Accepted future architecture remains:

```text
Next.js App Router + TypeScript
→ reusable Product Foundation
→ Anonymous-First Supabase identity/application layer
→ durable progress + Entitlement
→ Waffo billing adapter
→ optional credits / Live Mode later
```

Paused until reviewed `GO PLATFORM`:

```text
#11 / #27–#30 full runtime migration
#12 identity foundation
#13 progress / checkpoint / Entitlement
#14 Waffo billing
#15 compute-credit ledger
#18 platform E2E / security / billing gate
#20 bounded Live Mode
#21 Public Beta decision
```

No payment is collected during the current Validation Alpha.

---

# Current next action

```text
#66 canonical docs sync
        ↓
record #19 cohort start timestamp
        ↓
recruit 20–30 qualified developers
        ↓
monitor data health with M3 without changing experiment mechanics
        ↓
allow D7 eligibility to mature
        ↓
close cohort window deliberately
        ↓
M4B / #64 final Product Gate memo
        ↓
choose one decision before platform work resumes
```
