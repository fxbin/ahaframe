# AhaFrame Curriculum v0.9 — Complete AI Engineering Learning Path

Date: 2026-08-27  
Status: **canonical v0.9 curriculum source of truth**  
Parent: #117  
Issue: #118

> **Learn AI Engineering by surviving production incidents.**

v0.9 keeps the v0.8 failure-first product thesis, but expands the validation-sized curriculum into a complete multi-session learning system for experienced software engineers moving into production AI Engineering.

The goal is **not** to maximize lesson count. The goal is to build a coherent graph of engineering judgments that can be understood, practiced, transferred, reviewed, and integrated in production decisions.

---

## 1. Learner and product boundary

Primary learner:

- backend / platform / full-stack / infrastructure engineers;
- already comfortable with APIs, data systems, retries, observability, testing and production debugging;
- moving into LLM / RAG / Agent engineering;
- wants system-level judgment rather than framework memorization.

Assumed foundations:

```text
HTTP / APIs
basic databases and caches
queues / async work
timeouts / retries
software testing
logs / metrics / traces
production deployment and debugging
```

Not required as prerequisites:

```text
full linear algebra curriculum
backpropagation derivation
transformer-from-scratch implementation
PyTorch internals
RLHF implementation
GPU / kernel engineering
```

The six engineering layers remain an internal cognitive model:

```text
Prompt Engineering      shapes behavior
Context Engineering     shapes knowledge
Harness Engineering     shapes reliability
Loop Engineering        shapes iteration
Graph Engineering       shapes orchestration
Evaluation Engineering  proves whether it works
```

They are **not** the primary learner navigation. Learner-facing progression uses the ten stages below.

---

## 2. Canonical ten-stage path

```text
00  AI Systems Mental Model
01  Behavior, Prompt & Output Contracts
02  Context, Retrieval & RAG
03  Memory, Knowledge & Source of Truth
04  Tools, MCP & Capability Boundaries
05  Agent Loop, State & Long-Running Work
06  Reliability, Security & Human Control
07  Evaluation, Observability & Production Economics
08  Graphs, Delegation & Multi-Agent Systems
09  Production Architecture & Capstones
```

The recommended path is directional, not locked. A qualified learner may enter through an Incident first, then backfill only the prerequisite models that matter.

Canonical learning loop:

```text
SEE THE FAILURE
→ INSPECT EVIDENCE
→ FORM A HYPOTHESIS
→ CHANGE ONE POLICY / ARCHITECTURE DECISION
→ RUN / REPLAY
→ OBSERVE CONSEQUENCES
→ COMPARE
→ EXPLAIN
→ TRANSFER TO A CHANGED CASE
→ REVIEW LATER
```

---

## 3. Model contract used in this document

Every canonical model has:

- a stable model ID;
- one primary stage;
- prerequisite edges;
- exactly one primary teaching format;
- a localization / terminology key;
- current AhaFrame coverage;
- a version-sensitivity marker.

Primary format vocabulary:

```text
GUIDE       concise engineering mental model
PLAYGROUND  isolate one behavior or variable
LAB         focused deterministic experiment
MISSION     bounded engineering decision
INCIDENT    production failure diagnosis + intervention + consequence
DRILL       changed-case retrieval / transfer practice
BUILD       multi-model architecture / implementation challenge
BOSS        cross-layer release decision
REFERENCE   searchable supporting material
```

`Version-sensitive = yes` means the content must record a dated upstream protocol/product reference and be reviewed deliberately when that contract changes.

---

## 4. Canonical Knowledge Graph — 52 decision-changing mental models

### Stage 00 — AI Systems Mental Model

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S00-M01 | Probabilistic model behavior vs application guarantees | PLAYGROUND | — | `systems.probability_vs_guarantee` | Token Playground | no |
| S00-M02 | Model claim vs runtime fact | GUIDE | S00-M01 | `systems.claim_vs_runtime_fact` | partial in traces | no |
| S00-M03 | Structured output as an application contract | LAB | S00-M01 | `systems.structured_output_contract` | gap / partial | provider details only |
| S00-M04 | Runtime enforcement vs model persuasion | MISSION | S00-M02, S00-M03 | `systems.runtime_enforcement` | Prompt Injection / Instruction Conflict | no |

**Stage outcome:** learner stops treating model output as a system guarantee and can identify which guarantees must be enforced by application/runtime boundaries.

### Stage 01 — Behavior, Prompt & Output Contracts

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S01-M01 | Instruction authority and provenance | MISSION | S00-M02 | `behavior.instruction_authority` | Instruction Conflict / Prompt Injection | no |
| S01-M02 | Ambiguity, specificity and instruction conflict | LAB | S01-M01 | `behavior.ambiguity_and_conflict` | Instruction Conflict | no |
| S01-M03 | Examples / few-shot context as behavior shaping, not policy enforcement | GUIDE | S01-M01 | `behavior.examples_not_enforcement` | gap | model-specific examples only |
| S01-M04 | Prompt vs Context vs Runtime responsibility boundary | DRILL | S00-M04, S01-M01 | `behavior.layer_responsibility_boundary` | Prompt vs Context boundary | no |

**Stage outcome:** learner can tell when better wording is useful and when a problem belongs to context selection, permissions, runtime policy, or evaluation instead.

### Stage 02 — Context, Retrieval & RAG

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S02-M01 | Finite context budget | PLAYGROUND | S00-M01 | `context.finite_budget` | Context Window | model limits only |
| S02-M02 | Context structure and cache-friendly stability | GUIDE | S02-M01 | `context.structure_and_stability` | partial | provider caching details |
| S02-M03 | Compression / compaction vs critical-information retention | LAB | S02-M01 | `context.compaction_retention` | Context Compression | implementation details |
| S02-M04 | Evidence granularity / chunking | LAB | S02-M01 | `retrieval.evidence_granularity` | RAG Failure / Broken RAG | no |
| S02-M05 | Dense, sparse and hybrid retrieval as complementary evidence strategies | LAB | S02-M04 | `retrieval.hybrid_strategy` | Broken RAG partial | retrieval stack only |
| S02-M06 | Reranking as a second evidence-selection stage | MISSION | S02-M05 | `retrieval.reranking` | Broken RAG partial | reranker implementation only |
| S02-M07 | Freshness, authority and source priority | INCIDENT | S02-M04 | `retrieval.freshness_authority` | Broken RAG | no |
| S02-M08 | Structured / metadata-aware retrieval and filtering | GUIDE | S02-M04, S02-M07 | `retrieval.structured_filtering` | partial | datastore syntax only |

**Stage outcome:** learner treats retrieval quality as a pipeline property and can explain why more context, higher top-k, or a stronger prompt do not repair stale or weak evidence.

### Stage 03 — Memory, Knowledge & Source of Truth

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S03-M01 | Working memory vs durable memory | GUIDE | S02-M01 | `memory.working_vs_durable` | weak | no |
| S03-M02 | Memory write / read lifecycle and selection policy | LAB | S03-M01 | `memory.lifecycle` | gap | storage implementation only |
| S03-M03 | Memory vs authoritative source-of-truth conflict | INCIDENT | S02-M07, S03-M01 | `memory.source_of_truth_conflict` | weak / Broken RAG optional | no |
| S03-M04 | Expiry, invalidation, versioning and forgetting | MISSION | S03-M02, S03-M03 | `memory.expiry_and_versioning` | gap | no |
| S03-M05 | User memory vs domain knowledge boundary | DRILL | S03-M01, S03-M03 | `memory.user_vs_domain_knowledge` | gap | no |

**Stage outcome:** learner designs memory as a lifecycle and authority problem, not as “add a vector database.”

### Stage 04 — Tools, MCP & Capability Boundaries

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S04-M01 | Tool contract / schema design | LAB | S00-M03 | `tools.contract_schema` | partial | SDK syntax only |
| S04-M02 | Tool-result validation and explicit error surfaces | MISSION | S04-M01 | `tools.result_validation` | partial | no |
| S04-M03 | Capability boundary and least privilege | INCIDENT | S01-M01, S04-M01 | `tools.capability_boundary` | Prompt Injection | auth implementation only |
| S04-M04 | Reversible vs irreversible actions | GUIDE | S04-M01 | `tools.reversibility` | $47,000 Retry / Prompt Injection | no |
| S04-M05 | Human approval at the irreversible / high-risk boundary | MISSION | S04-M03, S04-M04 | `tools.human_approval_boundary` | $47,000 Retry / Prompt Injection | no |
| S04-M06 | MCP protocol state, application state, authorization and capability boundaries | MISSION | S04-M01, S04-M03 | `tools.mcp_boundary` | weak | **yes — MCP spec** |

**Stage outcome:** learner separates model intent, tool capability, authorization and application state, and does not use prompt wording as a security boundary.

**Current MCP anchor:** canonical content should target MCP specification `2026-07-28` until deliberately revised. That release moved the protocol core to stateless request/response semantics, formalized extensions, moved long-running Tasks into an extension, and hardened authorization. Research provenance: `https://blog.modelcontextprotocol.io/posts/2026-07-28/`.

### Stage 05 — Agent Loop, State & Long-Running Work

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S05-M01 | Act → observe → verify loop | PLAYGROUND | S04-M01, S04-M02 | `runtime.act_observe_verify` | Agent Loop | no |
| S05-M02 | Planning vs direct execution | DRILL | S05-M01 | `runtime.planning_vs_direct` | weak | no |
| S05-M03 | Bounded autonomy, termination and escalation | MISSION | S05-M01 | `runtime.bounded_autonomy` | Agent Loop / Reliability | no |
| S05-M04 | Checkpoint, resumable state and recovery | LAB | S05-M01 | `runtime.checkpoint_recovery` | Engine checkpoints | framework mechanics only |
| S05-M05 | Interrupt / cancellation semantics | MISSION | S05-M03, S05-M04 | `runtime.interrupt_cancel` | gap | runtime/API mechanics |
| S05-M06 | Async / long-running task lifecycle | MISSION | S05-M04, S05-M05 | `runtime.long_running_tasks` | gap | **yes — protocol/runtime** |

**Stage outcome:** learner can reason about an Agent as a long-lived state machine whose work may pause, resume, cancel, retry, escalate or terminate deliberately.

For MCP-backed long-running work, distinguish the general model from the current Tasks extension lifecycle (`tasks/get`, `tasks/update`, `tasks/cancel`). Protocol details are version-sensitive; the state-machine judgment is not.

### Stage 06 — Reliability, Security & Human Control

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S06-M01 | Timeout ambiguity: missing response ≠ confirmed failure | INCIDENT | S04-M04, S05-M01 | `reliability.timeout_ambiguity` | $47,000 Retry / homepage First Aha | no |
| S06-M02 | Retry policy and retry amplification | MISSION | S06-M01, S05-M03 | `reliability.retry_amplification` | $47,000 Retry | no |
| S06-M03 | Idempotency boundary for repeated intent | INCIDENT | S06-M01, S04-M04 | `reliability.idempotency_boundary` | $47,000 Retry | no |
| S06-M04 | Compensation and recovery after irreversible side effects | MISSION | S06-M03 | `reliability.compensation_recovery` | $47,000 Retry partial | no |
| S06-M05 | Trust boundary and defense in depth for untrusted context | INCIDENT | S01-M01, S04-M03, S04-M05 | `security.trust_boundary_defense` | Prompt Injection | no |

**Stage outcome:** learner can keep useful automation while bounding blast radius, repeated side effects, untrusted instructions and human-control costs.

### Stage 07 — Evaluation, Observability & Production Economics

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S07-M01 | Traceability as causal execution history | LAB | S05-M01 | `evidence.trace_causality` | all flagship Missions | tracing product syntax only |
| S07-M02 | Observability as a diagnosis interface | INCIDENT | S07-M01 | `evidence.observability_diagnosis` | partial | tooling implementation only |
| S07-M03 | Evaluation environment and verifier design | LAB | S00-M02 | `evaluation.environment_verifier` | Evaluation Failure | no |
| S07-M04 | Outcome vs trajectory evaluation | MISSION | S07-M01, S07-M03 | `evaluation.outcome_vs_trajectory` | partial / flagship Missions | evaluator implementation only |
| S07-M05 | Dataset slices, regression and aggregate-improvement traps | INCIDENT | S07-M03 | `evaluation.slices_and_regression` | partial | no |
| S07-M06 | Confidence, variance and sample-size humility | GUIDE | S07-M03 | `evaluation.confidence_humility` | weak | no |
| S07-M07 | Cost, latency, quality and release vetoes as one decision | BUILD | S07-M03, S07-M05 | `production.economics_release_gate` | Final Boss | pricing/provider costs only |

**Stage outcome:** learner can diagnose from trajectories, build a small defensible eval suite, interpret uncertainty, and make a release decision without collapsing quality into one average score.

Research anchor: current Agent-evaluation guidance increasingly treats multi-step trajectories, tool calls and intermediate state as first-class evidence rather than evaluating only final outputs. See `https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents` (2026-01-09) for methodology context; AhaFrame scenarios and eval models remain original.

### Stage 08 — Graphs, Delegation & Multi-Agent Systems

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S08-M01 | Loop vs Graph responsibility boundary | GUIDE | S05-M01 | `graph.loop_vs_graph` | Agent Workflow Graph | no |
| S08-M02 | Sequential, conditional and parallel topology trade-offs | LAB | S08-M01 | `graph.topology_tradeoffs` | Agent Workflow Graph | framework syntax only |
| S08-M03 | Delegation contract and shared vs isolated state | MISSION | S08-M02, S03-M01 | `graph.delegation_state_isolation` | weak | no |
| S08-M04 | Independent verification, coordination cost and correlated failure | INCIDENT | S08-M03, S07-M04 | `graph.independent_verification` | gap | no |

**Stage outcome:** learner can justify when orchestration or multiple agents add value and when they only add coordination cost, state complexity or correlated error.

### Stage 09 — Production Architecture & Capstones

| ID | Mental model | Primary format | Prerequisites | Localization key | Current coverage | Version-sensitive |
|---|---|---|---|---|---|---|
| S09-M01 | Cross-layer architecture decomposition | BUILD | S02-M07, S04-M03, S05-M03, S07-M03 | `production.cross_layer_architecture` | Reliable Support Agent | no |
| S09-M02 | Bounded rollout, fallback and graceful degradation | BUILD | S06-M05, S07-M07 | `production.rollout_degradation` | weak | deployment platform only |
| S09-M03 | Evidence synthesis into a defensible SHIP / BLOCK / INCONCLUSIVE decision | BOSS | S07-M07, S09-M01, S09-M02 | `production.release_evidence_synthesis` | Final Boss | no |

**Stage outcome:** learner integrates prior models into an architecture and owns a release decision under incomplete evidence and competing operational constraints.

---

## 5. v0.8 → v0.9 audit of all 38 prior models

`KEEP` preserves the model boundary. `REFINE` sharpens or splits it. `MERGE` combines overlapping judgments. No v0.8 model is silently deleted.

| v0.8 # | v0.8 model | Decision | v0.9 destination |
|---:|---|---|---|
| 1 | Probabilistic behavior vs application guarantees | KEEP | S00-M01 |
| 2 | Instruction authority and provenance | KEEP | S01-M01 |
| 3 | Structured output as a contract | KEEP | S00-M03 |
| 4 | Runtime enforcement vs model persuasion | KEEP | S00-M04 |
| 5 | Finite context budget | KEEP | S02-M01 |
| 6 | Context structure / cache-friendly stability | KEEP | S02-M02 |
| 7 | Compression vs critical-information retention | REFINE | S02-M03 |
| 8 | Evidence granularity / chunking | KEEP | S02-M04 |
| 9 | Dense vs sparse retrieval | MERGE | S02-M05 |
| 10 | Hybrid retrieval | MERGE | S02-M05 |
| 11 | Reranking | KEEP | S02-M06 |
| 12 | Freshness and authority | REFINE | S02-M07 |
| 13 | Contextual / structured retrieval | REFINE | S02-M08 |
| 14 | Long-term memory lifecycle | REFINE / SPLIT | S03-M01, S03-M02 |
| 15 | Memory vs source-of-truth conflict | KEEP | S03-M03 |
| 16 | Tool contract / schema design | KEEP | S04-M01 |
| 17 | Result validation | KEEP | S04-M02 |
| 18 | Capability boundary / least privilege | KEEP | S04-M03 |
| 19 | Reversible vs irreversible actions | KEEP | S04-M04 |
| 20 | Timeout ambiguity | KEEP | S06-M01 |
| 21 | Idempotency boundary | KEEP | S06-M03 |
| 22 | Retry policy as system policy | REFINE | S06-M02 |
| 23 | Human approval boundary | KEEP | S04-M05 |
| 24 | Parallel tool calls / state races | REFINE | S08-M02, S08-M03 |
| 25 | Act → observe → verify loop | KEEP | S05-M01 |
| 26 | Planning vs direct execution | KEEP | S05-M02 |
| 27 | Bounded autonomy / termination | REFINE | S05-M03 |
| 28 | Checkpoint / recovery state | REFINE | S05-M04 |
| 29 | Interrupt / cancellation semantics | KEEP | S05-M05 |
| 30 | Traceability / causal execution history | KEEP | S07-M01 |
| 31 | Observability as a diagnosis interface | KEEP | S07-M02 |
| 32 | Evaluation environment + verifier | KEEP | S07-M03 |
| 33 | Outcome vs trajectory evaluation | KEEP | S07-M04 |
| 34 | Dataset and slice coverage | MERGE | S07-M05 |
| 35 | Regression vs aggregate improvement | MERGE | S07-M05 |
| 36 | Confidence / sample-size humility | KEEP | S07-M06 |
| 37 | Cost / latency / quality as one decision | REFINE | S07-M07 |
| 38 | Release gate / veto logic | REFINE | S07-M07 → S09-M03 integration |

### New v0.9 models created because the production judgment was previously implicit or missing

```text
S00-M02  model claim vs runtime fact
S01-M02  ambiguity / specificity / conflict
S01-M03  examples are behavior shaping, not enforcement
S01-M04  Prompt vs Context vs Runtime responsibility boundary
S03-M04  expiry / invalidation / versioning / forgetting
S03-M05  user memory vs domain knowledge
S04-M06  MCP protocol / app-state / authorization boundary
S05-M06  async / long-running task lifecycle
S06-M04  compensation / recovery
S06-M05  trust boundary / defense in depth
S08-M01  Loop vs Graph boundary
S08-M03  delegation / state isolation
S08-M04  independent verification / correlated failure
S09-M01  cross-layer architecture decomposition
S09-M02  rollout / fallback / degradation
S09-M03  release evidence synthesis
```

---

## 6. Flagship and Build dependency projection

### The Broken RAG Pipeline

Primary models:

```text
S02-M01
S02-M03–M08
S07-M01
S07-M03
S07-M05
S07-M07
```

Optional backfill: S03-M03 when stale memory competes with an authoritative policy source.

### The $47,000 Retry

Primary models:

```text
S04-M01–M05
S05-M03–M04
S06-M01–M04
S07-M01–M02
S07-M07
```

### The Prompt Injection Attack

Primary models:

```text
S00-M04
S01-M01
S04-M03–M05
S06-M05
S07-M01–M02
S07-M04
S07-M07
```

### Intermediate Builds

v0.9 requires at least two integrated Builds before / alongside the Final Boss:

1. **Evidence-Grounded Support Answering** — Prompt + Context + Retrieval + Memory + Evaluation.
2. **Bounded Tool-Using Agent Runtime** — Tools + capability + state + long-running work + reliability + observability.

Exact implementation belongs to #120–#123; this document locks their knowledge dependencies, not their UI.

### Final Boss — Ship the Production Support Agent

Integrates rather than reteaches:

```text
S09-M01
S09-M02
S09-M03
```

with evidence from retrieval, memory, capability policy, Agent runtime, reliability/security, evaluation/observability and production economics.

---

## 7. Specialist paths reuse the same graph

Specialist paths are views over canonical nodes, not duplicated courses.

### RAG Reliability

```text
S00-M02
→ S02-M01–M08
→ S03-M03
→ S07-M01–M05
→ Broken RAG
→ Evidence-Grounded Support Answering Build
```

### Agent Runtime

```text
S04-M01–M06
→ S05-M01–M06
→ S06-M01–M04
→ S07-M01–M02
→ $47,000 Retry
→ Bounded Tool-Using Agent Runtime Build
```

### Evaluation & Observability

```text
S00-M02
→ S07-M01–M07
→ Evaluation Failure / future Evaluation Incident
→ both intermediate Builds
→ Final Boss
```

### Multi-Agent Systems

```text
S05-M01–M04
→ S07-M01, S07-M04
→ S08-M01–M04
→ Agent Workflow Graph
→ future correlated-failure Incident
→ Production Architecture
```

---

## 8. Soft prerequisite semantics

The graph is directional, not a login-gated lock tree.

Rules:

- an experienced learner may open any public Incident immediately;
- an Incident shows the 1–3 highest-value prerequisite gaps, not a wall of required lessons;
- debrief may route backward to a missing model;
- completing a prerequisite returns the learner to the original Incident context;
- a learner may choose a specialist path without duplicating node state;
- anonymous/local state is sufficient for the first implementation;
- `seen` or `completed` must never be presented as academic mastery.

Machine-readable state and recommendation semantics belong to #119 and #124.

---

## 9. Version-sensitive knowledge policy

Stable engineering judgments should not churn because a provider renamed an API. Provider/protocol specifics are supporting evidence, not the curriculum spine.

Version-sensitive nodes in v0.9:

- S00-M03 — provider-specific structured-output mechanisms;
- S02-M01–M03 — model context limits / caching / compaction implementation details;
- S04-M06 — MCP specification and authorization lifecycle;
- S05-M04–M06 — runtime/task implementation details;
- S07-M01–M04 — tracing/evaluator product APIs;
- S07-M07 — current provider cost data;
- S08-M02 — framework syntax only, never the topology judgment itself.

Publishing rule:

```text
stable mental model
        +
dated implementation note / source provenance
        ↓
review version-sensitive note when upstream changes
without silently rewriting the stable model ID
```

---

## 10. Explicitly excluded / deferred topics

These may exist as references later, but do not enter the v0.9 canonical path unless evidence shows a production-judgment gap:

```text
beginner Python / TypeScript
full linear algebra / calculus
backpropagation course
transformer implementation from scratch
full fine-tuning / SFT / RLHF curriculum
GPU kernels / CUDA
full inference-serving / Kubernetes curriculum
robotics
broad computer-vision / speech curriculum
framework certification tracks
provider API catalogs
exhaustive MCP method-by-method documentation
leaderboards / XP / streak curriculum mechanics
continuous autonomous self-improvement as a core track
```

Why: these either belong to a different learner level, change too quickly at the API surface, or do not improve AhaFrame's core advantage — production AI engineering judgment through evidence and failure.

---

## 11. Content readiness projection

This document defines **52 canonical models**, inside the #117 target range of 45–55.

It does **not** require 52 separate pages.

A single high-quality Incident may teach or practice several linked models. Before #125 Content Readiness review, the target remains:

```text
52 canonical models
24+ useful Guide / Foundation nodes
12+ meaningful Labs / Missions / Incidents
2+ integrated Builds
1 Final Boss
10 stages represented
6+ stages with genuine multi-session depth
EN + zh-CN parity on the paid-ready surface
```

Counts remain a floor, not a quality score.

---

## 12. Canonical decisions locked by #118

- v0.9 uses a 10-stage learner-facing path.
- The six engineering layers remain internal mental-model dimensions, not top-level course navigation.
- The Knowledge Graph contains **52** canonical decision-changing models.
- Every canonical model has one primary format and a stable ID.
- v0.8's 38 models remain traceable through an explicit KEEP / REFINE / MERGE audit.
- Memory becomes a first-class stage rather than a RAG footnote.
- Tools/MCP and long-running Agent work become first-class production topics.
- MCP details are version-sensitive and currently anchored to specification `2026-07-28`.
- Trajectory evidence is first-class in Agent evaluation.
- Multi-Agent is taught with explicit single-agent / workflow baselines and correlated-failure costs.
- Specialist paths are graph projections, not duplicate curricula.
- The path remains Incident-first and anonymous-first; prerequisites guide rather than gate.
- Machine-readable content/progression contracts belong to #119/#124.

Refs: #117 #118 #119 #120 #121 #122 #123 #124 #125 #83 #84
