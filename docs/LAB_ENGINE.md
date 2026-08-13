# AhaFrame Lab / Simulation Engine — v0.3

Date: 2026-08-13

## Purpose

AhaFrame should not implement every interactive lesson as a one-off JavaScript demo. The Lab Engine provides a small deterministic runtime that lets many AI-engineering labs share the same execution model while keeping the visual layer independent.

> **Simulate the concept. Spend compute only to validate reality.**

The engine is intentionally client-side and dependency-free. It does not require a model API, database, server process, or application framework.

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

A Lab can also use:

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
src/assets/lab-engine.js             generic state/simulation runtime
src/assets/lab-scenarios.js          shared deterministic scenarios
src/assets/token.js                  Token Playground adapter
src/assets/context.js                Context Window adapter
src/assets/agent.js                  Agent Loop adapter
src/assets/rag.js                    RAG Failure adapter
src/assets/agent-reliability.js      Agent Reliability adapter
src/assets/evaluation-scenario.js    Evaluation Failure page-specific scenario
src/assets/evaluation.js             Evaluation Failure adapter
src/assets/home.js                   homepage Token adapter
scripts/test_lab_engine.js           behavioral regression tests
```

The standard page builder loads:

```text
lab-engine.js
    ↓
lab-scenarios.js
    ↓
page-specific scenario module (when needed)
    ↓
page adapter
```

Evaluation Failure is the first Lab to use a page-specific scenario module. This lets the common scenario registry stay compact without modifying the generic Engine contract.

## Scenario contract

A scenario is registered with:

```js
AhaFrame.registerLabScenario({
  id: 'example-lab',
  version: '1.0.0',
  title: 'Example Lab',
  initialState: {
    parameter: 1,
  },
  reduce(state, action) {
    // Return the next plain state object.
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

- `state` must be a plain serializable object;
- reducers return a new valid state object for every supported action;
- reducers must not access the DOM;
- deterministic Labs produce the same state/derived output for the same initial state and action sequence;
- `derive` computes display data and metrics without mutating state;
- external API calls, timers, browser events, and rendering belong outside the reducer;
- unknown or invalid actions fail explicitly.

## Engine API

```js
const lab = AhaFrame.createLab('context-window');

lab.dispatch('SELECT_STRATEGY', {strategy: 'rag'});
lab.subscribe(({state, derived}) => render(state, derived));
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

`compare()` compares top-level state fields and `derived.metrics` by default. A scenario may provide a custom domain-specific compare function later.

## Adapter responsibilities

A DOM adapter may:

- read sliders, buttons, selects, or other controls;
- dispatch semantic actions;
- render state and derived data;
- manage browser-only effects such as timers;
- emit semantic product analytics events.

It must not duplicate the scenario's calculations or state transitions.

The Token probability transform exists once in the Token scenario and is shared by both the homepage demo and the full Token lesson. The same rule applies to Production Labs: domain calculations belong in scenarios, not HTML adapters.

## Analytics boundary

The Lab Engine does **not** emit analytics by default. Product events remain owned by adapters.

Engine-level `lab_action` / `lab_reset` events are opt-in:

```js
AhaFrame.createLab('example-lab', {track: true});
```

This avoids duplicate high-frequency events from controls such as sliders.

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

The first Production Lab pressure test.

State:

```text
chunkSize
overlap
topK
retrieval
reranker
contextBudget
```

Actions include:

```text
SET_CHUNK_SIZE
SET_OVERLAP
SET_TOP_K
SET_RETRIEVAL
SET_RERANKER
APPLY_BALANCED_PRESET
```

Derived:

```text
recall
precision
noise
context tokens
overflow tokens
context utilization
latency estimate
cost index
answer-quality score
failure diagnosis
```

The adapter saves the intentionally broken starting state as `baseline` and continuously compares the current configuration against it.

### Agent Reliability Lab

The second Production Lab pressure test and the first focused on execution-policy and safety trade-offs.

State:

```text
maxSteps
retryLimit
timeoutSec
validation
humanApproval
termination
```

Actions include:

```text
SET_MAX_STEPS
SET_RETRY_LIMIT
SET_TIMEOUT
SET_VALIDATION
SET_HUMAN_APPROVAL
SET_TERMINATION
APPLY_RELIABILITY_PRESET
```

Derived:

```text
success rate
runaway risk
unsafe-action risk
expected steps
simulated latency
cost index
human reviews / 100 runs
reliability score
failure diagnosis
```

The scenario demonstrates that more retries and step budget can raise completion while also increasing loop risk and cost. Validation and approval reduce safety risk but add overhead. The adapter saves `baseline` and compares every policy against the unreliable starting state.

### Evaluation Failure Lab

The third Production Lab pressure test. Unlike RAG and Agent Reliability, the learner is not primarily tuning the candidate system; the learner is debugging the **decision process used to evaluate it**.

Scenario id:

```text
evaluation-failure
```

Implementation is page-specific in `src/assets/evaluation-scenario.js` and is loaded after the shared registry.

State:

```text
datasetPreset
passThreshold
safetyVeto
sampleSize
judgeMode
costGate
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

Derived:

```text
slice scores / weights
aggregate v1 / v2 / delta
regressions
critical regressions
modeled evidence width
judge noise / coverage
estimated evaluation cost
cost per success
SHIP / BLOCK / INCONCLUSIVE
failure diagnosis
```

On mount, the adapter saves:

```js
lab.checkpoint('naive-eval');
```

The initial evaluation can say `SHIP` even though a critical safety slice regresses, illustrating a demo-biased / missing-gate failure. The production preset changes dataset composition, sample size, judge strategy, and hard gates; it intentionally produces `BLOCK` while the candidate's critical regression remains.

This Lab also establishes that a preset does not have to optimize the simulated system. It can improve the **quality of an engineering decision**.

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

The Engine has now been exercised by three distinct Production Lab shapes:

```text
RAG Failure
  multi-parameter optimization
  context arithmetic
  baseline comparison

Agent Reliability
  execution policy
  risk / safety trade-offs
  human-in-the-loop cost
  baseline comparison

Evaluation Failure
  fixed system data + configurable decision policy
  dataset weighting
  hard gates
  evidence strength
  three-state release outcome
  naive-evaluation comparison
```

No new generic Engine primitive was needed for Evaluation Failure. This is evidence that the current abstraction remains sufficient; do not expand the Engine speculatively.

## Determinism and claims

Production Lab metrics are synthetic and pedagogical unless a future Live Mode explicitly reports real executions.

The deterministic layer should:

- make causal relationships repeatable;
- use internally coherent arithmetic;
- label simulated rates/costs/evidence clearly;
- never present synthetic data as external benchmark evidence.

A future Live Mode can compare predicted trade-offs against real model/retrieval/tool results without replacing the simulation-first learning path.

## Testing contract

`scripts/test_lab_engine.js` verifies:

- scenario registration;
- core Token / Context invariants;
- RAG broken-baseline and balanced-preset behavior;
- Agent Reliability baseline and reliability-preset behavior;
- Evaluation Failure `SHIP / BLOCK / INCONCLUSIVE` decision invariants;
- safety and cost gates;
- modeled evidence-width behavior;
- invalid input rejection;
- history, checkpoints, compare, replay, and reset.

`scripts/validate.py` additionally checks generated routes, semantic HTML/JSON-LD, asset presence/order, JavaScript syntax, sitemap discovery, and deployment configuration.

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

The next Product Lab should pressure-test the existing contract before the Engine grows again.
