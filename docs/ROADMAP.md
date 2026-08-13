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
- `docs/adr/0001-saas-platform-runtime.md` — accepted SaaS runtime/migration architecture.
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

Dedicated Prompt and Graph Labs are backlog items and do not block the first Alpha.

## Phase 0 — Product foundation

Status: complete

- AhaFrame brand + `ahaframe.com`
- warm-white / graphite / teal visual system
- Token Playground
- Context Window Lab
- Agent Loop Simulator
- generic Lab / Simulation Engine
- history / checkpoint / compare / replay
- RAG Failure Lab
- Agent Reliability Lab
- Evaluation Failure Lab
- Context Compression Lab
- CI / static validation
- pricing hypothesis: `$49 one-time Foundations` + future `$12/month Production Labs`

## Phase 1A — Content MVP

Status: one item remaining

```text
#7 Curriculum v1.1                 done
#8 Context Compression Lab         done
#9 Reliable Support Agent Build    NEXT
```

The capstone combines:

```text
Task / prompt contract
+ Retrieval configuration
+ Context compression policy
+ Harness controls
+ Loop / termination policy
+ Graph topology where useful
+ Human approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Architecture decision
+ Trade-off explanation
+ Release decision
```

Backlog candidates that do not delay Alpha:

```text
Instruction Conflict Lab
Agent Workflow Graph Lab
Tool Contract Failure Lab
```

## Phase 1B — SaaS platform migration

Architecture decision: **accepted in ADR-0001**.

Target runtime:

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

Migration strategy:

> **Parity first. Platform features second.**

The migration is staged but **not a permanent hybrid**.

### #10 Architecture ADR — complete when merged

Locked decisions:

- Next.js is the target long-term application runtime;
- Raphael StarterKit is the allowed reusable development skeleton;
- create the Next.js application in a temporary `web/` migration boundary;
- keep the existing static application as behavior/SEO reference until parity;
- do not redesign Labs during migration;
- preserve exact `/en/...` public URLs;
- preserve crawlable server-rendered educational content;
- mount existing deterministic Lab Engine/scenarios from client boundaries rather than rewriting scenario math into React;
- Supabase owns identity/data, with RLS on user-owned tables;
- Waffo is a billing adapter, never the authorization model;
- `Entitlement` is AhaFrame's access truth;
- secrets are server-only;
- Vercel preview → parity gate → production cutover is the target deployment flow.

See `docs/adr/0001-saas-platform-runtime.md`.

### #11 SaaS runtime migration — next platform implementation

Implementation phases:

```text
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

During M1–M4, the existing static build remains a regression oracle, not a second long-term production runtime.

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

Future:

```text
CreditLedger
UsageRecord
```

`Entitlement` is the canonical application access truth. It is not identical to a subscription row and must not require a synchronous Waffo lookup for each request.

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

Waffo integration rules:

- use a server-owned API/SDK adapter;
- keep Merchant/private credentials server-side;
- success redirects never grant access;
- verify Webhook signatures;
- deduplicate provider events with a unique event ID;
- reconcile Purchase / Subscription / Entitlement from verified server-side events;
- explicitly handle cancellation, past-due, refund, and retry behavior;
- use test mode for the complete chain before production.

Credits rule:

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Do not sell credits before a real metered compute capability exists.

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

Production operations must cover HTTPS/DNS, canonical/robots/sitemap/structured data, safe secrets, error monitoring, uptime visibility, preview-to-production promotion, and rollback.

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
cancel / expiry / refund reconciliation
session expiry / sign out
mobile + desktop smoke path
```

Security review includes Supabase RLS, Waffo signature/idempotency, server-side access control, secret exposure, dependency/configuration hygiene, and failure handling.

AhaFrame is not externally launch-ready merely because pages are online.

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
- #18 Launch Gate passes.

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

One Lab first; no unlimited compute; hard budgets; server-side provider adapter; atomic credit debit; auditable usage/cost evidence.

## Phase 8 — Public Beta

Tracked work:

```text
#21 Public Beta GO / NO-GO
```

Public Beta requires a deliberate written release decision based on Soft Alpha evidence and platform reliability.

## Current execution state

```text
DONE         #7  Curriculum v1.1
DONE         #8  Context Compression Lab
NEXT         #9  Reliable Support Agent Build
ADR          #10 Platform architecture (accepted; merge pending in this branch)
NEXT PLATFORM #11 SaaS runtime migration after #10
```

Execution lanes:

```text
CONTENT              PLATFORM
#9 Capstone           #10 ADR
                        ↓
                      #11 Migration
       \                /
        \              /
         → #12 / #13 → #14 → #16/#17 → #18 → #19
```

## Engineering workflow

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

> **Can the Next.js parity migration preserve AhaFrame's no-login learning experience, SEO, visual system, and deterministic Lab behavior before we add Auth and Billing?**
