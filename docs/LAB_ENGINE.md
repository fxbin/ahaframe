# AhaFrame Lab / Simulation Engine — v0.1

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

These primitives are the foundation for future Production Labs such as RAG failure analysis, agent reliability, evaluation, context engineering, model routing, and MCP security.

## Runtime files

```text
src/assets/lab-engine.js       generic state/simulation runtime
src/assets/lab-scenarios.js    current deterministic scenario definitions
src/assets/token.js            Token Playground DOM adapter
src/assets/context.js          Context Window DOM adapter
src/assets/agent.js            Agent Loop DOM adapter
src/assets/home.js             homepage Token Playground adapter
scripts/test_lab_engine.js     behavioral regression tests
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
    // return view data and optional metrics
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

- `state` must be a plain serializable object.
- reducers return a new valid state object for every supported action;
- reducers must not access the DOM;
- deterministic labs should produce the same state for the same initial state and action sequence;
- `derive` computes display data and metrics from state without mutating state;
- external API calls, timers, browser events, and rendering belong outside the scenario reducer;
- unknown or invalid actions should fail explicitly instead of silently producing undefined behavior.

## Engine API

Create a runtime instance:

```js
const lab = AhaFrame.createLab('context-window');
```

Dispatch an action:

```js
lab.dispatch('SELECT_STRATEGY', {strategy: 'rag'});
```

Subscribe to frames:

```js
lab.subscribe(({state, derived}) => {
  render(state, derived);
});
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

Other primitives:

```js
lab.getFrame();
lab.getHistory();
lab.reset();
lab.checkpoint('before-change');
lab.compare('before-change');
lab.replay(actions);
```

`compare()` compares top-level state fields and `derived.metrics` by default. A scenario may provide its own domain-specific compare function later.

## Adapter responsibilities

The DOM adapter is deliberately thin. It may:

- read sliders, buttons, selects, or other user controls;
- dispatch semantic actions to the engine;
- render state / derived data;
- manage browser-only effects such as timers;
- emit product analytics events.

It must not duplicate the scenario's core calculations or state transitions.

For example, the Token Playground probability transform now exists once in the Token scenario and is shared by both the homepage demo and the full lesson.

## Analytics boundary

The Lab Engine does **not** emit analytics by default. Existing product-level events remain owned by the adapters.

Engine-level `lab_action` / `lab_reset` events are opt-in via:

```js
AhaFrame.createLab('example-lab', {track: true});
```

This avoids duplicate high-frequency events from controls such as sliders.

## Current migrated scenarios

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

The browser adapter owns the recovery timer and cancels stale timers on Reset / Next; the scenario owns the deterministic state transition.

## Testing contract

`scripts/test_lab_engine.js` verifies:

- scenario registration;
- Token Playground probability invariants;
- greedy vs deterministic teaching sample behavior;
- Context Window arithmetic;
- Agent error / recovery state transitions;
- history;
- checkpoints;
- compare;
- replay;
- reset;
- invalid-input rejection.

`python3 scripts/validate.py` also runs the engine test and verifies that interactive generated pages load `lab-engine.js` before `lab-scenarios.js`.

## What the engine intentionally does not do yet

- real LLM inference;
- embeddings / vector databases;
- server persistence;
- user accounts;
- multiplayer / collaboration;
- code sandbox execution;
- arbitrary plugin execution;
- framework-specific component rendering.

These capabilities should be introduced above or beside the engine only when a validated Production Lab requires them.

## Evolution path

The next major scenario should be a **RAG Failure Lab**, because it exercises more of the abstraction:

```text
Scenario
  ↓
Parameters
  ├── chunk size
  ├── overlap
  ├── top-k
  ├── reranking
  └── context budget
  ↓
Derived Metrics
  ├── recall
  ├── precision
  ├── context usage
  ├── latency estimate
  └── cost estimate
  ↓
Checkpoint / Compare
  ↓
Failure explanation
```

If the scenario bundle grows materially, scenario definitions should be split into route-specific modules while keeping the engine API unchanged.

The architectural invariant is more important than the current file layout:

> **Scenario logic is reusable and deterministic; rendering is replaceable.**
