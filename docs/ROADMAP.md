# AhaFrame Development Roadmap

Date: 2026-08-13  
Version: v0.5 — Conceptual Closure + Validation First  
Status: active execution roadmap

## Product direction

AhaFrame is an English-first **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

The product is not organized around a catalog of fashionable AI terms. It teaches a durable engineering model for understanding and building production AI systems.

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

These six layers form the **AhaFrame AI Engineering Stack**.

Core learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Current execution principle:

> **Finish the mental model, not the platform.**

Product principle:

> **Reach conceptual closure first; then validate learning value before building platform completeness.**

AhaFrame is not validated because individual Labs work technically. Before the first formal Validation Alpha, the product should expose the smallest coherent mental model of a production AI system from Prompt through Evaluation, then integrate those layers in one Build experience.

After that closure is achieved, content expansion stops by default and real-user evidence becomes the priority.

Execution sources of truth:

- `docs/CURRICULUM.md` — curriculum and Lab backlog;
- `docs/PRODUCT_SPEC.md` — product / pricing hypotheses;
- `docs/adr/0001-saas-platform-runtime.md` — accepted future SaaS runtime architecture;
- `docs/CONTEXT_COMPRESSION_LAB.md` — Context Compression implementation spec;
- `docs/EVALUATION_FAILURE_LAB.md` — Evaluation Failure implementation spec;
- this roadmap — **current execution order, stop lines, and validation gates**.

GitHub issue `#22` predates this v0.5 sequencing and must be reconciled before platform implementation resumes.

---

# 1. The AhaFrame AI Engineering Stack

AhaFrame teaches engineering responsibilities rather than framework names.

| Layer | Responsibility | Canonical question | Minimum closure experience |
|---|---|---|---|
| **Prompt** | Behavior | What should the model do, under which instructions and constraints? | Instruction Conflict Lab |
| **Context** | Knowledge | What should the model know now, in what form, and within what budget? | Context Window + RAG + Compression |
| **Harness** | Reliability | What tools, permissions, validation, approvals, limits, and runtime controls make the model safe enough to operate? | Agent Reliability Lab |
| **Loop** | Iteration | How should the system act, observe, verify, recover, retry, escalate, and stop? | Agent Loop Simulator |
| **Graph** | Orchestration | How should deterministic steps, tools, branches, joins, agents, and human gates form a workflow topology? | Agent Workflow Graph Lab |
| **Evaluation** | Evidence | What evidence is sufficient to decide that the system is better, safe enough, and economically acceptable to release? | Evaluation Failure Lab |

The stack is intended to remain useful even when individual models, SDKs, agent frameworks, or protocols change.

It is **not** a claim that every AI system must literally execute these layers in a fixed linear runtime order. It is a mental model for engineering responsibility and diagnosis.

## 1.1 Conceptual closure definition

AhaFrame reaches **Conceptual Closure v1** when a qualified developer can:

1. distinguish the responsibility of all six layers;
2. observe at least one meaningful failure / trade-off in each layer;
3. explain why one layer cannot substitute for another;
4. combine the layers into one defensible production architecture decision;
5. use Evaluation to decide `SHIP / BLOCK / INCONCLUSIVE` rather than treating system construction as the endpoint.

Conceptual closure is **not curriculum completeness**.

Do not interpret it as permission to build dozens of lessons per layer.

---

# Phase 0 — Product Foundation

**Status: COMPLETE**

Completed experiences:

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done
RAG Failure Lab                done
Agent Reliability Lab          done
Evaluation Failure Lab         done
Context Compression Lab        done
```

Completed foundation:

- AhaFrame brand + `ahaframe.com`;
- warm-white / graphite / teal visual system;
- generic deterministic Lab / Simulation Engine;
- History / Checkpoint / Compare / Replay / Reset primitives;
- static build + validation + CI;
- crawlable no-login educational content;
- pricing hypothesis: `$49 one-time Foundations` + future `$12/month Production Labs`.

The existing seven experiences are strong product assets, but the six-layer stack is not yet conceptually closed because Prompt and Graph lack first-class experiences and the full stack has not yet been integrated in one Build.

---

# Phase 1 — Conceptual Closure

**Status: NEXT**

Goal:

> Complete the smallest coherent Prompt → Context → Harness → Loop → Graph → Evaluation mental model, then integrate it once.

This phase is about **closure**, not catalog expansion.

## 1.1 Prompt — Instruction Conflict Lab

**Status: REQUIRED BEFORE FORMAL VALIDATION ALPHA**

Working concept:

> **Prompt shapes behavior, but Prompt is not Context, Permission, Runtime Control, or Evaluation.**

Candidate scenario: refund-capable support agent with conflicting instruction sources.

Example inputs:

```text
System policy
Developer instruction
Retrieved policy / context
User request
Tool capability
Output schema
```

Candidate controls:

```text
instruction source / precedence
instruction wording / specificity
retrieved instruction-like content
output schema strictness
policy ambiguity
```

Candidate derived signals:

```text
instruction adherence
conflict / ambiguity risk
policy violation risk
output validity
unresolved conflict diagnosis
```

Required Aha:

> A better prompt can shape behavior, but it cannot replace permission boundaries, reliable context assembly, runtime validation, or release evaluation.

Do **not** turn this into a prompt-tip collection.

## 1.2 Context — existing coverage

**Status: CLOSED FOR v1**

Current coverage:

```text
Context Window Lab
RAG Failure Lab
Context Compression Lab
```

Together they should teach:

- working context is finite;
- retrieval decides what evidence enters the system;
- more context is not always better;
- lower token count is not automatically better;
- compression can remove task-critical information;
- quality, latency, evidence coverage, and cost interact.

Do not add another Context Lab before Validation Alpha unless a real dependency blocks conceptual closure.

## 1.3 Harness — existing coverage

**Status: CLOSED FOR v1**

Primary experience:

```text
Agent Reliability Lab
```

Core responsibility:

> Tools, schemas, validation, limits, approval boundaries, permissions, timeouts, and runtime safeguards make model behavior operationally reliable enough to use.

Required Aha:

> A system can complete tasks successfully while still being unsafe, expensive, or operationally unreliable.

## 1.4 Loop — existing coverage

**Status: CLOSED FOR v1**

Primary experience:

```text
Agent Loop Simulator
```

Core responsibility:

> Act → Observe → Verify → Recover / Retry → Escalate → Stop.

Required Aha:

> An agent is not just a single model call; reliability depends on bounded iteration and explicit termination / recovery behavior.

## 1.5 Graph — Agent Workflow Graph Lab

**Status: REQUIRED BEFORE FORMAL VALIDATION ALPHA**

Working concept:

> **Graph shapes orchestration. Loop shapes local iteration. They are related but not the same thing.**

Candidate architecture presets:

```text
Single Agent
Sequential Pipeline
Branched Workflow
Parallel Workflow
Coordinator + Workers
Human-Gated Workflow
```

Candidate controls:

```text
branching
parallelism
shared vs isolated state
retry boundary
deterministic vs agentic node
human approval placement
agent count
join strategy
```

Candidate derived signals:

```text
latency
coordination cost
state complexity
failure propagation
reliability
human review load
cost index
```

Required Aha:

> More agents and more graph complexity do not automatically produce a better system.

Secondary Aha:

> Graph is workflow topology; Loop is how a step / agent iterates within that topology.

Do **not** make the lesson framework-specific to LangGraph, CrewAI, AutoGen, or another current SDK.

## 1.6 Evaluation — existing coverage

**Status: CLOSED FOR v1**

Primary experience:

```text
Evaluation Failure Lab
```

Required Aha:

> Evaluation is a decision system, not a single score.

A candidate system may improve average quality while still requiring `BLOCK` because safety-critical slices, cost, reliability, or evidence remain unresolved.

## 1.7 Integration — Reliable Support Agent Build

**Status: REQUIRED FOR CONCEPTUAL CLOSURE**

This becomes the **integration endpoint**, not merely another lesson.

The learner must combine:

```text
Prompt / task contract
+ Context / retrieval policy
+ Context compression policy
+ Harness controls
+ Loop / termination policy
+ Graph topology
+ Human approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Architecture decision
+ Trade-off explanation
+ SHIP / BLOCK / INCONCLUSIVE
```

The Build should reward **engineering judgment**, not framework boilerplate.

The target final Aha is:

> **A production AI agent is not a prompt plus a model. It is an engineered system whose behavior, knowledge, reliability, iteration, orchestration, and evidence must work together.**

## 1.8 Closure Gate

Before moving to formal Validation Alpha, verify:

```text
Prompt experience implemented
Context coverage coherent
Harness coverage coherent
Loop coverage coherent
Graph experience implemented
Evaluation coverage coherent
Integration Build usable end-to-end
```

Also verify that the homepage / curriculum can communicate the six-layer stack without requiring the user to infer it from separate pages.

### Content stop line

After Closure Gate passes:

> **STOP CONTENT EXPANSION BY DEFAULT.**

The following remain backlog and do not block validation:

```text
Tool Contract Failure Lab
Retry & Idempotency Lab
MCP Permission Lab
Embedding Similarity Lab
Attention Budget Explorer
Model Routing Lab
Trace Diagnosis Lab
Guardrail Failure Lab
Multi-Agent deep dives
additional framework-specific tutorials
```

A new Lab after Closure Gate must be justified by validated user demand, a missing dependency for a paid outcome, or evidence that a current mental model is incomplete.

---

# Phase 2 — Validation Instrumentation

**Status: PREPARE DURING PHASE 1; COMPLETE BEFORE EXTERNAL ALPHA**

Instrumentation may be implemented in parallel with Prompt / Graph / Capstone work because it does not require the SaaS platform.

Goal:

> Explain what users did, where they dropped, whether the stack created Aha moments, whether they crossed layers, whether they completed the integration experience, whether they returned, and whether they showed payment intent.

This phase has higher priority than Supabase identity, billing, entitlement, credit ledgers, or full Next.js migration.

## 2.1 Analytics event model

Track at minimum:

```text
landing_viewed
stack_viewed
layer_entered
lab_viewed
lab_started
parameter_changed
preset_applied
failure_triggered
checkpoint_created
compare_used
reset_used
lab_completed
aha_feedback_submitted
next_lab_clicked
second_lab_started
cross_layer_started
capstone_started
capstone_completed
architecture_decision_submitted
release_decision_submitted
pricing_viewed
paid_intent_clicked
waitlist_submitted
return_visit
```

High-frequency events should be sampled or omitted unless they answer a concrete product question.

Relevant events should carry experiment context:

```text
anonymous_user_id
session_id
layer_id
lab_id
lab_version
experiment_id / variant (when applicable)
utm_source
utm_medium
utm_campaign
referrer
timestamp
device class
```

Country / region may be collected only through a privacy-appropriate analytics mechanism. Do not add invasive fingerprinting.

### `lab_version` is required

Do not mix behavior from materially different Lab experiences into the same metric without version context.

Increment the version when instructional flow, default scenario, scoring model, controls, or copy changes enough to affect learning behavior.

## 2.2 Meaningful Interaction

A `lab_started` event alone does not prove the user engaged with the mental model.

For Validation Alpha, **Meaningful Interaction** requires at least one causal action beyond opening the page, for example:

```text
parameter change
preset apply
failure trigger
checkpoint
compare
scenario action that changes derived state
```

## 2.3 Aha measurement

AhaFrame's core outcome is changed engineering understanding.

After selected experiences, ask:

> **Did this change how you think about this system?**

Suggested answers:

```text
No
A little
Yes
Oh, I finally get it.
```

Define:

```text
Strong Aha = Yes + Oh, I finally get it.
```

Optional qualitative prompt:

> **What do you understand differently now?**

## 2.4 Stack comprehension signal

After the user has crossed multiple layers or completed the Capstone, test the stack itself rather than only individual Labs.

Example question:

> **If this AI system behaves correctly but can still execute an unsafe refund, which engineering layer would you inspect first?**

The goal is not certification. It is to test whether users can correctly distinguish Prompt / Context / Harness / Loop / Graph / Evaluation responsibilities.

## 2.5 “Want more” signal

After a meaningful experience, optionally ask:

> **Would you use more Labs like this for production AI topics?**

This distinguishes a strong interactive article from a product with repeat learning demand.

---

# Phase 3 — Validation Deployment

**Status: AFTER CLOSURE GATE + INSTRUMENTATION**

Goal:

> Put the conceptually closed, no-login product in front of real users with production analytics and feedback capture, without first building the full SaaS platform.

Advance the intent of existing work items where possible:

```text
#16 Analytics + waitlist storage      move forward
#17 ahaframe.com deployment           move forward
#19 Developer Alpha                   redefine as Validation Alpha
```

Required before recruiting the formal cohort:

- `ahaframe.com` production deployment;
- HTTPS / DNS;
- canonical / robots / sitemap / structured data intact;
- analytics events verifiably arriving;
- anonymous-user and session continuity;
- real waitlist / feedback persistence;
- basic error monitoring;
- mobile + desktop smoke test;
- privacy-safe analytics disclosure where required;
- rollback path;
- Prompt / Graph / Capstone routes working at validation quality.

Not required:

```text
Supabase account system
cross-device saved progress
Waffo billing
Entitlement
Subscription
CreditLedger
full SaaS runtime migration
Live Mode compute
```

Public learning remains no-login.

---

# Phase 4 — Validation Alpha

**Status: AFTER PHASE 3**

Recruit **20–30 qualified developers** before broad public launch.

## 4.1 Primary ICP

Experienced software developers who:

- are comfortable with APIs, backend/frontend systems, debugging, or production engineering;
- already use tools such as ChatGPT, Claude, Cursor, Copilot, or AI APIs;
- are actively moving toward AI engineering;
- have not yet built or owned multiple production LLM / agent systems end-to-end.

Prefer a mix of:

```text
Backend / Java
Python
Frontend
DevOps / Platform
Data / Full-stack
```

Do not optimize the first cohort for absolute beginners or ML researchers.

## 4.2 Validation journey

Two funnels matter.

### Fast-value funnel

```text
Landing
↓
First Lab
↓
Meaningful Interaction
↓
Failure / Trade-off Observed
↓
Aha Feedback
↓
Second Lab / Another Layer
↓
Pricing / More-Labs Intent
↓
Return Visit
```

### Stack-value funnel

```text
AI Engineering Stack
↓
Multiple Layers
↓
Capstone
↓
Architecture Decision
↓
Release Decision
↓
Stack Comprehension / Aha
```

The first funnel tests immediate product value.

The second tests the stronger thesis:

> **Does AhaFrame create a coherent AI-engineering mental model rather than a collection of good demos?**

Do not require every Alpha participant to finish all six layers in one session.

## 4.3 Core dashboard

| Metric | Product question |
|---|---|
| Landing → Lab Start | Does positioning create enough intent to try? |
| Meaningful Interaction Rate | Do users actually PLAY rather than just read? |
| Failure / Trade-off Trigger Rate | Do users reach BREAK? |
| Lab Completion Rate | Is the experience understandable and usable? |
| **Strong Aha Rate** | Does the experience change understanding? |
| **Second Lab / Cross-Layer Rate** | Is this a product rather than one good page? |
| **Stack Comprehension** | Does the six-layer model transfer? |
| Capstone Start / Completion | Does the integrated model create pull? |
| D7 Return | Is there continuing value? |
| Paid / Founding Intent | Is there commercial potential? |

Supporting analysis should include source / campaign, layer, Lab, Lab version, and cohort breakdowns.

## 4.4 Internal validation thresholds

These are **internal experimental decision rules, not industry benchmarks**.

| Metric | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% of Lab starters |
| First Lab → Second Lab / Layer | ≥ 30% |
| Users completing ≥2 Labs | ≥ 25% |
| **Strong Aha Rate** | **≥ 60%** |
| “Want more Labs like this” | ≥ 40% |
| Pricing page visit | ≥ 10% |
| Paid / Founding intent | ≥ 3% |
| D7 Return | ≥ 15% initially; ≥ 20% is strong |

For Stack Comprehension and Capstone metrics, the first Alpha is primarily exploratory. Establish a baseline before turning them into hard gates.

Do not tune the product to hit a metric mechanically. Use qualitative evidence to explain metric movement.

## 4.5 Qualitative review

Look for evidence such as:

```text
“I finally understand why ...”
“I thought X was always better, but now I see ...”
“I understand the difference between Loop and Graph now.”
“I was trying to solve a Harness problem with a better Prompt.”
“I would use this before designing / debugging ...”
“I want a Lab for ...”
```

Weak evidence includes:

```text
“Nice UI”
“Cool demo”
“Looks polished”
```

AhaFrame is validated by changed mental models, transferred engineering judgment, multi-experience demand, and credible commercial intent.

---

# Phase 5 — Product Gate

**Status: REQUIRED BEFORE SAAS PLATFORM EXPANSION**

After the first 20–30 qualified users, write an explicit Product Gate decision.

Possible outcomes:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

## 5.1 Interpretation matrix

### Case A — Interaction low

```text
Lab Start          acceptable
Meaningful Action  low
```

Likely problem:

> UX / onboarding / control discoverability.

Action:

> Fix interaction design before changing curriculum or building platform features.

### Case B — Interaction high, Aha low

```text
Interaction  high
Aha          low
```

Likely problem:

> The simulation is interesting but the teaching model does not create understanding.

Action:

> Rework scenario design, causal explanation, defaults, or debrief. Do not solve with more Labs.

### Case C — Individual Aha high, stack comprehension low

```text
Lab Aha              high
Cross-layer behavior acceptable
Stack comprehension  low
```

Likely problem:

> Strong Labs, weak unifying mental model.

Action:

> Improve stack framing, transitions, comparisons between layers, and Capstone integration. Do not add unrelated content.

### Case D — Aha high, Second Lab / Cross-Layer low

Likely problem:

> Strong single-page educational assets; weak platform / curriculum pull.

Action:

> Test better next-Lab routing and topic demand. Consider content / acquisition positioning if repeat demand remains weak.

### Case E — Aha + multi-Lab strong, paid intent weak

Likely problem:

> Product value exists, monetization boundary or buyer may be wrong.

Action:

> Test paid Build Projects, Production Labs, team / employer value, or alternative pricing before extensive billing infrastructure.

### Case F — Aha + stack + multi-Lab + return + paid intent strong

Desired signal:

> **GO PLATFORM.**

Resume the accepted SaaS architecture and build durable identity / state / revenue infrastructure.

## 5.2 Minimum GO condition

Do not treat any one metric as sufficient.

A `GO PLATFORM` decision should normally require:

- Strong Aha at or above the internal target;
- meaningful multi-Lab / cross-layer behavior;
- evidence that the six-layer stack improves comprehension rather than merely naming categories;
- evidence of return or explicit future-use intent;
- non-zero credible payment intent;
- no unresolved severe trust problem in deterministic educational metrics.

---

# Phase 6 — Evidence-Driven Content Expansion

**Status: AFTER PRODUCT GATE OR WHEN VALIDATION REVEALS A SPECIFIC GAP**

Conceptual Closure v1 is not permission to stop evolving the curriculum forever.

It means the next Lab is selected from evidence rather than taxonomy completion.

Candidate backlog:

```text
Tool Contract Failure Lab
Retry & Idempotency Lab
MCP Permission Lab
Embedding Similarity Lab
Attention Budget Explorer
Planning Strategy Lab
Model Routing Lab
Trace Diagnosis Lab
Guardrail Failure Lab
Agent Budget Lab
Multi-Agent coordination labs
```

Decision rule:

> **Every new Lab must answer demonstrated user demand, repair a validated comprehension gap, or enable a validated paid outcome.**

---

# Phase 7 — SaaS Platform Migration

**Status: PAUSED UNTIL GO PLATFORM**

ADR-0001 remains accepted. v0.5 changes **when** the architecture is executed, not the target architecture.

Future target runtime:

```text
Next.js App Router + TypeScript
        ↓
Raphael StarterKit SaaS foundation
        ↓
Supabase identity + application data
        ↓
Waffo billing adapter
        ↓
AhaFrame Lab Engine preserved as framework-independent simulation runtime
```

Migration principle:

> **Parity first. Platform features second.**

Planned implementation remains:

```text
#11 SaaS runtime migration

M1 Bootstrap Next.js under web/
 ↓
M2 Port public routes without redesign
 ↓
M3 Mount existing Lab Engine / scenarios
 ↓
M4 Route + visual + SEO + behavior parity gate
 ↓
M5 Production runtime cutover
```

Do not rewrite deterministic scenario math into React merely because the shell changes.

---

# Phase 8 — Identity + Durable State

**Status: AFTER GO PLATFORM + MIGRATION PARITY**

Tracked work:

```text
#12 Optional Supabase identity
#13 Progress / checkpoints / entitlement model
```

Identity UX must preserve no-login acquisition:

```text
Visit
 ↓
Learn / use Labs immediately
 ↓
Choose Save / Purchase / Build / Live Mode
 ↓
Sign in
```

Preferred OAuth: GitHub first; email fallback.

Minimum domain model:

```text
User (auth.users)
LabRun
Checkpoint
Progress
Purchase
Subscription
Entitlement
PaymentEvent
```

Future only when real metered compute exists:

```text
CreditLedger
UsageRecord
```

`Entitlement` remains the canonical application access truth.

---

# Phase 9 — Revenue Chain

**Status: AFTER PRODUCT VALUE + PAYMENT INTENT ARE VALIDATED**

Tracked work:

```text
#14 Waffo one-time + subscription billing
#15 Compute-credit foundation only when needed
```

Current commercial hypothesis:

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
Compute Credits            real compute only
```

Pricing remains unvalidated until users make real payment decisions.

Billing invariants:

- private credentials remain server-side;
- success redirects never grant access;
- verified server / webhook state updates Purchase / Subscription / Entitlement;
- duplicate events are idempotent;
- cancellation / expiry / refund reconcile access correctly;
- provider IDs remain adapter metadata rather than the domain model.

Do not build or sell compute credits before a real metered capability exists.

---

# Phase 10 — Platform Launch Gate

**Status: AFTER PLATFORM + REVENUE IMPLEMENTATION**

Tracked work:

```text
#18 Full E2E / security / billing verification
```

Required critical paths:

```text
anonymous learning
signed-in save / restore
Foundations purchase → entitlement
Production subscription → entitlement
failed payment → no access
duplicate webhook → no duplicate grant
cancel / expiry / refund reconciliation
session expiry / sign out
mobile + desktop smoke path
```

Security review includes:

- Supabase RLS;
- Waffo signature / idempotency;
- server-side access control;
- secret handling;
- input / error handling;
- dependency / configuration hygiene.

---

# Phase 11 — Metered Live Mode

**Status: POST-VALIDATION EXPANSION**

Tracked work:

```text
#20 One bounded Live Mode path
```

Product loop:

```text
Simulation prediction
        ↓
Real bounded run
        ↓
Observed result
        ↓
Compare
```

Rules:

- one high-value Lab first;
- no unlimited model compute;
- hard per-run and per-user budgets;
- server-side provider adapter;
- auditable provider / model / usage / latency / cost evidence;
- atomic credit debit only when credits are necessary.

Live Mode should validate or challenge the simulation mental model; it should not turn AhaFrame into a generic model playground.

---

# Phase 12 — Public Beta

**Status: CONDITIONAL**

Tracked work:

```text
#21 Public Beta GO / NO-GO
```

Public Beta requires two separate proofs:

```text
Product proof
+ Platform reliability proof
```

A technically reliable SaaS with weak Product Gate evidence does not qualify.

---

# Current Execution State

```text
DONE    Product Foundation
DONE    7 existing experiences
DONE    Context / Harness / Loop / Evaluation v1 coverage
DONE    #10 SaaS architecture direction / ADR

NEXT    Instruction Conflict Lab          → Prompt closure
NEXT    Agent Workflow Graph Lab          → Graph closure
NEXT    Reliable Support Agent Build      → Integration closure
PARALLEL Validation instrumentation       → analytics / Aha / stack metrics

THEN    Closure Gate
THEN    Validation deployment
THEN    20–30 developer Validation Alpha
THEN    Product Gate

PAUSE   #11 SaaS migration until GO PLATFORM
PAUSE   #12–#15 identity / billing / credits until GO PLATFORM
```

Current execution flow:

```text
Existing 7 Experiences
        ↓
Instruction Conflict Lab
        ↓
Agent Workflow Graph Lab
        ↓
Reliable Support Agent Build
        ↓
CONCEPTUAL CLOSURE GATE
        ↓
Instrumented Production Deployment
        ↓
20–30 Qualified Developers
        ↓
Aha + Cross-Layer + Stack Comprehension
+ Return + Paid Intent
        ↓
PRODUCT GATE
   ↙          ↓           ↘
REFRAME   VALIDATE AGAIN   GO PLATFORM
                           ↓
                     #11 Migration
                           ↓
                     #12 / #13
                           ↓
                     #14 Revenue
                           ↓
                     #18 Launch Gate
                           ↓
                     #20 Live Mode
                           ↓
                     #21 Public Beta
```

---

# Engineering Workflow

Every implementation item follows:

```text
Issue
→ feature branch
→ implementation
→ behavioral / security validation
→ PR
→ CI
→ review
→ squash merge
→ close Issue
→ update roadmap / master issue
```

During Phase 1, engineering effort is justified by conceptual closure.

After Closure Gate, engineering completeness is subordinate to evidence gathering until Product Gate.

---

# Decision Rules

## Current content question

> **Can Prompt → Context → Harness → Loop → Graph → Evaluation form one coherent, durable engineering mental model rather than six labels?**

## Current integration question

> **Can the Reliable Support Agent Build make a developer combine the six layers into one defensible architecture and release decision?**

## Current analytics question

> **Can we reliably connect anonymous acquisition → Lab behavior → Aha → cross-layer behavior → stack comprehension → return / payment intent without adding login friction?**

## Deferred platform question

> **Can the accepted Next.js + Supabase + Waffo architecture preserve AhaFrame's no-login learning experience, SEO, visual system, and deterministic Lab behavior?**

This question becomes active only after `GO PLATFORM`.

## Final principles

> **Finish the mental model, not the platform.**

> **Do not build the next layer because it is architecturally elegant. Build it because conceptual closure or validated user behavior makes it necessary.**
