# AhaFrame Product Spec — v0.3 Content MVP + Platform Launch

Date: 2026-08-16
Status: active product source of truth

## Product thesis

AhaFrame is an English-first **Interactive AI Engineering Lab** for experienced software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

AhaFrame teaches engineering intuition by making hidden AI-system behavior visible, letting learners manipulate deterministic simulations, deliberately trigger failure modes, compare policies, and apply the resulting mental models to production decisions.

## Brand

- Brand: **AhaFrame**
- Primary domain: `https://ahaframe.com`
- Category: Interactive AI Engineering
- Audience: experienced developers becoming AI engineers
- Visual system: warm white / graphite / teal
- Product feel: future technical textbook, not generic AI SaaS template

## Learning model

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture rule:

> **Simulate the concept. Spend compute only to validate reality.**

## AI Engineering Layers

Curriculum source of truth: `docs/CURRICULUM.md`.

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

These layers cross-cut system domains such as RAG, tools, agents, production, and multi-agent systems. They are not six duplicated course catalogs.

## Public route contract

Current public URLs are contractual during the SaaS migration:

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/labs/rag-failure/
/en/labs/agent-reliability/
/en/labs/evaluation-failure/
/en/labs/context-compression/
/en/pricing/
/en/early-access/
```

Root `/` resolves/redirects to `/en/` unless a later localization decision explicitly changes the contract.

## Foundation lessons

### Token Playground

Deterministic teaching model for next-token prediction, candidate probabilities, sampling, greedy decoding, and temperature.

### Context Window Lab

Finite working context and the trade-offs among truncation, summarization, retrieval, and longer-term memory.

### Agent Loop Simulator

Task interpretation, action selection, tool use, observation, retry/recovery, and termination.

## Production Lab previews

All current metrics are deterministic educational quantities, not live benchmark evidence.

### RAG Failure Lab

Controls:

```text
Chunk Size
Overlap
Top-K
Retrieval Strategy
Reranker
```

Signals:

```text
Recall
Precision
Context Usage
Overflow
Latency
Cost Index
Answer Quality
Failure Diagnosis
```

The learner repairs a deliberately broken retrieval policy and compares it with the baseline.

### Agent Reliability Lab

Scenario: refund-capable customer-support agent.

Controls:

```text
Max Steps
Retry Limit
Tool Timeout
Result Validation
Human Approval
Termination Rule
```

Signals:

```text
Success Rate
Reliability Score
Runaway Risk
Unsafe-Action Risk
Expected Steps
Latency
Cost Index
Human Review Load
Failure Diagnosis
```

The Lab demonstrates that completion rate alone does not make an Agent production-safe.

### Evaluation Failure Lab

The learner starts from a demo-biased evaluation where Agent v2 looks better overall while long-horizon and safety-critical refund slices regress.

Controls:

```text
Dataset preset
Pass threshold
Safety veto
Sample size
Judge mode
Cost gate
```

Release outcome:

```text
SHIP / BLOCK / INCONCLUSIVE
```

Core lesson:

> **Evaluation is a decision system, not a single score.**

### Context Compression Lab

Route:

```text
/en/labs/context-compression/
```

The synthetic working set contains 25,500 tokens and the teaching production budget allows 16,000 active tokens.

Controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory budget
Critical-fact protection
```

Signals:

```text
Active context tokens
Token savings
Critical-information retention
Evidence coverage
Instruction retention
Task quality
Hallucination-risk index
Latency index
Cost index
Context overflow
Failure diagnosis
```

The baseline saves more than 70% of tokens while destroying critical information. The balanced preset intentionally spends more context than the broken baseline, restores modeled quality, and stays inside 16k. Retaining nearly everything can also fail by overflowing the budget.

See `docs/CONTEXT_COMPRESSION_LAB.md`.

## Content MVP stop line

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

Prompt, Graph, and Tools-specific Labs remain backlog candidates unless the capstone exposes a real missing dependency.

### Reliable Support Agent Build

The capstone must integrate:

```text
Task / prompt contract
+ Retrieval configuration
+ Context policy
+ Harness controls
+ Loop / termination policy
+ Graph topology where useful
+ Approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Architecture decision
+ Trade-off explanation
+ Release decision
```

The product should reward defensible architecture, not framework boilerplate copying.

## Pricing hypothesis

```text
Free                       $0
AI Engineer Foundations    $39 one-time hypothesis
Production Labs            $12/month future hypothesis
```

### Free boundary

- core mental models;
- foundational simulations;
- public guides / curriculum map;
- selected Production Lab previews;
- anonymous local learning progress.

### Paid capability boundary

The two paid offers are deliberately separate entitlements rather than a nested subscription ladder.

**AI Engineer Foundations — one-time lifetime entitlement**

The public pricing promise must describe what is actually shipped in production, not a future course-count target. During the current validation phase that means:

- 3 flagship production-incident Missions;
- 1 cross-layer Final Boss;
- interactive Foundations and specialist Labs already available in the product;
- evaluation and release-decision challenges;
- lifetime access as the Foundations track expands.

Do not market fixed counts such as `12 interactive labs` or `3 Build Projects` until those counts are genuinely shipped and available to the purchaser.

**Production Labs — time-bounded subscription entitlement**

- advanced production incident simulations;
- continuously growing Mission library;
- advanced compare / replay workflows;
- later: durable cloud checkpoints and saved experiments;
- later: Live Mode capabilities when real metered compute exists.

Production Labs does **not** include or grant the Foundations purchase. A learner who owns Foundations keeps that lifetime entitlement if a later Production Labs subscription expires.

Pricing remains a hypothesis until users make real payment decisions.

## Platform Launch definition

AhaFrame is not launch-ready merely because pages are online.

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

Execution master: GitHub issue `#22`.

## Accepted SaaS architecture

Architecture decision: `docs/adr/0001-saas-platform-runtime.md`.

Target runtime:

```text
Next.js App Router + TypeScript
        ↓
Raphael StarterKit SaaS foundation
        ↓
Supabase Auth + application data
        ↓
Waffo billing adapter
        ↓
AhaFrame Lab Engine preserved as framework-independent runtime
```

Migration strategy:

> **Parity first. Platform features second.**

The target is one Next.js production runtime. The migration is staged, not a permanent hybrid.

Issue #11 initially creates the Next.js application under `web/` while the current static application remains a behavior/SEO regression reference. Production switches only after route, visual, SEO, and Lab behavior parity passes.

Raphael may be reused directly for generic SaaS foundation. Creem and Raphael product-specific business logic are replaced; AhaFrame keeps its brand, learning UX, curriculum, Lab Engine, pricing, and entitlement semantics.

## Rendering boundary

Public educational content should remain server-rendered/static where possible.

```text
Explanation / SEO content   → server/static rendering
Interactive Lab controls    → client boundary
Account / entitlement       → server-aware application state
Billing / secrets / webhook → server only
```

The migration must not move scenario calculations into React components.

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
Derived Metrics
  ↓
Adapter / UI boundary
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

Current scenarios:

```text
token-playground
context-window
rag-failure
agent-reliability
agent-loop
evaluation-failure
context-compression
```

The Next.js migration preserves these scenario definitions and the Node behavioral regression suite. A future ESM/TypeScript packaging refactor is optional and must not be coupled to route migration.

See `docs/LAB_ENGINE.md`.

## Authentication boundary

Public learning remains no-login.

```text
Visit
 ↓
Learn / use Labs immediately
 ↓
Choose Save / Purchase / Build / Live Mode
 ↓
Sign in
```

Identity is justified for:

1. cross-device progress;
2. saved Lab runs/checkpoints;
3. paid entitlements;
4. Build submissions;
5. Live Mode credits.

Preferred first OAuth path: GitHub. Email fallback remains available. Do not build social profiles, teams, organizations, certificates, or a large LMS model for the first platform version.

## Supabase data boundary

`auth.users` owns identity. AhaFrame application tables own product state.

Minimum durable domain:

```text
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

User-owned tables require production-reviewed RLS. Privileged Supabase credentials remain server-only.

## Entitlement boundary

`Entitlement` is the canonical access truth.

Do not equate access with `Subscription` because AhaFrame needs multiple grant types:

```text
Foundations one-time purchase      → lifetime entitlement
Production Labs subscription      → time-bounded entitlement
future explicit support/admin grant → entitlement
Compute Credits                    → ledger balance, not entitlement
```

The Production Labs entitlement does not imply a Foundations entitlement, and expiration of Production Labs never revokes an independently purchased lifetime Foundations entitlement.

Application access checks read AhaFrame-owned entitlement state and do not synchronously call Waffo on every request.

## Billing — Waffo Pancake

Waffo is a payment-provider adapter behind AhaFrame-owned server APIs.

Product mapping:

```text
AI Engineer Foundations    → one-time Waffo product
Production Labs            → subscription Waffo product
Compute Credits            → one-time/dynamic purchase only after Live Mode exists
```

Authoritative flow:

```text
UI
 ↓
AhaFrame server checkout endpoint
 ↓
Waffo adapter / checkout
 ↓
customer payment
 ↓
verified Waffo webhook
 ↓
PaymentEvent
 ↓
Purchase / Subscription
 ↓
Entitlement
```

Billing invariants:

- Waffo private credentials remain server-only;
- browser success redirects never grant access;
- Webhook signatures are verified;
- provider event IDs are deduplicated with a uniqueness guarantee;
- retries cannot duplicate purchases, entitlements, or future credits;
- cancellation, past-due, refund, and paid-through behavior is explicit and tested;
- Waffo provider IDs remain adapter metadata, not domain identity.

Issue #14 must confirm the exact provider-supported mechanism for correlating a server-created checkout/order with an authenticated AhaFrame user; if provider metadata/reference is insufficient, use an AhaFrame-owned pending-checkout record.

## Compute credits

Credits are **compute credits**, not learning tokens.

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Do not publicly sell credits until a real metered capability exists.

When enabled, use an append-only ledger or transaction-safe equivalent with atomic debits, idempotent grants, and auditable UsageRecords. Do not port a simple read-modify-write mutable balance as the source of truth.

## Environment / secrets

Browser-safe values are limited to intentionally public configuration.

Server-only examples:

```text
Supabase privileged/service credential
Waffo Merchant/private credential
Waffo webhook verification material
future model-provider keys
internal reconciliation credentials
```

Private values never use `NEXT_PUBLIC_*`, never enter client bundles, and never enter version control. Test/preview/production environments remain separated.

## Deployment topology

Target:

```text
GitHub
 ↓
Vercel Preview
 ↓
CI + route/SEO/visual/Lab parity
 ↓
Vercel Production
 ↓
ahaframe.com

Supabase → Auth + PostgreSQL
Waffo    → Checkout + billing events
```

The current static build remains the migration regression oracle until issue #11 cuts production over to Next.js.

## SEO / discovery invariants

The migration must preserve or improve:

- exact current public paths;
- canonical URLs;
- one H1 per educational page;
- crawlable explanation content without client JS;
- LearningResource/WebPage structured data;
- sitemap and robots behavior;
- Open Graph metadata;
- synthetic-metric disclosure;
- preview/local indexing safeguards.

## Measurement

Semantic analytics remain adapter/product owned rather than high-frequency Engine owned. The platform phase will connect production analytics and durable waitlist storage in issue #16.

## Launch Gate

Before external Alpha users are invited, issue #18 must prove:

```text
anonymous learning
signed-in save / restore
one-time purchase → entitlement
subscription → entitlement
failed payment → no access
duplicate webhook → no duplicate grant
cancel / expiry / refund reconciliation
session expiry / sign out
mobile + desktop smoke tests
```

Security review includes Supabase RLS, Waffo signature/idempotency, server-side access control, secret handling, input/error behavior, and dependency/configuration hygiene.

## Current execution lanes

```text
CONTENT
#9 Reliable Support Agent Build

PLATFORM
#10 SaaS architecture ADR
 ↓
#11 Next.js parity migration
```

After #10 merges, #9 and #11 can proceed in parallel and converge before Auth, durable state, Waffo billing, production operations, Launch Gate QA, and the 20–50 developer Soft Alpha.
