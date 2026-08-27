# AhaFrame Content System v0.9

Status: **canonical authoring contract**  
Depends on: Curriculum v0.9 (#118)  
Owns: reusable content data contract for #119, consumed by Learning UX #124 and homepage projection #131.

## 1. Why this exists

AhaFrame should be able to add a Guide, Lab, Mission, Review or Boss without inventing a new information architecture each time.

The content system therefore separates three concerns:

```text
semantic learning graph
        ↓
localized presentation
        ↓
page/runtime adapters
```

The semantic layer is framework-independent JSON. Localized files may change wording, never simulation behavior. Deterministic Lab/Mission engines remain separate runtime code.

## 2. Canonical files

| File | Responsibility |
|---|---|
| `content/learning-graph-v0.9.json` | stage/model/content IDs, routes, prerequisites, next/backfill edges, analytics IDs, provenance |
| `content/learning-graph.en.json` | English stage/model/content presentation |
| `content/learning-graph.zh-CN.json` | Simplified Chinese presentation |
| `content/learning-node-examples-v0.9.json` | complete authoring-contract examples for all canonical node types |
| `web/lib/learning-graph.ts` | typed read adapter for the current Next.js application |
| `scripts/test_learning_content_system.py` | framework-independent content lint / graph integrity gate |

## 3. Canonical node types

```text
GUIDE
PLAYGROUND
LAB
MISSION
INCIDENT
DRILL
REVIEW
BUILD
BOSS
REFERENCE
```

The type answers **how this judgment is best learned**, not where the page appears in navigation.

### GUIDE

Changes a mental model through a compact explanation and concrete evidence. No filler prose.

### PLAYGROUND / LAB

Interaction must expose behavior or a trade-off that is materially easier to understand by manipulating it than by reading it.

### MISSION / INCIDENT

Must contain evidence, competing plausible hypotheses, intervention and observable consequences. Do not reduce a production problem to a hidden single-slider answer.

### DRILL / REVIEW

Require recall or transfer. Recognition-only multiple choice is not the default learning action.

### BUILD / BOSS

Integrate multiple mental models and end in a defensible artifact or production decision.

### REFERENCE

Holds deeper or version-sensitive material without pretending it is the primary learning path.

## 4. Complete authoring record

Every authored node uses the following stable fields. `learning-node-examples-v0.9.json` contains one valid example for every node type.

```text
id                        stable locale-neutral content ID
version                   semantic content version
nodeType                   one canonical node type
stageId                    canonical curriculum stage
modelIds                   mental models exercised
prerequisiteContentIds     actual prerequisite edges
recommendedNextContentIds  deterministic next-node candidates
effortBand                 SHORT | MEDIUM | DEEP
teachingFormat             concrete delivery contract
learningObjective          engineering judgment/action, not topic exposure
evidenceRequirement        what must be observable/inspectable
debrief                    reusable mental model after the interaction
transferPrompt             changed-case transfer/retrieval prompt
reviewEligible             whether the node can seed later review
localeKeyRoot              presentation lookup root
analyticsId                stable semantic analytics ID
runtimeRef                 optional Lab/Mission/Build runtime adapter
provenance                 curriculum/source/runtime provenance
```

Do not add learner-visible strings to this record merely because a component needs copy. Put localized presentation in locale files.

## 5. Live graph vs authoring examples

The live v0.9 graph currently maps every public v0.8 experience without changing stable IDs or public routes. It is intentionally smaller than the 52-model curriculum: a mental model does not need its own page.

`learning-node-examples-v0.9.json` defines the **full node authoring shape** before all future nodes exist. These examples are fixtures/contracts, not public routes and not claims that the content has shipped.

When a new node ships:

1. choose existing mental-model IDs;
2. define its semantic authoring record;
3. add locale presentation in EN and zh-CN together;
4. wire a generic page/runtime adapter appropriate to its type;
5. add only decision-useful analytics;
6. run the content lint before merging.

## 6. Boundary with runtime engines

Content data may say:

```text
runtimeRef = mission-engine:47000-retry
```

It may not encode the actual retry algorithm, hidden scoring threshold, permission evaluator or deterministic simulation rules in localized prose.

Runtime engines own:

- state machines;
- deterministic scenario calculation;
- scoring/classification;
- permission and side-effect semantics;
- replay/checkpoint behavior.

Content owns:

- what judgment is being learned;
- which evidence the learner must inspect;
- prerequisite/next/transfer relationships;
- user-facing explanation and localization;
- stable semantic analytics identity.

This keeps locale changes from altering simulation semantics.

## 7. Graph rules

- Stage IDs and mental-model IDs are stable once published.
- Prerequisite edges must form a DAG.
- Recommended next/backfill edges may point only to existing content IDs.
- Public routes are locale-neutral in the graph and localized only by the application adapter.
- A route is not renamed merely because its learner-facing title changes.
- Existing v0.8 public experiences must remain represented during v0.9 migration.
- A model can be linked by many nodes; it still has one canonical model ID and one primary teaching format in the curriculum.
- Specialist paths are projections over the same graph, not cloned curricula.

## 8. Localization rules

EN and zh-CN launch together for paid-ready/public learning surfaces.

Locale files contain presentation only:

```text
stage: title + description
model: title
content: title + learner promise
```

The lint intentionally rejects semantic fields inside these locale records. Future node-specific localized prose should follow the same rule: the locale file may change wording but not IDs, prerequisites, runtime policy, scores, permissions or analytics identity.

## 9. Analytics rule

`analyticsId` is locale-independent. Instrument an event only when it answers a product question.

Good examples:

```text
path continued
prerequisite backfill opened/completed
transfer drill attempted
review returned
specialist branch entered
```

Avoid instrumentation that merely records every hover, graph pan or decorative click.

## 10. Authoring checklist

Before opening a content PR:

- [ ] stable `id` and semantic `version` selected;
- [ ] one canonical `nodeType` selected for the primary teaching format;
- [ ] stage/model links use IDs from Curriculum v0.9;
- [ ] objective is an engineering judgment/action, not “learn about X”;
- [ ] prerequisite edge is necessary rather than bureaucratic gating;
- [ ] Incident/Mission has evidence + competing hypotheses + intervention + consequence;
- [ ] Lab/Playground interaction materially reveals behavior/trade-off;
- [ ] Review/Drill requires retrieval or transfer;
- [ ] Build/Boss integrates multiple models and produces a defensible decision/artifact;
- [ ] debrief states the reusable mental model;
- [ ] transfer prompt changes the case rather than repeating it;
- [ ] EN and zh-CN presentation added together;
- [ ] version-sensitive claims have provenance and a review trigger;
- [ ] analytics ID is semantic and locale-independent;
- [ ] runtime semantics remain in Lab/Mission engine code;
- [ ] `python3 scripts/test_learning_content_system.py` passes.

## 11. Migration of current public experiences

The v0.9 graph currently preserves these stable public content IDs:

```text
token-playground
context-window
agent-loop
rag-failure
context-compression
agent-reliability
instruction-conflict
evaluation-failure
agent-workflow-graph
reliable-support-agent
```

Their v0.8 routes are checked automatically against `lab-reconciliation-v0.8.json`. Migration may enrich semantics, but cannot silently repurpose IDs or break indexed routes.

## 12. CI gate

`scripts/test_learning_content_system.py` fails on at least:

- duplicate stage/model/content/analytics IDs;
- missing 10-stage / 52-model canonical coverage;
- orphan model or content references;
- illegal prerequisite cycles;
- locale parity drift or empty localization;
- runtime-semantic fields leaking into current graph locale records;
- missing sourceRef definitions;
- v0.8 route/ID migration loss;
- incomplete node-type authoring examples;
- Review/Drill examples without retrieval/transfer semantics;
- Build/Boss examples that do not integrate multiple models.

This gate is part of the shared core validation workflow.

Refs: #117 #118 #119 #124 #131 #90
