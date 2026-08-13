# AhaFrame Curriculum v1.1

Date: 2026-08-13
Status: active curriculum source of truth

## Product boundary

AhaFrame is an **Interactive AI Engineering Lab** for experienced software developers moving into AI engineering. It is not trying to become a 500-lesson encyclopedia.

The content model is:

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

Learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture rule:

> **Simulate the concept. Spend compute only to validate reality.**

## Research references

AhaFrame uses external projects to check curriculum breadth and engineering depth, not as content to copy.

### AI Engineering from Scratch

- Repository: `https://github.com/rohitg00/ai-engineering-from-scratch`
- Website: `https://aiengineeringfromscratch.com/`
- Role: broad prerequisite / AI-engineering dependency map.
- Useful areas: LLM Engineering, Tools & Protocols, Agent Engineering, Infrastructure & Production, Capstones.

### AI Agent Book — 深入理解 AI Agent

- Repository: `https://github.com/bojieli/ai-agent-book`
- Online book: `https://bojieli.github.io/ai-agent-book/`
- Role: Agent engineering depth, context/memory, MCP/tools, evaluation, continuous improvement, multi-agent systems.

### Source-use rule

```text
Research concepts                     yes
Check curriculum gaps                 yes
Study experiment methodology          yes
Link / attribute references           yes
Design original scenarios             yes
Write original explanations           yes
Implement original simulations        yes

Copy source prose                     no
Copy source illustrations             no
Repackage source lessons              no
Assume third-party assets inherit
repository-level licensing            no
```

## Audience boundary

Primary learner: an experienced software engineer who already understands APIs, data, backend systems, debugging, and production trade-offs, but needs AI-native engineering intuition.

Optional ML / transformer foundations may exist later. The primary path starts where software engineering meets LLM systems.

## AI Engineering Layers

The six layers describe **what is being engineered** around an AI system. They are cross-cutting concepts, not six duplicated course catalogs.

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

Primary question: **What should the model do?**

Controls include instructions, precedence, examples, output schema, rubrics, constraints, and policy wording.

AhaFrame should focus on failures, not prompt-tip collections.

Backlog candidate:

- **Instruction Conflict Lab** — conflicting system / developer / retrieved / user instructions.

### Context Engineering — shapes knowledge

Primary question: **What should the model know now, in what form, and within what budget?**

Controls include context window, retrieval, chunking, reranking, memory, compression, and context budget.

Current coverage:

- Context Window Lab — done
- RAG Failure Lab — done
- Context Compression Lab — **done**

### Harness Engineering — shapes reliability

Primary question: **What runtime, tools, permissions, validation, approval, state, and safeguards make the model safe enough to operate?**

Current coverage:

- Agent Reliability Lab — done
- Evaluation Failure Lab — verification / release-gate side

Future candidates:

- Tool Contract Failure Lab
- Retry & Idempotency Lab
- MCP Permission Lab
- Trace Diagnosis Lab

### Loop Engineering — shapes iteration

Primary question: **How should the system act, observe, verify, recover, retry, escalate, and stop?**

Current coverage:

- Agent Loop Simulator — done
- Agent Reliability Lab — done

### Graph Engineering — shapes orchestration

Primary question: **How should deterministic steps, tools, loops, agents, branches, joins, validators, and human gates form an explicit workflow topology?**

Backlog candidate:

- **Agent Workflow Graph Lab** — serial vs branched vs parallel vs cyclic workflows, coordination cost, state boundaries, and failure propagation.

This does not block the first Alpha.

### Evaluation Engineering — proves whether it works

Primary question: **What evidence is sufficient to decide that a system is better, safe enough, and economically acceptable to release?**

Current coverage:

- Evaluation Failure Lab — done

## Engineering layers × system domains

| Domain | Prompt | Context | Harness | Loop | Graph | Evaluation |
|---|---|---|---|---|---|---|
| LLM behavior | instructions / schema | context window | output validation | iterative repair | — | quality checks |
| Retrieval / RAG | query formulation | evidence selection | retrieval controls | retry retrieval | retrieval workflow | retrieval eval |
| Tools / MCP | tool description | tool results | schema / permission / idempotency | retry / recovery | parallel / branched tools | tool verifiers |
| Agents | task instruction | memory / state | limits / approval / safety | act-observe-stop | workflow topology | trajectory / outcome eval |
| Production | policy prompts | context budget | observability / routing / cost | bounded retries | orchestration | release gates |
| Multi-Agent | delegation instruction | context isolation | permissions | local loops | delegation / joins | system-level eval |

Do not create a Lab merely to fill a matrix cell.

## Current experiences → engineering layers

| Experience | Primary layer | Secondary layers | Status |
|---|---|---|---|
| Token Playground | LLM behavior foundation | Prompt, Evaluation intuition | Done |
| Context Window Lab | Context | — | Done |
| Agent Loop Simulator | Loop | Harness | Done |
| RAG Failure Lab | Context | Harness, Evaluation | Done |
| Agent Reliability Lab | Harness | Loop, Evaluation | Done |
| Evaluation Failure Lab | Evaluation | Harness | Done |
| Context Compression Lab | Context | Harness, Evaluation | **Done** |
| Reliable Support Agent Build | Harness / Build | Prompt, Context, Loop, Graph, Evaluation | **Next** |

## Curriculum domains

The eight tracks remain the dependency / backlog map:

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

## Track 01 — LLM Mental Models

| Concept | Candidate experience | Tier | Status |
|---|---|---|---|
| Next-token prediction / sampling | Token Playground | Free | Done |
| Context window | Context Window Lab | Free | Done |
| Instruction conflict | Instruction Conflict Lab | Foundations | Backlog after Alpha |
| Structured output | Structured Output Failure Lab | Foundations | Backlog |
| Embeddings | Embedding Similarity Lab | Free/Preview | Backlog |
| Attention / KV intuition | Attention Budget Explorer | Free | Later |

## Track 02 — Context & Retrieval

| Concept | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|
| RAG configuration | noisy / overflowed retrieval | RAG Failure Lab | Preview | Done |
| Context compression | token savings destroy required information | Context Compression Lab | Preview | **Done** |
| Chunking | chunks too large / too small | Chunking Trade-off Lab | Foundations | Backlog |
| Reranking | precision / cost trade-off | Reranker Trade-off Lab | Foundations | Backlog |
| Retrieval memory | stale memory wins | Memory Retrieval Lab | Production | Backlog |
| Knowledge structure | vector-only search misses structure | Retrieval Strategy Lab | Production | Later |

### Context Compression Lab v1

Product question:

> When context compression reduces tokens, latency, and cost, what task-critical information gets lost?

Implemented controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory budget
Critical-fact protection
```

Implemented signals:

```text
Active context tokens
Token savings
Critical-information retention
Evidence coverage
Task quality
Hallucination risk
Latency index
Cost index
Context overflow
Failure diagnosis
```

The Lab intentionally demonstrates both extremes:

- an over-compressed policy can look cheap while deleting required information;
- an under-compressed policy can retain excellent information while exceeding the fixed 16k working-context budget.

See `docs/CONTEXT_COMPRESSION_LAB.md`.

## Track 03 — Tools & Protocols

| Concept | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|
| Tool schema | ambiguous contract | Tool Contract Failure Lab | Preview | Candidate extension |
| Function calling | wrong tool / malformed args | Function Calling Failure Lab | Foundations | Backlog |
| Retry / idempotency | retry repeats irreversible action | Retry & Idempotency Lab | Production | Backlog |
| Parallel calls | race / stale observations | Parallel Tool Race Lab | Production | Backlog |
| MCP architecture | wrong capability boundary | MCP Architecture Lab | Foundations | Backlog |
| MCP permissions | excess capability exposure | MCP Permission Lab | Production | Backlog |

## Track 04 — Agent Engineering

| Concept | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|
| Agent loop | observation / retry loop | Agent Loop Simulator | Free | Done |
| Execution policy | runaway / unsafe tail risk | Agent Reliability Lab | Preview | Done |
| Planning | planning overhead exceeds benefit | Planning Strategy Lab | Foundations | Backlog |
| Memory | stale memory drives action | Agent Memory Lab | Foundations | Backlog |
| Human approval | approval everywhere / nowhere | Human-in-the-loop Lab | Production | Partly covered |
| Budgeting | success with bad unit economics | Agent Budget Lab | Production | Backlog |

## Track 05 — Evaluation & Reliability

| Concept | Failure mode | Candidate Lab | Tier | Status |
|---|---|---|---|---|
| Evaluation design | aggregate hides critical regression | Evaluation Failure Lab | Preview | Done |
| Dataset coverage | demo-biased confidence | Dataset Coverage Lab | Foundations | Partly covered |
| Rubrics / judge | grader ambiguity | LLM Judge Bias Lab | Production | Partly covered |
| Regression testing | average improves while slice regresses | Regression Detection Lab | Foundations | Covered in v1 |
| Statistical confidence | underpowered test treated as proof | Statistical Significance Lab | Production | Intro covered |
| Cost-aware eval | quality win loses economically | Cost-per-Success Lab | Production | Intro covered |
| Trajectory eval | final answer passes despite bad process | Trajectory Evaluation Lab | Production | Backlog |

## Track 06 — Production AI

| Concept | Failure mode | Candidate Lab | Status |
|---|---|---|---|
| Prompt caching | stale-prefix assumptions | Prompt Cache Lab | Backlog |
| Model routing | cheap route harms hard cases | Model Routing Lab | Backlog |
| Latency vs quality | SLO conflict | Latency vs Quality Lab | Backlog |
| Guardrails | false positives vs unsafe misses | Guardrail Failure Lab | Backlog |
| Observability | aggregate telemetry hides cause | Trace Diagnosis Lab | Backlog |
| Inference economics | throughput harms goodput | Inference Economics Lab | Later |

## Track 07 — Multi-Agent Systems

| Concept | Failure mode | Candidate Lab | Status |
|---|---|---|---|
| Workflow graph | cycles / joins / shared-state failures | Agent Workflow Graph Lab | Backlog after Alpha |
| Delegation | wrong specialist | Delegation Failure Lab | Backlog |
| Context isolation | state leaks / missing state | Context Isolation Lab | Backlog |
| Coordination | communication overhead | Coordination Cost Lab | Backlog |
| Consensus | agents reinforce same error | Consensus Failure Lab | Later |

## Track 08 — Build Systems

Content MVP capstone:

### Reliable Support Agent Build — **Next**

```text
Retrieval configuration
+ Context compression policy
+ Tool / retry / termination policy
+ Approval boundary
+ Evaluation / release gate
+ Cost / latency budget
        ↓
Architecture decision
+ Trade-off explanation
+ Release decision
```

Future projects:

```text
Production RAG Challenge
MCP Tool System Challenge
Production AI Architecture Challenge
```

Build projects should require engineering decisions rather than code-copying.

## Content MVP stop line

```text
Token Playground               done
Context Window Lab             done
Agent Loop Simulator           done

RAG Failure Lab                done
Agent Reliability Lab          done
Evaluation Failure Lab         done
Context Compression Lab        done
Reliable Support Agent Build   next

        ↓
UX / technical-content review
        ↓
Platform Launch Gate
        ↓
Soft Alpha with 20–50 developers
```

Dedicated Prompt / Graph Labs do not block this stop line.

## Free vs paid boundary

### Free / acquisition

- core mental models;
- selected foundational simulations;
- public guides / curriculum map;
- rotating Production Lab previews;
- enough interaction to understand the AhaFrame method before purchase.

### Foundations / paid hypothesis

- full failure simulations;
- evaluation challenges;
- production trade-off Labs;
- integrated Build Projects;
- later: durable checkpoints / cloud progress.

### Production Labs / future subscription hypothesis

- continuously growing production scenarios;
- advanced compare / replay workflows;
- Live Mode where real compute validates simulation predictions;
- metered compute, never unlimited AI usage.

## Lab selection rubric

A new Lab should satisfy most of these:

1. Is there a real engineering decision?
2. Can a plausible failure be made visible?
3. Does changing a parameter create a meaningful trade-off?
4. Can v1 be deterministic and cheap?
5. Does the learner leave with a reusable mental model?
6. Does it connect to another Lab or Build Challenge?
7. Is it materially better than reading a tutorial or asking a chatbot?

If mostly no, use a guide, glossary, or reference instead.

## Maintenance rule

External repositories are references, not runtime dependencies. Curriculum changes only when a topic strengthens AhaFrame's product thesis or learning path.

Canonical decision rule:

> **Do not maximize lesson count. Maximize the number of production decisions a learner can reason about correctly.**
