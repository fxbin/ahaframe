# AhaFrame Lab / Simulation Engine — v0.3

Date: 2026-08-13
Status: active architecture contract

## Purpose

AhaFrame should not implement every interactive lesson as a one-off JavaScript demo. The Lab Engine provides a small deterministic runtime that lets many AI-engineering Labs share the same execution model while keeping the visual layer independent.

> **Simulate the concept. Spend compute only to validate reality.**

The Engine is client-side and dependency-free. It does not require a model API, database, server process, or application framework.

## Core model

```text
Scenario
   ↓
Initial State
   ↓
Action
   ↓
Reducer
   ↓
New State
   ↓
Derived View / Metrics
   ↓
Adapter renders the DOM
```

Reusable primitives:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

## Runtime files

```text
src/assets/lab-engine.js                    generic state/simulation runtime
src/assets/lab-scenarios.js                 shared deterministic scenarios

src/assets/token.js                         Token adapter
src/assets/context.js                       Context Window adapter
src/assets/agent.js                         Agent Loop adapter
src/assets/rag.js                           RAG Failure adapter
src/assets/agent-reliability.js             Agent Reliability adapter

src/assets/evaluation-scenario.js           Evaluation page-specific scenario
src/assets/evaluation.js                    Evaluation adapter

src/assets/context-compression-scenario.js  Context Compression page-specific scenario
src/assets/context-compression.js           Context Compression adapter

src/assets/home.js                          homepage Token adapter
scripts/test_lab_engine.js                  behavioral regression tests
```

Standard load order:

```text
lab-engine.js
    ↓
lab-scenarios.js
    ↓
page-specific scenario module (when needed)
    ↓
page adapter
```

Page-specific scenarios keep the common registry compact without changing the generic Engine contract.

## Scenario contract

```js
AhaFrame.registerLabScenario({
  id: 'example-lab',
  version: '1.0.0',
  title: 'Example Lab',
  initialState: {
    parameter: 1,
  },
  reduce(state, action) {
    return {...state};
  },
  derive(state) {
    return {
      value: state.parameter * 2,
      metrics: {
        score: state.parameter,
      },
    };
  },
});
```

Rules:

- `state` is a plain serializable object;
- reducers return a new valid state object;
- reducers do not access DOM, timers, network, or browser effects;
- deterministic Labs return the same output for the same initial state and action sequence;
- `derive()` computes display data and metrics without mutating state;
- invalid / unsupported actions fail explicitly;
- browser timers, external APIs, rendering, and product analytics live outside the reducer.

## Engine API

```js
const lab=AhaFrame.createLab('context-window');

lab.dispatch('SELECT_STRATEGY',{strategy:'rag'});
lab.subscribe(({state,derived})=>render(state,derived));
lab.getFrame();
lab.getHistory();
lab.reset();
lab.checkpoint('before-change');
lab.compare('before-change');
lab.replay(actions);
```

A frame contains:

```text
id
version
state
derived
action
historyLength
```

`compare()` compares top-level state fields and `derived.metrics` by default.

## Adapter responsibilities

A DOM adapter may:

- read sliders / buttons / selects;
- dispatch semantic actions;
- render scenario-derived data;
- own browser-only effects such as timers;
- emit semantic product analytics.

It must not duplicate scenario calculations or state transitions.

## Analytics boundary

The Lab Engine does **not** emit analytics by default.

Product events remain adapter-owned. Optional low-level tracking can be enabled explicitly:

```js
AhaFrame.createLab('example-lab',{track:true});
```

This prevents high-frequency controls from creating duplicate analytics noise.

## Current scenarios

### Token Playground

State:

```text
temperature
sampling
```

Derived:

```text
candidate probabilities
selected token
entropy
```

The homepage Token preview and full lesson share the same scenario math.

### Context Window Lab

State:

```text
strategy
```

Derived:

```text
active tokens
released tokens
headroom
utilization
strategy explanation
```

### RAG Failure Lab

First Production Lab pressure test.

State:

```text
chunkSize
overlap
topK
retrieval
reranker
contextBudget
```

Derived:

```text
recall
precision
noise
context tokens
overflow
latency
cost index
answer quality
failure diagnosis
```

The adapter checkpoints the broken baseline and compares the learner's current retrieval policy against it.

### Agent Reliability Lab

Second Production Lab pressure test.

State:

```text
maxSteps
retryLimit
timeoutSec
validation
humanApproval
termination
```

Derived:

```text
success rate
runaway risk
unsafe-action risk
expected steps
latency
cost index
human reviews / 100 runs
reliability score
failure diagnosis
```

The scenario demonstrates that retries and step budgets can improve completion while increasing loop risk and cost; validation / approval reduce safety risk but add overhead.

### Evaluation Failure Lab

Third Production Lab pressure test and first page-specific scenario.

Scenario id:

```text
evaluation-failure
```

State:

```text
datasetPreset
passThreshold
safetyVeto
sampleSize
judgeMode
costGate
```

Derived:

```text
slice scores / weights
aggregate v1 / v2 / delta
regressions
critical regressions
evidence width
judge noise / coverage
evaluation cost
cost per success
SHIP / BLOCK / INCONCLUSIVE
failure diagnosis
```

On mount:

```js
lab.checkpoint('naive-eval');
```

The Lab proves that a better evaluation policy can improve the **release decision** without improving the candidate system itself.

### Context Compression Lab

Fourth Production Lab pressure test and second page-specific scenario.

Scenario id:

```text
context-compression
```

Implementation:

```text
src/assets/context-compression-scenario.js
src/assets/context-compression.js
```

State:

```text
compressionRatio
summaryDepth
retrievalBudget
memoryBudget
protectCritical
```

Actions:

```text
SET_COMPRESSION_RATIO
SET_SUMMARY_DEPTH
SET_RETRIEVAL_BUDGET
SET_MEMORY_BUDGET
SET_PROTECT_CRITICAL
APPLY_BALANCED_PRESET
```

Derived:

```text
original tokens
active context tokens
fixed context budget
token savings
per-segment token retention
per-segment semantic retention
critical-information retention
evidence coverage
instruction retention
task quality
hallucination-risk index
latency index
cost index
overflow tokens
failure diagnosis
```

On mount:

```js
lab.checkpoint('over-compressed-baseline');
```

The initial state deliberately compresses the 25.5k synthetic working set to about 7.4k tokens. That looks cheap but destroys modeled task-critical information.

The balanced preset intentionally **increases active context** relative to the broken baseline while remaining below 16k and restoring modeled critical retention and task quality.

A separate invariant demonstrates the opposite failure: retaining nearly everything can maximize modeled quality while overflowing the fixed working-context budget.

This Lab adds no generic Engine primitive. It uses State → Reducer → Derived Metrics → checkpoint / compare exactly as the previous scenarios do.

See `docs/CONTEXT_COMPRESSION_LAB.md`.

### Agent Loop Simulator

State:

```text
step
failure
```

Derived:

```text
current status
final result
progress
completion / failure flags
```

Browser timers remain in the adapter so reset and recovery effects cannot leak into the reducer.

## Current pressure-test coverage

The Engine has now been exercised by four distinct Production Lab shapes:

```text
RAG Failure
  multi-parameter optimization
  context arithmetic
  baseline comparison

Agent Reliability
  execution policy
  safety / risk trade-offs
  human-in-the-loop overhead
  baseline comparison

Evaluation Failure
  fixed system data + configurable decision policy
  dataset weighting
  hard gates
  evidence strength
  three-state release outcome

Context Compression
  resource allocation
  per-segment semantic retention
  admission budget vs summarization
  quality / capacity / cost trade-off
  safer policy can intentionally spend more resources
```

No new generic Engine feature was needed for these pressure tests. Do not expand the Engine speculatively.

## Determinism and claims

Production Lab metrics are synthetic and pedagogical unless a future Live Mode explicitly reports real execution evidence.

The deterministic layer should:

- make causal relationships repeatable;
- use internally coherent arithmetic;
- label simulated rates / costs / evidence clearly;
- never present synthetic data as external benchmark evidence.

A future Live Mode may compare simulation predictions with real model / retrieval / tool behavior without replacing the simulation-first learning path.

## Testing contract

`scripts/test_lab_engine.js` verifies:

- scenario registration;
- Token / Context invariants;
- RAG broken-baseline and balanced-preset behavior;
- Agent Reliability baseline and reliability-preset behavior;
- Evaluation `SHIP / BLOCK / INCONCLUSIVE` invariants;
- safety / cost gates and evidence width;
- Context Compression over-compressed baseline;
- Context Compression balanced policy;
- retrieval-budget starvation despite critical protection;
- context overflow when too much information is retained;
- invalid parameter rejection;
- history, checkpoint, compare, replay, and reset.

`scripts/validate.py` additionally checks:

- generated routes;
- semantic HTML / JSON-LD;
- mount points;
- page-specific script ordering;
- asset presence;
- JavaScript syntax;
- sitemap discovery;
- deployment configuration.

## Extension rule

Do not add a new Engine feature because a future Lab might need it. Add a primitive only when a real Lab cannot be expressed cleanly with:

```text
state
reducer
derived metrics
history
checkpoint
compare
replay
adapter-owned effects
```

The next Content MVP item is the **Reliable Support Agent Build** capstone. It should reuse existing scenario logic where practical rather than forcing new Engine infrastructure prematurely.
