# AhaFrame Product Spec — v0.3 Content MVP + Platform Launch

Date: 2026-08-13

## Product thesis

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The product tests whether developers can build stronger engineering intuition by manipulating deterministic simulations, breaking systems, comparing configurations, and then applying the resulting mental model to production decisions.

## Brand system

- **Brand:** AhaFrame
- **Primary domain:** `https://ahaframe.com`
- **Category:** Interactive AI Engineering
- **Positioning:** Interactive labs for developers becoming AI engineers
- **Primary slogan:** **Understand AI by seeing it work.**

## Primary audience

- experienced software developers transitioning into AI engineering;
- technical product builders using LLMs and agents;
- technical learners who want engineering intuition rather than terminology memorization.

## Learning model

```text
SEE → PLAY → BREAK → AHA → BUILD
```

- **See** — visualize hidden AI-system behavior;
- **Play** — change meaningful parameters or state;
- **Break** — expose failure modes intentionally;
- **Aha** — connect cause and effect into a durable mental model;
- **Build** — apply the mental model to architecture, debugging, evaluation, and production trade-offs.

## Curriculum v1.1

`docs/CURRICULUM.md` is the curriculum source of truth.

AhaFrame uses external material as research references, not runtime or content dependencies:

- **AI Engineering from Scratch** provides a broad dependency map across LLM engineering, tools/protocols, agent engineering, production infrastructure, and capstones.
- **AI Agent Book** provides deeper references for Agent design, context, memory, tools/MCP, evaluation, continuous improvement, and multi-agent engineering.

AhaFrame transforms those references into original failure-first experiences instead of copying source lessons.

### AI Engineering Layers

Curriculum v1.1 introduces a first-class six-layer mental model:

```text
Prompt Engineering      — shapes behavior
Context Engineering     — shapes knowledge
Harness Engineering     — shapes reliability
Loop Engineering        — shapes iteration
Graph Engineering       — shapes orchestration
Evaluation Engineering  — proves whether it works
```

These are cross-cutting engineering layers, not six separate catalogs.

### Curriculum domains

The existing eight tracks remain as system/dependency domains:

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

The layers answer **what kind of engineering decision is being made**; the domains answer **where in the AI system the decision appears**.

A new full Lab should normally require:

- a real engineering decision;
- a visible failure mode;
- a meaningful parameter trade-off;
- a deterministic low-cost first implementation;
- a reusable mental model;
- a connection to another Lab or Build Challenge.

If a topic does not satisfy these criteria, prefer a guide or reference instead of manufacturing an interactive Lab.

Prompt and Graph are explicit curriculum gaps, but their candidate Labs do not expand the pre-Alpha Content MVP:

```text
Instruction Conflict Lab      backlog after Alpha
Agent Workflow Graph Lab      backlog after Alpha
```

## Public routes

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/labs/rag-failure/
/en/labs/agent-reliability/
/en/labs/evaluation-failure/
/en/pricing/
/en/early-access/
```

The root route redirects to `/en/`.

## Foundation lessons

### Token Playground

Teaches next-token prediction, visible candidate probabilities, sampling, greedy decoding, and temperature. The simulation is deterministic and pedagogical; it does not claim to expose logits from a live production model.

### Context Window Lab

Teaches finite working context and the trade-offs between truncation, summarization, retrieval, and longer-term memory. Numerical before/after states must remain internally consistent.

### Agent Loop Simulator

Teaches task interpretation, action selection, tool use, observation, retry/error recovery, and final response. It is the first explicit Loop Engineering mental model. Error simulation must never race with Reset or manual progression.

## Production Lab previews

### RAG Failure Lab

The learner starts from a deliberately poor retrieval configuration and controls:

```text
Chunk Size
Overlap
Top-K
Retrieval Strategy
Reranker
```

The deterministic model derives recall, precision, context usage, overflow, latency, cost index, answer quality, and failure diagnosis. Primary layer: **Context Engineering**.

### Agent Reliability Lab

The learner starts from a weak control policy for a customer-support agent that may perform an irreversible refund action.

Controls:

```text
Max Steps
Retry Limit
Tool Timeout
Result Validation
Human Approval
Termination Rule
```

Derived metrics include success rate, reliability score, runaway risk, unsafe-action risk, expected steps, simulated latency, cost index, review load, and failure diagnosis.

Primary layer: **Harness Engineering**. Secondary layer: **Loop Engineering**.

### Evaluation Failure Lab

The learner starts from a demo-biased release evaluation for the same customer-support agent world. Agent v2 has a higher aggregate score even though long-horizon and safety-critical refund cases regress.

Controls:

```text
Dataset preset
Pass threshold
Safety veto
Sample size
Judge mode
Cost gate
```

Derived signals include aggregate score, slice regressions, evidence width, judge noise, evaluation cost, cost per success, and `SHIP / BLOCK / INCONCLUSIVE`.

Primary layer: **Evaluation Engineering**. The core lesson is:

> **Evaluation is a decision system, not a single score.**

All Production Lab previews use deterministic educational metrics. They are not presented as benchmark results from live models, tools, vector stores, LLM judges, customer-support traffic, or human-review queues.

## Content MVP stop line

The Content MVP remains intentionally small:

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         next
Reliable Support Agent Build    next
```

`Instruction Conflict Lab`, `Agent Workflow Graph Lab`, and `Tool Contract Failure Lab` are backlog candidates and do not delay Soft Alpha unless the capstone reveals a real prerequisite gap.

The objective is a coherent 60–120 minute journey, not maximum lesson count.

## Platform launch definition

AhaFrame is not considered a public platform merely because the static pages are deployed. Before Public Beta, the complete product chain must be demonstrably coherent:

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
→ E2E / security verification
→ Soft Alpha
→ Public Beta decision
```

Execution is tracked in GitHub issue `#22`.

## Platform direction

Current runtime:

```text
Python static generator
+ HTML / CSS / dependency-light browser JS
+ generic AhaFrame Lab Engine
```

Target SaaS foundation is being designed in a dedicated architecture step before migration:

```text
Raphael StarterKit   reusable development skeleton
Supabase             identity + application data
Waffo Pancake        billing provider
AhaFrame Lab Engine  simulation runtime
```

The runtime migration must preserve current URLs, SEO guarantees, visual identity, and deterministic Lab behavior.

### Identity policy

Public learning remains no-login.

Ask for identity only when the learner chooses a durable capability such as:

```text
Save
Purchase
Build Project
Live Mode
Cross-device progress
```

Supabase is the intended identity/data foundation. GitHub sign-in is the preferred first OAuth path for the developer audience, with an email fallback.

### Entitlement policy

Application access must not be derived directly from a payment provider response.

The domain model separates:

```text
Purchase
Subscription
Entitlement
PaymentEvent
```

`Entitlement` is the canonical application access truth so one-time Foundations access and recurring Production Labs access can coexist without coupling product logic to Waffo.

### Billing policy

Waffo Pancake is the intended payment provider.

Initial product types:

```text
AI Engineer Foundations    one-time purchase hypothesis
Production Labs            recurring subscription hypothesis
```

The server/webhook path is authoritative. A browser success redirect alone must never grant access. Duplicate payment/webhook events must be idempotent.

### Compute-credit policy

Credits are for real compute only:

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

A transaction-safe credit ledger may be implemented before Live Mode, but credit packages must not be sold publicly until a real metered compute capability exists.

## Pricing hypothesis

The previous `$19/month Pro` and `$39/month Founding Member` concepts are retired.

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

The exact public price remains a validation hypothesis until real checkout evidence exists.

### Free boundary

- core mental models;
- foundational simulations;
- public concept guides and curriculum map;
- local progress;
- rotating Production Lab previews.

### Paid boundary

- full failure simulations;
- Production Labs;
- build projects;
- evaluation challenges;
- later: saved cloud experiments and Live Mode capabilities.

## Conversion model

```text
Visitor
  ↓
Start free lesson / lab
  ↓
Interact with parameters
  ↓
Diagnose or repair a failed scenario
  ↓
Start another lab
  ↓
Start capstone / view paid capability
  ↓
Optional sign-in
  ↓
Checkout
  ↓
Verified entitlement
  ↓
Return / retain progress
```

## Lab / Simulation Engine

```text
Scenario
  ↓
State
  ↓
Action
  ↓
Reducer
  ↓
Derived View / Metrics
  ↓
DOM Adapter
```

Reusable capabilities:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

Registered deterministic scenarios:

```text
token-playground
context-window
rag-failure
agent-reliability
agent-loop
evaluation-failure
```

The Lab Engine remains framework-independent. Platform migration must wrap it rather than rewrite it without a demonstrated reason.

See `docs/LAB_ENGINE.md` for the architecture contract.

## Visual direction

The approved system is documented in `docs/VISUAL_SYSTEM.md`.

Core positioning:

> Future technical textbook, not AI startup template.

Use warm white, graphite, and teal. Avoid generic blue-purple AI gradients, decorative neural-network imagery, or unexplained “AI magic” effects.

## SEO / generative-search posture

Public conceptual pages use stable URLs, crawlable explanations, answer-first definitions, semantic structured data, sitemap/robots, and explicit modification dates. A platform migration must preserve or improve these guarantees.

## Analytics boundary

Product events belong to the product adapters/workflows. The Lab Engine keeps engine-level analytics opt-in so high-frequency simulation actions do not automatically duplicate semantic events.

The production funnel eventually includes:

```text
landing
lab start
parameter interaction
second lab
capstone
pricing
sign in
checkout start
purchase / subscription
return usage
```

## Intentional non-goals for the current Content MVP

- mandatory authentication;
- unlimited real AI usage;
- live LLM-as-judge by default;
- code sandbox;
- full LMS/CMS/admin systems;
- community;
- certificates;
- AI tutor;
- multi-language UI beyond an i18n-ready content layout.

These non-goals do not block building the minimal platform foundation required for a coherent public product.

## Exit criteria

AhaFrame reaches Public Beta only when a new external user can discover the product, learn without registration, optionally create an account, retain progress, purchase the intended product, receive correct access through verified server-side billing state, use paid capabilities, and return later with consistent account state — while the operator can observe product behavior and failures safely.
