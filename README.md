# AhaFrame v0.3 Content MVP

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

Core learning model:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Core architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

## AI Engineering Stack

AhaFrame organizes its mental models around six cross-cutting engineering layers:

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

See `docs/CURRICULUM.md` for the curriculum map and backlog.

## Current product

### Foundation lessons

- **Token Playground** — next-token prediction, sampling, greedy decoding, temperature.
- **Context Window Lab** — context budgets, overflow, summarization, retrieval, memory.
- **Agent Loop Simulator** — act, observe, retry, recover, terminate.

### Production Lab previews

- **RAG Failure Lab** — tune chunk size, overlap, Top-K, retrieval strategy, and reranking while observing recall, precision, context pressure, quality, latency, and cost.
- **Agent Reliability Lab** — tune steps, retries, timeout, validation, approval, and termination while observing success, runaway risk, unsafe-action risk, latency, cost, and review load.
- **Evaluation Failure Lab** — debug dataset composition, slice regressions, safety vetoes, evidence strength, judge strategy, cost gates, and `SHIP / BLOCK / INCONCLUSIVE` release decisions.
- **Context Compression Lab** — compress a 25.5k-token synthetic support-agent working context under a 16k budget while balancing token savings, critical-information retention, evidence coverage, quality, hallucination risk, latency, and cost.

All Production Lab metrics are deterministic educational quantities unless a future Live Mode explicitly reports real execution evidence.

## Content MVP status

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done

RAG Failure Lab                done
Agent Reliability Lab          done
Evaluation Failure Lab         done
Context Compression Lab        done
Reliable Support Agent Build   NEXT
```

The capstone is the final Content MVP item before full UX/content review and the platform Launch Gate.

Dedicated Prompt, Graph, and Tools Labs remain backlog candidates and do not block the first Alpha by default.

## Routes

```text
/
└── /en/
    ├── /lessons/token-playground/
    ├── /lessons/context-window/
    ├── /lessons/agent-loop/
    ├── /labs/rag-failure/
    ├── /labs/agent-reliability/
    ├── /labs/evaluation-failure/
    ├── /labs/context-compression/
    ├── /pricing/
    └── /early-access/
```

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

Registered scenarios:

```text
token-playground
context-window
rag-failure
agent-reliability
agent-loop
evaluation-failure
context-compression
```

Evaluation Failure and Context Compression use page-specific scenario modules while keeping the generic Engine unchanged.

See `docs/LAB_ENGINE.md`.

## Current source architecture

```text
content/                           English content model
src/assets/                        browser JavaScript + favicon
  lab-engine.js                    generic deterministic Lab runtime
  lab-scenarios.js                 shared deterministic scenarios
  rag.js                           RAG Failure adapter
  agent-reliability.js             Agent Reliability adapter
  evaluation-scenario.js           Evaluation deterministic scenario
  evaluation.js                    Evaluation adapter
  context-compression-scenario.js  Context Compression deterministic scenario
  context-compression.js           Context Compression adapter
src/styles/                        CSS modules
scripts/ahaframe/                  static page builders
  rag.py
  agent_reliability.py
  evaluation.py
  context_compression.py
scripts/build_site.py              build entrypoint
scripts/test_lab_engine.js         Lab Engine behavioral regression suite
docs/CURRICULUM.md                 curriculum + source mapping
docs/LAB_ENGINE.md                 Engine architecture contract
docs/EVALUATION_FAILURE_LAB.md     Evaluation product/simulation spec
docs/CONTEXT_COMPRESSION_LAB.md    Context Compression product/simulation spec
docs/ROADMAP.md                    Content + platform execution roadmap
docs/adr/0001-saas-platform-runtime.md  accepted SaaS runtime ADR
site/                              generated output (ignored)
```

## Run current static product locally

```bash
python3 scripts/build_site.py
python3 -m http.server 8080 --directory site
```

Open:

```text
http://localhost:8080/en/
```

## Current production-style static build

Local builds fail closed for search indexing. Configure a production origin explicitly:

```bash
AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/build_site.py
```

This updates canonical URLs, JSON-LD URLs, sitemap URLs, robots.txt, and `llms.txt`.

## Validation

```bash
python3 scripts/build_site.py
python3 scripts/validate.py
node scripts/test_lab_engine.js
```

Validation covers:

- exact route set and internal links;
- metadata / canonical / JSON-LD;
- answer-first learning blocks;
- accessibility basics;
- sitemap accuracy;
- Lab Engine / scenario asset order;
- Token / Context / RAG / Agent Reliability / Evaluation Failure / Context Compression / Agent Loop invariants;
- JavaScript syntax;
- deployment configuration.

These tests remain the parity oracle during the Next.js migration.

## Pricing hypothesis

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

The product should not confuse basic knowledge access with paid value. Paid capability centers on failure simulations, Production Labs, Build Projects, durable state, and later Live Mode validation.

## Public-platform plan

AhaFrame is not launch-ready merely because static pages can be deployed.

Master execution issue: **#22 — AhaFrame Platform Launch**.

Required chain:

```text
Content
→ Identity
→ Saved state
→ Entitlement
→ Payment
→ Verified webhook
→ Access control
→ Analytics
→ Production deployment
→ E2E / security
→ Soft Alpha
→ Public Beta decision
```

## Accepted SaaS architecture

ADR: `docs/adr/0001-saas-platform-runtime.md`.

Target architecture:

```text
Next.js App Router + TypeScript
        ↓
Raphael StarterKit SaaS foundation
        ↓
Supabase identity + application data
        ↓
Waffo billing adapter
        ↓
AhaFrame Lab Engine preserved
```

Migration rule:

> **Parity first. Platform features second.**

The migration is staged but not a permanent hybrid. Issue #11 should bootstrap the Next.js application under `web/`, port current public routes without redesign, mount the existing deterministic Lab Engine, and prove route/SEO/visual/behavior parity before the production runtime switches.

The current static application remains a regression reference during migration, not a second long-term production runtime.

Public lessons and Labs stay no-login. Ask for identity only when the learner chooses durable value such as Save, Purchase, Build, or Live Mode.

## Billing / entitlement rule

Waffo is a payment-provider adapter, not AhaFrame's access model.

Application domain:

```text
User / auth.users
LabRun
Checkpoint
Progress
Purchase
Subscription
Entitlement
PaymentEvent
```

Future compute:

```text
CreditLedger
UsageRecord
```

`Entitlement` is the canonical access truth.

Credits are reserved for real compute:

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Waffo checkout and webhook credentials remain server-only. Browser success redirects never grant access. Verified/idempotent server-side events reconcile Purchase, Subscription, and Entitlement state.

## Target deployment

The accepted long-term runtime targets Vercel for the Next.js application, with Supabase for Auth/Postgres and Waffo for checkout/billing events.

Migration flow:

```text
GitHub
 ↓
Vercel Preview
 ↓
route / SEO / visual / Lab parity
 ↓
Production cutover
 ↓
ahaframe.com
```

The current static Vercel/Cloudflare deployment config remains valid only as the pre-migration reference until issue #11 performs the runtime cutover.

## Next execution lanes

```text
CONTENT
#9 Reliable Support Agent Build

PLATFORM
#10 SaaS architecture ADR     ← current docs branch
 ↓
#11 Next.js parity migration
```

After #10 merges, #9 and #11 can proceed in parallel and converge before Auth, durable entitlement state, Waffo billing, production operations, and Launch Gate QA.
