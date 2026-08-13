# AhaFrame Development Roadmap

Date: 2026-08-13

## Product direction

AhaFrame is an **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

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

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Execution source of truth:

- `docs/CURRICULUM.md` — curriculum v1.1, engineering layers, system domains, prerequisites, backlog, free/paid boundary.
- `docs/EVALUATION_FAILURE_LAB.md` — implemented Evaluation Failure Lab specification.
- GitHub issue `#22` — end-to-end Platform Launch execution plan.

## AI Engineering Layers

AhaFrame now uses this six-layer mental model:

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

These layers cross-cut the curriculum domains. Prompt and Graph gaps are explicit, but their dedicated candidate Labs stay outside the pre-Alpha critical path unless the capstone proves they are required.

## Phase 0 — Foundation complete

Status: complete

- AhaFrame brand + `ahaframe.com`
- warm-white / graphite / teal visual system
- Token Playground
- Context Window Lab
- Agent Loop Simulator
- generic Lab / Simulation Engine
- history / checkpoint / compare / replay
- CI and validation
- pricing hypothesis reset to `$49 one-time Foundations` + future `$12/month Production Labs`
- RAG Failure Lab
- Agent Reliability Lab
- Evaluation Failure Lab

## Phase 1A — Curriculum v1.1 + remaining Content MVP

Status: current

The goal is a coherent 60–120 minute journey, not a large catalog.

Tracked work:

```text
#7  Curriculum v1.1                    in progress
#8  Context Compression Lab            next
#9  Reliable Support Agent Build       next
```

### Content MVP stop line

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         next
Reliable Support Agent Build    next
```

Backlog candidates that do **not** delay Soft Alpha by default:

```text
Instruction Conflict Lab
Agent Workflow Graph Lab
Tool Contract Failure Lab
```

### Context Compression Lab — next

Primary product question:

> **When context compression saves tokens, latency, and cost, what task-critical information gets lost?**

Candidate controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory allocation
Protected instructions / facts
```

Candidate signals:

```text
Active context tokens
Compression savings
Critical-information retention
Task quality
Latency / cost index
Failure diagnosis
```

The Lab should continue the support-agent world if that strengthens the final capstone without becoming repetitive.

### Reliable Support Agent Build — capstone

The capstone combines the engineering layers into one architecture decision:

```text
Prompt
+ Context / RAG
+ Harness
+ Loop
+ Graph/topology where relevant
+ Evaluation
        ↓
Reliable Support Agent
```

The learner must design a customer-support agent with fixed safety, latency, and cost constraints and explain the trade-offs.

## Phase 1B — Platform architecture

This work can begin in parallel with the remaining Content MVP after curriculum v1.1 is locked.

Tracked work:

```text
#10 Raphael → AhaFrame architecture / migration ADR
#11 SaaS runtime migration
```

Inputs:

```text
Raphael StarterKit  → reusable development skeleton
Supabase             → identity + application data
Waffo Pancake        → payment provider
AhaFrame Lab Engine  → deterministic simulation runtime
```

The architecture ADR must decide whether migration is full Next.js or staged/hybrid, and must preserve current public URLs, SEO, visual identity, and Lab behavior.

Platform rule:

> **Borrow the SaaS foundation; do not overwrite the product.**

AhaFrame keeps ownership of its brand, learning UX, curriculum, Lab Engine, scenarios, pricing model, and entitlement semantics.

## Phase 2 — Identity + durable state

Tracked work:

```text
#12 Optional Supabase identity
#13 Progress / checkpoints / entitlement model
```

### Identity UX

Do not put a login wall in front of public lessons or simulations.

```text
Visit AhaFrame
    ↓
Learn / use Labs immediately
    ↓
Choose Save / Purchase / Build / Live Mode
    ↓
Sign in
```

Preferred first OAuth path: GitHub. Email is fallback.

### Minimum durable domain model

```text
User
LabRun
Checkpoint
Progress
Purchase
Subscription
Entitlement
PaymentEvent
```

Future-ready:

```text
CreditLedger
UsageRecord
```

`Entitlement` is the canonical access truth; it must not be identical to a subscription row.

## Phase 3 — Revenue chain

Tracked work:

```text
#14 Waffo one-time + subscription billing
#15 Atomic compute-credit ledger / purchase foundation
```

### Billing provider

Waffo Pancake is the selected payment provider.

Product mapping:

```text
AI Engineer Foundations    one-time purchase
Production Labs            recurring subscription
Compute Credits            real compute only
```

### Billing invariants

- payment private keys stay server-side;
- browser success redirects do not grant access;
- verified server/webhook state updates purchases/subscriptions/entitlements;
- duplicate webhook events are idempotent;
- canceled/refunded/expired states reconcile correctly;
- provider IDs do not become the application domain model.

### Credits rule

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Credit packages must not be sold publicly until a real metered compute capability exists.

## Phase 4 — Measurement + production operations

Tracked work:

```text
#16 Production analytics + waitlist storage
#17 ahaframe.com deployment + observability
```

Production funnel:

```text
Landing
→ Lab start
→ Parameter interaction
→ Second Lab
→ Capstone
→ Pricing
→ Sign in
→ Checkout start
→ Purchase / subscription
→ Return usage
```

Deployment must include correct HTTPS/domain configuration, canonical URLs, sitemap/robots/structured data, safe secrets, error visibility, and rollback documentation.

## Phase 5 — Launch Gate

Tracked work:

```text
#18 Full E2E / security / billing verification
```

The platform is not ready for external users until these critical paths pass:

```text
anonymous learning
signed-in save/restore
Foundations purchase → entitlement
Production subscription → entitlement
failed payment → no access
duplicate webhook → no duplicate grant
session expiry / sign out
mobile + desktop critical path
```

Security review includes Supabase RLS, payment webhook signature/idempotency, server-side access control, secret exposure, dependency hygiene, and failure handling.

## Phase 6 — Soft Alpha

Tracked work:

```text
#19 20–50 developer Soft Alpha
```

Preconditions:

- Content MVP complete;
- account/save flow works;
- payment/entitlement chain works;
- production analytics and error monitoring active;
- `ahaframe.com` deployed;
- Launch Gate passes.

Observe:

- Lab start/completion and second-Lab rate;
- parameter interaction depth;
- which Labs create the strongest “aha”;
- sign-in/save demand;
- pricing/checkout behavior;
- technical/content confusion.

This is still not a broad Product Hunt / Hacker News / Reddit launch.

## Phase 7 — One metered Live Mode path

Tracked work:

```text
#20 One bounded Live Mode validation path
```

Add real compute only where it validates the simulation against reality:

```text
Simulation prediction
        ↓
Live run
        ↓
Observed result
        ↓
Compare
```

Rules:

- one Lab first;
- no unlimited model compute;
- hard usage/budget limits;
- server-side provider adapter;
- atomic credit debit;
- record model/provider, usage, latency, and cost evidence.

## Phase 8 — Public Beta decision

Tracked work:

```text
#21 Public Beta GO / NO-GO
```

Public Beta requires a deliberate written release decision based on Soft Alpha evidence and platform reliability.

If compute credits are publicly sold, a real metered Live Mode must already exist.

## GitHub execution workflow

Master tracking issue: `#22`.

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
→ update master checklist
```

The current GitHub connector does not expose GitHub Projects V2 mutations. A Project can be created in the GitHub UI and populated with issues `#7–#21`; the Issues/PRs/Actions remain directly manageable through the connected tool.

Recommended Project fields:

```text
Status       Backlog / Ready / In Progress / Review / Done
Phase        Content / Platform / Auth & Data / Billing / Ops / Launch / Live
Priority     P0 / P1 / P2
Type         Curriculum / Content / Platform / Auth / Data / Billing / Ops / QA / Launch
Launch Gate  Required / Post-Alpha
```

## Decision rule

The next feature should answer a product question, not merely make the platform look more complete.

Current content question:

> **Can AhaFrame make the cost-vs-information-loss trade-off of context compression visible enough that a developer can choose a defensible context policy instead of simply maximizing or minimizing tokens?**

Current platform question:

> **Can AhaFrame preserve its fast no-login learning experience while adding durable identity, entitlement, Waffo billing, and observability as a coherent production chain?**
