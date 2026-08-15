# AhaFrame Curriculum v0.8 — Game Learning & Production Incident Edition

Date: 2026-08-16
Status: **draft candidate for #84**
Parent: #83

> This document is a proposed replacement direction for the learner-facing curriculum. `docs/CURRICULUM.md` remains the current canonical v1.1 source until this draft is reviewed and explicitly promoted.

## 1. Product thesis

AhaFrame is not trying to win by publishing the largest AI curriculum.

It should win by giving experienced software engineers a place to **practice the engineering judgment required to ship AI systems**.

Learner-facing promise:

> **Learn AI Engineering by surviving production incidents.**

Internal learning loop:

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

AhaFrame may provide optional foundation references, but the default journey starts where **software engineering meets probabilistic AI systems**.

---

## 3. Research inputs and source-use boundary

Two repositories are used as research maps, not as content to copy.

### `rohitg00/ai-engineering-from-scratch`

Primary role: **breadth / dependency map**.

Most relevant areas for AhaFrame:

- Phase 11 — LLM Engineering;
- Phase 13 — Tools & Protocols;
- Phase 14 — Agent Engineering;
- Phase 17 — Infrastructure & Production;
- Phase 19 — Capstone Projects.

Useful design lessons:

- concepts should lead to runnable artifacts;
- `Problem → Concept → Build → Use → Ship` is a strong progression;
- production economics, tooling and deployment belong in the curriculum, not in an appendix;
- placement and routing are valuable when curriculum breadth grows.

### `bojieli/ai-agent-book`

Primary role: **Agent depth / experiment methodology map**.

Most relevant areas for AhaFrame:

- Agent = model + context + tools;
- context engineering and context compression;
- user memory, RAG, hybrid retrieval, reranking and structured retrieval;
- MCP/tool capability design;
- event-driven and asynchronous Agent runtimes;
- evaluation environments, verifiers, rubrics and statistical evidence;
- learning from runtime trajectories;
- multi-Agent collaboration, isolation and coordination.

Useful design lessons:

- runnable experiment is stronger than prose-only explanation;
- negative results are valuable when evidence is preserved;
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

## 4. AhaFrame's internal engineering model remains six layers

The six layers describe **what is being engineered**. They are not the primary course navigation.

```text
Prompt Engineering      shapes behavior
Context Engineering     shapes knowledge
Harness Engineering     shapes reliability
Loop Engineering        shapes iteration
Graph Engineering       shapes orchestration
Evaluation Engineering  proves whether it works
```

Production concerns such as cost, latency, observability, routing and security cut across all six layers.

The learner should gradually recognize these layers while solving incidents rather than being required to memorize the taxonomy before doing anything useful.

---

# 5. Learner-facing AI Engineer Campaign

## Chapter 01 — Why AI Systems Fail

**Promise:** understand why an AI feature that looks correct in a demo can fail in production.

Primary experiences:

- Foundation: Token Playground / model variability intuition;
- Foundation: Context Window / finite working state;
- Mission: output contract / structured-output failure;
- Incident teaser: the same input succeeds nine times and fails on the tenth.

Learner leaves able to distinguish:

- model behavior;
- application state;
- runtime guarantees;
- evidence of correctness.

---

## Chapter 02 — Build Retrieval You Can Trust

**Promise:** move from “we added RAG” to an evidence pipeline that can be debugged and evaluated.

Primary experiences:

- hybrid retrieval mental model;
- chunk / evidence granularity;
- reranking;
- freshness and authority;
- context budget and compression;
- memory vs authoritative knowledge;
- retrieval evaluation.

Flagship incident:

> **The Broken RAG Pipeline** — the support Agent answers with yesterday's truth even though today's policy exists.

Issue: #86

---

## Chapter 03 — Give the System Tools

**Promise:** understand that giving a model a function is equivalent to adding capabilities to a runtime.

Primary experiences:

- tool contract / schema;
- result validation;
- reversible vs irreversible actions;
- least privilege;
- MCP capability boundaries;
- approval gates;
- parallel tool execution.

This chapter prepares both #87 and #88.

---

## Chapter 04 — Turn Tool Use Into an Agent

**Promise:** understand when a tool-using loop becomes an Agent runtime and what must bound it.

Primary experiences:

- act → observe → verify loop;
- planning vs direct execution;
- state and checkpoints;
- retry / recovery;
- termination;
- interruption and cancellation;
- budgeted autonomy.

Existing Agent Loop Simulator becomes a foundation/sandbox unless #90 decides to reframe it.

---

## Chapter 05 — Make the Agent Reliable

**Promise:** make reliability a system property rather than a prompt property.

Flagship incident:

> **The $47,000 Retry** — a timeout triggers retries around an irreversible payment/refund action.

Issue: #87

Primary concepts:

- timeout ambiguity;
- retry amplification;
- idempotency;
- approval boundaries;
- compensation;
- auditability;
- cost / latency / automation trade-offs.

---

## Chapter 06 — Survive a Security Incident

**Promise:** understand why the model cannot be the sole authorization or trust boundary.

Flagship incident:

> **The Prompt Injection Attack** — untrusted retrieved content tries to turn legitimate tools into an exfiltration path.

Issue: #88

Primary concepts:

- instruction provenance;
- trusted vs untrusted context;
- capability scoping;
- least privilege;
- runtime policy enforcement;
- false-positive / false-negative trade-offs;
- defense in depth.

---

## Chapter 07 — Evaluate Before Shipping

**Promise:** replace “the demo looks better” with evidence sufficient for a release decision.

Primary experiences:

- evaluation environment;
- deterministic verifier vs model judge;
- task success vs trajectory/process violation;
- dataset / slice coverage;
- regression detection;
- uncertainty and sample size;
- cost per success;
- release vetoes.

Candidate flagship follow-up after v0.8:

> **The Evaluation That Lied** — aggregate score improves while an enterprise-critical slice regresses.

Do not add this as a fourth flagship Mission before #92 unless one of #86/#87/#88 is explicitly replaced.

---

## Chapter 08 — Coordinate Multiple Agents

**Promise:** learn when decomposition helps and when more Agents only create more failure surfaces.

Primary concepts:

- delegation boundary;
- manager/worker topology;
- context sharing vs isolation;
- independent verification;
- parallelism vs coordination overhead;
- shared-state races;
- correlated-error / consensus failure.

Candidate later incident:

> **The Agents Agreed. They Were Both Wrong.**

This chapter is represented in the Knowledge Graph for completeness but does not block the first Content Preview.

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
+ evaluation gates
+ cost / latency budget
```

They must inspect evidence, spend limited intervention budget, compare architectures and make a release decision:

```text
SHIP
BLOCK
INCONCLUSIVE
```

The Final Boss is successful only if knowledge from the earlier Missions materially changes the learner's decisions.

---

# 6. Canonical v0.8 Mental Model Set

The v0.8 candidate set contains **36 core mental models**. A mental model is selected because it changes an engineering decision, not because a source repository contains a lesson about it.

Legend:

- `F` — Foundation / interactive guide;
- `M` — Mission / focused practice;
- `I` — Incident / production scenario;
- `B` — Boss / integrated challenge;
- `R` — Reference / secondary sandbox.

## A. Behavior and contracts

| # | Mental model | Engineering question | Layers | Primary format | v0.8 |
|---|---|---|---|---|---|
| 1 | Probabilistic behavior vs application guarantees | What must the application guarantee even when the model cannot? | Prompt, Harness, Eval | F | Core |
| 2 | Instruction authority and provenance | Which instruction is authoritative and where did it come from? | Prompt, Context, Harness | I (#88) | Core |
| 3 | Structured output as a contract | How do schema, validation and repair differ from “please return JSON”? | Prompt, Harness | M | Core |
| 4 | Runtime enforcement vs model persuasion | What policy must live outside the prompt? | Harness, Eval | I (#88) | Core |

## B. Context, retrieval and memory

| # | Mental model | Engineering question | Layers | Primary format | v0.8 |
|---|---|---|---|---|---|
| 5 | Finite context budget | What deserves to be in working context now? | Context | F | Core |
| 6 | Context structure and cache-friendly stability | What context can remain stable and reusable vs dynamic? | Context, Production | M/R | Core-lite |
| 7 | Compression vs critical-information retention | What did token savings destroy? | Context, Eval | M / merge into #86 | Core |
| 8 | Evidence granularity / chunking | Is evidence split at the unit needed by the task? | Context | I (#86) | Core |
| 9 | Dense vs sparse retrieval | Which relevance signal is missing? | Context | I (#86) | Core |
| 10 | Hybrid retrieval | When do complementary retrieval signals beat a single index? | Context | I (#86) | Core |
| 11 | Reranking | Is candidate recall enough, and how should evidence be reordered? | Context, Eval | I (#86) | Core |
| 12 | Freshness and authority | Is the highest-scoring result allowed to override the newest/authoritative source? | Context, Harness | I (#86) | Core |
| 13 | Contextual / structured retrieval | When does structure/provenance matter more than raw similarity? | Context | M/I | Core-lite |
| 14 | Long-term memory lifecycle | What should be extracted, validated, stored, updated and forgotten? | Context, Harness | M | Core |
| 15 | Memory vs source-of-truth conflict | When should remembered state lose to authoritative current data? | Context, Eval | I / later | Core |

## C. Tools, permissions and side effects

| # | Mental model | Engineering question | Layers | Primary format | v0.8 |
|---|---|---|---|---|---|
| 16 | Tool contract / schema design | What inputs, outputs and failure states must be explicit? | Harness | M | Core |
| 17 | Result validation | How do we know a tool result actually satisfied the intent? | Harness, Eval | M/B | Core |
| 18 | Capability boundary / least privilege | What is the Agent allowed to do, not merely able to ask for? | Harness | I (#88) | Core |
| 19 | Reversible vs irreversible actions | Which actions require stronger controls? | Harness, Loop | I (#87/#88) | Core |
| 20 | Timeout ambiguity | Does a timeout mean the action failed? | Harness, Loop | I (#87) | Core |
| 21 | Idempotency boundary | Can the same intent execute twice without duplicate side effects? | Harness, Loop | I (#87) | Core |
| 22 | Retry policy as a system policy | Which failures are retryable, how often and under what evidence? | Loop, Harness | I (#87) | Core |
| 23 | Human approval boundary | Where does human review reduce risk enough to justify friction? | Harness, Graph | I/B | Core |
| 24 | Parallel tool calls and race conditions | When does concurrency increase throughput vs stale/contradictory state? | Graph, Harness | M / later | Core-lite |

## D. Agent loop and state

| # | Mental model | Engineering question | Layers | Primary format | v0.8 |
|---|---|---|---|---|---|
| 25 | Act → observe → verify loop | What evidence should change the next action? | Loop, Harness | F | Core |
| 26 | Planning vs direct execution | When is planning overhead useful rather than ceremonial? | Loop, Graph | M | Core-lite |
| 27 | Bounded autonomy / termination | When must the runtime stop, escalate or declare inconclusive? | Loop, Harness | M/I | Core |
| 28 | Checkpoint / recovery state | What state is safe to resume after a failure? | Loop, Harness | M/B | Core |
| 29 | Interrupt / cancellation semantics | Can new high-priority evidence stop stale work safely? | Loop, Graph | M / later | Core-lite |

## E. Evaluation and production decisions

| # | Mental model | Engineering question | Layers | Primary format | v0.8 |
|---|---|---|---|---|---|
| 30 | Evaluation environment + verifier | What repeatable environment turns behavior into comparable evidence? | Evaluation | M | Core |
| 31 | Outcome vs trajectory evaluation | Can the final answer pass while the process violated policy? | Evaluation, Harness | M/B | Core |
| 32 | Dataset and slice coverage | Which important failures are hidden by the aggregate score? | Evaluation | M/B | Core |
| 33 | Regression vs aggregate improvement | Did a “better” release harm a critical segment? | Evaluation | M/B | Core |
| 34 | Confidence / sample-size humility | Is the evidence strong enough to support the claim? | Evaluation | M | Core-lite |
| 35 | Cost / latency / quality as one decision | Is higher quality still a production win at this latency and cost? | Evaluation, Production | I/B | Core |
| 36 | Release gate / veto logic | What evidence is sufficient to SHIP, BLOCK or remain INCONCLUSIVE? | Evaluation, Harness | B (#89) | Core |

### Deferred but mapped after v0.8

These are valuable but not part of the 36-model first Content Gate unless folded into an existing Mission:

- model routing;
- prompt caching economics;
- detailed inference serving / goodput;
- active tool discovery;
- self-reflection / verbal RL methods;
- continuous Agent self-improvement;
- multimodal / computer-use control loops;
- post-training / SFT / RL;
- robotics;
- full GPU serving and orchestration.

---

# 7. Multi-Agent extension map

Multi-Agent is intentionally not allowed to inflate the initial 36-model core. The following concepts remain an explicit post-preview extension because they are important to the full AI Engineering map:

1. delegation boundary and specialist selection;
2. manager/worker graph;
3. context sharing vs isolation;
4. independent verifier / correlated-error control;
5. communication and coordination cost;
6. shared-state race / settlement semantics;
7. consensus failure.

The future incident **The Agents Agreed. They Were Both Wrong.** should cover several of these together rather than becoming seven separate Labs.

---

# 8. Content format rules

## Foundation

Use when the learner needs a mental picture before an Incident.

Characteristics:

- 3–8 minutes;
- one core model;
- interactive if the interaction reveals behavior;
- no artificial story required.

Examples:

- context budget;
- act/observe/verify loop;
- probabilistic model vs deterministic application boundary.

## Mission

Use when a focused engineering skill can be practiced in one bounded decision.

Examples:

- repair a structured-output contract;
- choose an approval boundary;
- design a verifier.

## Incident

Use when failure diagnosis and trade-offs are the learning mechanism.

Required sequence:

```text
failure visible
→ evidence available
→ multiple plausible hypotheses
→ player intervention
→ consequence
→ replay / compare
→ debrief
```

## Boss / Build

Use for cross-layer architecture decisions where no single configuration is universally optimal.

A Boss should produce a defensible engineering decision, not a hidden-answer puzzle.

## Reference / Sandbox

Keep broad experimentation tools here when they remain useful for SEO, exploration or deeper practice but are not strong enough to lead the Campaign.

---

# 9. First flagship content dependency map

## #86 — The Broken RAG Pipeline

Must primarily teach:

```text
#5  finite context budget
#7  compression vs retention
#8  evidence granularity
#9  dense retrieval
#10 hybrid retrieval
#11 reranking
#12 freshness / authority
#15 memory vs source-of-truth conflict (optional first release)
#30 evaluation environment / verifier
#32 dataset/slice coverage (intro)
#35 cost / latency / quality
```

## #87 — The $47,000 Retry

Must primarily teach:

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
#35 cost / latency / quality
```

## #88 — The Prompt Injection Attack

Must primarily teach:

```text
#2  instruction authority / provenance
#4  runtime enforcement
#18 least privilege / capability boundary
#19 irreversible/sensitive actions
#23 approval boundary
#31 trajectory/process evaluation
#36 release/security veto
```

## #89 — Final Boss

Must integrate rather than reteach:

```text
retrieval evidence
context policy
capability and tool policy
retry / idempotency
approval / escalation
security boundary
release evaluation
cost / latency budget
```

The Boss should reward transfer: someone who completed #86/#87/#88 should make better architecture decisions without the Boss explicitly telling them the answer.

---

# 10. Preliminary migration of current AhaFrame experiences

Final classification belongs to #90. This table only prevents #84 from assuming all current Labs remain primary navigation.

| Current experience | Preliminary v0.8 role |
|---|---|
| Token Playground | KEEP AS FOUNDATION / sandbox |
| Context Window Lab | KEEP AS FOUNDATION; prerequisite to #86 |
| Agent Loop Simulator | KEEP AS FOUNDATION or PREREQUISITE NODE |
| RAG Failure Lab | MERGE / REFRAME into #86 |
| Context Compression Lab | MERGE mechanics into #86; retain public sandbox route |
| Agent Reliability Lab | source mechanics for #87/#89; likely remove from primary discovery |
| Evaluation Failure Lab | KEEP/REFRAME as Chapter 07 Mission; potential later Incident |
| Instruction Conflict | merge useful provenance mechanics into #88 |
| Agent Workflow Graph | secondary Graph foundation; not flagship before #92 |
| Reliable Support Agent Build | REFRAME as Final Boss #89 |

Route deletion is not implied. Public SEO routes should be preserved or explicitly migrated by #90.

---

# 11. Journey prerequisites

The Campaign should not impose a rigid “complete every lesson” gate.

Use **soft prerequisites**:

- Incident page can link to 1–3 short prerequisite Foundations;
- experienced users may enter an Incident directly;
- debrief can route users backward to missing mental models;
- Final Boss can recommend prerequisites based on failed decisions, without requiring account infrastructure.

A future placement system may route users through the Knowledge Graph, inspired by broad curricula such as `ai-engineering-from-scratch`, but placement is not required for v0.8 Content Preview.

---

# 12. Knowledge completeness vs product scope

AhaFrame should know about more topics than it teaches in the first Campaign.

```text
External AI Engineering universe
             ↓
AhaFrame Knowledge Graph
             ↓
Selected 36 core mental models
             ↓
Campaign Foundations / Missions
             ↓
3 flagship Incidents
             ↓
Final Boss
```

This distinction prevents two failure modes:

1. **coverage anxiety** — creating a page for every concept;
2. **product shallowness** — having attractive incidents with no coherent knowledge model underneath.

---

# 13. v0.8 stop line

Before formal #19 recruitment:

```text
#84 Knowledge Graph / Journey             first pass approved
#85 Mission gameplay contract             implemented enough for flagship use

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

Do not add a fourth flagship Mission before #92 unless one of the first three is explicitly removed/replaced.

---

# 14. Content quality rubric

A Foundation/Mission/Incident is worth building when most answers are **yes**:

1. Is there a real engineering decision?
2. Can the failure or uncertainty be made visible?
3. Can the learner inspect evidence rather than guess?
4. Does one plausible fix create a meaningful trade-off elsewhere?
5. Can v1 be deterministic and cheap?
6. Does the learner leave with a reusable mental model?
7. Does the experience connect to another Mission or the Final Boss?
8. Is it materially better than reading a tutorial or asking a chatbot?
9. Can a working engineer understand why the scenario matters in <10 seconds?
10. Is the experience still useful without badges, streaks or leaderboard mechanics?

If mostly no, make it a guide/reference, not a Mission.

---

# 15. Review questions for promoting this draft

Before replacing `docs/CURRICULUM.md` with this direction, reviewers should answer:

1. Are 36 mental models too many, too few, or missing a production-critical decision?
2. Is the Campaign coherent for an experienced software engineer entering AI Engineering?
3. Do #86/#87/#88 cover three sufficiently different and attractive failure families?
4. Does the six-layer internal model remain useful without dominating learner navigation?
5. Which existing Labs should remain primary vs become foundation/reference?
6. Does the Final Boss actually require transfer across earlier Missions?
7. Are any source-inspired topics accidentally being reproduced rather than transformed into original AhaFrame content?
8. Can this batch remain bounded until #92?

If these are resolved, promote this document (or its reviewed successor) to the canonical curriculum source and proceed with #85/#86/#87/#88 in parallel.

Refs: #83 #84 #85 #86 #87 #88 #89 #90 #91 #92 #19
