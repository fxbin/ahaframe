# AhaFrame Product Spec — v0.3 Content MVP + Platform Launch

Date: 2026-08-13
Status: active product source of truth

## Product thesis

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The product tests whether developers can build stronger engineering intuition by manipulating deterministic simulations, breaking systems, comparing configurations, and applying the resulting mental model to production decisions.

## Brand

- **Brand:** AhaFrame
- **Primary domain:** `https://ahaframe.com`
- **Category:** Interactive AI Engineering
- **Audience:** experienced developers becoming AI engineers
- **Primary slogan:** **Understand AI by seeing it work.**

## Learning model

```text
SEE → PLAY → BREAK → AHA → BUILD
```

- **See** — visualize hidden system behavior.
- **Play** — change meaningful parameters.
- **Break** — trigger failure modes intentionally.
- **Aha** — connect cause and effect into a durable mental model.
- **Build** — apply the model to architecture, debugging, evaluation, and production trade-offs.

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

These layers cross-cut system domains such as RAG, tools, agents, production, and multi-agent systems. They do not imply six duplicated course catalogs.

## Public routes

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

The root route redirects to `/en/`.

## Foundation lessons

### Token Playground

Teaches next-token prediction, visible candidate probabilities, sampling, greedy decoding, and temperature using a deterministic teaching model.

### Context Window Lab

Teaches finite working context and the trade-offs between truncation, summarization, retrieval, and longer-term memory.

### Agent Loop Simulator

Teaches task interpretation, action selection, tool use, observation, retry/error recovery, and termination.

## Production Lab previews

All current Production Lab metrics are deterministic educational quantities. They are not presented as benchmark measurements from live models, retrieval systems, tools, LLM judges, or customer traffic.

### RAG Failure Lab

Controls:

```text
Chunk Size
Overlap
Top-K
Retrieval Strategy
Reranker
```

Derived signals:

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

The learner starts from a broken retrieval configuration and compares the current policy against the baseline.

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

Derived signals:

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

The Lab demonstrates that a system can have a reasonable completion rate while remaining operationally unsafe or expensive.

### Evaluation Failure Lab

The learner starts from a demo-biased evaluation where Agent v2 appears stronger overall even though long-horizon and safety-critical refund slices regress.

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

A better evaluation policy can correctly block an unresolved regression; it does not magically fix the candidate system.

### Context Compression Lab

Implemented route:

```text
/en/labs/context-compression/
```

Scenario: the same support-agent world, but now the failure is in context assembly. The original synthetic working set contains 25,500 tokens and production allows a 16,000-token active context.

Controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory budget
Critical-fact protection
```

Derived signals:

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

The initial policy is deliberately over-compressed: it saves more than 70% of tokens but loses most task-critical information.

The balanced preset intentionally **spends more context** than the broken baseline while remaining inside 16k and restoring modeled task quality. This prevents the Lab from teaching “lower token count = better.”

The Lab also demonstrates the opposite failure: retaining nearly everything can preserve excellent information while violating the working-context budget.

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

Dedicated Prompt, Graph, and Tools Labs remain backlog candidates and do not delay the first Alpha unless the capstone exposes a real missing dependency.

### Reliable Support Agent Build

The capstone must integrate the mental models already taught:

```text
Task / prompt contract
+ Retrieval configuration
+ Context policy
+ Harness controls
+ Loop / termination policy
+ Approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Architecture decision
+ Trade-off explanation
+ Release decision
```

The goal is not to copy LangChain/LangGraph boilerplate. The learner should make a defensible production architecture decision under explicit constraints.

## Pricing hypothesis

The retired `$19/month Pro` and `$39/month Founding` hypotheses remain retired.

Current hypothesis:

```text
Free                       $0
AI Engineer Foundations    $49 one-time
Production Labs            $12/month future hypothesis
```

### Free boundary

- core mental models;
- foundational simulations;
- public guides / curriculum map;
- selected Production Lab previews;
- anonymous local learning progress.

### Paid capability boundary

- full failure simulations;
- Production Labs;
- Build Projects;
- evaluation challenges;
- later: durable cloud checkpoints and Live Mode capabilities.

Pricing is not considered validated until users make real payment decisions.

## Platform Launch definition

AhaFrame is not “launched” merely because static pages are online.

The public-platform chain is:

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

## SaaS foundation

Approved platform inputs:

```text
Raphael StarterKit  → reusable SaaS development skeleton
Supabase             → identity + application data
Waffo Pancake        → billing provider
AhaFrame Lab Engine  → deterministic simulation runtime
```

Raphael may be used directly as a development skeleton, but AhaFrame keeps ownership of product behavior, visual system, curriculum, Lab Engine, pricing semantics, and access model.

The platform architecture ADR must define whether migration is full Next.js or staged/hybrid before runtime migration begins.

## Authentication boundary

Public learning must remain no-login.

Intended UX:

```text
Visit
 ↓
Learn / use Labs immediately
 ↓
Choose Save / Purchase / Build / Live Mode
 ↓
Sign in
```

Identity becomes useful for:

1. cross-device progress;
2. saved Lab runs and checkpoints;
3. paid entitlements;
4. Build submissions;
5. Live Mode credits.

Preferred first OAuth path: GitHub. Email fallback remains available.

Do not build social profiles, teams, organizations, certificates, or a large LMS model for the first platform version.

## Durable domain model

Minimum application model:

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

Future Live Mode:

```text
CreditLedger
UsageRecord
```

`Entitlement` is the canonical access truth. It must not be derived by synchronously calling the payment provider on every request.

## Billing

Selected provider: **Waffo Pancake**.

Product mapping:

```text
AI Engineer Foundations    one-time purchase
Production Labs            recurring subscription
Compute Credits            one-time purchase only when real compute exists
```

Billing invariants:

- private credentials remain server-side;
- a browser success redirect never grants access;
- verified server/webhook state updates Purchase / Subscription / Entitlement;
- duplicate webhook events are idempotent;
- cancellation, expiry, and refund states reconcile access correctly;
- provider IDs remain adapter metadata rather than the application domain model.

## Compute credits

Credits are **compute credits**, not learning tokens.

```text
Simulation / learning   no credits
Saved progress          no credits
Live model / agent run  credits
Sandbox execution       credits later
```

Do not sell credits publicly until at least one real metered Live Mode capability exists.

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

Registered deterministic scenarios:

```text
token-playground
context-window
rag-failure
agent-reliability
agent-loop
evaluation-failure
context-compression
```

Evaluation Failure and Context Compression load scenario-specific deterministic modules after the shared scenario registry and before their DOM adapters. The generic Engine remains unchanged.

See `docs/LAB_ENGINE.md`.

## Measurement

Current semantic events include lesson interactions and Lab-specific controls. Context Compression adds:

```text
context_compression_parameter_changed
context_compression_summary_depth_changed
context_compression_protection_changed
context_compression_balanced_preset_applied
context_compression_baseline_reset
context_compression_build_challenge_started
context_compression_paid_intent_click
```

The Engine itself keeps tracking opt-in to avoid duplicating high-frequency adapter-owned product events.

## Visual direction

Canonical visual system: `docs/VISUAL_SYSTEM.md`.

Core positioning:

> Future technical textbook, not AI startup template.

Use warm white, graphite, and teal. Avoid generic blue-purple gradients, unexplained glow effects, or decorative “AI magic.”

## SEO / discovery

Public conceptual pages use stable crawlable URLs, answer-first copy, semantic structured data, sitemap / robots, explicit modification dates, and canonical HTML as the source of truth.

## Launch Gate

Before inviting external Alpha users, the complete critical path must pass:

```text
anonymous learning
signed-in save / restore
one-time purchase → entitlement
subscription → entitlement
failed payment → no access
duplicate webhook → no duplicate grant
cancel / expiry reconciliation
session expiry / sign out
mobile + desktop smoke tests
```

Security review includes Supabase RLS, Waffo webhook signature/idempotency, server-side access control, secret handling, and dependency/configuration hygiene.

## Current next steps

Two lanes can now run in parallel:

```text
CONTENT
#9 Reliable Support Agent Build

PLATFORM
#10 Raphael → AhaFrame architecture ADR
        ↓
#11 SaaS runtime migration
```

They converge before identity, billing, production operations, Launch Gate, and the 20–50 developer Soft Alpha.
