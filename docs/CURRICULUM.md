# AhaFrame Curriculum — Canonical Entry

Date: 2026-08-27  
Status: **active curriculum source of truth**

The active learner-facing curriculum is:

> [`docs/CURRICULUM_V0_9.md`](./CURRICULUM_V0_9.md) — **Complete AI Engineering Learning Path**

The previous v0.8 source remains preserved for provenance:

> [`docs/CURRICULUM_V0_8.md`](./CURRICULUM_V0_8.md) — Game Learning & Production Incident Edition

## Product thesis

> **Learn AI Engineering by surviving production incidents.**

AhaFrame is designed for experienced software engineers moving into production AI Engineering. It is not a 500-lesson encyclopedia and does not require learners to begin with a complete math/ML curriculum.

## Learner-facing path

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

The six engineering layers remain the internal cognitive framework:

```text
Prompt Engineering      shapes behavior
Context Engineering     shapes knowledge
Harness Engineering     shapes reliability
Loop Engineering        shapes iteration
Graph Engineering       shapes orchestration
Evaluation Engineering  proves whether it works
```

They are not the primary course-navigation hierarchy.

## Learning loop

```text
See the failure
→ Inspect evidence
→ Form a hypothesis
→ Change one bounded decision
→ Run / replay
→ Observe consequences
→ Compare
→ Explain
→ Transfer
→ Review later
```

## Canonical v0.9 boundaries

`CURRICULUM_V0_9.md` defines:

- the complete 10-stage learner path;
- **52** decision-changing mental models with stable IDs;
- primary teaching format for every model;
- prerequisite edges;
- EN/zh-CN terminology keys;
- current coverage and version-sensitivity markers;
- a complete audit of the prior v0.8 38-model graph;
- specialist-path projections without duplicate curricula;
- flagship Incident / Build / Final Boss dependencies;
- version-sensitive policy for MCP, provider APIs, tracing and cost data;
- explicit exclusions that keep AhaFrame focused on production engineering judgment.

## Current source-use invariant

AhaFrame may study external material for concepts, coverage gaps, protocol facts and experiment methodology, but AhaFrame scenarios, prose, diagrams, evidence, controls, formulas, simulations and debriefs remain original.

Research provenance includes:

- `https://github.com/rohitg00/ai-engineering-from-scratch`
- `https://github.com/bojieli/ai-agent-book`
- MCP specification / release material, currently anchored to `2026-07-28`
- current provider/research engineering material where implementation details are version-sensitive

The canonical stable model IDs must not churn merely because a provider changes an API name.

## Downstream contract

```text
#118 canonical curriculum
        ↓
#119 machine-readable content-node contract
        ↓
#124 progression / Knowledge Map semantics
        ↓
#131 homepage Learning Map projection
```

The older v1.1 taxonomy-first curriculum remains available through git history; v0.8 remains available as a versioned provenance document.

Refs: #117 #118 #119 #120 #121 #122 #123 #124 #125 #83 #84
