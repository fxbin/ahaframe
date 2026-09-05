# Practice Reconciliation — Core-80

## Decision

Core-80 Practice density must be measured from **what existing interactions actually exercise**, not from Guide CTA presence and not only from the 17-Experience production-wave manifest.

The production plan remains unchanged at 17 Experiences. A separate reconciliation contract records additional canonical Concept evidence that is already earned by existing public runtimes.

This is an evidence correction, not a runtime expansion.

## Before → after

| Metric | Before reconciliation | After reconciliation |
| --- | ---: | ---: |
| Published Guides | 80 | 80 |
| Guides with real Practice links | 80/80 | 80/80 |
| Guide Concepts explicitly covered by Practice evidence | 40/80 (50.0%) | **56/80 (70.0%)** |
| Same-Path Guide-backed Practice memberships | 52/143 (36.4%) | **72/143 (50.3%)** |
| Core-80 addition memberships explicitly practiced | 9/21 (42.9%) | **17/21 (81.0%)** |
| Production Experiences | 17 | 17 |
| Evidence Practices considered | 17 | **21** |
| Evidence Path–Practice memberships | 19 | **25** |
| Path reach | 15/15 | 15/15 |

The improvement comes entirely from existing interaction semantics. No new Lab, Mission, Incident or Build was created.

## Reconciled evidence sources

### Existing production Experiences augmented

- **Token Playground**
  - `concept-next-token-generation`
  - `concept-sampling-controls`
- **Broken RAG Pipeline**
  - `concept-hybrid-retrieval`
  - `concept-reranking`
  - `concept-evidence-granularity` — retained even though it does not yet have a Core-80 Guide, because chunk size/overlap directly exercises it and it is valuable input for Core-100 ranking.
- **$47,000 Retry**
  - `concept-retry-amplification`
  - `concept-compensation-recovery` — recorded for future ranking even though it is not a Core-80 Guide.
- **Production Release Gate**
  - `concept-observability-diagnosis`
  - `concept-traceability`
  - `concept-online-monitoring`

### Existing public specialist/reference Practices added to evidence

- **Context Compression**
  - Paths: LLM Application Engineering; Write a Book with AI
  - `concept-finite-context-budget`
  - `concept-context-management`
  - `concept-context-compaction`
- **Instruction Conflict / Prompt Injection Attack**
  - Paths: AI Foundations; Production AI Reliability
  - `concept-instruction-authority`
  - `concept-instruction-conflict`
  - `concept-prompt-context-runtime-boundary`
  - `concept-prompt-specificity`
  - `concept-trust-boundary`
  - `concept-prompt-injection-defense`
  - `concept-runtime-enforcement`
- **Agent Workflow Graph**
  - Path: Multi-Agent & Orchestration
  - `concept-agent-loop`
  - `concept-loop-vs-graph`
  - `concept-delegation-state`
  - `concept-workflow-decomposition`
  - `concept-parallel-agent-work`
  - `concept-independent-verification`
  - `concept-topology-tradeoffs`
  - `concept-coordination-overhead`
- **Evaluation Failure**
  - Path: Production AI Reliability
  - `concept-evaluation-evidence`
  - `concept-slices-regression`
  - `concept-confidence-variance`
  - `concept-release-economics`
  - `concept-ship-block-inconclusive`

Not-yet-Guide Concepts are intentionally recorded here because Practice proximity is one of the ranking dimensions required by #198. They do **not** increase the current Core-80 Guide-density numerator until they have a published Guide.

## Per-Path Guide-backed Practice density

| Path | Guided Concepts | Before | After | After coverage |
| --- | ---: | ---: | ---: | ---: |
| AI Foundations | 24 | 3 | 5 | 20.8% |
| Vibe Coding & Agentic Software Engineering | 8 | 3 | 3 | 37.5% |
| LLM Application Engineering | 9 | 2 | 5 | 55.6% |
| RAG & Knowledge Systems | 10 | 3 | 5 | 50.0% |
| Agent Engineering | 12 | 7 | 7 | 58.3% |
| Multi-Agent & Orchestration | 6 | 1 | 5 | 83.3% |
| Production AI Reliability | 14 | 4 | 12 | 85.7% |
| Model Engineering | 6 | 1 | 1 | 16.7% |
| Write a Book with AI | 9 | 4 | 5 | 55.6% |
| Build an AI Knowledge Base | 9 | 6 | 6 | 66.7% |
| Research with AI | 8 | 3 | 3 | 37.5% |
| Data Analysis with AI | 6 | 4 | 4 | 66.7% |
| Create a Course or Knowledge Product with AI | 6 | 3 | 3 | 50.0% |
| Run a Solo Business with AI | 6 | 3 | 3 | 50.0% |
| AI Customer Support | 10 | 5 | 5 | 50.0% |

This table is not a target to maximize mechanically. A low ratio can mean either a true Practice gap or simply that a Course contains conceptual material that is better understood through Guide/course context than through a dedicated interaction.

## Core-80 residual Practice gaps

After reconciliation, four Core-80 addition memberships remain without same-Path explicit Practice evidence:

1. `concept-embeddings-semantic-space` — AI Foundations
2. `concept-hallucination` — AI Foundations
3. `concept-context-vs-memory` — AI Foundations
4. `concept-reversible-actions` — Agent Engineering

These are the only residual gaps among the 21 Path memberships introduced by Core-80.

They should **not automatically trigger four new runtimes**. For #198 and later Practice planning, each must still pass the decision-changing interaction test:

- does the Concept change an engineering decision?
- is there a meaningful variable and observable consequence?
- can an existing Practice absorb it without semantic distortion?
- would a new interaction strengthen `Understand → Decide → Practice → Transfer` rather than merely visualize terminology?

## Implication for Core-100 (#198)

Practice reconciliation changes the Core-100 ranking input materially.

A candidate should receive strong Practice-proximity credit when a current public interaction already exercises it even if it has no Guide yet. Examples now supported by explicit evidence include:

- `concept-evidence-granularity`
- `concept-compensation-recovery`
- `concept-instruction-authority`
- `concept-instruction-conflict`
- `concept-prompt-context-runtime-boundary`
- `concept-prompt-specificity`
- `concept-runtime-enforcement`
- `concept-loop-vs-graph`
- `concept-delegation-state`
- `concept-independent-verification`
- `concept-release-economics`
- `concept-ship-block-inconclusive`

Therefore Core-100 ranking should combine:

1. remaining Path Guide-floor gaps;
2. **reconciled Practice proximity**;
3. likely Search/direct-retrieval value;
4. pedagogical distinctiveness;
5. outcome-path usefulness;
6. remaining Concept reuse, where any exists.

The next step is #198: freeze a deterministic 20-Concept Core-100 candidate set from those dimensions, rather than authoring the next 20 Guides immediately.

## Reproducibility

Run:

```bash
python3 scripts/practice_density.py
python3 scripts/practice_density.py --json
python3 scripts/practice_density.py --check
```

The check preserves both the original 40/80 / 52/143 / 9/21 baseline and the reconciled 56/80 / 72/143 / 17/21 result.
