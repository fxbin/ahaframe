# Core-120 Guide Release

## Decision

Core-120 is the **final automatic full-Guide wave** for Content Completeness V1.

The release implements the completed stopping-gate decision in #201 and publishes the exact frozen 20-Concept set without substitutions. After this wave, no Core-140 or Core-145 batch is planned. The remaining 25 canonical Concepts move to #199 for explicit intentional treatment.

## Publication target

Core-120 moves the canonical Guide publication from 100 to 120 Guides:

- 120 / 145 Concepts = 82.8%
- 183 / 208 Path–Concept memberships = 88.0%
- Path reach = 15 / 15
- minimum Path coverage = 85.0%

The 20 additions are stored in `content/guides/core120-selection-v1.0.json` and promoted into `coverage-plan-v1.0.json` only because the corresponding Guide bundles are present.

## Frozen additions

- AI Foundations: prompt specificity; multimodal representation; distribution shift; bias/fairness
- Vibe Coding: repository context; dependency/migration verification
- LLM Application Engineering: API rate-limit resilience
- RAG & Knowledge Systems: metadata retrieval; knowledge graph structure
- Agent Engineering: action grounding; sandbox permissions
- Multi-Agent & Orchestration: delegation state
- Production AI Reliability: compensation/recovery; release economics; failure attribution
- Model Engineering: fine-tuning dataset design
- Write a Book with AI: research-to-outline
- Research with AI: claim–evidence matrix
- Create a Course / Knowledge Product: media quality review
- Run a Solo Business: customer problem research

## Practice discipline

Core-120 does not create Practice evidence by declaration. Exactly 10 of the 20 frozen additions already have exact same-Path existing Practice evidence under the canonical production/reconciliation contracts. The other ten may have useful Practice CTAs, but those links do not count as explicit evidence.

Expected reconciled post-publication state, verified by repository computation rather than authored labels:

- 80 / 120 Guide Concepts with explicit Practice evidence
- 96 / 183 same-Path Guide-backed memberships with explicit evidence
- 10 / 20 Core-120 additions with exact same-Path evidence

No new Lab, Mission, Incident or Build runtime is introduced to improve the percentage.

## Architecture invariants

- Course ordering remains canonical Path milestone ordering.
- Guide membership remains derived from canonical Paths.
- Related Guides remain Knowledge-Graph-derived.
- Search remains a projection over canonical sources rather than an authored index.
- Guides remain OPEN.
- Billing and free-choice activation remain false.
- Deterministic Practice runtime semantics do not change.

## Stopping rule

After Core-120, a remaining Concept receives a full Guide only when later evidence earns it through at least one of:

1. demonstrated direct-search demand;
2. a real Course learning discontinuity;
3. strong existing or newly justified Practice evidence;
4. a distinct mental model not adequately taught by neighboring Guides;
5. version-sensitive importance that warrants a maintained standalone source-governed Guide.

Otherwise #199 assigns concise canonical, Practice/Course-first, or semantic-overlap treatment.
