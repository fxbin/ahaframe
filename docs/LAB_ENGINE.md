# AhaFrame Lab / Simulation Engine — v0.3

Date: 2026-08-12

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

A complete lab can also use:

```text
History
Checkpoint
Compare
Replay
Failure Injection
```

## Runtime files

```text
src/assets/lab-engine.js          generic state/simulation runtime
src/assets/lab-scenarios.js       deterministic scenario definitions
src/assets/token.js               Token Playground DOM adapter
src/assets/context.js             Context Window DOM adapter
src/assets/agent.js               Agent Loop DOM adapter
src/assets/rag.js                 RAG Failure Lab DOM adapter
src/assets/agent-reliability.js   Agent Reliability Lab DOM adapter
src/assets/home.js                homepage Token Playground adapter
scripts/test_lab_engine.js        behavioral regression tests
```

The page builder emits the engine before the scenario registry and page adapters.

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
    // return the next plain state object
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

### Rules

- `state` must be a plain serializable object;
- reducers return a new valid state object for every supported action;
- reducers must not access the DOM;
- deterministic labs should produce the same state for the same initial state and action sequence;
- `derive` computes display data and metrics from state without mutating state;
- external API calls, timers, browser events, and rendering belong outside the scenario reducer;
- unknown or invalid actions should fail explicitly.

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

`compare()` compares top-level state fields and `derived.metrics` by default. A scenario may provide its own domain-specific compare function later.

## Adapter responsibilities

A DOM adapter may:

- read sliders, buttons, selects, or other user controls;
- dispatch semantic actions;
- render state / derived data;
- manage browser-only effects such as timers;
- emit product analytics events.

It must not duplicate the scenario's core calculations or state transitions.

The Token probability transform now exists once in the Token scenario and is shared by both the homepage demo and the full lesson.

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

Derived data:

```text
candidate probabilities
selected token
entropy metric
```

### Context Window Lab

State:

```text
strategy
```

Derived data:

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

Derived data:

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

The adapter saves the intentionally bad starting state as a checkpoint and continuously uses `compare('baseline')` to show how the learner's configuration changes quality and context pressure.

### Agent Reliability Lab

The second Production Lab pressure test and the first one focused on policy/safety trade-offs rather than retrieval optimization.

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

Derived data:

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

The scenario is deliberately structured so one metric cannot be optimized in isolation. More retries and step budget may raise completion while also increasing loop risk and cost. Validation and approval reduce safety risk but add execution overhead. Goal-aware termination improves boundedness without pretending that max-step exhaustion is a sufficient stopping policy.

The adapter saves the unreliable starting state as a checkpoint and compares every learner configuration against that baseline.

All RAG and Agent Reliability metrics are synthetic and pedagogical. They are not benchmark results from live models, tools, vector databases, customer-support traffic, or human-review queues.

### Agent Loop Simulator

State:

```text
step
failure
```

Actions include:

```text
NEXT
INJECT_TOOL_ERROR
RECOVER_TOOL_ERROR
```

The browser adapter owns the recovery timer and cancels stale timers on Reset / Next; the scenario owns the deterministic transition.

## Testing contract

`scripts/test_lab_engine.js` verifies:

- scenario registration;
- Token probability invariants;
- Context arithmetic;
- RAG broken-baseline metrics and balanced-preset improvement;
- Agent Reliability unreliable-baseline metrics and reliability-preset improvement;
- baseline checkpoint / compare behavior for both Production Labs;
- Agent Loop error / recovery transitions;
- history / checkpoint / compare / replay / reset;
- invalid-input rejection.

`python3 scripts/validate.py` also runs the engine test and verifies generated interactive pages load `lab-engine.js` before `lab-scenarios.js`.

## What the engine intentionally does not do yet

- real LLM inference;
- real embeddings / vector databases;
- server persistence;
- user accounts;
- code sandbox execution;
- arbitrary plugin execution;
- framework-specific component rendering.

These capabilities should be introduced above or beside the engine only when a validated Production Lab requires them.

## Next pressure tests

RAG Failure validated multi-parameter optimization, failure diagnosis, checkpoints, and compare.

Agent Reliability adds execution-policy trade-offs across success, boundedness, safety, latency, and cost.

The next useful pressure test is **Evaluation Lab**, because it introduces a different shape of problem:

```text
Evaluation Lab
  dataset / slices
  pass thresholds
  version A vs version B
  quality metrics
  regressions
  cost / latency constraints
```

After that, **Context Engineering Lab** should test budget allocation across compression, retrieval, memory, and information loss.

If scenario definitions grow materially, split them into route-specific modules while keeping the engine API unchanged.

Architectural invariant:

> **Scenario logic is reusable and deterministic; rendering is replaceable.**
