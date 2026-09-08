# Core-120 Guide Release

## Decision

Core-120 is the **final automatic full-Guide wave** for Content Completeness V1.

The release implements the completed stopping-gate decision in #201 and publishes the exact frozen 20-Concept set without substitutions. After this wave, no Core-140 or Core-145 batch is planned. The remaining 25 canonical Concepts are governed by the final intentional-treatment contract in `content/guides/intentional-treatment-v1.0.json` and documented in `docs/CONTENT_COMPLETENESS_FINAL_TREATMENT.md`.

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

## Final treatment after Core-120

The post-Core-120 residual is exactly **25 Concepts**. #199 resolves them into four explicit treatments rather than leaving them as an implicit future Guide backlog:

- 6 `CONCISE_CANONICAL`
- 9 `PRACTICE_OR_COURSE_FIRST`
- 8 `SEMANTIC_OVERLAP_REVIEW`, all resolved as `KEEP_DISTINCT_CONCISE`
- 2 `FULL_GUIDE_ON_TRIGGER`

The two trigger-only candidates are:

- `concept-mcp-tasks-elicitation`
- `concept-outcome-trajectory-evaluation`

They remain concise today. A future full Guide must be earned by new search demand, a demonstrated Course gap, real Practice evidence, a sufficiently distinct teaching surface, or version-sensitive maintenance value.

This makes the Content Completeness V1 end state intentional rather than uniform:

- 120 substantial full Guides;
- 25 explicit non-Guide treatments;
- 145 / 145 canonical Concepts accounted for;
- no automatic Core-140/Core-145 wave.

#202 completes the follow-up by implementing and validating the bilingual concise Concept explanation surface across all 145 canonical Concepts. The product now exposes the concise layer through the same canonical Knowledge Map/Search read model, while full Guides remain optional deeper enrichment. See `docs/CONCISE_CONCEPT_SURFACE.md` for the implementation and validation contract.
