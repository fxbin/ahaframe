# AhaFrame Development Roadmap

Date: 2026-08-13  
Version: v0.4 — Validation First  
Status: active execution roadmap

## Product direction

AhaFrame is an English-first **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

```text
AI Engineering Learning
        ↓
Interactive Mental Models
        ↓
Failure Simulations
        ↓
Engineering Judgment
        ↓
Build Projects
        ↓
Paid capability
```

Core learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Product principle:

> **Validate learning value before building platform completeness.**

AhaFrame is not validated because the Labs work technically. The next milestone is to prove that real developers interact deeply, experience a measurable Aha, continue into additional Labs, and show enough return / payment intent to justify SaaS investment.

Execution sources of truth:

- `docs/CURRICULUM.md` — curriculum and Lab backlog.
- `docs/adr/0001-saas-platform-runtime.md` — accepted future SaaS runtime/migration architecture.
- `docs/CONTEXT_COMPRESSION_LAB.md` — implemented Context Compression specification.
- `docs/EVALUATION_FAILURE_LAB.md` — implemented Evaluation Failure specification.
- `docs/PRODUCT_SPEC.md` — current product / pricing hypotheses.
- This roadmap — **current execution order and validation gates**.

GitHub issue `#22` predates this validation-first sequencing and must be reconciled before platform implementation resumes.

## AI Engineering Layers

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

Dedicated Prompt, Graph, Tools, and additional Production Labs remain backlog candidates. They do not block Validation Alpha.

---

# Phase 0 — Product Foundation

**Status: COMPLETE**

Existing product assets are sufficient for the first external validation cohort.

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

### Validation MVP freeze

The seven implemented experiences are the **Validation MVP**.

Until the Product Gate is completed, do not add Labs merely to make the catalog look complete.

The following are explicitly **not required** before Validation Alpha:

```text
#9 Reliable Support Agent Build
Instruction Conflict Lab
Agent Workflow Graph Lab
Tool Contract Failure Lab
Embedding / Attention explorers
additional Production Labs
```

`#9 Reliable Support Agent Build` remains strategically useful, but is now conditional post-validation work unless a user study reveals that lack of a capstone prevents us from testing the core thesis.

---

# Phase 1 — Validation Instrumentation

**Status: NEXT**

Goal:

> Instrument the current no-login product well enough to explain what users did, where they dropped, whether they experienced an Aha, whether they explored another Lab, and whether they showed return / payment intent.

This phase has higher priority than Supabase identity, billing, entitlement, credit ledgers, or full Next.js migration.

## 1.1 Analytics event model

Track at minimum:

```text
landing_viewed
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
pricing_viewed
paid_intent_clicked
waitlist_submitted
return_visit
```

High-frequency UI events should be sampled or avoided unless they answer a concrete product question.

Every relevant event should carry enough experiment context to support cohort analysis:

```text
anonymous_user_id
session_id
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

Country / region may be collected only when available through a privacy-appropriate analytics mechanism; do not add invasive fingerprinting.

### `lab_version` is required

Do not combine behavior from materially different Lab experiences into one metric. When instructional flow, default scenario, scoring model, controls, or copy changes enough to affect learning behavior, increment the Lab version used in analytics.

## 1.2 Meaningful interaction definition

A `lab_started` event alone does not prove the user played with the system.

For Validation Alpha, define **Meaningful Interaction** as a user performing at least one causal Lab action beyond opening the page, such as:

```text
parameter change
preset apply
failure trigger
checkpoint
compare
scenario action that changes derived state
```

We may tighten this definition after observing real sessions.

## 1.3 Aha measurement

AhaFrame's core outcome is not page completion. It is changed engineering understanding.

After selected Labs, ask:

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

Also collect one optional qualitative prompt:

> **What do you understand differently now?**

This open-text answer is high-value research evidence and should be stored separately from anonymous event telemetry where practical.

## 1.4 “Want more” signal

After a meaningful Lab experience, optionally ask:

> **Would you use more Labs like this for production AI topics?**

This distinguishes a good single interactive article from a product with multi-Lab demand.

---

# Phase 2 — Validation Deployment

**Status: AFTER PHASE 1**

Goal:

> Put the current Validation MVP in front of real users with production analytics and feedback capture, without first building the full SaaS platform.

Reuse / advance the intent of existing work items where possible:

```text
#16 Analytics + waitlist storage      move forward
#17 ahaframe.com deployment           move forward
#19 Developer Alpha                   move forward as Validation Alpha
```

Required before recruiting users:

- `ahaframe.com` production deployment;
- HTTPS / DNS;
- canonical / robots / sitemap / structured data intact;
- analytics events verifiably arriving;
- anonymous-user and session continuity;
- real waitlist / feedback persistence;
- basic error monitoring;
- mobile + desktop smoke test;
- privacy-safe analytics disclosure where required;
- rollback path.

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

Public learning must remain no-login.

---

# Phase 3 — Validation Alpha

**Status: AFTER PHASE 2**

Recruit **20–30 qualified developers** before broad public launch.

## 3.1 Primary ICP

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

## 3.2 Validation journey

The shortest useful funnel is:

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
Second Lab
↓
Pricing / More-Labs Intent
↓
Return Visit
```

The Capstone is not required for this funnel.

## 3.3 Core dashboard

The first decision dashboard should emphasize a small number of product metrics rather than vanity traffic:

| Metric | Product question |
|---|---|
| Landing → Lab Start | Does positioning create enough intent to try? |
| Meaningful Interaction Rate | Do users actually PLAY rather than just read? |
| Failure / Trade-off Trigger Rate | Do users reach the BREAK part of the loop? |
| Lab Completion Rate | Is the experience understandable and usable? |
| **Strong Aha Rate** | Does the Lab actually change understanding? |
| **Second Lab Rate** | Is this a product, not just one good page? |
| D7 Return | Is there continuing value? |
| Paid / Founding Intent | Is there commercial potential? |

Supporting analysis should include source / campaign, Lab, Lab version, and cohort breakdowns.

## 3.4 Internal validation thresholds

These are **internal experimental decision rules, not industry benchmarks**.

| Metric | Initial target |
|---|---:|
| Landing → Lab Start | ≥ 40% |
| Meaningful Interaction | ≥ 60% of Lab starters |
| Failure / Trade-off Trigger | ≥ 40% of Lab starters |
| First Lab → Second Lab | ≥ 30% |
| Users completing ≥2 Labs | ≥ 25% |
| **Strong Aha Rate** | **≥ 60%** |
| “Want more Labs like this” | ≥ 40% |
| Pricing page visit | ≥ 10% |
| Paid / Founding intent | ≥ 3% |
| D7 Return | ≥ 15% initially; ≥ 20% is strong |

Do not tune the product to hit a metric mechanically. Use qualitative feedback to understand why a metric moved.

## 3.5 Qualitative review

For the first cohort, review representative sessions / feedback manually.

Look specifically for statements like:

```text
“I finally understand why ...”
“I thought X was always better, but now I see ...”
“I would use this before designing / debugging ...”
“I want a Lab for ...”
```

Weak evidence includes generic praise such as:

```text
“Nice UI”
“Cool demo”
“Looks polished”
```

AhaFrame is validated by changed mental models and repeat demand, not aesthetic approval.

---

# Phase 4 — Product Gate

**Status: REQUIRED BEFORE PLATFORM EXPANSION**

After the first 20–30 qualified users, write an explicit Product Gate decision.

Possible outcomes:

```text
GO PLATFORM
VALIDATE AGAIN
REFRAME
CONTENT / BRAND ASSET
STOP
```

## 4.1 Interpretation matrix

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

### Case C — Aha high, Second Lab low

```text
Aha         high
Second Lab  low
```

Likely problem:

> Strong single-page educational asset; weak platform / curriculum pull.

Action:

> Test better next-Lab routing and topic demand. Consider content / acquisition asset positioning if repeat demand remains weak.

### Case D — Aha + multi-Lab strong, paid intent weak

```text
Aha          high
Second Lab   high
Paid Intent  low
```

Likely problem:

> Product value exists, monetization boundary or buyer may be wrong.

Action:

> Test paid Build Projects, Production Labs, team / employer value, or alternative pricing before building extensive billing infrastructure.

### Case E — Aha + multi-Lab + return + paid intent strong

This is the desired signal:

> **GO PLATFORM.**

Resume the accepted SaaS architecture and build durable identity / state / revenue infrastructure.

## 4.2 Minimum GO condition

Do not treat any one metric as sufficient. A GO PLATFORM decision should normally require:

- Strong Aha at or above the internal target;
- meaningful multi-Lab behavior;
- evidence of return or explicit future-use intent;
- non-zero credible payment intent;
- no unresolved severe comprehension / trust problem in deterministic metrics.

---

# Phase 5 — Conditional Content Expansion

**Status: ONLY AFTER PRODUCT GATE OR WHEN REQUIRED BY VALIDATION**

Candidate next item:

```text
#9 Reliable Support Agent Build
```

The Capstone should combine existing mental models:

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

The Build should reward defensible engineering judgment, not framework boilerplate.

Additional Labs are chosen from observed demand and failure patterns, not curriculum completeness.

Possible backlog:

```text
Instruction Conflict Lab
Tool Contract Failure Lab
Retry & Idempotency Lab
Agent Workflow Graph Lab
Model Routing Lab
Trace Diagnosis Lab
Guardrail Failure Lab
```

Decision rule:

> **Every new Lab must answer either a demonstrated user demand or a missing dependency required for a validated paid outcome.**

---

# Phase 6 — SaaS Platform Migration

**Status: PAUSED UNTIL GO PLATFORM**

Architecture decision in ADR-0001 remains accepted. The validation-first roadmap changes **when** we execute it, not the target architecture.

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

# Phase 7 — Identity + Durable State

**Status: AFTER GO PLATFORM + MIGRATION PARITY**

Tracked work:

```text
#12 Optional Supabase identity
#13 Progress / checkpoints / entitlement model
```

Identity UX must preserve the no-login acquisition experience:

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

# Phase 8 — Revenue Chain

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

# Phase 9 — Platform Launch Gate

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

# Phase 10 — Metered Live Mode

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
- auditable provider/model/usage/latency/cost evidence;
- atomic credit debit only when credits are actually necessary.

Live Mode should validate or challenge the simulation's mental model; it should not turn AhaFrame into a generic model playground.

---

# Phase 11 — Public Beta

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
DONE    7 Validation-MVP experiences
DONE    #10 SaaS architecture direction / ADR

NEXT    Phase 1 — Validation instrumentation
NEXT    Phase 2 — Validation deployment
NEXT    Phase 3 — 20–30 developer Validation Alpha
NEXT    Phase 4 — Product Gate

HOLD    #9 Capstone unless validation requires it
PAUSE   #11 SaaS migration until GO PLATFORM
PAUSE   #12–#15 identity / billing / credits until GO PLATFORM
```

Current execution flow:

```text
Existing 7 Labs
      ↓
Analytics + Aha Feedback
      ↓
Production Validation Deployment
      ↓
20–30 Qualified Developers
      ↓
Funnel + Aha + Multi-Lab + Return + Paid Intent
      ↓
PRODUCT GATE
   ↙        ↓          ↘
REFRAME   VALIDATE     GO PLATFORM
                         ↓
                 Content / Capstone as needed
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

Every implementation item still follows:

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

But engineering completeness is subordinate to evidence gathering during Validation Alpha.

---

# Decision Rules

## Current product question

> **Do experienced software developers gain meaningfully stronger AI-engineering intuition from AhaFrame's interactive failure simulations, and do enough of them want additional Labs / return / paid capability to justify a platform?**

## Current analytics question

> **Can we reliably connect anonymous acquisition → Lab behavior → Aha → second-Lab behavior → return / payment intent without adding login friction?**

## Deferred platform question

> **Can the accepted Next.js + Supabase + Waffo architecture preserve AhaFrame's no-login learning experience, SEO, visual system, and deterministic Lab behavior?**

This question becomes active only after `GO PLATFORM`.

## Final principle

> **Do not build the next layer because it is architecturally elegant. Build it because validated user behavior makes it necessary.**
