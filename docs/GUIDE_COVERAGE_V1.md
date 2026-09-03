# Guide Coverage v1 — 145 Concepts × 15 Paths

## Decision

Guide density should grow by **Path gap + Concept reuse**, not by raw Guide count.

The Knowledge Graph has 145 reusable Concepts projected into 15 Paths. After deduplicating repeated Concept references inside the same Path, the binary Concept × Path matrix contains **208 positive Path–Concept memberships**.

The current `core-20` Guide wave covers 20/145 Concepts, but its Path coverage is uneven. Two Paths have no Guide-backed Concept at all: **Model Engineering** and **Create a Course or Knowledge Product with AI**.

For the next waves:

- **core-40**: require every Path to reach at least **30%** Guide coverage, while maximizing covered Path–Concept memberships.
- **core-60**: require every Path to reach at least **45%** Guide coverage, while preserving nearly all available reuse efficiency.

This policy keeps Guides canonical to Concepts while using Path membership only as a prioritization signal.

## Coverage summary

| Stage | Concept coverage | Path–Concept membership coverage | Path reach | Minimum Path coverage | Reuse efficiency |
| --- | ---: | ---: | ---: | ---: | ---: |
| core-20 | 20/145 (13.8%) | 37/208 (17.8%) | 13/15 | 0.0% | baseline |
| core-40 | 40/145 (27.6%) | 89/208 (42.8%) | 15/15 | 30.0% | 89/89 theoretical max (100%) |
| core-60 | 60/145 (41.4%) | 122/208 (58.7%) | 15/15 | 45.0% | 122/123 theoretical max (99.2%) |

At 60 Guides we intentionally give up one theoretical membership slot versus pure reuse ranking in order to raise the weakest Path floor from 40.9% to 45.0%.

## Path-by-Path projection

| Path | Concepts | core-20 | core-40 | core-60 |
| --- | ---: | ---: | ---: | ---: |
| AI Foundations | 40 | 5/40 (12.5%) | 12/40 (30.0%) | 19/40 (47.5%) |
| Vibe Coding & Agentic Software Engineering | 12 | 2/12 (16.7%) | 6/12 (50.0%) | 7/12 (58.3%) |
| LLM Application Engineering | 14 | 4/14 (28.6%) | 5/14 (35.7%) | 7/14 (50.0%) |
| RAG & Knowledge Systems | 16 | 4/16 (25.0%) | 7/16 (43.8%) | 9/16 (56.3%) |
| Agent Engineering | 20 | 3/20 (15.0%) | 7/20 (35.0%) | 9/20 (45.0%) |
| Multi-Agent & Orchestration | 9 | 2/9 (22.2%) | 3/9 (33.3%) | 5/9 (55.6%) |
| Production AI Reliability | 22 | 3/22 (13.6%) | 7/22 (31.8%) | 10/22 (45.5%) |
| Model Engineering | 9 | 0/9 (0.0%) | 3/9 (33.3%) | 6/9 (66.7%) |
| Write a Book with AI | 11 | 4/11 (36.4%) | 7/11 (63.6%) | 7/11 (63.6%) |
| Build an AI Knowledge Base | 10 | 1/10 (10.0%) | 6/10 (60.0%) | 9/10 (90.0%) |
| Research with AI | 10 | 3/10 (30.0%) | 6/10 (60.0%) | 8/10 (80.0%) |
| Data Analysis with AI | 7 | 1/7 (14.3%) | 5/7 (71.4%) | 5/7 (71.4%) |
| Create a Course or Knowledge Product with AI | 9 | 0/9 (0.0%) | 3/9 (33.3%) | 5/9 (55.6%) |
| Run a Solo Business with AI | 9 | 2/9 (22.2%) | 4/9 (44.4%) | 6/9 (66.7%) |
| AI Customer Support | 10 | 3/10 (30.0%) | 8/10 (80.0%) | 10/10 (100.0%) |

## core-20 → core-40 additions

The next 20 canonical Concepts are:

1. `concept-evaluation-evidence` — reuse 6 Paths
2. `concept-document-extraction` — reuse 2 Paths
3. `concept-human-review-boundary` — reuse 5 Paths
4. `concept-model-selection-tradeoff` — reuse 3 Paths
5. `concept-copyright-provenance` — reuse 3 Paths
6. `concept-synthetic-data-distillation` — reuse 2 Paths
7. `concept-specification-before-generation` — reuse 2 Paths
8. `concept-supervised-finetuning` — reuse 2 Paths
9. `concept-editorial-voice-control` — reuse 2 Paths
10. `concept-vector-similarity` — reuse 2 Paths
11. `concept-confidence-variance` — reuse 2 Paths
12. `concept-tool-result-validation` — reuse 2 Paths
13. `concept-versioned-dependencies` — reuse 2 Paths
14. `concept-auditability` — reuse 2 Paths
15. `concept-verification-over-introspection` — reuse 3 Paths
16. `concept-uncertainty-calibration` — reuse 2 Paths
17. `concept-retrieval-pipeline` — reuse 3 Paths
18. `concept-knowledge-base-lifecycle` — reuse 3 Paths
19. `concept-tool-contract` — reuse 2 Paths
20. `concept-retrieval-evaluation` — reuse 2 Paths

This wave closes both zero-coverage Paths while still reaching the maximum possible **89 covered Path–Concept memberships** for any 40-Guide superset of the current core-20.

## core-40 → core-60 additions

The following 20 Concepts raise the minimum Path floor to 45%:

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

Pure reuse ranking can cover 123/208 memberships at 60 Guides, but leaves Production AI Reliability at 40.9%. The selected wave covers 122/208 and raises every Path to at least 45%.

## Metric definition

For a Concept `c` and Path `p`:

- `M(c,p) = 1` when `c` appears in any milestone of `p`, otherwise `0`.
- repeated references to the same Concept inside one Path count once.
- `reuse(c) = Σp M(c,p)`.
- `pathCoverage(p) = guidedConcepts(p) / concepts(p)`.
- `membershipCoverage = Σ guided reuse(c) / 208`.

The selection policy is a constrained set-cover strategy: close the lowest Path coverage gaps to the stage floor, then prefer candidates that cover the largest number of still-useful Path memberships.

## Reproducibility

Run:

```bash
python scripts/guide_coverage.py
python scripts/guide_coverage.py --check
python scripts/guide_coverage.py --json
```

The machine-readable wave plan lives at `content/guides/coverage-plan-v1.0.json`.

## Implementation sequencing

1. Merge the existing core-20 Guide system.
2. Author the 20 `core-40` additions with EN / zh-CN parity and one canonical Concept binding per Guide.
3. Re-run coverage and parity checks before shipping core-40.
4. Author the 20 `core-60` additions.
5. Re-run coverage after any Path inventory change; do not assume this ranking remains valid if the graph changes.
