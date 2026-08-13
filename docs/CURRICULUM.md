# AhaFrame Curriculum v1.1

Date: 2026-08-13
Status: active curriculum source of truth

## Purpose

AhaFrame is not trying to become a 500-lesson encyclopedia. It is an **Interactive AI Engineering Lab** for experienced software developers who need production intuition faster than another linear tutorial can provide.

The curriculum organizes content around engineering dependencies and failure modes:

```text
Concept dependency
      ↓
Mental model
      ↓
Failure mode
      ↓
Interactive simulation
      ↓
Engineering decision
      ↓
Build challenge
```

The learning loop remains:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

And the architecture rule remains:

> **Simulate the concept. Spend compute only to validate reality.**

## Reference sources

AhaFrame uses external material as research and curriculum references, not as content to copy.

### AI Engineering from Scratch

- Repository: `https://github.com/rohitg00/ai-engineering-from-scratch`
- Website: `https://aiengineeringfromscratch.com/`
- License: MIT
- Role in AhaFrame: broad AI-engineering dependency map and topic coverage.
- Especially relevant areas:
  - Phase 11 — LLM Engineering
  - Phase 13 — Tools & Protocols
  - Phase 14 — Agent Engineering
  - Phase 17 — Infrastructure & Production
  - Phase 19 — Capstone Projects

### AI Agent Book — 深入理解 AI Agent：设计原理与工程实践

- Repository: `https://github.com/bojieli/ai-agent-book`
- Online book: `https://bojieli.github.io/ai-agent-book/`
- License: Apache-2.0
- Role in AhaFrame: Agent-engineering depth, experimental methodology, evaluation design, and production failure cases.
- Particularly relevant chapters:
  - Chapter 1 — Agent foundations
  - Chapter 2 — Context engineering
  - Chapter 3 — Memory / RAG / knowledge
  - Chapter 4 — Tools / MCP
  - Chapter 5 — Coding agents
  - Chapter 6 — Agent evaluation
  - Chapter 8 — Continuous improvement
  - Chapter 10 — Multi-agent systems

### Source-use policy

AhaFrame should:

```text
Research concepts                     yes
Use topics to check curriculum gaps   yes
Study experiment methodology          yes
Link / attribute useful references    yes
Design original failure scenarios     yes
Write original explanations           yes
Implement original simulations        yes

Copy source prose                     no
Copy source illustrations             no
Repackage source lessons              no
Assume third-party assets share the
repository's top-level license         no
```

If source code or substantial licensed material is ever incorporated directly, handle its license and notices explicitly. The default implementation strategy is **independent re-modeling**, not source import.

## Audience boundary

The default learner is an experienced software engineer moving into AI engineering.

AhaFrame should not require a learner to complete a traditional ML curriculum before reaching useful AI-system engineering concepts. Math, deep learning, transformer internals, and training theory may exist as optional foundations, but the primary path starts where software engineering meets LLM systems.

```text
Primary path

LLM behavior
   ↓
Context
   ↓
Retrieval
   ↓
Tools
   ↓
Agents
   ↓
Evaluation
   ↓
Production
   ↓
Systems
```

## AI Engineering Layers

Curriculum v1.1 adds a first-class engineering-layer model. These layers describe **what is being engineered** around an AI system; they are not six independent course catalogs.

```text
Prompt Engineering
      ↓
Context Engineering
      ↓
Harness Engineering
      ↓
Loop Engineering
      ↓
Graph Engineering
      ↓
Evaluation Engineering
```

Canonical mental model:

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

### Prompt Engineering — shapes behavior

Primary question:

> What should the model do, and how should instructions, examples, schemas, and constraints shape its behavior?

Typical controls:

```text
instructions
instruction priority
few-shot examples
output schema
rubric / policy wording
prompt length and placement
```

AhaFrame should not become a prompt-tip collection. Prompt content should focus on engineering failures such as conflicting instructions, brittle output contracts, policy ambiguity, and prompt injection boundaries.

Backlog candidate:

- **Instruction Conflict Lab** — system/developer/retrieved/user instructions compete; the learner repairs precedence and contract clarity.

This candidate is **not** part of the pre-Alpha Content MVP stop line.

### Context Engineering — shapes knowledge

Primary question:

> What information should the model have now, in what form, and within what working budget?

Typical controls:

```text
context window
retrieval
chunking
reranking
memory
compression
context budget
```

Existing coverage:

- Context Window Lab
- RAG Failure Lab
- Context Compression Lab — next Content MVP implementation

### Harness Engineering — shapes reliability

Primary question:

> What runtime environment, tools, permissions, verification, state, and safeguards make model behavior reliable enough to operate?

Typical controls:

```text
tools and schemas
permissions
validation
human approval
sandbox / runtime boundaries
observability
cost and execution budgets
```

Existing coverage:

- Agent Reliability Lab
- Evaluation Failure Lab (verification/release-gate side)

Future coverage can include Tool Contract Failure, Retry & Idempotency, MCP Permission, and Trace Diagnosis without making Harness a separate duplicated topic tree.

### Loop Engineering — shapes iteration

Primary question:

> How should an AI system act, observe, verify, recover, retry, escalate, and stop over repeated iterations?

Typical controls:

```text
goal
state
retry policy
verifier
stop condition
budget
recovery
escalation
```

Existing coverage:

- Agent Loop Simulator
- Agent Reliability Lab

### Graph Engineering — shapes orchestration

Primary question:

> How should multiple deterministic steps, tools, loops, agents, validators, branches, joins, and human gates be organized into an explicit workflow topology?

Typical controls:

```text
nodes
edges
branching
parallelism
state boundaries
joins
subgraphs
verifier placement
human gates
```

Backlog candidate:

- **Agent Workflow Graph Lab** — compare serial, branched, parallel, and cyclic agent workflows while observing coordination overhead, state contamination, latency, and failure propagation.

This candidate is **not** part of the pre-Alpha Content MVP stop line.

### Evaluation Engineering — proves whether it works

Primary question:

> What evidence is sufficient to decide that a system is better, safe enough, and economically acceptable to release?

Typical controls:

```text
dataset composition
slices
rubrics / verifiers
sample size
regression policy
safety veto
cost gate
release threshold
```

Existing coverage:

- Evaluation Failure Lab

## Engineering layers × system domains

The six layers cross-cut the existing curriculum domains. The domains remain useful because they tell us **where** the engineering decision appears.

| Domain | Prompt | Context | Harness | Loop | Graph | Evaluation |
|---|---|---|---|---|---|---|
| LLM behavior | instructions / schema | context window | output validation | iterative repair | — | quality checks |
| Retrieval / RAG | query formulation | evidence selection | retrieval pipeline controls | retry retrieval | retrieval workflow | retrieval eval |
| Tools / MCP | tool description | tool results | schema / permission / idempotency | retry / recovery | parallel / branched tools | tool verifiers |
| Agents | task instruction | memory / working state | limits / approval / safety | act-observe-verify-stop | multi-step topology | trajectory / outcome eval |
| Production | policy prompts | context budget | observability / routing / cost | bounded retries | orchestration topology | release gates |
| Multi-Agent | delegation instruction | context isolation | permissions | local agent loops | delegation / join / consensus | system-level eval |

Do not create duplicate Labs merely to fill every cell.

## Current Lab → engineering-layer mapping

| Experience | Primary layer | Secondary layers |
|---|---|---|
| Token Playground | Prompt / model-behavior foundation | Evaluation intuition |
| Context Window Lab | Context | — |
| Agent Loop Simulator | Loop | Harness |
| RAG Failure Lab | Context | Harness, Evaluation |
| Agent Reliability Lab | Harness | Loop, Evaluation |
| Evaluation Failure Lab | Evaluation | Harness |
| Context Compression Lab | Context | Evaluation |
| Reliable Support Agent Build | Harness | Prompt, Context, Loop, Graph, Evaluation |

The capstone should eventually demonstrate that production AI engineering is not one technique; it is the interaction between these layers.

## Curriculum domains

The eight existing tracks remain the content/dependency map. They are **system domains**, not competing top-level definitions of AI engineering.

```text
01 LLM Mental Models
02 Context & Retrieval
03 Tools & Protocols
04 Agent Engineering
05 Evaluation & Reliability
06 Production AI
07 Multi-Agent Systems
08 Build Systems
```

## Curriculum graph

```text
Token / Sampling ───────────────┐
                               │
Context Window ──→ Chunking ──→ RAG ──→ Reranking ──────┐
       │                │        │                        │
       └──→ Compression │        └──→ Retrieval Eval ────┤
                        │                                 │
Embedding ──────────────┘                                 │
                                                          ↓
Tool Schema ──→ Function Calling ──→ Agent Loop ──→ Agent Reliability
                         │                │                │
MCP ─────────────────────┘                ├──→ Memory      │
                                          ├──→ Planning    │
                                          └──→ Approval    │
                                                           ↓
Evaluation Design ──→ Regression ──→ Statistical Confidence
        │                                      │
        └──→ Safety Veto ───────────────────────┤
                                               ↓
Caching / Routing / Cost / Latency ─────→ Production AI
                                               ↓
                                  Multi-Agent / Build Systems
```

This graph is a content dependency model, not a requirement that every node become a separate page.

## Track 01 — LLM Mental Models

**Goal:** give software engineers enough model intuition to reason about API behavior without turning the product into an ML degree.

| Concept | Prerequisites | AhaFrame treatment | Candidate experience | Tier | Status |
|---|---|---|---|---|---|
| Next-token prediction | none | visual probability model | Token Playground | Free | Done |
| Sampling / temperature | next-token prediction | parameter-response simulation | Token Playground | Free | Done |
| Context window | token basics | visible finite budget | Context Window Lab | Free | Done |
| Instruction conflict | LLM API basics | precedence / ambiguity failure | Instruction Conflict Lab | Foundations | Backlog after Alpha |
| Structured output | LLM API basics | schema violation / repair | Structured Output Failure Lab | Foundations | Backlog |
| Embeddings | vector intuition | geometry + retrieval behavior | Embedding Similarity Lab | Free/Preview | Backlog |
| Attention / KV intuition | token + context | optional visual mental model | Attention Budget Explorer | Free | Later |

## Track 02 — Context & Retrieval

**Goal:** make information selection and context-budget trade-offs visible.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| RAG configuration | context | high recall but noisy/overflowed context | RAG Failure Lab | Preview | Done |
| Chunking | context, retrieval | chunks too large/small for task | Chunking Trade-off Lab | Foundations | Backlog |
| Reranking | retrieval | recall improves while precision/cost degrade | Reranker Trade-off Lab | Foundations | Backlog |
| Context compression | context | lower token use but information loss | Context Compression Lab | Preview | **Next** |
| Retrieval memory | embeddings, retrieval | stale or irrelevant memory wins | Memory Retrieval Lab | Production | Backlog |
| Knowledge structure | retrieval | vector-only search misses structured relationships | Retrieval Strategy Lab | Production | Later |

## Track 03 — Tools & Protocols

**Goal:** treat tools as typed production interfaces with side effects, contracts, permissions, and failure semantics.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Tool schema | structured output | ambiguous schema causes wrong arguments | Tool Contract Failure Lab | Preview | Candidate extension |
| Function calling | tool schema | model chooses wrong tool or malformed args | Function Calling Failure Lab | Foundations | Backlog |
| Retry / idempotency | function calling | retry repeats irreversible action | Retry & Idempotency Lab | Production | Backlog |
| Parallel calls | function calling | race / stale observations | Parallel Tool Race Lab | Production | Backlog |
| MCP architecture | tools | wrong boundary / excessive exposure | MCP Architecture Lab | Foundations | Backlog |
| MCP permissions | MCP | capability is available beyond required scope | MCP Permission Lab | Production | Backlog |

## Track 04 — Agent Engineering

**Goal:** explain why a working agent loop is not the same as a reliable production agent.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Agent loop | tools | observation/retry loop | Agent Loop Simulator | Free | Done |
| Execution policy | agent loop | success with runaway / unsafe tail risk | Agent Reliability Lab | Preview | Done |
| Planning | agent loop | planning overhead exceeds task benefit | Planning Strategy Lab | Foundations | Backlog |
| Memory | context, agent loop | stale memory drives wrong action | Agent Memory Lab | Foundations | Backlog |
| Human approval | tool side effects | approval everywhere or nowhere | Human-in-the-loop Lab | Production | Partly covered in Agent Reliability |
| Budgeting | reliability | agent succeeds but unit economics fail | Agent Budget Lab | Production | Backlog |
| Tool discovery | tools, agent loop | excessive tool choice increases error surface | Tool Discovery Lab | Production | Later |

## Track 05 — Evaluation & Reliability

**Goal:** turn “looks better” into an engineering decision supported by representative data, slices, verifiers, uncertainty, and deployment gates.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Evaluation design | RAG or Agent | aggregate score hides critical regression | Evaluation Failure Lab | Preview | Done |
| Dataset coverage | evaluation | demo-biased set gives false confidence | Dataset Coverage Lab | Foundations | Partly covered |
| Rubrics / judge | evaluation | grader noise / rubric ambiguity | LLM Judge Bias Lab | Production | Partly covered |
| Regression testing | evaluation | average improves while slice regresses | Regression Detection Lab | Foundations | Covered in Evaluation Failure v1 |
| Statistical confidence | evaluation | underpowered experiment treated as proof | Statistical Significance Lab | Production | Intro covered |
| Cost-aware eval | evaluation | quality win loses on cost-per-success | Cost-per-Success Lab | Production | Intro covered |
| Tracing / trajectory eval | agent loop, evaluation | final answer passes while process violates policy | Trajectory Evaluation Lab | Production | Backlog |

## Track 06 — Production AI

**Goal:** teach the operational trade-offs that determine whether an AI feature can be shipped and sustained.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Prompt caching | context, cost | cost falls but stale-prefix assumptions spread | Prompt Cache Lab | Production | Backlog |
| Model routing | evaluation | cheap route harms hard cases | Model Routing Lab | Production | Backlog |
| Latency vs quality | evaluation | quality target exceeds latency SLO | Latency vs Quality Lab | Production | Backlog |
| Guardrails | tools, eval | false positives vs missed unsafe actions | Guardrail Failure Lab | Production | Backlog |
| Observability | agent/eval | aggregate telemetry cannot explain failures | Trace Diagnosis Lab | Production | Backlog |
| Inference economics | cost basics | throughput optimization harms user-visible goodput | Inference Economics Lab | Advanced | Later |

## Track 07 — Multi-Agent Systems

**Goal:** show that adding agents increases coordination and context problems before it creates useful specialization.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Workflow graph | loop, tools | cycles / joins / shared-state topology cause coordination failures | Agent Workflow Graph Lab | Advanced | Backlog after Alpha |
| Delegation | agent reliability | wrong task sent to wrong specialist | Delegation Failure Lab | Advanced | Backlog |
| Context isolation | context, multi-agent | private state leaks or useful state is lost | Context Isolation Lab | Advanced | Backlog |
| Coordination | delegation | communication overhead exceeds benefit | Coordination Cost Lab | Advanced | Backlog |
| Consensus | evaluation | multiple agents reinforce the same error | Consensus Failure Lab | Advanced | Later |

## Track 08 — Build Systems

**Goal:** combine multiple mental models into architecture decisions under explicit constraints.

Candidate projects:

```text
Production RAG Challenge
  retrieval + reranking + evaluation + context budget

Reliable Support Agent Challenge
  prompt + context + RAG + tools + loop + harness + evaluation

MCP Tool System Challenge
  schema + permission boundary + retry/idempotency + observability

Production AI Architecture Challenge
  routing + caching + cost + latency + evaluation gates
```

Build projects should not merely ask learners to copy code. A challenge should define constraints and let learners make defensible trade-offs.

## Content MVP v1 stop line

The immediate closed-development path remains deliberately small:

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done

RAG Failure Lab                done
Agent Reliability Lab          done
Evaluation Failure Lab         done
Context Compression Lab        next
Reliable Support Agent Build   next

        ↓
UX / technical-content review
        ↓
Soft Alpha with 20–50 developers
```

Prompt and Graph gaps are now explicit in the curriculum, but `Instruction Conflict Lab` and `Agent Workflow Graph Lab` do **not** delay Soft Alpha. They become post-Alpha candidates unless user behavior shows they are required to understand the capstone.

## Free vs paid curriculum boundary

The curriculum does not equate “advanced topic” with “paid page.” The boundary is capability.

### Free / acquisition layer

- core mental models;
- selected foundational simulations;
- concept guides and dependency map;
- rotating Production Lab previews;
- enough interaction to understand the AhaFrame method before purchase.

### Foundations / paid hypothesis

- full failure simulations;
- evaluation challenges;
- production trade-off labs;
- integrated Build Projects;
- later: durable checkpoints / cloud progress.

### Production Labs / future subscription hypothesis

- continuously growing production scenarios;
- advanced comparison and replay workflows;
- Live Mode where real compute validates simulation predictions;
- metered compute rather than unlimited AI usage.

## Lab selection rubric

A new Lab should score well on most of these questions before implementation:

1. **Is there a real engineering decision?**
2. **Can a plausible failure be made visible?**
3. **Does changing a parameter create a meaningful trade-off?**
4. **Can the first version be deterministic and cheap?**
5. **Does the learner leave with a reusable mental model?**
6. **Does it connect to another Lab or Build Challenge?**
7. **Is the experience materially better than reading a tutorial or asking a chatbot for an explanation?**

If the answer is mostly no, the topic belongs in a guide, glossary, or external reference rather than a full Lab.

## Curriculum maintenance rule

External repositories and emerging engineering terminology are research signals, not automatic backlog expansion. AhaFrame should adopt a concept only when it improves the learner's mental model or a real engineering decision.

The canonical decision rule remains:

> **Do not maximize lesson count. Maximize the number of production decisions a learner can reason about correctly.**
