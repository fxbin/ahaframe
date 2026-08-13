# AhaFrame v0.3 Content MVP

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The current implementation is a static, dependency-light validation product. Version control contains source files only; `site/` is generated build output and intentionally ignored. A SaaS platform migration is now planned separately so current Lab behavior and SEO are preserved before Auth/Billing are added.

## Product direction

```text
AI Engineering Learning
        ↓
Interactive Mental Models
        ↓
Failure Simulations
        ↓
Production Labs
        ↓
Build Projects
        ↓
Paid capability
```

Core architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

## Curriculum v1.1

AhaFrame has a formal curriculum map rather than adding Labs topic-by-topic.

See:

- `docs/CURRICULUM.md` — Curriculum v1.1, engineering layers, system domains, prerequisites, Lab backlog, source-reference policy, and free/paid boundary.
- `docs/EVALUATION_FAILURE_LAB.md` — implemented Evaluation Failure Lab product + simulation specification.
- `docs/ROADMAP.md` — Content MVP + end-to-end Platform Launch sequence.
- GitHub issue `#22` — execution master for the public-platform chain.

External references:

- **AI Engineering from Scratch** — broad AI-engineering dependency map.
- **AI Agent Book** — Agent / Evaluation engineering depth.

AhaFrame independently re-models useful concepts into original failure-first simulations.

### AI Engineering Layers

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

These layers cross-cut the eight system domains:

```text
01 LLM Mental Models
02 Context & Retrieval
03 Tools & Protocols
04 Agent Engineering
05 Evaluation & Reliability
06 Production AI
07 Multi-Agent Systems
08 Build Systems
```

Prompt and Graph are explicit curriculum gaps, but `Instruction Conflict Lab` and `Agent Workflow Graph Lab` stay in the post-Alpha backlog unless the capstone proves they are required.

The learning method is:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

## Current product

### Foundation lessons

- Token Playground
- Context Window Lab
- Agent Loop Simulator

### Production Lab previews

- **RAG Failure Lab** — Context Engineering: tune retrieval while watching recall, precision, context pressure, latency, cost, and answer quality.
- **Agent Reliability Lab** — Harness + Loop Engineering: tune steps, retries, timeouts, validation, approval, and termination while watching reliability and operational risk.
- **Evaluation Failure Lab** — Evaluation Engineering: debug a demo-biased release process and move among `SHIP / BLOCK / INCONCLUSIVE` based on slices, evidence strength, safety vetoes, and cost gates.

All Production Labs use synthetic deterministic metrics for teaching. They are not presented as benchmark measurements from live models, retrieval systems, tools, LLM judges, customer-support traffic, or human-review systems.

## Content MVP stop line

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         next
Reliable Support Agent Build    next
```

The immediate content goal remains a coherent 60–120 minute journey, not a large catalog.

## Platform Launch plan

AhaFrame is not considered a public platform merely because pages are deployed. The complete chain must work:

```text
Content
→ optional identity
→ durable progress / checkpoints
→ entitlement
→ payment
→ verified webhook
→ access control
→ analytics
→ production deployment
→ E2E / security
→ Soft Alpha
→ Public Beta decision
```

Tracked in GitHub issue `#22`.

Planned platform foundation:

```text
Raphael StarterKit   reusable development skeleton
Supabase             identity + application data
Waffo Pancake        billing provider
AhaFrame Lab Engine  deterministic simulation runtime
```

Public lessons and Labs stay no-login. Sign-in appears when the learner chooses **Save / Purchase / Build Project / Live Mode**.

Application access is represented by `Entitlement`, not by a Waffo or subscription object directly.

## Pricing validation

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

The current public pricing UI is still validation-first. Real checkout is introduced through the Platform Launch work, with Waffo as the selected billing provider.

Compute credits are reserved for real compute only and must not be sold before at least one metered Live Mode exists.

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
```

See `docs/LAB_ENGINE.md` for the engine contract.

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
    ├── /pricing/
    └── /early-access/
```

## Source architecture

```text
content/                          English content model
src/assets/                       browser JavaScript + favicon
  lab-engine.js                   generic deterministic Lab runtime
  lab-scenarios.js                shared deterministic scenarios
  rag.js                          RAG Failure Lab DOM adapter
  agent-reliability.js            Agent Reliability Lab DOM adapter
  evaluation-scenario.js          Evaluation Failure deterministic scenario
  evaluation.js                   Evaluation Failure DOM adapter
src/styles/                       CSS modules
scripts/ahaframe/                 page-specific static-site build modules
scripts/build_site.py             build entrypoint
scripts/test_lab_engine.js        Lab Engine behavioral regression suite
docs/CURRICULUM.md                curriculum v1.1 + engineering layers
docs/EVALUATION_FAILURE_LAB.md    Evaluation Failure product/simulation spec
docs/LAB_ENGINE.md                Lab Engine architecture contract
docs/ROADMAP.md                   content + platform launch roadmap
site/                             generated output (ignored)
```

## Run locally

```bash
python3 scripts/build_site.py
python3 -m http.server 8080 --directory site
```

Open:

```text
http://localhost:8080/en/
```

## Production build

Local builds default to `http://localhost:8080` and intentionally emit `noindex` safeguards.

```bash
AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/build_site.py
```

This updates canonical URLs, JSON-LD URLs, sitemap URLs, robots.txt, and `llms.txt`.

## Waitlist and analytics integration

Current static runtime endpoint URLs are generated at build time:

```bash
AHAFRAME_WAITLIST_ENDPOINT=https://your-api.example.com/waitlist \
AHAFRAME_ANALYTICS_ENDPOINT=https://your-api.example.com/events \
AHAFRAME_BASE_URL=https://ahaframe.com \
python3 scripts/build_site.py
```

Do **not** put API secrets in these variables; endpoint URLs are written to public browser JavaScript.

Production analytics and durable waitlist storage are tracked separately in the Platform Launch plan.

## Authentication policy

No account is required for public learning.

Authentication exists to unlock durable value:

- cross-device Lab history/checkpoints;
- paid entitlements;
- Live Mode credits;
- Build Project submissions;
- persistent progress.

The intended UX asks for sign-in only when the learner chooses **Save / Purchase / Live Mode / Build Project**.

## Validation

```bash
python3 scripts/build_site.py
python3 scripts/validate.py
node scripts/test_lab_engine.js
```

Validation covers route/SEO invariants, accessibility basics, sitemap accuracy, Lab asset ordering, JavaScript syntax, and deterministic Lab behavior.

## Deployment

The current static build supports Vercel or Cloudflare Pages. The target SaaS runtime will be chosen through the platform architecture ADR before migration.

## Current intentional non-goals

- mandatory accounts before public learning;
- unlimited AI compute;
- real LLM-as-judge by default;
- code sandbox before it is justified;
- large LMS/CMS/admin systems;
- community;
- certificates;
- AI tutor.

The goal is **validation before unnecessary platform complexity**, while still running the full identity/payment/entitlement/operations chain before Public Beta.
