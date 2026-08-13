# AhaFrame Curriculum v1.0

Date: 2026-08-13
Status: active curriculum source of truth

## Purpose

AhaFrame is not trying to become a 500-lesson encyclopedia. It is an **Interactive AI Engineering Lab** for experienced software developers who need production intuition faster than another linear tutorial can provide.

The curriculum therefore organizes content around engineering dependencies and failure modes:

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

Useful curriculum ideas include prerequisite-aware learning, explicit build/use/ship progression, context engineering, RAG, evaluation, caching/cost, guardrails, function calling, MCP, agent patterns, and production infrastructure.

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
| Tool schema | structured output | ambiguous schema causes wrong arguments | Tool Contract Failure Lab | Preview | Candidate Content MVP extension |
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

Reference emphasis:

- AI Engineering from Scratch, Phase 11 / Evaluation: datasets, automated scoring, LLM-as-judge, regression testing, confidence, CI/CD gating.
- AI Agent Book, Chapter 6: evaluation environments, trajectories, verifiers, multidimensional rubrics, cost evidence, statistical comparison, failure analysis.

| Concept | Prerequisites | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|---|
| Evaluation design | RAG or Agent | aggregate score hides critical regression | Evaluation Failure Lab | Preview | **Done** |
| Dataset coverage | evaluation | demo-biased set gives false confidence | Dataset Coverage Lab | Foundations | Partly covered in Evaluation Failure |
| Rubrics / judge | evaluation | grader noise / rubric ambiguity | LLM Judge Bias Lab | Production | Partly covered in Evaluation Failure |
| Regression testing | evaluation | average improves while slice regresses | Regression Detection Lab | Foundations | Covered in Evaluation Failure v1 |
| Statistical confidence | evaluation | underpowered experiment treated as proof | Statistical Significance Lab | Production | Intro covered in Evaluation Failure v1 |
| Cost-aware eval | evaluation | quality win loses on cost-per-success | Cost-per-Success Lab | Production | Intro covered in Evaluation Failure v1 |
| Tracing / trajectory eval | agent loop, evaluation | final answer passes while process violates policy | Trajectory Evaluation Lab | Production | Backlog |

Evaluation Failure v1 now makes four evaluation-design decisions concrete: dataset composition can hide regressions, a safety veto can override an aggregate improvement, small samples can make a release `INCONCLUSIVE`, and a cost gate can independently block a candidate. The values are deterministic teaching data rather than live benchmark evidence.

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
  RAG + tools + bounded execution + approval + evaluation

MCP Tool System Challenge
  schema + permission boundary + retry/idempotency + observability

Production AI Architecture Challenge
  routing + caching + cost + latency + evaluation gates
```

Build projects should not merely ask learners to copy code. A challenge should define constraints and let learners make defensible trade-offs.

## Content MVP v1 stop line

The immediate closed-development path is deliberately small:

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

`Tool Contract Failure Lab` is the first optional extension if the five-step path needs a clearer Tools & Protocols bridge before Soft Alpha. It should not delay external testing unless the Build Challenge requires it.

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

External repositories are references, not upstream dependencies. AhaFrame should periodically review relevant source changes to discover missing topics, but the curriculum changes only when a new topic strengthens AhaFrame's product thesis or user learning path.

The canonical decision rule remains:

> **Do not maximize lesson count. Maximize the number of production decisions a learner can reason about correctly.**
