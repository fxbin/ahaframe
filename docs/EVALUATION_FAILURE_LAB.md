# Evaluation Failure Lab — Product & Simulation Spec

Date: 2026-08-13
Status: implemented in v0.3 Content MVP
Route: `/en/labs/evaluation-failure/`

## Why this Lab exists

RAG Failure Lab teaches how retrieval can look functional while wasting context and degrading answer quality. Agent Reliability Lab teaches how an agent can complete tasks while remaining operationally unsafe or expensive.

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

The durable mental model is:

> **Evaluation is a decision system, not a single score. Dataset coverage, slices, evidence strength, judge coverage, veto conditions, and economics determine whether an apparent improvement is trustworthy.**

## Reference synthesis

The Lab is informed by, but does not copy, two public references:

- AI Engineering from Scratch — Phase 11 / Evaluation: representative datasets, automated scoring, rubric judging, regression testing, evidence strength, cost, and deployment gates.
- AI Agent Book — Chapter 6: repeatable evaluation environments, trajectories, verifiers, multidimensional rubrics, statistical comparison, cost evidence, and failure analysis.

AhaFrame uses original English copy, original synthetic data, and an original deterministic simulation.

## Scenario

The Lab continues the customer-support product world used by Agent Reliability Lab.

The support AI uses:

```text
Customer/account lookup
RAG policy retrieval
Tool calling
Refund recommendation / action
```

The team has produced **Agent v2** after tuning retrieval and execution behavior. A headline dashboard says v2 is better, but that conclusion depends on the evaluation policy.

## Fixed synthetic slice model

| Evaluation slice | v1 | v2 | Delta | Role |
|---|---:|---:|---:|---|
| Common FAQ | 88 | 95 | +7 | clear improvement |
| Retrieval-heavy | 79 | 91 | +12 | strong improvement |
| Tool calling | 82 | 94 | +12 | strong improvement |
| Long-horizon | 76 | 64 | -12 | hidden regression |
| Safety-critical refund | 89 | 61 | -28 | critical regression |

These values are teaching data, not benchmark results.

### Dataset presets

```text
Demo-biased
Common FAQ              45%
Retrieval-heavy         30%
Tool calling            15%
Long-horizon             7%
Safety-critical refund   3%

Production-like
Common FAQ              30%
Retrieval-heavy         25%
Tool calling            20%
Long-horizon            15%
Safety-critical refund  10%

Safety-heavy
20% each slice
```

The naive demo-biased aggregate makes v2 look clearly stronger even though the critical refund slice regresses by 28 points.

## Learner controls

```text
Dataset preset       Demo-biased / Production-like / Safety-heavy
Pass threshold       70–95
Safety veto          OFF / ON
Sample size          50 / 100 / 200 / 500
Judge mode           Deterministic / Rubric / Mixed
Cost gate            OFF / ON
```

The controls change the release-evaluation policy. They do not mutate the fixed v1/v2 slice scores.

## Implemented state contract

Scenario id:

```text
evaluation-failure
```

Initial state:

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

Actions:

```text
SET_DATASET_PRESET
SET_PASS_THRESHOLD
SET_SAFETY_VETO
SET_SAMPLE_SIZE
SET_JUDGE_MODE
SET_COST_GATE
APPLY_PRODUCTION_PRESET
```

Derived data:

```text
sliceScores
aggregateV1
aggregateV2
aggregateDelta
regressions
criticalRegressions
confidenceWidth
evidenceAdequate
judgeNoise
judgeCoverage
estimatedEvalCost
costPerSuccessV1
costPerSuccessV2
decision
failureType
diagnosis
metrics
```

Runtime files:

```text
src/assets/evaluation-scenario.js   deterministic scenario
src/assets/evaluation.js            DOM adapter + analytics
scripts/ahaframe/evaluation.py      static page builder
```

The scenario is page-specific: the generic Lab Engine loads first, the shared scenario registry loads second, then `evaluation-scenario.js`, then the adapter. No generic Engine change was required.

## Decision model

Release outcome is one of:

```text
SHIP
BLOCK
INCONCLUSIVE
```

### SHIP

Used when the candidate clears the configured aggregate threshold, no active hard gate is violated, and modeled evidence is strong enough.

### BLOCK

Used when a configured hard condition is clearly violated. In v1 this includes:

- safety-veto violation;
- cost-per-success gate violation;
- failure to meet the aggregate release condition.

### INCONCLUSIVE

Used when the candidate appears better but the modeled evidence width is too large relative to the improvement.

This third state is deliberate: an evaluation process should be able to say **“we do not know yet.”**

## Pedagogical evidence model

Evidence width is deterministic and decreases with larger sample size. Judge mode adds a modeled coverage/noise penalty.

This is not a real confidence interval calculated from stochastic model trials. It is a teaching mechanism for the principle that:

```text
more representative evidence + more samples
            ↓
stronger release confidence
```

while also showing that more samples do not repair a biased dataset.

Judge modes model three trade-offs:

```text
Deterministic checks   cheap / stable / narrower coverage
Rubric judge           broader semantics / noisier / more costly
Mixed evaluation       strongest modeled coverage / additional cost
```

No live LLM judge is invoked.

## Economics model

The simulation exposes:

```text
Estimated evaluation cost index
Cost per successful task — v1
Cost per successful task — v2
```

Synthetic v2 task cost is intentionally higher, allowing the cost gate to block a candidate that might otherwise clear the quality policy.

The values are cost units, not vendor pricing.

## Failure diagnoses

Implemented failure types:

```text
aggregate-score-trap
  a critical regression invalidates the headline aggregate

demo-biased-dataset
  easy/common cases dominate the evaluation distribution

underpowered-eval
  apparent improvement is smaller than the modeled evidence width

judge-mismatch
  selected judge strategy has insufficient modeled coverage

missing-veto
  critical regression is averaged away rather than gated

economic-regression
  quality is acceptable but cost-per-success violates the active budget

healthy
  active release conditions and evidence support the decision
```

## Baseline and production preset

On mount, the adapter saves:

```text
checkpoint('naive-eval')
```

The naive baseline uses:

```text
Dataset             Demo-biased
Threshold           80
Safety veto         OFF
Sample size         50
Judge               Rubric
Cost gate           OFF
```

It intentionally returns:

```text
v2 aggregate > v1 aggregate
critical safety regression exists
Decision: SHIP
```

The one-click production preset uses:

```text
Dataset             Production-like
Threshold           82
Safety veto         ON
Sample size         200
Judge               Mixed
Cost gate           ON
```

It intentionally returns:

```text
Decision: BLOCK
```

because a better evaluation policy correctly exposes the unresolved critical regression. The preset improves the **decision process**, not the candidate system.

## Interaction flow

### SEE

The learner sees a candidate that appears better overall.

### PLAY

The learner changes dataset composition, threshold, sample size, judge strategy, and release gates.

### BREAK

The learner discovers that the naive evaluation process itself is broken.

### AHA

Slice-level regressions, evidence strength, vetoes, and economics explain why the release decision changes.

### BUILD

The page ends with a policy challenge:

> Define the minimum release gate you would require before shipping a customer-support agent that can perform refunds.

The task is to choose a defensible policy, not copy boilerplate code.

## Analytics boundary

Adapter-owned events include:

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

The generic Engine remains analytics opt-in and does not duplicate high-frequency control events.

## Regression-test invariants

`scripts/test_lab_engine.js` now verifies:

1. `evaluation-failure` is registered;
2. demo-biased baseline gives v2 a higher aggregate;
3. the candidate contains a -28 critical safety regression;
4. naive evaluation can return `SHIP` when hard gates are disabled;
5. production preset returns `BLOCK` because the safety regression remains;
6. increasing sample size reduces modeled evidence width;
7. production-like evaluation at small sample size can return `INCONCLUSIVE`;
8. a safety veto overrides aggregate improvement;
9. a cost gate can independently block an otherwise acceptable candidate;
10. invalid threshold, sample size, dataset preset, and judge mode fail explicitly;
11. checkpoint / compare works against `naive-eval`.

## Copy and claims guardrails

The page explicitly communicates that:

- slice scores and costs are synthetic educational values;
- evidence-width behavior is pedagogical, not the result of real repeated model runs;
- no live LLM judge is invoked;
- there are no universal thresholds embedded in the Lab;
- production releases require representative data, validated graders/verifiers, and organization-specific risk criteria.

Do not publish volatile vendor pricing or imply these synthetic values are benchmark evidence.

## v1 non-goals

```text
real LLM-as-judge calls
real benchmark ingestion
real statistical tests over live stochastic outputs
user-uploaded datasets
CSV analytics tooling
full tracing backend
login
cloud persistence
billing
```

## Exit result

The implemented Lab satisfies the intended experience when a learner can:

> Start from an apparently better candidate, modify the evaluation design, discover a hidden critical regression, and explain why the release decision changes from `SHIP` to `BLOCK` or `INCONCLUSIVE`.
