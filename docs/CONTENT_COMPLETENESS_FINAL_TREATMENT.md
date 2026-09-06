# Content Completeness V1 — Final treatment after Core-120

## Decision

Content Completeness V1 ends automatic long-form Guide expansion at **Core-120**.

The canonical inventory still contains **145 Concepts**, but only **120** receive substantial full Guides by default. The remaining **25** are not a hidden Core-140/Core-145 backlog. Each now has one explicit final treatment in `content/guides/intentional-treatment-v1.0.json`.

The final partition is:

- `CONCISE_CANONICAL`: **6**
- `PRACTICE_OR_COURSE_FIRST`: **9**
- `SEMANTIC_OVERLAP_REVIEW`: **8**
- `FULL_GUIDE_ON_TRIGGER`: **2**

This gives all **145 / 145 Concepts** an intentional teaching policy while keeping full Guide count at **120 / 145**.

## 1. CONCISE_CANONICAL — 6

These remain distinct canonical Concepts, but the useful independent teaching surface is small enough that a concise mental model is the correct default.

- `concept-sequence-ordering`
- `concept-modality-grounding`
- `concept-reasoning-opacity`
- `concept-human-accountability`
- `concept-prompt-caching`
- `concept-user-domain-memory`

A concise treatment still needs localized definition, mental model, why-it-matters and canonical Path/relationship context. #202 owns that readable concise surface.

## 2. PRACTICE_OR_COURSE_FIRST — 9

These are better understood inside a real workflow than as another detached article.

### Practice-first with explicit existing evidence — 4

- `concept-independent-verification`
  - evidence: `multi-agent-coordination-incident`
- `concept-inference-serving`
  - evidence: `model-adaptation-decision-lab`
- `concept-research-synthesis`
  - evidence: `research-evidence-mission`
- `concept-structured-analysis`
  - evidence: `data-analysis-verification-lab`

These mappings are validated against the existing production/reconciliation evidence model. A Guide CTA is not enough to create this status.

### Course-first without fabricated Practice evidence — 5

- `concept-environment-observation`
- `concept-source-backed-drafting`
- `concept-knowledge-curation`
- `concept-knowledge-product-publishing`
- `concept-content-marketing-system`

These Concepts already occupy meaningful positions in canonical Course sequences, but the current Practices do not explicitly earn those Concept mappings. Their treatment therefore says `COURSE_FIRST`, not `PRACTICE_FIRST`.

## 3. SEMANTIC_OVERLAP_REVIEW — 8

The semantic review is now resolved. None of these Concepts is merged, deprecated or aliased in V1.

All eight remain distinct canonical nodes with resolution `KEEP_DISTINCT_CONCISE`:

- `concept-examples-shape-behavior`
- `concept-planning-as-search`
- `concept-plan-before-code`
- `concept-context-structure-cache`
- `concept-planning-vs-direct`
- `concept-hybrid-structured-unstructured-search`
- `concept-cross-layer-architecture`
- `concept-queue-backpressure`

The reason to stop at concise treatment differs by Concept, but the shared rule is the same: neighboring published Guides already own most of the reusable mental model. A second long Guide would add more duplication than learning value.

Importantly, overlap does **not** imply identity. For example, queue-level backpressure is not the same thing as streaming backpressure, so the Concept remains canonical even though a separate long Guide is not justified today.

## 4. FULL_GUIDE_ON_TRIGGER — 2

Two Concepts are sufficiently distinct that a future standalone Guide is plausible, but current evidence does not justify publishing or maintaining one now.

### `concept-mcp-tasks-elicitation`

Current treatment: concise canonical.

A full Guide is earned only when one of the following becomes real:

- direct-search or learner demand;
- an MCP specification change creates a material maintained teaching surface;
- a shipped Practice makes Tasks or elicitation change an engineering decision.

This Concept is version-sensitive, so speculative long-form coverage would create maintenance cost without enough current product value.

### `concept-outcome-trajectory-evaluation`

Current treatment: concise canonical.

A full Guide is earned only when one of the following becomes real:

- a dedicated agent-evaluation Practice exposes trajectory-level evidence;
- a real Course learning discontinuity remains after neighboring evaluation Guides;
- direct-search or production-evaluation demand warrants standalone coverage.

## Structural completeness after #199

The end state is deliberately asymmetric:

```text
145 canonical Concepts
├─ 120 substantial OPEN Guides
└─ 25 intentional non-Guide treatments
   ├─ 6 concise canonical
   ├─ 9 Practice/Course-first
   ├─ 8 semantic-overlap resolved as keep-distinct-concise
   └─ 2 full Guide only on new evidence trigger
```

This is considered structurally complete because every canonical Concept has an explicit treatment and remains reachable through the same Knowledge Graph / Path architecture.

## What this contract forbids

- no Core-140 or Core-145 vanity wave;
- no automatically converting the remaining inventory into long Guides;
- no fabricated Practice evidence to justify a treatment;
- no merge/deprecation/alias merely because two Concepts overlap;
- no second relationship graph inside the treatment contract;
- no using provider/version churn alone as a reason to create a long article.

## What can still change later

The treatment contract is final for Content Completeness V1, but evidence can trigger a deliberate future product decision.

A non-Guide Concept may be promoted to a full Guide only through a new explicit decision backed by search demand, a demonstrated learning gap, real Practice evidence, a clearly distinct mental model, or version-sensitive maintenance value. Such promotion is **individual**, not a new batch wave.

## Validation

Run:

```bash
python3 scripts/test_intentional_treatment.py
```

The validator proves that:

- the repository still has 145 canonical Concepts;
- EN and zh-CN still publish exactly 120 identical Guide Concept bindings;
- the residual set is exactly 25;
- the treatment contract partitions that exact residual once and only once;
- Practice-first mappings are earned by current evidence;
- Course-first mappings do not fabricate Practice evidence;
- all semantic-overlap reviews are resolved;
- Core-140/Core-145 batch machinery remains absent.

## Next implementation boundary

#199 freezes **what treatment each remaining Concept receives**.

#202 is the next step: make sure the concise canonical explanation surface is complete and bilingual for all Concepts that intentionally do not have full Guides, using the canonical inventory/presentation layer rather than creating a second curriculum.
