# Guide Coverage v1 — 145 Concepts × 15 Paths

## Decision

Guide density grows by **Path gap + Concept reuse + retrieval value + Practice adjacency + pedagogical distinctiveness**, not by raw Guide count.

The Knowledge Graph has 145 reusable Concepts projected into 15 Paths. After deduplicating repeated Concept references inside the same Path, the binary Concept × Path matrix contains **208 positive Path–Concept memberships**.

The staged policy is:

- **core-40**: require every Path to reach at least **30%** Guide coverage, while maximizing covered Path–Concept memberships.
- **core-60**: require every Path to reach at least **45%** Guide coverage, while preserving nearly all available reuse efficiency.
- **core-80**: require every Path to reach at least **60%** Guide coverage. By this point cross-Path reuse is nearly exhausted, so editorial priority also considers likely direct-search value, connection to real Practice, and whether the Guide adds a distinct engineering decision model.

This keeps Guides canonical to Concepts while using Path membership only as a prioritization signal. It does **not** create a second curriculum or require 145 identical long-form Guides.

## Coverage summary

| Stage | Concept coverage | Path–Concept membership coverage | Path reach | Minimum Path coverage | Reuse efficiency |
| --- | ---: | ---: | ---: | ---: | ---: |
| core-20 | 20/145 (13.8%) | 37/208 (17.8%) | 13/15 | 0.0% | baseline |
| core-40 | 40/145 (27.6%) | 89/208 (42.8%) | 15/15 | 30.0% | 89/89 theoretical max (100%) |
| core-60 | 60/145 (41.4%) | 122/208 (58.7%) | 15/15 | 45.0% | 122/123 theoretical max (99.2%) |
| core-80 | 80/145 (55.2%) | 143/208 (68.8%) | 15/15 | 60.0% | 143/143 theoretical max (100%) |

At 60 Guides we intentionally gave up one theoretical membership slot versus pure reuse ranking in order to raise the weakest Path floor from 40.9% to 45.0%.

After core-60, only `concept-context-compaction` among the remaining 85 Concepts is reused by more than one Path. That means raw reuse ranking no longer meaningfully distinguishes the remaining candidates. Core-80 therefore restores theoretical maximum membership efficiency while using the additional editorial dimensions to decide **which single-Path gaps are worth filling first**.

## Path-by-Path projection

| Path | Concepts | core-20 | core-40 | core-60 | core-80 |
| --- | ---: | ---: | ---: | ---: | ---: |
| AI Foundations | 40 | 5/40 (12.5%) | 12/40 (30.0%) | 19/40 (47.5%) | 24/40 (60.0%) |
| Vibe Coding & Agentic Software Engineering | 12 | 2/12 (16.7%) | 6/12 (50.0%) | 7/12 (58.3%) | 8/12 (66.7%) |
| LLM Application Engineering | 14 | 4/14 (28.6%) | 5/14 (35.7%) | 7/14 (50.0%) | 9/14 (64.3%) |
| RAG & Knowledge Systems | 16 | 4/16 (25.0%) | 7/16 (43.8%) | 9/16 (56.3%) | 10/16 (62.5%) |
| Agent Engineering | 20 | 3/20 (15.0%) | 7/20 (35.0%) | 9/20 (45.0%) | 12/20 (60.0%) |
| Multi-Agent & Orchestration | 9 | 2/9 (22.2%) | 3/9 (33.3%) | 5/9 (55.6%) | 6/9 (66.7%) |
| Production AI Reliability | 22 | 3/22 (13.6%) | 7/22 (31.8%) | 10/22 (45.5%) | 14/22 (63.6%) |
| Model Engineering | 9 | 0/9 (0.0%) | 3/9 (33.3%) | 6/9 (66.7%) | 6/9 (66.7%) |
| Write a Book with AI | 11 | 4/11 (36.4%) | 7/11 (63.6%) | 7/11 (63.6%) | 9/11 (81.8%) |
| Build an AI Knowledge Base | 10 | 1/10 (10.0%) | 6/10 (60.0%) | 9/10 (90.0%) | 9/10 (90.0%) |
| Research with AI | 10 | 3/10 (30.0%) | 6/10 (60.0%) | 8/10 (80.0%) | 8/10 (80.0%) |
| Data Analysis with AI | 7 | 1/7 (14.3%) | 5/7 (71.4%) | 5/7 (71.4%) | 6/7 (85.7%) |
| Create a Course or Knowledge Product with AI | 9 | 0/9 (0.0%) | 3/9 (33.3%) | 5/9 (55.6%) | 6/9 (66.7%) |
| Run a Solo Business with AI | 9 | 2/9 (22.2%) | 4/9 (44.4%) | 6/9 (66.7%) | 6/9 (66.7%) |
| AI Customer Support | 10 | 3/10 (30.0%) | 8/10 (80.0%) | 10/10 (100.0%) | 10/10 (100.0%) |

## core-20 → core-40 additions

The 20 canonical Concepts were:

1. `concept-evaluation-evidence`
2. `concept-document-extraction`
3. `concept-human-review-boundary`
4. `concept-model-selection-tradeoff`
5. `concept-copyright-provenance`
6. `concept-synthetic-data-distillation`
7. `concept-specification-before-generation`
8. `concept-supervised-finetuning`
9. `concept-editorial-voice-control`
10. `concept-vector-similarity`
11. `concept-confidence-variance`
12. `concept-tool-result-validation`
13. `concept-versioned-dependencies`
14. `concept-auditability`
15. `concept-verification-over-introspection`
16. `concept-uncertainty-calibration`
17. `concept-retrieval-pipeline`
18. `concept-knowledge-base-lifecycle`
19. `concept-tool-contract`
20. `concept-retrieval-evaluation`

This wave closed both zero-coverage Paths while reaching the maximum possible **89 covered Path–Concept memberships** for any 40-Guide superset of core-20.

## core-40 → core-60 additions

The following 20 Concepts raised the minimum Path floor to 45%:

1. `concept-pretraining-objective`
2. `concept-parallel-agent-work`
3. `concept-visual-briefing`
4. `concept-model-capability-envelope`
5. `concept-least-privilege`
6. `concept-verification-loop`
7. `concept-latency-throughput-basics`
8. `concept-trust-boundary`
9. `concept-traceability`
10. `concept-slices-regression`
11. `concept-preference-posttraining`
12. `concept-prompt-decomposition`
13. `concept-privacy-data-boundary`
14. `concept-memory-lifecycle`
15. `concept-research-question-decomposition`
16. `concept-topology-tradeoffs`
17. `concept-multimodal-iteration`
18. `concept-open-closed-model-tradeoff`
19. `concept-memory-expiry`
20. `concept-customer-support-copilot`

Pure reuse ranking could cover 123/208 memberships at 60 Guides, but left Production AI Reliability at 40.9%. The selected wave covers 122/208 and raises every Path to at least 45%.

## core-60 → core-80 additions

The next 20 Concepts raise the weakest Paths to at least 60% while keeping the theoretical maximum 143 covered memberships:

1. `concept-next-token-generation`
2. `concept-sampling-controls`
3. `concept-embeddings-semantic-space`
4. `concept-hallucination`
5. `concept-context-vs-memory`
6. `concept-checkpoint-resume`
7. `concept-async-long-running`
8. `concept-reversible-actions`
9. `concept-retry-amplification`
10. `concept-prompt-injection-defense`
11. `concept-online-monitoring`
12. `concept-rollout-fallback`
13. `concept-context-compaction`
14. `concept-streaming-backpressure`
15. `concept-learning-objective-design`
16. `concept-coordination-overhead`
17. `concept-reranking`
18. `concept-test-first-ai`
19. `concept-fact-check-revision`
20. `concept-data-analysis-verification`

The wave intentionally mixes foundational search-worthy concepts (`hallucination`, embeddings, sampling), production failure concepts (retry amplification, injection defense, monitoring, rollout), runtime continuity (checkpoint/resume, asynchronous work, compaction), and outcome-path concepts with direct Practice connections.

## Metric definition

For a Concept `c` and Path `p`:

- `M(c,p) = 1` when `c` appears in any milestone of `p`, otherwise `0`.
- repeated references to the same Concept inside one Path count once.
- `reuse(c) = Σp M(c,p)`.
- `pathCoverage(p) = guidedConcepts(p) / concepts(p)`.
- `membershipCoverage = Σ guided reuse(c) / 208`.

The selection policy remains constrained set cover for hard matrix floors. Once reuse ceases to distinguish candidates, editorial selection adds explicit retrieval value, Practice adjacency and pedagogical distinctiveness without changing the canonical graph.

## Reproducibility

Run:

```bash
python scripts/guide_coverage.py
python scripts/guide_coverage.py --check
python scripts/guide_coverage.py --json
```

The machine-readable wave plan lives at `content/guides/coverage-plan-v1.0.json`.

## Implementation sequencing

1. Preserve all prior wave sets as cumulative frozen baselines.
2. Author each new wave with EN / zh-CN parity and one canonical Concept binding per Guide.
3. Re-run coverage, Guide quality, route parity and browser interaction checks before merge.
4. After core-80, audit Practice density before freezing core-100 candidates.
5. Re-run the matrix after any Path inventory change; do not assume rankings remain valid if the graph changes.
6. Do not automatically target 145 long-form Guides. Remaining Concepts need an intentional treatment decision, and full Guides should stop when additional long-form coverage no longer materially improves the learning product.
