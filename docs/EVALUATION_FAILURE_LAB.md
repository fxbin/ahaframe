# Evaluation Failure Lab — Product & Simulation Spec

Date: 2026-08-12
Status: approved next Production Lab design target

## Why this Lab exists

RAG Failure Lab teaches how a retrieval system can look plausible while wasting context and reducing answer quality.

Agent Reliability Lab teaches how an agent can complete many tasks while remaining operationally unsafe or expensive.

Evaluation Failure Lab completes the next part of the engineering loop:

```text
Build
  ↓
Observe failure
  ↓
Tune
  ↓
Evaluate
  ↓
Decide whether to ship
```

The product question is:

> **How do you know a new AI-system version is actually better, rather than merely better on an aggregate score or a convenient demo set?**

## Core aha

The learner should experience this trap directly:

```text
System A overall score: 82
System B overall score: 88

Conclusion at first glance:
SHIP B

Then inspect slices:

Simple / common cases      improve
Retrieval cases            improve
Tool-calling cases         improve
Safety-critical cases      regress badly
Long-horizon cases         regress

Real conclusion:
DO NOT SHIP YET
```

The durable mental model is:

> **Evaluation is a decision system, not a single score. Dataset coverage, slices, verifiers, uncertainty, and veto conditions determine whether an apparent improvement is trustworthy.**

## Reference synthesis

The Lab is informed by, but should not copy, two references:

### AI Engineering from Scratch

`https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/11-llm-engineering/10-evaluation`

Relevant ideas to re-model independently:

- representative evaluation datasets;
- deterministic checks, semantic/rubric judging, and human calibration;
- baseline-vs-candidate regression testing;
- confidence / sample-size awareness;
- cost and latency as evaluation dimensions;
- deployment gates rather than vibes-based review.

### AI Agent Book — Chapter 6

`https://github.com/bojieli/ai-agent-book/tree/main/chapter6`

Relevant ideas to re-model independently:

- evaluation environment and repeatable task execution;
- trajectories and process evidence, not only final answers;
- multidimensional rubrics;
- explicit verifiers and veto rules;
- statistical comparison;
- cost evidence and failure analysis.

AhaFrame will write original copy, use original synthetic data, and implement an original deterministic simulation.

## Scenario

Use the same product world as Agent Reliability Lab so the Content MVP feels connected rather than episodic.

### System under evaluation

A customer-support AI uses:

```text
Customer/account lookup
RAG policy retrieval
Tool calling
Refund recommendation / action
```

The team has created **Agent v2** after tuning retrieval and execution behavior.

A dashboard shows that v2's aggregate score is higher than v1, encouraging a fast ship decision.

The learner's job is to decide whether that conclusion survives a better evaluation design.

## Fixed system performance model

The first version should use a fixed deterministic slice matrix rather than live model outputs.

Suggested synthetic slice scores:

| Evaluation slice | v1 | v2 | Change | Interpretation |
|---|---:|---:|---:|---|
| Common FAQ | 88 | 95 | +7 | clear improvement |
| Retrieval-heavy | 79 | 91 | +12 | strong improvement |
| Tool calling | 82 | 94 | +12 | strong improvement |
| Long-horizon | 76 | 64 | -12 | hidden regression |
| Safety-critical refund | 89 | 61 | -28 | release-blocking regression |

These are teaching values, not benchmark results.

The default evaluation-set mix should be intentionally demo-biased so the aggregate favors v2.

Suggested default mix:

```text
Common FAQ              45%
Retrieval-heavy         30%
Tool calling            15%
Long-horizon             7%
Safety-critical refund   3%
```

A more production-representative mix can reveal the risk:

```text
Common FAQ              30%
Retrieval-heavy         25%
Tool calling            20%
Long-horizon            15%
Safety-critical refund  10%
```

Exact percentages may be tuned during implementation as long as the invariant remains: the default aggregate says “ship” while the critical slice says “block.”

## Learner controls

Keep v1 focused. The Lab should teach several evaluation dimensions without becoming an analytics dashboard simulator.

### 1. Dataset composition

Preset selector:

```text
Demo-biased
Production-like
Safety-heavy
```

Optional later enhancement: direct slice-weight controls.

### 2. Pass threshold

Range:

```text
70–95
```

Shows why arbitrary global thresholds do not replace per-slice requirements.

### 3. Safety veto

```text
OFF / ON
```

When enabled, a critical safety slice below its floor blocks shipment regardless of the aggregate score.

### 4. Evaluation sample size

```text
50
100
200
500
```

Used to derive a pedagogical confidence-width estimate.

The Lab should not claim statistical significance from real stochastic trials; it simulates why small samples provide weaker evidence.

### 5. Judge mode

```text
Deterministic checks
Semantic / rubric judge
Mixed evaluation
```

This should change the modeled coverage/noise trade-off rather than pretending one judge is universally best.

### 6. Cost constraint

Toggle or threshold:

```text
Ignore cost
Enforce cost-per-success budget
```

This connects evaluation quality to production economics.

## Derived metrics

The Scenario should derive at least:

```text
Aggregate Score — v1
Aggregate Score — v2
Aggregate Delta
Critical Safety Score — v2
Regression Count
Critical Regression Count
Evaluation Confidence Width
Judge Noise Index
Estimated Eval Cost
Cost per Successful Task
Ship Decision
Failure Diagnosis
```

Optional second iteration:

```text
Long-horizon score
Worst-slice score
Process-policy violation rate
```

## Decision model

The decision result should be one of:

```text
SHIP
BLOCK
INCONCLUSIVE
```

### SHIP

Only when:

- candidate meets aggregate threshold;
- no enabled veto is violated;
- no critical regression exceeds the allowed budget;
- evidence strength is adequate;
- cost constraint is satisfied when enabled.

### BLOCK

When a critical condition is clearly violated.

### INCONCLUSIVE

When the observed candidate appears better but the configured evidence is too weak for a confident release decision.

This third state is important. The lesson should not teach that every evaluation must force a binary answer.

## Failure diagnoses

The simulation should expose named failure modes instead of only changing numbers.

### `aggregate-score-trap`

The overall metric improves while a critical slice materially regresses.

### `demo-biased-dataset`

The evaluation distribution overweights easy/common cases and underweights consequential production cases.

### `underpowered-eval`

Sample size is too small to support the release decision confidently.

### `judge-mismatch`

The chosen evaluation method cannot reliably capture important semantic or process-level quality dimensions.

### `missing-veto`

A safety-critical dimension is averaged away rather than treated as a release gate.

### `economic-regression`

Quality improves but cost-per-success violates the configured production budget.

### `healthy`

The candidate improves meaningfully and passes all active release conditions.

## Lab Engine contract

Recommended scenario id:

```text
evaluation-failure
```

### State

```js
{
  datasetPreset: 'demo-biased',
  passThreshold: 80,
  safetyVeto: false,
  sampleSize: 50,
  judgeMode: 'rubric',
  costGate: false,
}
```

### Actions

```text
SET_DATASET_PRESET
SET_PASS_THRESHOLD
SET_SAFETY_VETO
SET_SAMPLE_SIZE
SET_JUDGE_MODE
SET_COST_GATE
APPLY_PRODUCTION_PRESET
```

### Derived

```text
sliceScores
aggregateV1
aggregateV2
aggregateDelta
regressions
criticalRegressions
confidenceWidth
judgeNoise
estimatedEvalCost
costPerSuccessV1
costPerSuccessV2
decision
failureType
diagnosis
metrics
```

### Checkpoint

On mount:

```text
checkpoint('naive-eval')
```

The learner should compare the improved evaluation policy to the initial naive evaluation setup.

## Recommended production preset

A one-click preset should teach the intended shape of a safer evaluation design:

```text
Dataset preset       Production-like
Pass threshold       82
Safety veto          ON
Sample size          200
Judge mode           Mixed evaluation
Cost gate            ON
```

The preset does **not** need to make v2 pass. In fact, the intended first version should reveal that a better evaluation policy correctly blocks v2 until the safety and long-horizon regressions are fixed.

This is pedagogically stronger than every AhaFrame preset magically “solving” the system.

## Interaction flow

### SEE

Show a summary card:

```text
v1 overall: 82
v2 overall: 88
Recommendation: SHIP v2
```

### PLAY

Let the learner change dataset composition, threshold, sample size, judge strategy, and gates.

### BREAK

Reveal that the naive evaluation setup itself is broken.

The system being debugged is not only the agent; it is the **evaluation process**.

### AHA

Expose slice-level regressions and explain why the aggregate hid them.

### BUILD

End with a release-gate challenge:

> Define the minimum evaluation policy you would require before shipping a customer-support agent that can perform refunds.

The learner should choose a policy, not write boilerplate code.

## UI composition

Suggested page layout:

```text
Hero / quick answer

┌──────────────────────────────┬─────────────────────────┐
│ Eval policy controls         │ Release decision        │
│                              │ SHIP / BLOCK / ?        │
│ Dataset preset               │                         │
│ Threshold                    │ Aggregate delta         │
│ Safety veto                  │ Critical regression     │
│ Sample size                  │ Confidence              │
│ Judge mode                   │ Cost per success        │
│ Cost gate                    │                         │
└──────────────────────────────┴─────────────────────────┘

Slice comparison
v1 vs v2

Naive eval checkpoint
vs
Current evaluation policy

Failure diagnosis

Concept explanation

Build challenge
```

On mobile, controls and metrics must collapse to a single column.

## Copy guardrails

The page must explicitly say that:

- all scores and costs are synthetic educational values;
- confidence behavior is pedagogical, not a result from actual repeated model runs;
- no live LLM judge is being invoked;
- the point is to understand evaluation design, not memorize universal thresholds;
- real production releases require representative data, validated graders/verifiers, and organization-specific risk criteria.

Do not publish volatile vendor pricing or model-specific claims as fixed facts inside the deterministic simulation.

## Regression-test invariants

`scripts/test_lab_engine.js` should verify at least:

1. `evaluation-failure` is registered;
2. initial demo-biased configuration gives v2 a higher aggregate score;
3. initial configuration contains a critical safety regression;
4. naive configuration can recommend SHIP because the veto is disabled;
5. enabling a production-like preset reveals / blocks the critical regression;
6. increasing sample size reduces modeled confidence width;
7. safety veto can override aggregate improvement;
8. cost gate can block an otherwise acceptable candidate when the synthetic budget is exceeded;
9. invalid thresholds, sample sizes, presets, and judge modes throw explicit errors;
10. checkpoint / compare works against `naive-eval`.

## Analytics events

Adapter-owned events:

```text
evaluation_parameter_changed
evaluation_dataset_preset_changed
evaluation_safety_veto_changed
evaluation_sample_size_changed
evaluation_judge_mode_changed
evaluation_cost_gate_changed
evaluation_production_preset_applied
evaluation_naive_baseline_reset
evaluation_build_challenge_started
evaluation_paid_intent_click
```

Do not emit every Engine action twice through engine-level tracking.

## What not to build in v1

Do not add yet:

```text
real LLM-as-judge calls
real benchmark ingestion
real confidence tests over live stochastic outputs
user-uploaded datasets
CSV analytics tooling
full tracing backend
login
cloud persistence
billing
```

Those become candidates only after the deterministic experience proves useful.

## Exit criteria

Evaluation Failure Lab is ready for implementation when the following statement is true:

> A learner can start from an apparently better candidate, modify the evaluation design, discover a hidden critical regression, and explain why the release decision changed.

If the page only teaches metric definitions, it has failed the AhaFrame product thesis.
