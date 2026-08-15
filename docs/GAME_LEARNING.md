# AhaFrame Game Learning Contract v0.8

Date: 2026-08-16
Status: **implementation candidate for #85**
Parent: #83
Curriculum input: #84 / `docs/CURRICULUM_V0_8.md`

## 1. Architecture decision

AhaFrame does **not** build a second simulation runtime.

```text
Mission Layer
  role / objective
  incident evidence
  production constraints
  intervention budget
  attempt history
  outcome classification
  release decision
  debrief gate
        ↓
Existing Lab Engine
  reducer / derive
  history
  checkpoint
  compare
  replay
        ↓
Deterministic Scenario
```

Canonical boundary:

> **Lab Engine simulates the system. Mission Layer gives the simulation stakes, evidence, constraints, progression and a decision.**

Implemented source:

```text
src/assets/mission-engine.js
```

Test fixture:

```text
scripts/fixtures/mission_engine_fixture.js
scripts/test_mission_engine.js
```

---

## 2. Learner loop

Every flagship Incident should implement the same semantic loop:

```text
MISSION BRIEF
→ INCIDENT
→ INVESTIGATE EVIDENCE
→ FORM A HYPOTHESIS
→ CHANGE POLICY / ARCHITECTURE
→ RUN SIMULATION
→ OBSERVE CONSEQUENCES
→ COMPARE / RETRY
→ SUBMIT RELEASE DECISION
→ ENGINEERING DEBRIEF
```

The UI does not need ten screens. These are semantic phases.

Stable phase enum implemented by the Mission Engine:

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

Visible/localized strings never control these transitions.

---

## 3. Implemented Mission definition contract

A Mission wraps one deterministic Lab scenario in v0.8.

Minimal definition:

```js
AhaFrame.registerMission({
  id: 'retry-incident',
  version: '0.8.0',
  scenarioId: 'retry-incident-scenario',
  chapterId: 'reliability',

  interventionBudget: 5,

  evidence: [
    {id: 'tool-timeline', source: 'derived', path: 'evidence.toolTimeline'},
    {id: 'policy', source: 'state', path: 'retryPolicy'}
  ],

  interventions: [
    {id: 'retry-limit', actionType: 'SET_RETRY_LIMIT', cost: 1},
    {id: 'idempotency', actionType: 'SET_IDEMPOTENCY', cost: 2}
  ],

  constraints: [
    {id: 'duplicate-risk', metric: 'duplicatePercent', op: '<=', value: 0.5, severity: 'veto'},
    {id: 'success', metric: 'successPercent', op: '>=', value: 92, severity: 'target'},
    {id: 'latency', metric: 'latencySeconds', op: '<=', value: 12, severity: 'target'}
  ],

  releaseDecisions: ['SHIP', 'BLOCK', 'INCONCLUSIVE'],

  classifyOutcome(frame, missionState, constraintResults) {
    return 'PRODUCTION_VIABLE'; // stable locale-neutral code
  }
});
```

### Machine-semantic rules

Locale-neutral:

```text
mission id
scenario id
evidence id
intervention id
action type
constraint id
constraint severity
outcome code
release decision
scenario state / formulas
```

Localized presentation:

```text
title
role
brief
incident copy
evidence labels
metric explanations
constraint explanations
outcome explanations
debrief
CTA
```

Scenario math belongs in scenario definitions, not page/UI adapters.

---

## 4. Implemented runtime API

Create a Mission:

```js
const mission=AhaFrame.createMission('retry-incident');
```

Public runtime operations:

```text
start()
inspectEvidence(id)
intervene(interventionId, payload)
runSimulation()
compareAttempts(leftNumber, rightNumber)
restoreAttempt(number)
readyToDecide()
submitReleaseDecision(decision)
complete()
reset()
getSnapshot()
getMissionState()
getLabFrame()
listAttempts()
```

The Mission Layer deliberately reuses Lab Engine `dispatch`, `compare` and `replay` rather than copying them.

---

## 5. Runtime state

Mission state is separate from underlying scenario state.

```js
{
  missionId,
  missionVersion,
  scenarioId,
  phase,
  startedAt,
  attemptCount,
  simulationRunCount,
  inspectedEvidenceIds,
  interventionActionCount,
  interventionBudget,
  interventionBudgetSpent,
  remainingBudget,
  attemptFrames,
  releaseDecision,
  outcomeCode,
  debriefUnlocked,
  completed
}
```

Do not persist free-form learner hypotheses or rationales to analytics by default. They can contain personal or sensitive text.

---

## 6. Evidence-first rule

An Incident starts with symptoms, not the diagnosis.

Bad:

> Retry amplification is happening. Enable idempotency.

Good:

> The client timed out. The provider later reports success. The runtime had already started another attempt.

Useful evidence types:

```text
trace / timeline
logs
retrieved documents
provenance / trust labels
tool calls
state snapshots
policy config
cost / latency telemetry
evaluation slices
before / after compare
```

Evidence inspection is available through stable IDs, but clicking every evidence panel is **not** a fake completion requirement.

Traceability/Observability from #84 is therefore a learning primitive, not decorative UI.

---

## 7. Hypothesis model

A Mission should support hypothesis-driven debugging without becoming a multiple-choice quiz.

A UI may offer local hypothesis categories such as:

```text
RETRIEVAL_RECALL
STALE_AUTHORITY
CONTEXT_OVERFLOW
TOOL_SIDE_EFFECT
RETRY_POLICY
PERMISSION_BOUNDARY
EVAL_COVERAGE
```

But selecting the right label never completes a Mission. The learner must change real system policy and observe consequences.

Free-form hypothesis text remains local-only unless a later privacy decision explicitly permits collection.

---

## 8. Intervention budget

Game tension comes from engineering constraints rather than coins/XP.

Example:

```text
Change Budget: 5

Enable reranking            cost 1
Add freshness filter        cost 1
Switch retrieval strategy   cost 2
Add idempotency boundary    cost 2
Add human approval          cost 3
```

The budget represents migration complexity / operational effort.

Mission Engine enforces the budget deterministically and refuses actions that would exceed it.

Expensive actions may still hurt latency, complexity, automation or review load. There must be no “buy the best answer” path.

---

## 9. Constraint model

Implemented severities:

```text
veto
 target
 budget
 diagnostic
```

A constraint reads either:

```text
frame.derived.metrics[metric]
```

or an explicit frame `path`.

Supported operators:

```text
< <= > >= == !=
```

### Hard-veto invariant

A weighted aggregate score can never hide a critical safety/security violation.

Generic Mission classification defaults to:

```text
failed veto                       → SAFETY_VETO
all target/budget constraints OK  → PRODUCTION_VIABLE
otherwise                         → CONSTRAINT_MISS
```

Flagship Missions should normally supply a richer deterministic `classifyOutcome()`.

---

## 10. Attempts, replay and compare

A simulation run snapshots:

```js
{
  attemptNumber,
  frame,
  constraintResults,
  outcomeCode,
  interventionBudgetSpent,
  actions
}
```

Mission attempts are intentionally built on Lab Engine primitives:

```text
Lab history      → intervention history
Lab replay       → restore deterministic policy
Lab compare      → state/metric delta between attempts
Mission Layer    → adds constraints/outcome/budget
```

A learner should be able to compare at least two materially different policies in every flagship Incident.

---

## 11. Outcome model

Flagship Missions need richer outcomes than PASS/FAIL.

Recommended stable codes:

```text
PRODUCTION_VIABLE
SAFE_BUT_TOO_EXPENSIVE
SAFE_BUT_TOO_SLOW
SAFE_BUT_LOW_RECOVERY
FAST_BUT_UNRELIABLE
HIGH_AUTOMATION_HIGH_RISK
INSUFFICIENT_EVIDENCE
SAFETY_VETO
MISSION_FAILED
```

Not every Mission uses every code.

Outcome code is machine semantic. Diagnosis/explanation is localized presentation.

There should not be one hidden canonical preset. When the domain allows it, at least two different architectures should be defensible under the stated constraints.

---

## 12. Release decision

Flagship Incidents and Final Boss end with exactly one learner decision:

```text
SHIP
BLOCK
INCONCLUSIVE
```

`INCONCLUSIVE` is a valid professional answer when evidence is insufficient.

The engine records the decision but does not reduce system design to “correct button / wrong button.” A later presentation layer may describe evidence alignment such as supported, overconfident or inconsistent with a veto.

---

## 13. Engineering Debrief

Debrief unlocks after release decision.

Required content:

1. what failed;
2. causal model;
3. tempting fix and why it can fail;
4. important trade-off;
5. reusable engineering rule;
6. production analogy;
7. related AhaFrame mental models;
8. next Mission / Final Boss connection.

The debrief must explain the system rather than restate final numbers.

---

## 14. Score / star policy

Stars/score are optional and secondary.

If used, display separate engineering dimensions such as:

```text
Reliability
Safety
Latency
Cost
Maintainability
Evidence Quality
```

Rules:

- derive scores from actual Mission constraints/metrics;
- display critical veto separately;
- no global leaderboard in v0.8;
- no daily streak requirement;
- no XP economy;
- a learner can complete the objective without optimizing a vanity score.

Primary replay question:

> Can you improve this dimension without breaking another constraint?

---

## 15. Fixture proof

#85 includes a deterministic, non-public fixture:

```text
mission:  mission-engine-demo
scenario: mission-engine-demo
```

It models timeout/retry/idempotency trade-offs only to prove runtime mechanics.

The regression covers:

- phase transitions;
- evidence inspection;
- intervention budget;
- baseline safety veto;
- production-viable alternative;
- multiple attempts;
- compare;
- restore/replay;
- deterministic repeated policy;
- release decision;
- debrief gate;
- reset;
- invalid mission/evidence/decision/action paths.

The fixture is **not** public curriculum and must not substitute for #87.

---

## 16. Flagship reuse rules

### #86 Broken RAG Pipeline

Reuse existing RAG/context trade-off math where defensible, but add incident-specific evidence: document age, authority, retrieval trace, reranking order and context composition. It must not be a renamed slider page.

### #87 The $47,000 Retry

Existing Agent Reliability metrics are useful primitives, but #87 needs explicit timeout ambiguity, irreversible side effect, idempotency and execution timeline semantics.

### #88 Prompt Injection Attack

Instruction Conflict can contribute authority/provenance concepts, but #88 needs actual capability/permission enforcement and policy-decision traces. Prompt wording alone is insufficient.

### #89 Final Boss

Consumes the same Mission primitives but integrates multiple scenario dimensions and release vetoes. It should reward transfer from #86/#87/#88.

---

## 17. Instrumentation boundary

Mission Engine itself does **not** emit a new durable analytics event for every interaction.

Current stable Product Gate semantics remain untouched until a metric has an explicit decision use.

Existing semantics can still apply where appropriate:

```text
lab_started
meaningful_interaction
failure_tradeoff_observed
aha_feedback_submitted
second_lab_started
```

Potential content-preview additions should stay minimal:

```text
mission_started
simulation_run
mission_completed
release_decision_submitted
```

Do not persist `evidence_inspected`, every policy change, or free-form hypotheses merely because the engine can observe them.

Preview users use a separate `content-preview-2026-08` cohort and do not contaminate formal `alpha-2026-08` evidence.

---

## 18. Engine extension rule

Do not expand `lab-engine.js` for narrative or game UI concerns.

Only add a Lab Engine primitive if **at least two flagship Missions** prove a missing simulation capability that cannot cleanly live in Mission Layer.

Mission concerns that stay outside Lab Engine:

```text
brief / role
evidence reveal
constraint presentation
intervention budget
attempt naming
outcome classification
release decision
debrief
scorecard
progression
```

---

## 19. v0.8 non-goals

Do not add to #85:

```text
account progress
cloud save
XP
leaderboards
badges marketplace
multiplayer
LLM-generated Missions
real compute mode
authoring CMS
```

#85 exists to provide enough reusable mechanics for three high-quality flagship Incidents, not to build a learning platform.

---

## 20. Acceptance criteria for #85

#85 can close when:

- reusable Mission registration/runtime exists over current Lab Engine;
- there is no duplicated scenario/history/replay/compare engine;
- start → inspect → intervene → run → compare → decide → debrief works;
- hard veto and soft targets are distinct;
- intervention budget is enforced;
- deterministic fixture/regression is connected to CI;
- locale-neutral semantic tokens control machine behavior;
- no unnecessary durable analytics events are introduced;
- #86/#87/#88 can share this same contract without bespoke gameplay runtimes.

Design invariant:

> If points, stars and progress decoration were removed, would diagnosing and fixing the incident still be engaging and educational?

If no, the Mission is using fake gamification.

Refs: #83 #84 #85 #86 #87 #88 #89 #90 #91 #92 #19
