# AhaFrame Development Roadmap

Date: 2026-08-13  
Version: v0.6 — Conceptual Closure Complete / Validation First  
Status: active execution roadmap

## Product direction

AhaFrame is an English-first **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

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

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Current execution principle:

> **Do not let platform completeness outrun product evidence.**

The v1 mental model is now conceptually closed. Content expansion stops by default. The immediate job is to measure whether the existing system actually changes how qualified developers think about production AI.

Execution sources of truth:

- `docs/CURRICULUM.md` — curriculum map and backlog;
- `docs/PRODUCT_SPEC.md` — product and pricing hypotheses;
- `docs/VALIDATION.md` — Validation Alpha event, feedback, storage, and Product Gate contract;
- `docs/adr/0001-saas-platform-runtime.md` — accepted future SaaS runtime architecture;
- GitHub issue `#22` — master execution state;
- this roadmap — current phase order and stop lines.

---

# Phase 0 — Product Foundation

**Status: COMPLETE**

Foundation experiences:

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done
```

Production/failure experiences:

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

Foundation infrastructure:

- AhaFrame brand + `ahaframe.com`;
- warm-white / graphite / teal visual system;
- deterministic Lab / Simulation Engine;
- History / Checkpoint / Compare / Replay / Reset;
- static build + validation + CI;
- no-login crawlable educational pages;
- pricing hypothesis: `$49 one-time Foundations` + future `$12/month Production Labs`;
- paused Next.js migration bootstrap under `web/` kept green in CI.

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
Prompt
+ Context
+ Harness
+ Loop
+ Graph
+ Evaluation
        ↓
Reliable Support Agent Build
        ↓
SHIP / BLOCK / INCONCLUSIVE
```

The integrated Build uses existing layer scenarios rather than inventing a second set of formulas. Automated tests verify that:

- the starting architecture is blocked by cross-layer failures;
- repairing Prompt alone does not hide Graph/runtime problems;
- repairing Graph alone does not hide Prompt problems;
- one coherent six-layer reference architecture can clear the modeled release gate.

## Content stop line

**Effective immediately:**

> **STOP CONTENT EXPANSION BY DEFAULT.**

Do not build another Lab merely because a new AI Engineering term appears.

Backlog topics such as MCP, idempotency, tool contracts, guardrails, routing, observability, multi-agent patterns, and framework tutorials resume only when one of these is true:

1. Validation shows a real comprehension gap;
2. users repeatedly request the topic;
3. it is required for a paid outcome;
4. the six-layer mental model is proven incomplete.

---

# Phase 2 — Validation Instrumentation

**Status: CURRENT — issue #16**

Goal:

> Measure behavior, mental-model change, cross-layer continuation, future-use intent, and return behavior before building account/billing/platform completeness.

## Anonymous validation context

Every semantic event receives:

```text
anonymousUserId
sessionId
firstSeenAt
visitCount
returnVisit
pageType
layer
labId
labVersion
utmSource / medium / campaign
firstUtmSource
referrer
deviceClass
```

No account is required.

## Funnel

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

### Meaningful Interaction

A page view does not count.

For the first Alpha, a Lab reaches meaningful interaction after either:

- at least two semantic state-changing actions; or
- a meaningful preset / explicit failure-injection action.

This is an operational product metric, not a formal learning assessment.

## Strong Aha

After selected meaningful states, ask:

> **Did this change how you think about this system?**

Responses:

```text
No
A little
Yes
Oh, I finally get it.
```

```text
Strong Aha = Yes + Oh, I finally get it.
```

Optional qualitative prompt:

> **What do you understand differently now?**

The optional note is stored separately from ordinary analytics properties.

## Validation backend

Provider-neutral browser contract:

```text
AhaFrame semantic events / feedback / waitlist
        ↓
HTTP ingest endpoint
        ↓
Supabase Edge Function
        ↓
Postgres
```

Repository implementation:

```text
supabase/migrations/202608130001_validation_alpha.sql
supabase/functions/validation-ingest/index.ts
```

Tables:

```text
validation_events
aha_feedback
validation_waitlist
```

Security boundary:

- Row Level Security enabled;
- no direct browser access to validation tables;
- service credential only in the server-side Edge Function;
- allowed-origin check;
- POST-only ingest;
- bounded payload/string sizes;
- event/feedback IDs provide idempotency;
- public callers receive no database rows.

See `docs/VALIDATION.md`.

## Phase 2 exit criteria

Before deployment:

- [x] stable anonymous identity/session model;
- [x] return-visit model;
- [x] first/session attribution;
- [x] semantic event enrichment;
- [x] Meaningful Interaction derivation;
- [x] Aha feedback UI/payload;
- [x] explicit local Demo mode;
- [x] waitlist enriched with anonymous validation context;
- [x] migration + Edge Function contract in repo;
- [x] runtime/build/backend contract tests in CI;
- [ ] dedicated AhaFrame Supabase project provisioned;
- [ ] migration applied;
- [ ] anonymous ingest function deployed and verified end-to-end.

Issue #16 remains open until the final three remote-storage items pass.

---

# Phase 3 — Validation Deployment

**Status: NEXT — issue #17**

Goal:

> Put the conceptually closed, no-login product in front of real users with durable evidence capture and basic operational visibility.

Required:

- production `ahaframe.com` deployment;
- validation endpoint configured for analytics, feedback, and waitlist;
- real event/feedback/waitlist writes verified;
- anonymous session continuity verified;
- canonical/robots/sitemap/OG checked;
- mobile + desktop smoke test;
- basic error/uptime visibility;
- rollback procedure.

Still **not required** before Validation Alpha:

```text
Supabase Auth
cross-device progress
Entitlement
Waffo checkout
Subscription
CreditLedger
full Next.js SaaS migration
Live Mode
```

---

# Phase 4 — Validation Alpha

**Status: AFTER #16 + #17 — issue #19**

Cohort:

> approximately **20–30 qualified software developers moving toward AI engineering**.

Observe:

- where developers enter the stack;
- which Labs produce meaningful interaction;
- whether failure/trade-off states are reached;
- Strong Aha by layer / Lab;
- qualitative mental-model changes;
- first-Lab → second-Lab / cross-layer continuation;
- capstone use;
- more-Labs / pricing / waitlist intent;
- return behavior;
- confusion around synthetic educational metrics.

Initial internal decision signals:

| Signal | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% |
| First Lab → Second Layer | ≥ 30% |
| Users completing ≥2 Labs | ≥ 25% |
| **Strong Aha Rate** | **≥ 60%** |
| Want more Labs | ≥ 40% |
| Pricing visit | ≥ 10% |
| Paid / founding intent | ≥ 3% |
| D7 Return | ≥ 15%; ≥20% strong |

These are internal decision heuristics, not industry benchmarks.

---

# Phase 5 — Product Gate

After the first qualified cohort, choose exactly one primary decision:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

A `GO PLATFORM` decision should normally require:

- clear mental-model value / Strong Aha;
- meaningful cross-layer continuation;
- future-use or return intent;
- credible payment intent;
- no unresolved trust problem around deterministic educational metrics.

Do not reinterpret “software is deployable” as `GO PLATFORM`.

---

# Conditional Platform Path — PAUSED

Accepted architecture is preserved:

```text
Next.js App Router + TypeScript
→ Raphael StarterKit reusable SaaS foundation
→ Supabase identity + application data
→ Waffo payment adapter
→ AhaFrame Lab Engine remains framework-independent
```

Existing work is not discarded. The Next.js M1 bootstrap under `web/` remains covered by CI.

Paused until `GO PLATFORM`:

```text
#11 / #27–#30 full runtime migration
#12 optional Supabase identity
#13 progress / checkpoint / entitlement
#14 Waffo billing
#15 compute-credit ledger
#18 platform E2E / security / billing gate
#20 bounded Live Mode
#21 Public Beta decision
```

Identity remains optional even after platform work resumes:

```text
Visit / learn / use Labs anonymously
        ↓
Save / Purchase / Build / Live Mode
        ↓
Sign in
```

Credits remain reserved for **real compute**, never ordinary learning or deterministic simulation.

---

# Current next action

```text
#16 code / storage contract      almost complete
        ↓
provision AhaFrame Supabase project
        ↓
apply migration + deploy ingest function
        ↓
verify durable event / feedback / waitlist writes
        ↓
close #16
        ↓
#17 validation deployment
        ↓
#19 qualified developer Alpha
        ↓
Product Gate
```
