# AhaFrame Curriculum v0.8 — Game Learning & Production Incident Edition

Date: 2026-08-16
Status: **active curriculum source of truth**
Parent: #83

> **Learn AI Engineering by surviving production incidents.**

This document is the canonical learner-facing curriculum direction. `docs/CURRICULUM.md` is the stable entry point and points here.

## 1. Product and audience boundary

AhaFrame should not win by publishing the largest AI curriculum. It should give experienced software engineers a place to practice the judgment required to ship AI systems.

Primary learner:

- experienced backend / platform / full-stack / infrastructure engineer;
- comfortable with APIs, data systems, retries, observability, testing and production debugging;
- moving into LLM / RAG / Agent engineering;
- does not need to begin with algebra, backpropagation or Python syntax.

Primary loop:

```text
SEE THE FAILURE
→ INSPECT EVIDENCE
→ FORM A HYPOTHESIS
→ CHANGE POLICY / ARCHITECTURE
→ RUN THE SYSTEM
→ OBSERVE CONSEQUENCES
→ COMPARE / RETRY
→ SHIP / BLOCK / INCONCLUSIVE
→ ENGINEERING DEBRIEF
```

The six engineering layers remain the internal cognitive model:

```text
Prompt Engineering      shapes behavior
Context Engineering     shapes knowledge
Harness Engineering     shapes reliability
Loop Engineering        shapes iteration
Graph Engineering       shapes orchestration
Evaluation Engineering  proves whether it works
```

Cross-cutting production concerns:

```text
Security
Observability / Tracing
Cost / Latency
Reliability
Release Evidence
```

The learner-facing path is Mission/Incident-first, not taxonomy-first.

---

## 2. Research inputs and source-use boundary

Reference repositories:

- `https://github.com/rohitg00/ai-engineering-from-scratch`
  - role: breadth/dependency map for LLM Engineering, Tools & Protocols, Agent Engineering, production concerns and capstone integration;
- `https://github.com/bojieli/ai-agent-book`
  - role: Agent depth and experiment methodology for Context, Memory/RAG, MCP/Tools, async Agents, Evaluation and Multi-Agent.

Allowed:

```text
Research concepts and terminology          yes
Check content coverage gaps                yes
Study experiment methodology               yes
Link / attribute references                yes
Design original scenarios                  yes
Write original explanations                yes
Implement original deterministic models    yes
```

Not allowed:

```text
Copy source prose                          no
Copy source illustrations                  no
Repackage source lesson sequences          no
Clone experiments as AhaFrame content      no
Treat permissive license as product design no
```

AhaFrame incidents, evidence, controls, formulas, simulations, explanations and visuals remain original.

---

## 3. Coverage matrix

| Knowledge domain | Current AhaFrame coverage | v0.8 treatment |
|---|---|---|
| Probabilistic model behavior | Token Playground | Foundation |
| Structured output / schema | weak | focused Mission |
| Context budget / compression | existing Labs | Foundation + #86 |
| RAG / hybrid retrieval | RAG Failure | #86 flagship |
| Reranking / authority / freshness | partial | #86 flagship |
| Long-term memory | weak | Knowledge Graph; later Mission |
| Tool schema / result validation | partial | Mission + #87/#89 |
| Retry / idempotency / side effects | generic reliability Lab | #87 flagship |
| MCP / capability permissions | weak | #88 flagship |
| Prompt injection / trust provenance | Instruction Conflict | #88 flagship |
| Agent planning / bounded loop | Agent Loop | Foundation / Mission |
| Async interrupt / cancellation | weak | mapped; later implementation |
| Trace / observability / diagnosis | implicit | **core cross-cutting model** |
| Evaluation environment / verifier | Evaluation Failure | Chapter 07 + Boss |
| Outcome vs trajectory evaluation | partial | Chapter 07 + #88/#89 |
| Slice regression / statistical humility | partial | Chapter 07 + Boss |
| Cost / latency economics | partial synthetic metrics | core production decision model |
| Multi-Agent delegation/isolation | Workflow Graph | Knowledge Graph; post-preview Mission |
| Fine-tuning / post-training | absent | deferred/reference |
| GPU serving / kernels / orchestration | absent | explicitly deferred |

A topic enters the Knowledge Graph when it changes production engineering judgment. It becomes a v0.8 experience only when it is a flagship prerequisite, produces a strong evidence-first Mission, is required by Final Boss, or the preview exposes a blocking comprehension gap.

---

## 4. AI Engineer Campaign

### Chapter 01 — Why AI Systems Fail

- Token/model variability;
- finite context;
- structured-output contract;
- trace anatomy: model claim vs runtime fact.

### Chapter 02 — Build Retrieval You Can Trust

Flagship: **#86 The Broken RAG Pipeline**.

Core: hybrid retrieval, chunk/evidence granularity, reranking, freshness/authority, context compression, retrieval trace and evaluation.

### Chapter 03 — Give the System Tools

Core: tool contract, result validation, side effects, least privilege, MCP capability boundaries, approval gates and parallel-state risk.

### Chapter 04 — Turn Tool Use Into an Agent

Core: act→observe→verify, planning, checkpoints, retry/recovery, termination/escalation, interruption/cancellation, traceable execution and bounded autonomy.

### Chapter 05 — Make the Agent Reliable

Flagship: **#87 The $47,000 Retry**.

Core: timeout ambiguity, retry amplification, idempotency, approvals, compensation, auditability and reliability/latency/cost trade-offs.

### Chapter 06 — Survive a Security Incident

Flagship: **#88 The Prompt Injection Attack**.

Core: instruction provenance, trust, capability scoping, least privilege, runtime enforcement, policy-decision trace and defense in depth.

### Chapter 07 — Evaluate Before Shipping

Core: evaluation environment, verifier, outcome vs trajectory, slice coverage, regression, statistical humility, cost per success and release vetoes.

Post-preview candidate: **The Evaluation That Lied**.

### Chapter 08 — Coordinate Multiple Agents

Knowledge-map coverage only for first preview: delegation, manager/worker, context isolation, independent verification, coordination cost, state races and consensus failure.

Post-preview candidate: **The Agents Agreed. They Were Both Wrong.**

### Chapter 09 — Final Boss: Ship the Production Support Agent

Issue #89. Integrates retrieval, context, tools, retry/termination, approvals, security, traces, evaluation and cost/latency constraints into one release decision.

---

## 5. Canonical Knowledge Graph — 38 decision-changing mental models

`SHIP` means represented in first v0.8 preview. `MAP` means canonical knowledge but implementation may wait until after #92.

### A. Behavior and contracts

| # | Mental model | Scope |
|---|---|---|
| 1 | Probabilistic behavior vs application guarantees | SHIP |
| 2 | Instruction authority and provenance | SHIP / #88 |
| 3 | Structured output as a contract | SHIP |
| 4 | Runtime enforcement vs model persuasion | SHIP / #88 |

### B. Context, retrieval and memory

| # | Mental model | Scope |
|---|---|---|
| 5 | Finite context budget | SHIP |
| 6 | Context structure / cache-friendly stability | MAP |
| 7 | Compression vs critical-information retention | SHIP / #86 |
| 8 | Evidence granularity / chunking | SHIP / #86 |
| 9 | Dense vs sparse retrieval | SHIP / #86 |
| 10 | Hybrid retrieval | SHIP / #86 |
| 11 | Reranking | SHIP / #86 |
| 12 | Freshness and authority | SHIP / #86 |
| 13 | Contextual / structured retrieval | MAP |
| 14 | Long-term memory lifecycle | MAP |
| 15 | Memory vs source-of-truth conflict | MAP; optional #86 |

### C. Tools, permissions and side effects

| # | Mental model | Scope |
|---|---|---|
| 16 | Tool contract / schema design | SHIP |
| 17 | Result validation | SHIP |
| 18 | Capability boundary / least privilege | SHIP / #88 |
| 19 | Reversible vs irreversible actions | SHIP / #87/#88 |
| 20 | Timeout ambiguity | SHIP / #87 |
| 21 | Idempotency boundary | SHIP / #87 |
| 22 | Retry policy as system policy | SHIP / #87 |
| 23 | Human approval boundary | SHIP |
| 24 | Parallel tool calls / state races | MAP |

### D. Agent loop, state and evidence

| # | Mental model | Scope |
|---|---|---|
| 25 | Act → observe → verify loop | SHIP |
| 26 | Planning vs direct execution | MAP |
| 27 | Bounded autonomy / termination | SHIP |
| 28 | Checkpoint / recovery state | SHIP |
| 29 | Interrupt / cancellation semantics | MAP |
| 30 | Traceability / causal execution history | SHIP |
| 31 | Observability as a diagnosis interface | SHIP |

### E. Evaluation and production decisions

| # | Mental model | Scope |
|---|---|---|
| 32 | Evaluation environment + verifier | SHIP |
| 33 | Outcome vs trajectory evaluation | SHIP |
| 34 | Dataset and slice coverage | SHIP-lite |
| 35 | Regression vs aggregate improvement | MAP |
| 36 | Confidence / sample-size humility | MAP |
| 37 | Cost / latency / quality as one decision | SHIP |
| 38 | Release gate / veto logic | SHIP / #89 |

---

## 6. Flagship dependency map

### #86 — The Broken RAG Pipeline

Primary models: #5, #7–#12, #30–#32, #34 intro, #37. Optional: #15.

### #87 — The $47,000 Retry

Primary models: #16–#17, #19–#23, #27–#28, #30–#31, #37.

### #88 — The Prompt Injection Attack

Primary models: #2, #4, #18–#19, #23, #30–#31, #33, #38.

### #89 — Final Boss

Integrates rather than reteaches retrieval evidence, context policy, tool/capability policy, retry/idempotency, approvals, security, tracing/observability, evaluation and cost/latency.

---

## 7. Content format rules

### Foundation

3–8 minute mental-model experience. Interactive only when interaction reveals behavior.

### Mission

One focused engineering skill practiced through a bounded decision.

### Incident

```text
failure visible
→ evidence / trace
→ multiple plausible hypotheses
→ intervention
→ consequence
→ replay / compare
→ release decision
→ debrief
```

### Boss / Build

Cross-layer architecture/release decision with no hidden universal optimum.

### Reference / Sandbox

Useful for SEO, prerequisite intuition or deeper exploration but not primary Campaign discovery.

---

## 8. Existing Lab migration hypothesis

Final classification belongs to #90.

| Existing experience | v0.8 direction |
|---|---|
| Token Playground | KEEP AS FOUNDATION / sandbox |
| Context Window | KEEP AS FOUNDATION; #86 prerequisite |
| Agent Loop | KEEP AS FOUNDATION / prerequisite |
| RAG Failure | MERGE / REFRAME into #86 |
| Context Compression | MERGE mechanics into #86; retain public route |
| Agent Reliability | reuse mechanics in #87/#89; likely secondary discovery |
| Evaluation Failure | KEEP/REFRAME Chapter 07 Mission |
| Instruction Conflict | merge provenance mechanics into #88; keep route/reference |
| Agent Workflow Graph | secondary Graph foundation |
| Reliable Support Agent | REFRAME as Final Boss #89 |

Do not casually delete indexed routes. Stable `lab_id` and Validation semantics must not be silently repurposed for new Missions; Mission IDs are additive unless an explicit migration decision says otherwise.

---

## 9. Soft prerequisites

- experienced users may enter an Incident directly;
- Incident pages can link to 1–3 short Foundations;
- debrief can route backward to missing models;
- Final Boss can recommend prerequisites without requiring account infrastructure.

A placement system is not required for v0.8.

---

## 10. Explicitly deferred areas

Not required by first Content Preview:

```text
all 38 models as separate pages
full model-routing curriculum
prompt/KV caching deep dive
inference serving / goodput
active tool discovery
self-reflection / verbal RL
continuous autonomous self-improvement
multimodal / computer use
post-training / SFT / RLHF
robotics
GPU kernels / full serving orchestration
Multi-Agent flagship Mission
Evaluation That Lied flagship Mission
full Memory course
full MCP course
placement system
accounts / saved progression
XP / badges / streaks / leaderboard
```

---

## 11. v0.8 delivery boundary

Before formal #19 recruitment:

```text
#84 Curriculum / Knowledge Graph           DONE when this source is merged
#85 Mission gameplay contract              implemented for flagship use
#86 Broken RAG Pipeline                    usable
#87 $47,000 Retry                          usable
#88 Prompt Injection Attack                usable
#90 Existing Lab reconciliation            complete enough for discovery
#91 Homepage / Campaign discovery          live
#89 Final Boss                             integrated preview usable
        ↓
#92 3–5 developer Content Preview
        ↓
START ALPHA / ITERATE CONTENT AGAIN
```

Do not add a fourth flagship Incident before #92 unless one of the first three is explicitly removed or replaced.

---

## 12. Quality rubric

A Mission/Incident is worth building when most answers are yes:

1. real engineering decision;
2. visible failure/uncertainty;
3. evidence inspection rather than guessing;
4. at least two plausible diagnoses;
5. plausible fix creates a trade-off;
6. deterministic/cheap v1;
7. reusable mental model;
8. connection to another Mission/Final Boss;
9. materially better than a tutorial/chatbot;
10. stakes understandable in <10 seconds;
11. tracing/observability actually supports diagnosis;
12. still useful without cosmetic gamification.

If mostly no, make it a guide/reference rather than a Mission.

---

## 13. Canonical decisions locked by #84

- AhaFrame remains aimed at experienced software engineers entering AI Engineering.
- Six layers remain the internal model, not the primary marketing/course navigation.
- Learner-facing structure becomes a 9-chapter Incident-first Campaign.
- Knowledge completeness is separated from first-preview implementation scope.
- 38 decision-changing models form the v0.8 Knowledge Graph.
- Traceability and Observability are first-class learning primitives.
- First flagship set remains exactly #86/#87/#88 until #92.
- #89 is the integrated Final Boss.
- Existing indexed Lab routes are preserved/reconciled through #90 rather than casually deleted.
- External repositories are research inputs, not content templates.

Implementation mechanics belong to #85 and the flagship Mission issues.

Refs: #83 #84 #85 #86 #87 #88 #89 #90 #91 #92 #19
