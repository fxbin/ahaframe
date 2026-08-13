# AhaFrame Development Roadmap

Date: 2026-08-13
Status: active execution roadmap

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

Execution sources of truth:

- `docs/CURRICULUM.md` — Curriculum v1.1 and Lab backlog.
- `docs/CONTEXT_COMPRESSION_LAB.md` — implemented Context Compression specification.
- `docs/EVALUATION_FAILURE_LAB.md` — implemented Evaluation Failure specification.
- GitHub issue `#22` — end-to-end Platform Launch master plan.

## AI Engineering Layers

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

Dedicated Prompt and Graph Labs are backlog items; they do not block the first Alpha.

## Phase 0 — Product foundation

Status: complete

- AhaFrame brand + `ahaframe.com`
- warm-white / graphite / teal visual system
- Token Playground
- Context Window Lab
- Agent Loop Simulator
- generic Lab / Simulation Engine
- history / checkpoint / compare / replay
- CI / static validation
- pricing hypothesis: `$49 one-time Foundations` + future `$12/month Production Labs`

## Phase 1A — Content MVP

Status: one item remaining

Completed Production Labs:

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         done
```

Remaining Content MVP capstone:

```text
#9 Reliable Support Agent Build  NEXT
```

Backlog candidates that do not delay Alpha:

```text
Instruction Conflict Lab
Agent Workflow Graph Lab
Tool Contract Failure Lab
```

### Context Compression Lab — complete

Implemented route:

```text
/en/labs/context-compression/
```

Product question:

> **When context compression saves tokens, latency, and cost, what task-critical information gets lost?**

Implemented controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory budget
Critical-fact protection
```

Implemented signals:

```text
Active context tokens
Token savings
Critical-information retention
Evidence coverage
Task quality
Hallucination risk
Latency index
Cost index
Context overflow
Failure diagnosis
```

The Lab starts from a deliberately over-compressed support-agent context. Its balanced preset intentionally spends more tokens than the broken baseline while restoring critical information and remaining inside a fixed 16k working-context budget.

It also demonstrates the opposite failure: retaining nearly everything can preserve excellent modeled quality while overflowing the production context budget.

See `docs/CONTEXT_COMPRESSION_LAB.md`.

### Reliable Support Agent Build — next

The capstone should connect the existing Labs into one production decision:

```text
Prompt / task contract
+ Retrieval configuration
+ Context compression policy
+ Harness controls
+ Loop / termination policy
+ Graph topology where useful
+ Human approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Reliable Support Agent
```

Expected output:

```text
Architecture decision
Trade-off explanation
Release gate
```

The challenge should reward defensible architecture rather than boilerplate framework code.

## Phase 1B — Platform architecture

Status: ready to begin in parallel with #9

Tracked work:

```text
#10 Raphael → AhaFrame architecture / migration ADR
#11 SaaS runtime migration
```

Platform inputs:

```text
Raphael StarterKit  → reusable SaaS development skeleton
Supabase             → identity + application data
Waffo Pancake        → payment provider
AhaFrame Lab Engine  → deterministic simulation runtime
```

Architecture rule:

> **Borrow the SaaS foundation; do not overwrite the product.**

AhaFrame keeps ownership of:

- brand and visual system;
- curriculum and learning UX;
- Lab Engine and scenarios;
- pricing / entitlement semantics;
- public route and SEO behavior.

The ADR must decide full Next.js migration vs staged transition and define how current static routes, Lab behavior, SEO, and tests survive the move.

## Phase 2 — Identity + durable state

Tracked work:

```text
#12 Optional Supabase identity
#13 Progress / checkpoints / entitlement model
```

Identity UX:

```text
Visit
 ↓
Learn / use public Labs anonymously
 ↓
Choose Save / Purchase / Build / Live Mode
 ↓
Sign in
```

Preferred OAuth: GitHub first for the developer audience; email fallback.

Minimum domain model:

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

`Entitlement` is the canonical application access truth. It must not be identical to a subscription or payment-provider row.

## Phase 3 — Revenue chain

Tracked work:

```text
#14 Waffo one-time + subscription billing
#15 Atomic compute-credit ledger / purchase foundation
```

Commercial model:

```text
Free                       $0
AI Engineer Foundations    one-time purchase
Production Labs            recurring subscription
Compute Credits            real compute only
```

Billing invariants:

- Waffo private credentials stay server-side;
- browser success redirects do not grant access;
- verified server/webhook state updates Purchase / Subscription / Entitlement;
- duplicate webhook events are idempotent;
- refund / cancellation / expiry reconcile access correctly;
- provider IDs remain adapter metadata rather than the domain model.

Credits rule:

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Do not sell credits publicly before a real metered compute capability exists.

## Phase 4 — Measurement + production operations

Tracked work:

```text
#16 Production analytics + waitlist storage
#17 ahaframe.com deployment + observability
```

Target funnel:

```text
Landing
→ Lab start
→ Parameter interaction
→ Second Lab
→ Capstone
→ Pricing
→ Sign in
→ Checkout
→ Entitlement
→ Return usage
```

Production deployment must cover:

- HTTPS and DNS;
- canonical / robots / sitemap / structured data;
- server-safe secrets;
- error monitoring / uptime visibility;
- preview-to-production workflow;
- rollback procedure.

## Phase 5 — Launch Gate

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
cancel / expiry → correct access change
session expiry / sign out
mobile + desktop smoke path
```

Security review includes:

- Supabase RLS;
- Waffo signature / idempotency;
- server-side access control;
- secret exposure;
- input / error handling;
- dependency / configuration hygiene.

AhaFrame is not externally launch-ready merely because the pages are online.

## Phase 6 — Soft Alpha

Tracked work:

```text
#19 20–50 developer Soft Alpha
```

Preconditions:

- Content MVP complete;
- account / save flow works;
- payment / entitlement chain works;
- analytics / error monitoring active;
- `ahaframe.com` deployed;
- #18 Launch Gate passes.

Observe:

- Lab start / completion / second-Lab rate;
- parameter interaction depth;
- strongest “aha” experiences;
- sign-in / save demand;
- pricing / checkout behavior;
- technical and content confusion.

This is not yet a broad Product Hunt / Hacker News / Reddit launch.

## Phase 7 — Metered Live Mode

Tracked work:

```text
#20 One bounded Live Mode path
```

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
- atomic credit debit;
- record provider / model / usage / latency / cost evidence.

## Phase 8 — Public Beta

Tracked work:

```text
#21 Public Beta GO / NO-GO
```

Public Beta requires a deliberate written release decision based on Soft Alpha evidence and platform reliability.

## Current execution state

```text
DONE   #7  Curriculum v1.1
DONE   #8  Context Compression Lab
NEXT   #9  Reliable Support Agent Build
READY  #10 Raphael → AhaFrame architecture ADR
```

Recommended parallel execution after #8:

```text
Content lane:   #9
Platform lane:  #10
                   ↓
                 #11
```

The lanes converge before identity, billing, production operations, and Launch Gate.

## Engineering workflow

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
→ update #22
```

## Decision rule

The next feature should answer a product or platform question, not merely make AhaFrame look more complete.

Current content question:

> **Can the capstone make a developer combine retrieval, context, harness, loop, approval, evaluation, and economics into one defensible architecture?**

Current platform question:

> **Can AhaFrame preserve its fast no-login learning experience while adding durable identity, entitlement, Waffo billing, and observability as one coherent production chain?**
