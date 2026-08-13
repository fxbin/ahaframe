# Context Compression Lab — product and simulation specification

Date: 2026-08-13
Status: implemented in Content MVP
Route: `/en/labs/context-compression/`

## Product question

> When context compression reduces tokens, latency, and cost, what task-critical information gets lost?

This Lab continues the refund-capable customer-support world used by Agent Reliability and Evaluation Failure. The learner is not asked to minimize context. The learner is asked to design a **defensible working-context policy** under a fixed 16,000-token production budget.

## Mental model

```text
Application state
      ↓
Context assembly
      ↓
Retrieval / memory admission
      ↓
Compression / summarization
      ↓
Working context
      ↓
Model behavior
```

The central lesson is:

> **Context compression is an information-selection problem, not a token-minimization problem.**

A summarizer cannot preserve evidence that retrieval never admitted, and a larger context is not automatically better if it violates latency, cost, or capacity constraints.

## Synthetic original working set

The deterministic scenario starts from 25,500 synthetic tokens:

| Segment | Tokens | Role | Critical |
|---|---:|---|---|
| System + safety policy | 1,400 | Instructions | yes |
| Current customer request | 900 | Task | yes |
| Account + eligibility state | 1,800 | Evidence | yes |
| Refund policy | 2,600 | Evidence | yes |
| Retrieved order evidence | 4,200 | Retrieval | yes |
| Recent conversation | 4,800 | Conversation | no |
| Long-term memory | 3,000 | Memory | no |
| Prior tool trace | 2,600 | Tool state | no |
| Product background | 4,200 | Reference | no |

The fixed teaching budget is 16,000 active tokens.

## Controls

```text
Compression ratio       20–85%
Summary depth           shallow / balanced / deep
Retrieval budget        800–4,200 tokens
Memory budget           0–3,000 tokens
Critical-fact protection ON / OFF
```

### Initial broken baseline

```text
Compression ratio       72%
Summary depth           shallow
Retrieval budget        1,600
Memory budget           600
Critical protection     OFF
```

The baseline is deliberately attractive on cost: it keeps only about 7.4k active tokens and saves more than 70% of the original working set. The failure is semantic: critical retention and task quality collapse.

### Balanced teaching preset

```text
Compression ratio       58%
Summary depth           balanced
Retrieval budget        3,000
Memory budget           900
Critical protection     ON
```

The preset does **not** minimize tokens and does not maximize quality. It is designed to land inside the 16k budget while restoring critical-information retention and task quality at materially higher cost than the broken baseline.

## Derived signals

All values are deterministic educational quantities:

```text
Active context tokens
Token savings %
Critical-information retention %
Evidence coverage %
Instruction retention %
Task quality score
Hallucination-risk index
Latency index
Cost index
Context overflow tokens
Failure diagnosis
```

Semantic retention intentionally differs from raw token retention so the learner can see that a deeper summary may preserve more useful meaning per token. This is a teaching abstraction, not a tokenizer or summarizer benchmark.

## Failure taxonomy

```text
critical-information-loss
retrieval-budget-starvation
evidence-starvation
instruction-loss
quality-regression
context-budget-overflow
cost-heavy-context
healthy
```

Important interactions:

1. **Aggressive compression without protection** can look excellent on savings while dropping task-critical policy and evidence.
2. **Critical-fact protection cannot repair admission failure.** If retrieval budget excludes order evidence, a later summarizer cannot restore it.
3. **Under-compression can also fail.** Retaining nearly everything can produce excellent modeled quality while overflowing the 16k production budget.
4. A defensible policy must therefore balance capacity, semantic retention, task quality, latency, and cost.

## Engine contract

The Lab uses the existing generic engine unchanged:

```text
context-compression scenario
      ↓
State
      ↓
Reducer
      ↓
Derived metrics / diagnosis
      ↓
DOM adapter
```

It creates an `over-compressed-baseline` checkpoint and uses Engine `compare()` to show how the current policy differs from that baseline.

The page-specific scenario module loads after the shared scenario registry and before the DOM adapter:

```text
lab-engine.js
lab-scenarios.js
context-compression-scenario.js
context-compression.js
```

## Validation invariants

Behavioral tests lock these product properties:

- baseline saves >70% of tokens but has <40% critical retention and <40 task quality;
- balanced preset stays inside 16k, saves >42%, restores >85% critical retention, and reaches >85 task quality;
- starving retrieval produces a retrieval-budget failure even with critical protection enabled;
- retaining nearly everything can overflow the fixed context budget;
- invalid compression, summary, retrieval, and memory parameters fail explicitly;
- checkpoint comparison shows that safer compression may intentionally spend more context than the broken baseline.

## What this Lab does not claim

It does not run:

- a live LLM;
- a live summarizer;
- a tokenizer;
- a vector store;
- customer-support traffic;
- measured hallucination probabilities;
- universal production thresholds.

Real compression policies require representative tasks, model-specific evaluation, freshness and conflict rules, and workload-specific latency/cost measurements.

## Content MVP role

This is the final standalone Production Lab before the **Reliable Support Agent Build** capstone.

The capstone should reuse the mental model here:

```text
Retrieval policy
+ Context policy
+ Agent control policy
+ Approval boundary
+ Evaluation gate
+ Cost / latency budget
        ↓
Defensible production architecture
```
