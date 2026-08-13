# AhaFrame — Interactive AI Engineering

AhaFrame is an English-first interactive learning product for experienced software developers becoming AI engineers.

> **Understand AI by seeing it work.**

Learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

## AI Engineering Stack

AhaFrame organizes production AI responsibilities into six cross-cutting layers:

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

The v1 Conceptual Closure Gate is complete. The current execution phase is **Validation First**, not content expansion or SaaS-platform completion.

## Current experiences

### Foundations

- **Token Playground** — next-token prediction, sampling, temperature.
- **Context Window Lab** — context budgets, overflow, summarization, retrieval, memory.
- **Agent Loop Simulator** — act, observe, retry, recover, terminate.

### Failure / trade-off Labs

- **Instruction Conflict Lab** — Prompt authority, specificity, retrieved-context boundaries, output contracts, and the point where Prompt must hand off to Harness / Evaluation.
- **RAG Failure Lab** — retrieval configuration, recall, precision, context pressure, latency, cost, and quality.
- **Context Compression Lab** — token savings versus critical-information retention, evidence coverage, hallucination risk, latency, and cost.
- **Agent Reliability Lab** — retries, limits, validation, approval, termination, safety, latency, cost, and review load.
- **Agent Workflow Graph Lab** — topology, state boundaries, retry scope, joins, parallelism, coordination cost, and failure propagation.
- **Evaluation Failure Lab** — dataset coverage, regressions, safety vetoes, evidence strength, cost gates, and `SHIP / BLOCK / INCONCLUSIVE`.

### Integrated Build

- **Reliable Support Agent Build** — composes Prompt, Context, Harness, Loop, Graph, and Evaluation into one release architecture challenge.

All modeled metrics are deterministic educational quantities unless a future Live Mode explicitly reports real execution evidence.

## Current routes

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/labs/instruction-conflict/
/en/labs/rag-failure/
/en/labs/context-compression/
/en/labs/agent-reliability/
/en/labs/agent-workflow-graph/
/en/labs/evaluation-failure/
/en/build/reliable-support-agent/
/en/pricing/
/en/early-access/
```

## Validation First

Current issue: **#16 — anonymous analytics, Aha feedback, and durable validation storage**.

The first formal cohort is approximately 20–30 qualified software developers moving toward AI engineering.

Primary outcome:

> **Did this change how you think about this system?**

```text
No
A little
Yes
Oh, I finally get it.

Strong Aha = Yes + Oh, I finally get it.
```

Validation funnel:

```text
landing_viewed
→ lab_started
→ meaningful_interaction
→ failure_tradeoff_observed
→ aha_feedback_submitted
→ second_lab_started
→ capstone_started / completed
→ pricing / paid intent
→ waitlist
→ return_visit
```

See `docs/VALIDATION.md` for the event contract, privacy boundary, Supabase storage schema, Edge Function contract, dashboard queries, and Product Gate.

## Anonymous validation runtime

Every semantic event is enriched with provider-neutral context:

```text
anonymousUserId
sessionId
visitCount / returnVisit
pageType
layer
labId / labVersion
UTM attribution
referrer
deviceClass
```

Public build-time endpoint URLs:

```bash
AHAFRAME_ANALYTICS_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_FEEDBACK_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_WAITLIST_ENDPOINT=https://<validation-endpoint> \
AHAFRAME_BASE_URL=https://ahaframe.com \
python3 scripts/build_site.py
```

These variables are endpoint URLs, never secrets.

If no feedback or waitlist backend is configured, the UI explicitly reports **Demo mode** and never claims that browser-local storage was remotely persisted.

## Validation storage

The first Alpha backend is designed for Supabase Postgres + one anonymous ingest Edge Function:

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

Direct browser table access is denied. Row Level Security is enabled, public roles are revoked, and the service credential belongs only in the server-side Edge Function.

The repository contains the deployable schema/function contract; the dedicated AhaFrame Supabase project is provisioned separately before validation deployment.

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

Reusable primitives:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

The integrated Build reuses existing layer scenarios rather than duplicating their formulas.

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

Local builds intentionally fail closed for indexing. Production-style static build:

```bash
AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/build_site.py
```

## Validation / CI

```bash
node scripts/test_lab_engine.js
node scripts/test_instruction_conflict.js
node scripts/test_agent_workflow_graph.js
node scripts/test_integrated_build.js
node scripts/test_validation_runtime.js
python3 scripts/build_site.py
python3 scripts/validate.py
python3 scripts/test_validation_build.py
```

Validation covers Lab behavior, six-layer integration, anonymous identity/session/attribution, Strong Aha payloads, generated runtime order, validation storage security contracts, route/SEO/schema checks, JavaScript syntax, and the paused Next.js migration shell.

## Pricing hypothesis

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

No real payment is collected during Validation Alpha.

## Platform architecture — accepted but paused

Accepted future architecture:

```text
Next.js App Router + TypeScript
→ Raphael StarterKit reusable SaaS foundation
→ Supabase identity + application data
→ Waffo billing adapter
→ AhaFrame Lab Engine remains framework-independent
```

The `web/` Next.js bootstrap is preserved and kept green in CI, but full migration, Auth, entitlement, Waffo billing, and compute credits remain paused until the Product Gate produces **GO PLATFORM**.

## Current execution order

```text
Conceptual Closure         DONE
#16 Validation evidence    CURRENT
#17 Validation deployment  NEXT
#19 Developer Alpha        THEN
Product Gate               THEN

GO PLATFORM ?
  yes → resume SaaS platform path
  no  → validate again / reframe / stop
```

See `docs/ROADMAP.md` and GitHub master issue #22 for the active execution plan.
