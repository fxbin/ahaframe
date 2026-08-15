# AhaFrame Curriculum v0.8 — Game Learning & Production Incident Edition

Date: 2026-08-16
Status: **review candidate for #84**
Parent: #83

> This document is the v0.8 curriculum candidate. `docs/CURRICULUM.md` remains canonical until this candidate is reviewed and explicitly promoted.

## 1. Product thesis

AhaFrame should not win by publishing the largest AI curriculum.

It should win by giving experienced software engineers a place to **practice the engineering judgment required to ship AI systems**.

Learner-facing promise:

> **Learn AI Engineering by surviving production incidents.**

Primary learning loop:

```text
UNDERSTAND THE SYSTEM
        ↓
SEE THE FAILURE
        ↓
INSPECT EVIDENCE
        ↓
FORM A HYPOTHESIS
        ↓
CHANGE A POLICY / ARCHITECTURE
        ↓
RUN THE SYSTEM
        ↓
OBSERVE CONSEQUENCES
        ↓
COMPARE / RETRY
        ↓
EXPLAIN THE TRADE-OFF
        ↓
SHIP / BLOCK / INCONCLUSIVE
```

The previous `SEE → PLAY → BREAK → AHA → BUILD` model remains useful, but v0.8 makes the **Mission / Incident** the main learner-facing container.

---

## 2. Audience boundary

Primary learner:

- experienced backend / platform / full-stack / infrastructure engineer;
- already comfortable with APIs, databases, queues, retries, observability, testing, distributed systems and production debugging;
- moving into LLM / RAG / Agent engineering;
- does not need AhaFrame to teach algebra, backpropagation or Python syntax first;
- wants to understand why AI systems fail and how to make defensible production decisions.

The default journey starts where **software engineering meets probabilistic AI systems**.

Optional foundation references may exist, but v0.8 does not become a full math/ML/Transformer curriculum.

---

## 3. Research inputs and source-use boundary

Two repositories are used as research maps, not as content to copy.

### `rohitg00/ai-engineering-from-scratch`

Primary role: **breadth / dependency map**.

Most relevant areas for AhaFrame:

- LLM Engineering;
- Tools & Protocols;
- Agent Engineering;
- Infrastructure / Production concerns;
- Capstone-style integration.

Useful product lessons:

- concepts should lead to runnable artifacts;
- problem → concept → build → use → ship is a strong progression;
- production economics, tooling and deployment belong in the curriculum rather than an appendix;
- broad curricula need routing/placement instead of forcing everyone through the same start point.

### `bojieli/ai-agent-book`

Primary role: **Agent depth / experiment-methodology map**.

Most relevant areas for AhaFrame:

- Agent = model + context + tools;
- context engineering and compression;
- memory, RAG, hybrid retrieval and reranking;
- MCP/tool capability design;
- asynchronous/event-driven Agent runtimes;
- evaluation environments, verifiers, rubrics and statistical evidence;
- learning from trajectories and honest negative results;
- multi-Agent collaboration, isolation and coordination.

Useful product lessons:

- runnable experiment is stronger than prose-only explanation;
- negative results are useful when evidence is preserved;
- final-state success and process violations are separate evaluation signals;
- production claims should be tied to explicit evidence rather than demo appearance.

### Source-use invariant

Allowed:

```text
Research concepts and terminology          yes
Check content coverage gaps                yes
Study experiment methodology               yes
Link / attribute research references       yes
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

AhaFrame must create original incident narratives, evidence panels, controls, formulas, consequences and debriefs.

---

## 4. Coverage matrix — what AhaFrame absorbs and how

The point of the reference repositories is to prevent knowledge blind spots, not to determine the learner-facing table of contents.

| Knowledge domain | Breadth signal | Agent-depth signal | AhaFrame layer(s) | Current state | v0.8 treatment |
|---|---|---|---|---|---|
| Probabilistic model behavior | LLM engineering | Agent foundations | Prompt, Eval | Token Playground exists | Foundation |
| Structured output / schema | LLM engineering | tool/interface discipline | Prompt, Harness | weak coverage | Focused Mission |
| Context budget / compression | LLM engineering | context engineering | Context | existing Labs | Foundation + merge into #86 |
| RAG / hybrid retrieval | advanced RAG | memory/RAG experiments | Context, Eval | RAG Failure exists | #86 flagship |
| Reranking / authority / freshness | advanced retrieval | RAG depth | Context, Harness | partial | #86 flagship |
| Long-term memory | Agent engineering | memory chapter | Context, Harness | weak | Knowledge Graph + later Mission |
| Tool schema / result validation | tools/protocols | tools + coding Agents | Harness, Eval | partial | Mission + #87/#89 |
| Retry / idempotency / side effects | production reliability | Agent runtime/tool evidence | Harness, Loop | generic reliability Lab | #87 flagship |
| MCP / capability permissions | protocols | MCP/tool boundaries | Harness | weak | #88 flagship |
| Prompt injection / trust provenance | guardrails/security | context/tool security | Prompt, Context, Harness | Instruction Conflict exists | #88 flagship |
| Agent planning / bounded loop | Agent engineering | Agent foundations | Loop | Agent Loop exists | Foundation / Mission |
| Async interrupt / cancellation | production agents | asynchronous interaction | Loop, Graph | weak | mapped, later implementation |
| Trace / observability / incident diagnosis | production systems | coding/log diagnosis/evidence | Harness, Loop, Eval | implicit only | **core cross-cutting model** |
| Evaluation environment / verifier | evaluation | dedicated evaluation chapter | Evaluation | Evaluation Failure exists | Chapter 07 Mission + Boss |
| Outcome vs trajectory evaluation | evaluation | explicit process-vs-result evidence | Eval, Harness | partial | Chapter 07 + #88/#89 |
| Slice regression / statistical humility | evaluation | benchmark methodology | Evaluation | partial | Chapter 07 + Boss |
| Cost / latency / routing economics | production | cost analysis | Eval, cross-cutting | partial synthetic metrics | core production decision model |
| Multi-Agent delegation/isolation | Agent engineering | multi-Agent chapter | Graph, Context | Workflow Graph exists | knowledge map now; post-preview Mission |
| Fine-tuning / post-training | later AI engineering | continuous improvement | outside current core | absent | reference/deferred |
| GPU serving / kernels / orchestration | infrastructure | not core product thesis | cross-cutting infra | absent | explicitly deferred |

### Coverage decision rule

A knowledge area enters the **Knowledge Graph** when it changes production engineering judgment.

It becomes a **v0.8 learner-facing experience** only when one of these is true:

1. it is prerequisite to a flagship Incident;
2. it produces a strong evidence-first Mission on its own;
3. it is required by the Final Boss;
4. the 3–5 person preview exposes a comprehension gap that blocks the product experience.

This prevents “coverage complete” from meaning “build one page per topic.”

---

## 5. AhaFrame's internal engineering model remains six layers

The six layers describe **what is being engineered**. They are not the primary course navigation.

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
Deployment / Release Evidence
```

The learner should recognize these dimensions while solving incidents rather than being required to memorize the taxonomy before doing anything useful.

---

# 6. Learner-facing AI Engineer Campaign

## Chapter 01 — Why AI Systems Fail

**Promise:** understand why an AI feature that looks correct in a demo can fail in production.

Primary experiences:

- Foundation: Token Playground / model variability intuition;
- Foundation: Context Window / finite working state;
- Mission: structured-output contract failure;
- Foundation: evidence/trace anatomy — model claim vs runtime fact.

Learner leaves able to distinguish:

- model behavior;
- application state;
- runtime guarantees;
- observed evidence;
- evidence of correctness.

---

## Chapter 02 — Build Retrieval You Can Trust

**Promise:** move from “we added RAG” to an evidence pipeline that can be debugged and evaluated.

Primary concepts:

- hybrid retrieval;
- evidence granularity;
- reranking;
- freshness and authority;
- context budget / compression;
- memory vs authoritative knowledge;
- retrieval trace and evaluation.

Flagship Incident:

> **The Broken RAG Pipeline** — the support Agent answers with yesterday's truth even though today's policy exists.

Issue: #86

---

## Chapter 03 — Give the System Tools

**Promise:** understand that giving a model a function means adding capabilities and side effects to a runtime.

Primary concepts:

- tool contract / schema;
- result validation;
- reversible vs irreversible actions;
- least privilege;
- MCP capability boundaries;
- approval gates;
- parallel execution and state races.

This chapter prepares #87 and #88.

---

## Chapter 04 — Turn Tool Use Into an Agent

**Promise:** understand when a tool-using loop becomes an Agent runtime and what must bound it.

Primary concepts:

- act → observe → verify;
- planning vs direct execution;
- state and checkpoints;
- retry / recovery;
- termination / escalation;
- interruption / cancellation;
- traceable execution;
- budgeted autonomy.

Existing Agent Loop Simulator becomes a foundation/sandbox unless #90 decides to reframe it.

---

## Chapter 05 — Make the Agent Reliable

**Promise:** make reliability a system property rather than a prompt property.

Flagship Incident:

> **The $47,000 Retry** — a timeout triggers retries around an irreversible payment/refund action.

Issue: #87

Primary concepts:

- timeout ambiguity;
- retry amplification;
- idempotency;
- approval boundaries;
- compensation;
- execution trace / auditability;
- cost / latency / automation trade-offs.

---

## Chapter 06 — Survive a Security Incident

**Promise:** understand why the model cannot be the sole authorization or trust boundary.

Flagship Incident:

> **The Prompt Injection Attack** — untrusted retrieved content tries to turn legitimate tools into an exfiltration path.

Issue: #88

Primary concepts:

- instruction provenance;
- trusted vs untrusted context;
- capability scoping;
- least privilege;
- runtime policy enforcement;
- security-decision trace;
- false-positive / false-negative trade-offs;
- defense in depth.

---

## Chapter 07 — Evaluate Before Shipping

**Promise:** replace “the demo looks better” with evidence sufficient for a release decision.

Primary concepts:

- evaluation environment;
- deterministic verifier vs model judge;
- task success vs trajectory/process violation;
- dataset / slice coverage;
- regression detection;
- uncertainty and sample size;
- cost per success;
- release vetoes.

Candidate follow-up after v0.8:

> **The Evaluation That Lied** — aggregate score improves while an enterprise-critical slice regresses.

Do not add this as a fourth flagship Mission before #92 unless one of #86/#87/#88 is explicitly replaced.

---

## Chapter 08 — Coordinate Multiple Agents

**Promise:** learn when decomposition helps and when more Agents only create more failure surfaces.

Knowledge-map coverage:

- delegation boundary;
- manager/worker topology;
- context sharing vs isolation;
- independent verification;
- parallelism vs coordination overhead;
- shared-state races;
- correlated-error / consensus failure.

Candidate later Incident:

> **The Agents Agreed. They Were Both Wrong.**

Chapter 08 belongs to the canonical Knowledge Graph but **does not block the first Content Preview**.

---

## Chapter 09 — Final Boss: Ship the Production Support Agent

Issue: #89

The learner inherits a production candidate with:

```text
Retrieval
+ context policy
+ tools
+ retry / termination
+ approval boundaries
+ security policy
+ traces / evidence
+ evaluation gates
+ cost / latency budget
```

They inspect evidence, spend a limited intervention budget, compare architectures and submit one release decision:

```text
SHIP
BLOCK
INCONCLUSIVE
```

The Final Boss succeeds only if knowledge from earlier Missions materially changes the learner's decision quality.

---

# 7. Canonical v0.8 Knowledge Graph — 38 decision-changing mental models

The Knowledge Graph contains **38 core mental models**. “Core” means the concept changes production engineering judgment. It does **not** mean 38 separate pages must be built before preview.

Scope labels:

- `SHIP` — must be represented in the first v0.8 Content Preview through an existing experience, one of #86/#87/#88, #89, or a small prerequisite Mission;
- `MAP` — canonical knowledge model, but implementation may wait until after #92;
- `LATER` — explicitly deferred.

Format labels:

- `F` — Foundation / interactive guide;
- `M` — focused Mission;
- `I` — flagship Incident;
- `B` — Boss / integrated challenge;
- `R` — Reference / sandbox.

## A. Behavior and contracts

| # | Mental model | Engineering question | Layers | Format | Scope |
|---|---|---|---|---|---|
| 1 | Probabilistic behavior vs application guarantees | What must the application guarantee even when the model cannot? | Prompt, Harness, Eval | F | SHIP |
| 2 | Instruction authority and provenance | Which instruction is authoritative and where did it come from? | Prompt, Context, Harness | I #88 | SHIP |
| 3 | Structured output as a contract | How do schema, validation and repair differ from “please return JSON”? | Prompt, Harness | M | SHIP |
| 4 | Runtime enforcement vs model persuasion | What policy must live outside the prompt? | Harness, Eval | I #88 | SHIP |

## B. Context, retrieval and memory

| # | Mental model | Engineering question | Layers | Format | Scope |
|---|---|---|---|---|---|
| 5 | Finite context budget | What deserves to be in working context now? | Context | F | SHIP |
| 6 | Context structure / cache-friendly stability | What can remain stable and reusable vs dynamic? | Context, Production | R/M | MAP |
| 7 | Compression vs critical-information retention | What did token savings destroy? | Context, Eval | I #86 | SHIP |
| 8 | Evidence granularity / chunking | Is evidence split at the unit needed by the task? | Context | I #86 | SHIP |
| 9 | Dense vs sparse retrieval | Which relevance signal is missing? | Context | I #86 | SHIP |
| 10 | Hybrid retrieval | When do complementary retrieval signals beat one index? | Context | I #86 | SHIP |
| 11 | Reranking | Is candidate recall enough, and how should evidence be reordered? | Context, Eval | I #86 | SHIP |
| 12 | Freshness and authority | May a high-scoring stale source override current authoritative truth? | Context, Harness | I #86 | SHIP |
| 13 | Contextual / structured retrieval | When does provenance/structure matter more than similarity? | Context | M/I | MAP |
| 14 | Long-term memory lifecycle | What should be extracted, validated, stored, updated and forgotten? | Context, Harness | M | MAP |
| 15 | Memory vs source-of-truth conflict | When must remembered state lose to authoritative current data? | Context, Eval | I | MAP |

## C. Tools, permissions and side effects

| # | Mental model | Engineering question | Layers | Format | Scope |
|---|---|---|---|---|---|
| 16 | Tool contract / schema design | What inputs, outputs and failure states must be explicit? | Harness | M / I #87 | SHIP |
| 17 | Result validation | How do we know a tool result actually satisfied intent? | Harness, Eval | M/B | SHIP |
| 18 | Capability boundary / least privilege | What is the Agent allowed to do, not merely able to request? | Harness | I #88 | SHIP |
| 19 | Reversible vs irreversible actions | Which actions require stronger controls? | Harness, Loop | I #87/#88 | SHIP |
| 20 | Timeout ambiguity | Does a timeout mean the action failed? | Harness, Loop | I #87 | SHIP |
| 21 | Idempotency boundary | Can the same intent execute twice without duplicate side effects? | Harness, Loop | I #87 | SHIP |
| 22 | Retry policy as system policy | Which failures are retryable, how often, and under what evidence? | Loop, Harness | I #87 | SHIP |
| 23 | Human approval boundary | Where does human review reduce enough risk to justify friction? | Harness, Graph | I/B | SHIP |
| 24 | Parallel tool calls / state races | When does concurrency improve throughput vs corrupt shared state? | Graph, Harness | M | MAP |

## D. Agent loop, state and evidence

| # | Mental model | Engineering question | Layers | Format | Scope |
|---|---|---|---|---|---|
| 25 | Act → observe → verify loop | What evidence should change the next action? | Loop, Harness | F | SHIP |
| 26 | Planning vs direct execution | When is planning useful rather than ceremonial overhead? | Loop, Graph | M | MAP |
| 27 | Bounded autonomy / termination | When must the runtime stop, escalate or declare inconclusive? | Loop, Harness | M/I | SHIP |
| 28 | Checkpoint / recovery state | What state is safe to resume after a failure? | Loop, Harness | M/B | SHIP |
| 29 | Interrupt / cancellation semantics | Can new high-priority evidence safely stop stale work? | Loop, Graph | M | MAP |
| 30 | Traceability / causal execution history | Can we reconstruct what the Agent believed, called, observed and decided? | Harness, Loop, Eval | F/M + all Incidents | SHIP |
| 31 | Observability as a diagnosis interface | Which metrics/logs/traces distinguish competing failure hypotheses? | Harness, Eval | I/B | SHIP |

## E. Evaluation and production decisions

| # | Mental model | Engineering question | Layers | Format | Scope |
|---|---|---|---|---|---|
| 32 | Evaluation environment + verifier | What repeatable environment turns behavior into comparable evidence? | Evaluation | M | SHIP |
| 33 | Outcome vs trajectory evaluation | Can final output pass while the process violated policy? | Eval, Harness | M/B | SHIP |
| 34 | Dataset and slice coverage | Which important failures are hidden by aggregate score? | Evaluation | M/B | SHIP-lite |
| 35 | Regression vs aggregate improvement | Did a “better” release harm a critical segment? | Evaluation | M/B | MAP |
| 36 | Confidence / sample-size humility | Is evidence strong enough to support the claim? | Evaluation | M | MAP |
| 37 | Cost / latency / quality as one decision | Is higher quality still a production win at this latency and cost? | Eval, cross-cutting | I/B | SHIP |
| 38 | Release gate / veto logic | What evidence is sufficient to SHIP, BLOCK or remain INCONCLUSIVE? | Eval, Harness | B #89 | SHIP |

### Explicitly deferred knowledge areas

These remain useful research domains but are not required by v0.8 Content Preview:

- full model-routing curriculum;
- detailed prompt/KV caching economics;
- inference serving / goodput optimization;
- active tool discovery;
- self-reflection / verbal-RL methods;
- continuous autonomous self-improvement;
- multimodal / computer-use control loops;
- post-training / SFT / RLHF;
- robotics;
- GPU kernels / full serving orchestration.

They may later become reference content or Missions only when product evidence justifies them.

---

# 8. Multi-Agent extension map

Multi-Agent belongs in the canonical Knowledge Graph but does not inflate the first preview scope.

Mapped concepts:

1. delegation boundary / specialist selection;
2. manager-worker topology;
3. context sharing vs isolation;
4. independent verifier / correlated-error control;
5. communication and coordination cost;
6. shared-state race / settlement semantics;
7. consensus failure.

Future Incident:

> **The Agents Agreed. They Were Both Wrong.**

Several concepts should be learned in one system failure rather than becoming seven separate Labs.

---

# 9. Content format rules

## Foundation

Use when a learner needs a mental picture before an Incident.

- 3–8 minutes;
- one primary mental model;
- interactive only when interaction reveals behavior;
- no artificial story required.

## Mission

Use when one focused engineering skill can be practiced through a bounded decision.

Examples:

- repair a structured-output contract;
- choose an approval boundary;
- interpret a trace and select a verifier.

## Incident

Use when failure diagnosis and trade-offs are the learning mechanism.

Required sequence:

```text
failure visible
→ evidence / trace available
→ multiple plausible hypotheses
→ intervention
→ consequence
→ replay / compare
→ release decision
→ debrief
```

## Boss / Build

Use for cross-layer architecture and release decisions where no single configuration is universally optimal.

## Reference / Sandbox

Use when broad exploration remains useful for SEO, prerequisite intuition or deeper practice but is not strong enough to lead the Campaign.

---

# 10. First flagship dependency map

## #86 — The Broken RAG Pipeline

Primary models:

```text
#5   finite context budget
#7   compression vs retention
#8   evidence granularity
#9   dense vs sparse retrieval
#10  hybrid retrieval
#11  reranking
#12  freshness / authority
#30  traceability / causal history
#31  observability as diagnosis
#32  evaluation environment / verifier
#34  slice coverage (intro)
#37  cost / latency / quality
```

Optional first-release model:

```text
#15 memory vs source-of-truth conflict
```

## #87 — The $47,000 Retry

Primary models:

```text
#16 tool contract
#17 result validation
#19 irreversible actions
#20 timeout ambiguity
#21 idempotency
#22 retry policy
#23 human approval boundary
#27 termination / escalation
#28 recovery state
#30 causal execution trace
#31 observability / diagnosis
#37 cost / latency / quality
```

## #88 — The Prompt Injection Attack

Primary models:

```text
#2  instruction authority / provenance
#4  runtime enforcement
#18 least privilege / capability boundary
#19 irreversible / sensitive actions
#23 approval boundary
#30 provenance-aware execution trace
#31 policy-decision observability
#33 trajectory/process evaluation
#38 release/security veto
```

## #89 — Final Boss

Integrates rather than reteaches:

```text
retrieval evidence
context policy
capability / tool policy
retry / idempotency
approval / escalation
security boundary
trace / observability
release evaluation
cost / latency budget
```

The Boss should reward transfer: someone who completed #86/#87/#88 should make better architecture decisions without the Boss explicitly telling them the answer.

---

# 11. Preliminary migration of current AhaFrame experiences

Final classification belongs to #90. This table prevents #84 from assuming every current Lab remains primary navigation.

| Current experience | Preliminary v0.8 role |
|---|---|
| Token Playground | KEEP AS FOUNDATION / sandbox |
| Context Window Lab | KEEP AS FOUNDATION; prerequisite to #86 |
| Agent Loop Simulator | KEEP AS FOUNDATION / prerequisite node |
| RAG Failure Lab | MERGE / REFRAME into #86 |
| Context Compression Lab | MERGE mechanics into #86; retain public sandbox route |
| Agent Reliability Lab | reuse mechanics in #87/#89; remove from primary discovery if flagship is stronger |
| Evaluation Failure Lab | KEEP/REFRAME as Chapter 07 Mission; later Incident candidate |
| Instruction Conflict | merge provenance/authority mechanics into #88; keep route for SEO/reference |
| Agent Workflow Graph | secondary Graph foundation; not flagship before #92 |
| Reliable Support Agent Build | REFRAME as Final Boss #89 |

Route deletion is not implied. Existing indexed URLs should remain unless #90 records an explicit canonical/redirect/archive policy.

Stable `lab_id` and validation semantics should not be silently repurposed for new Missions. Mission identifiers should be additive unless a reviewed versioning plan says otherwise.

---

# 12. Journey prerequisites

The Campaign should not impose a rigid “complete every lesson first” gate.

Use soft prerequisites:

- Incident pages link to 1–3 short Foundations when necessary;
- experienced users may enter an Incident directly;
- evidence/debrief can route a learner backward to a missing mental model;
- Final Boss may recommend relevant prerequisites after weak decisions without requiring account infrastructure.

A future placement system may route users through the Knowledge Graph, but placement is not required for v0.8 Preview.

---

# 13. Knowledge completeness vs product scope

AhaFrame should understand more AI Engineering topics than it implements in the first Campaign.

```text
External AI Engineering universe
             ↓
AhaFrame Knowledge Graph
             ↓
38 decision-changing mental models
             ↓
SHIP subset represented in v0.8
             ↓
3 flagship Incidents
             ↓
Final Boss
```

This distinction prevents:

1. **coverage anxiety** — creating a page for every concept;
2. **product shallowness** — attractive incidents with no coherent knowledge model underneath;
3. **scope ambiguity** — treating every mapped concept as a pre-Alpha engineering requirement.

---

# 14. v0.8 implementation boundary

Before formal #19 recruitment, the required product set is bounded to:

```text
#84 Knowledge Graph / Journey              approved
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

Not required before #92:

```text
all 38 models as separate pages
Multi-Agent flagship Mission
Evaluation That Lied flagship Mission
full Memory course
full MCP course
placement system
accounts / saved progression
global score / badges / streaks / leaderboard
```

Do not add a fourth flagship Incident before #92 unless one of #86/#87/#88 is explicitly removed or replaced.

---

# 15. Content quality rubric

A Foundation/Mission/Incident is worth building when most answers are **yes**:

1. Is there a real engineering decision?
2. Can failure or uncertainty be made visible?
3. Can the learner inspect evidence rather than guess?
4. Are there at least two plausible hypotheses before diagnosis?
5. Does one plausible fix create a meaningful trade-off elsewhere?
6. Can v1 be deterministic and cheap?
7. Does the learner leave with a reusable mental model?
8. Does the experience connect to another Mission or the Final Boss?
9. Is it materially better than reading a tutorial or asking a chatbot?
10. Can a working engineer understand why the scenario matters in <10 seconds?
11. Does evidence/tracing support the diagnosis instead of merely decorating the page?
12. Is the experience still useful without badges, streaks or leaderboard mechanics?

If mostly no, make it a guide/reference, not a Mission.

---

# 16. Promotion decision for #84

This candidate is ready to replace the old learner-facing direction when reviewers agree on all of the following:

- the 38-model Knowledge Graph has no obvious production-critical blind spot for AhaFrame's target audience;
- `SHIP` vs `MAP` makes the first preview scope unambiguous;
- #86/#87/#88 represent three distinct and attractive failure families;
- Trace/Observability is treated as a learning primitive rather than hidden implementation detail;
- the six-layer model remains an internal cognitive framework instead of the primary marketing hierarchy;
- existing Lab routes have an explicit preliminary migration hypothesis for #90;
- Final Boss #89 requires transfer from earlier Missions;
- source repositories are used for coverage/methodology, not copied as lesson sequences;
- the batch remains bounded through #92.

If accepted, promote this document as the v0.8 curriculum truth source and close #84. Implementation details then belong to #85/#86/#87/#88/#89/#90/#91.

Refs: #83 #84 #85 #86 #87 #88 #89 #90 #91 #92 #19
