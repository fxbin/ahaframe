# AhaFrame Game Learning Contract v0.8

Date: 2026-08-16
Status: draft for #85
Parent: #83
Curriculum input: #84 / `docs/CURRICULUM_V0_8.md` draft

## 1. Decision

AhaFrame will **not** build a second simulation/game runtime.

The existing deterministic Lab Engine remains responsible for:

- scenario registration;
- plain-state reducers;
- derived metrics;
- action history;
- checkpoints;
- compare;
- replay;
- deterministic fixtures/tests.

A new **Mission Layer** sits above the Lab Engine and adds the learner-facing game structure:

```text
Mission Brief
+ role / objective
+ production constraints
+ evidence model
+ intervention budget
+ attempt history
+ outcome classification
+ release decision
+ engineering debrief
        ↓
Mission Layer
        ↓
Existing Lab Engine
        ↓
Scenario reducer + derive
```

Canonical boundary:

> **Lab Engine simulates the system. Mission Layer gives the simulation stakes, evidence, constraints, progression and a decision.**

This preserves the architectural invariant that simulation logic stays deterministic and framework-independent.

---

# 2. Why the Mission Layer exists

A parameter playground answers:

> What changes when I move this control?

A Mission must answer:

> A production system failed. What evidence matters, what should I change, what new risk does that create, and would I ship the result?

The Mission Layer exists to turn existing simulation primitives into a learning loop where **diagnosis and engineering trade-offs** matter more than slider exploration.

It should add tension without fake game mechanics.

---

# 3. Core game loop

Every flagship Incident should implement the same conceptual loop:

```text
1. MISSION BRIEF
   ↓
2. INCIDENT
   ↓
3. INVESTIGATE EVIDENCE
   ↓
4. FORM A HYPOTHESIS
   ↓
5. CHANGE POLICY / ARCHITECTURE
   ↓
6. RUN SIMULATION
   ↓
7. OBSERVE CONSEQUENCES
   ↓
8. COMPARE / RETRY
   ↓
9. SUBMIT RELEASE DECISION
   ↓
10. ENGINEERING DEBRIEF
```

The UI does not need to show ten literal screens. These are semantic phases.

---

# 4. Mission state machine

Stable machine phases:

```text
BRIEF
INVESTIGATE
INTERVENE
SIMULATE
REVIEW
DECIDE
DEBRIEF
COMPLETE
```

Recommended transitions:

```text
BRIEF
  └─ START_MISSION → INVESTIGATE

INVESTIGATE
  ├─ INSPECT_EVIDENCE → INVESTIGATE
  └─ CHANGE_POLICY → INTERVENE

INTERVENE
  ├─ CHANGE_POLICY → INTERVENE
  └─ RUN_SIMULATION → SIMULATE

SIMULATE
  └─ derived outcome → REVIEW

REVIEW
  ├─ CHANGE_POLICY → INTERVENE
  ├─ RESTORE_CHECKPOINT → INTERVENE
  ├─ COMPARE_ATTEMPTS → REVIEW
  └─ READY_TO_DECIDE → DECIDE

DECIDE
  ├─ SUBMIT_RELEASE_DECISION → DEBRIEF
  └─ CHANGE_POLICY → INTERVENE

DEBRIEF
  └─ COMPLETE_MISSION → COMPLETE
```

A Mission may simplify this flow, but machine semantics must not depend on visible/localized text.

---

# 5. Mission definition contract

A Mission definition is metadata and learning logic around one or more Lab scenarios.

Illustrative schema:

```js
{
  id: 'retry-incident',
  version: '0.8.0',
  scenarioId: 'retry-incident-scenario',
  chapterId: 'reliability',

  presentation: {
    titleKey: 'mission.retry.title',
    summaryKey: 'mission.retry.summary',
    roleKey: 'mission.retry.role',
    briefKey: 'mission.retry.brief'
  },

  objectives: [
    {id: 'stop-duplicates', kind: 'hard'},
    {id: 'preserve-recovery', kind: 'soft'}
  ],

  constraints: [
    {id: 'duplicate-risk', metric: 'duplicatePercent', op: '<=', value: 0.5, severity: 'veto'},
    {id: 'success', metric: 'successPercent', op: '>=', value: 92, severity: 'target'},
    {id: 'latency', metric: 'latencySeconds', op: '<=', value: 12, severity: 'target'},
    {id: 'human-review', metric: 'humanReviewPercent', op: '<=', value: 8, severity: 'target'}
  ],

  evidence: [
    {id: 'tool-timeline', source: 'derived', path: 'timeline'},
    {id: 'provider-outcomes', source: 'derived', path: 'providerOutcomes'},
    {id: 'policy', source: 'state', path: 'retryPolicy'}
  ],

  interventions: [
    {id: 'retry-limit', actionType: 'SET_RETRY_LIMIT', cost: 1},
    {id: 'idempotency', actionType: 'SET_IDEMPOTENCY_POLICY', cost: 2}
  ],

  releaseDecisions: ['SHIP', 'BLOCK', 'INCONCLUSIVE'],

  classifyOutcome(frame, missionState) {
    // returns stable outcome code only
  },

  debrief: {
    unlockRule: 'after-release-decision',
    conceptIds: ['timeout-ambiguity', 'idempotency-boundary', 'retry-policy']
  }
}
```

This example is descriptive, not a locked implementation API.

## Hard rules

- `id`, action types, constraint IDs, evidence IDs and outcome codes are locale-neutral.
- Presentation strings live in locale-aware content sources.
- A Mission cannot infer machine state from visible button text.
- Scenario math stays in scenario definitions, not in page/UI adapters.
- Mission scoring/classification must be deterministic for Simulation v1.

---

# 6. Mission runtime state

Mission-specific runtime state should be kept separate from underlying scenario state.

Candidate state:

```js
{
  missionId,
  missionVersion,
  phase,

  startedAt,
  attemptCount,
  simulationRunCount,

  inspectedEvidenceIds: [],
  interventionActionCount,
  interventionBudgetSpent,

  attemptFrames: [],
  selectedCompareAttempts: [],

  releaseDecision: null,
  outcomeCode: null,
  debriefUnlocked: false,
  completed: false
}
```

Do not persist free-form hypotheses/rationales to analytics by default. They may contain accidental personal or sensitive text.

A short rationale may exist as local UI state for learning, but durable collection must be an explicit later privacy decision.

---

# 7. Evidence-first learning

The Incident should begin with **symptoms**, not with the diagnosis.

Bad:

> Retry amplification is happening. Enable idempotency.

Good:

> The payment request timed out at 2.0 seconds. Two seconds later the provider recorded success. The runtime had already started attempt #2.

The player should have enough evidence to create competing hypotheses.

## Evidence types

Useful evidence panels include:

- timeline / trace;
- logs;
- retrieved documents;
- tool calls;
- state snapshots;
- policy configuration;
- cost / latency telemetry;
- evaluation slices;
- provenance / trust labels;
- failure counters;
- before/after compare.

## Evidence reveal

Not all evidence must be visible at once.

Supported reveal policies can be presentation-level:

```text
INITIAL
ON_INSPECT
AFTER_FIRST_RUN
AFTER_FAILURE_VARIANT
DEBRIEF_ONLY
```

Reveal policy must not make the underlying deterministic evidence impossible to inspect in tests.

## Evidence inspection should matter

The Mission may record evidence inspection for product learning, but should not force users to click every panel as a fake completion requirement.

A skilled engineer who already understands the evidence should be allowed to act quickly.

---

# 8. Hypothesis design

AhaFrame should encourage hypothesis-driven debugging without becoming a multiple-choice quiz.

Recommended UI:

- optional local hypothesis chips;
- “I think the failure is primarily…” categories;
- no immediate right/wrong reveal;
- compare hypothesis against simulation consequence later.

Stable hypothesis categories can help teaching, for example:

```text
RETRIEVAL_RECALL
STALE_AUTHORITY
CONTEXT_OVERFLOW
TOOL_SIDE_EFFECT
RETRY_POLICY
PERMISSION_BOUNDARY
EVAL_COVERAGE
```

But the player must still change the actual engineering policy.

Do not make selecting the correct hypothesis sufficient to complete a Mission.

---

# 9. Intervention budget

Game tension should come from **engineering constraints**, not arbitrary coins.

Mission may expose an intervention budget such as:

```text
Change Budget: 5
```

Examples:

```text
Enable reranking               cost 1
Add freshness filter           cost 1
Switch to hybrid retrieval     cost 2
Add human approval             cost 2
Add idempotency ledger         cost 2
Increase model tier            cost 3
```

The budget represents migration complexity / operational effort, not literal money.

## Rule

A policy must not dominate merely because it costs more.

Expensive interventions can still create:

- latency;
- complexity;
- review load;
- availability risk;
- false positives;
- lower automation.

---

# 10. Production constraints

Every flagship Incident should define constraints before the player optimizes.

Constraint categories:

```text
HARD VETO
TARGET
BUDGET
DIAGNOSTIC
```

Example:

```text
HARD VETO
- duplicate financial action <= 0.5%
- critical policy violation = 0

TARGET
- task success >= 92%
- P95 latency <= 12s

BUDGET
- human review <= 8%
- cost index <= 70

DIAGNOSTIC
- retries / request
- context tokens
- retrieval recall
```

## Veto rule

A weighted aggregate score must never hide a critical violation.

If a security/safety constraint is a release veto, a 95/100 total score cannot convert the system to “production viable.”

---

# 11. Simulation run and attempt model

A **simulation run** is one evaluation of the current policy against the Mission scenario.

An **attempt** is a policy/configuration snapshot plus its derived outcome.

Each run should create a compareable attempt:

```js
{
  attemptId,
  sequence,
  policyState,
  derived,
  outcomeCode,
  constraintResults,
  interventionBudgetSpent
}
```

The current Lab Engine already provides frame/history/checkpoint/compare/replay primitives. Mission implementation should adapt these instead of duplicating them.

## Suggested reuse

- Lab `checkpoint()` → named Mission attempt snapshot;
- Lab `compare()` → raw state/metric delta;
- Lab `getHistory()` → detailed intervention history;
- Lab `replay()` → deterministic replay / fixture;
- Mission Layer → adds constraint verdicts and outcome codes.

---

# 12. Outcome model

A Mission needs richer outcomes than PASS / FAIL.

Stable candidate outcome codes:

```text
PRODUCTION_VIABLE
SAFE_BUT_TOO_EXPENSIVE
SAFE_BUT_TOO_SLOW
FAST_BUT_UNRELIABLE
HIGH_AUTOMATION_HIGH_RISK
INSUFFICIENT_EVIDENCE
SAFETY_VETO
MISSION_FAILED
```

Not every Mission must use every code.

Outcome code is machine semantic; localized diagnosis is presentation.

## No unique hidden answer

At least two materially different policies should be capable of reaching a defensible `PRODUCTION_VIABLE` outcome in a flagship Incident whenever the domain allows it.

The lesson is judgment under constraints, not finding the author's secret preset.

---

# 13. Release decision

Flagship Incident and Boss experiences end with an explicit engineering decision:

```text
SHIP
BLOCK
INCONCLUSIVE
```

## Meaning

### SHIP

Current evidence is sufficient and no release veto is violated.

### BLOCK

Evidence shows a meaningful unacceptable risk or unmet hard constraint.

### INCONCLUSIVE

The current evidence cannot support a confident release decision.

`INCONCLUSIVE` must be treated as a valid professional answer, not a failure state.

## Decision quality

The simulation may compare the learner's decision to evidence state:

```text
SUPPORTED
OVERCONFIDENT
OVERCAUTIOUS
INCONSISTENT_WITH_VETO
```

Do not call the learner “wrong” merely because another architecture could also work.

---

# 14. Score / star model

Gamification is optional and subordinate to engineering evidence.

If shown, use a multi-dimensional scorecard:

```text
Reliability       ★★★
Safety            ★★★
Latency           ★★☆
Cost              ★★☆
Maintainability   ★☆☆
Evidence Quality  ★★★
```

## Rules

- score dimensions derive from Mission constraints/metrics;
- critical vetoes are shown separately;
- no global leaderboard in v0.8;
- no daily streak requirement;
- no XP economy required;
- a learner can complete the learning objective without chasing a perfect score.

Primary replay prompt:

> Can you improve this dimension without breaking another constraint?

---

# 15. Engineering Debrief

Debrief should unlock **after meaningful experimentation**, normally after a release decision.

Required sections:

1. **What failed** — named failure mode;
2. **Causal model** — why it happened;
3. **Tempting fix** — why the obvious fix can fail;
4. **Trade-off** — what another policy improves/harms;
5. **Reusable rule** — one compact mental model;
6. **Production analogy** — where engineers see this pattern;
7. **Related layer(s)** — Prompt/Context/Harness/Loop/Graph/Eval;
8. **Next Mission** — progression path.

The debrief must not simply restate the final numbers.

## Aha example

Retry Incident:

> A timeout is missing information, not proof of failure. Once a tool has irreversible side effects, retry design and idempotency design become one reliability problem.

---

# 16. Mission content anatomy

A flagship Mission content package should contain:

```text
mission metadata
role / brief
incident symptoms
production constraints
initial evidence
available interventions
deterministic scenario
outcome classifier
constraint classifier
attempt compare labels
debrief
related mental models
localization content
fixture paths
```

This is different from the current Lab content pattern because the **incident narrative and evidence sequence are first-class**.

---

# 17. UI composition

Recommended desktop layout:

```text
┌──────────────────────────────────────────────────────┐
│ INCIDENT HEADER                                      │
│ role · objective · incident status · change budget  │
├───────────────────────┬──────────────────────────────┤
│ EVIDENCE              │ SYSTEM / POLICY              │
│                       │                              │
│ traces                │ controls                     │
│ docs                  │ architecture choices         │
│ tool calls            │                              │
│ metrics               │ [RUN SIMULATION]             │
├───────────────────────┴──────────────────────────────┤
│ CONSEQUENCE / ATTEMPTS / COMPARE                     │
├──────────────────────────────────────────────────────┤
│ RELEASE DECISION                                     │
└──────────────────────────────────────────────────────┘
```

Mobile should become a clear vertical flow, not preserve desktop split panes at unusable widths.

## UI priority

1. Incident stakes;
2. evidence;
3. player decisions;
4. consequence;
5. comparison;
6. explanation.

Do not lead with a long conceptual article above the interactive Mission.

---

# 18. Relationship to current Lab Engine

Current Lab Engine capabilities already cover most simulation primitives:

```text
registerLabScenario
createLab
dispatch
reset
subscribe
checkpoint
compare
replay
getFrame
getHistory
getCheckpoint
```

This means v0.8 should prefer:

```text
Mission Adapter / Mission Runtime
        ↓
Lab Engine
```

instead of:

```text
New Game Engine
+ duplicated Scenario Engine
+ duplicated history / replay / compare
```

## Engine extension rule

Only extend `lab-engine.js` when at least two flagship Missions prove a missing **simulation primitive** that cannot cleanly live in Mission Layer.

Narrative, evidence reveal, constraints, attempt classification and debrief are not reasons to change Lab Engine.

---

# 19. Existing scenario reuse candidates

## RAG Failure

Existing mechanics already model:

- chunk size;
- overlap;
- top-k;
- vector vs hybrid retrieval;
- reranker;
- context budget;
- recall / precision;
- overflow;
- quality;
- latency;
- cost;
- multiple failure codes.

For #86, reuse the trade-off mathematics where defensible, but add incident-specific evidence such as document age/authority/provenance rather than merely reskinning the current page.

## Agent Reliability

Existing mechanics already model:

- max steps;
- retry limit;
- timeout;
- validation;
- human approval;
- termination;
- success;
- runaway risk;
- unsafe-action risk;
- latency;
- cost;
- review load.

For #87, these are strong primitives but insufficient by themselves. The flagship Retry Incident needs explicit side-effect/idempotency semantics and a timeline where timeout is ambiguous.

## Instruction Conflict

Useful source for #88:

- instruction precedence;
- retrieved instruction-like content;
- policy ambiguity;
- diagnosis across Prompt / Context / Harness / Evaluation.

The flagship security Incident must add actual capability/permission enforcement and trust provenance so it is not only a prompt wording exercise.

---

# 20. Instrumentation policy

Do not instrument every game interaction simply because it exists.

Current Product Gate semantics should remain stable until a new metric has a clear decision use.

## Required compatibility

A Mission can continue to emit existing stable Lab semantics where meaningful:

```text
lab_started
meaningful_interaction
failure_tradeoff_observed
aha_feedback_submitted
second_lab_started
```

A Mission-specific semantic event is justified only when it answers a distinct product question.

Candidate minimal additions for the separate content preview:

```text
mission_started
simulation_run
mission_completed
release_decision_submitted
```

Do **not** add `evidence_inspected`, `policy_changed`, etc. to durable analytics unless #92/M4 explicitly needs them.

The `content-preview-2026-08` cohort must remain separate from formal `alpha-2026-08` Product Gate evidence.

---

# 21. Localization rules

Mission machine semantics remain locale-neutral.

Shared across EN/zh-CN:

```text
mission id
scenario id
constraint ids
outcome codes
action types
evidence ids
release decision enum
formulas
fixture expectations
```

Localized presentation:

```text
title
role
incident copy
evidence labels
metric explanations
constraint explanation
outcome explanation
debrief
CTA
```

English visible text must never be used as a logic discriminator.

---

# 22. Deterministic testing contract

Every flagship Mission should have fixture tests that prove:

1. initial incident state is deterministic;
2. each supported intervention action changes only allowed state;
3. at least one tempting policy produces the intended secondary failure;
4. at least two attempts can be compared;
5. constraint/veto classification is deterministic;
6. outcome codes do not depend on locale;
7. SHIP/BLOCK/INCONCLUSIVE decision evaluation is stable;
8. replay produces the same final frame/outcome;
9. debrief unlock state follows semantic Mission state;
10. translated presentation cannot change simulation outcome.

---

# 23. Demo fixture for the Mission Layer

Before implementing #86/#87/#88, prove the Mission Layer against an existing deterministic scenario.

Recommended fixture:

```text
mission id: mission-reliability-fixture
scenario:   agent-reliability
```

Illustrative constraints:

```text
successPercent      >= 82    target
unsafeActionPercent <= 15    veto
runawayPercent      <= 20    target
latencySeconds      <= 28    target
costIndex           <= 80    target
```

Expected exercise:

1. baseline is unsafe/runaway or weak;
2. player changes reliability policy;
3. run creates attempt A;
4. player adds stricter controls;
5. run creates attempt B;
6. compare shows safety gain plus latency/review/cost trade-off;
7. release decision submitted;
8. debrief unlocks.

This fixture validates Mission mechanics. It is not a public flagship Mission.

---

# 24. First implementation slice

Keep the first code slice deliberately small:

```text
M1 Mission definition validation
M2 Mission runtime state + phase transitions
M3 wrap one Lab Engine instance
M4 attempt snapshots + constraint classification
M5 release decision + debrief gate
M6 fixture regression
M7 one minimal Mission shell UI
```

Do not build:

- account progress;
- cloud save;
- XP;
- global leaderboard;
- badges marketplace;
- multiplayer;
- LLM-generated dynamic Missions;
- real compute mode;
- authoring CMS.

---

# 25. Acceptance criteria for #85

#85 is ready to close when:

- one reusable Mission definition/runtime supports a fixture over current Lab Engine;
- no duplicate simulation/history/checkpoint engine exists;
- player can start → inspect → intervene → run → compare → decide → debrief;
- hard veto and soft targets are distinct;
- at least two policies show meaningful trade-offs;
- locale-neutral semantics are regression-tested;
- the same Mission primitives are sufficient to specify #86/#87/#88;
- instrumentation additions, if any, are minimal and explicitly tied to #92/product decisions.

---

# 26. Design invariant

The v0.8 game-learning system should always pass this test:

> If points, stars and progress decoration were removed, would diagnosing and fixing the incident still be engaging and educational?

If the answer is no, the Mission is relying on fake gamification rather than engineering gameplay.

Refs: #83 #84 #85 #86 #87 #88 #89 #90 #91 #92 #19
