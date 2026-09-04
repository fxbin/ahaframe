# Practice Density Audit — Core-80

## Decision

After Core-80, AhaFrame does **not** have a Guide-link problem. It has a **Practice evidence density** problem.

All 80 published Guides already point to real public Practice routes, so adding another generic CTA or inventing one Practice per Guide would create duplication without improving the learning system.

The stricter question is:

> Does the existing interactive Practice explicitly exercise the canonical Concept that the Guide teaches, inside the same Course where that Concept is being learned?

Measured against `ai-content-production-v1.0.json`, the answer is still uneven.

## Core-80 baseline

- published Guides: **80**
- Guides with real public Practice links: **80 / 80 = 100%**
- production Experiences: **17**
- production Path–Practice memberships: **19**
- Path reach: **15 / 15**
- production Practice types:
  - 1 Playground
  - 4 Missions
  - 3 Incidents
  - 3 Labs
  - 6 Builds
- Guide Concepts explicitly named by at least one production Experience: **40 / 80 = 50.0%**
- Guide-backed Path–Concept memberships explicitly practiced by a production Experience in the same Path: **52 / 143 = 36.4%**
- Core-80 additions specifically: **9 / 21 = 42.9%** same-Path explicit Practice coverage

These metrics intentionally do **not** say the remaining Guides have no useful Practice. Several Guides already route to strong specialist or legacy experiences such as Context Compression, Instruction Conflict, Evaluation Failure and Agent Workflow Graph. They say those existing interactions are not yet consistently represented in the current v1 production Concept evidence contract.

## Per-Path explicit Practice density

| Path | Guide-backed Concepts | Production Practices | Explicitly practiced Guide Concepts | Coverage |
| --- | ---: | ---: | ---: | ---: |
| AI Foundations | 24 | 1 | 3 | 12.5% |
| Multi-Agent & Orchestration | 6 | 1 | 1 | 16.7% |
| Model Engineering | 6 | 1 | 1 | 16.7% |
| LLM Application Engineering | 9 | 1 | 2 | 22.2% |
| Production AI Reliability | 14 | 2 | 4 | 28.6% |
| RAG & Knowledge Systems | 10 | 1 | 3 | 30.0% |
| Vibe Coding & Agentic Software Engineering | 8 | 1 | 3 | 37.5% |
| Research with AI | 8 | 1 | 3 | 37.5% |
| Write a Book with AI | 9 | 1 | 4 | 44.4% |
| Create a Course or Knowledge Product with AI | 6 | 1 | 3 | 50.0% |
| Run a Solo Business with AI | 6 | 1 | 3 | 50.0% |
| AI Customer Support | 10 | 1 | 5 | 50.0% |
| Agent Engineering | 12 | 3 | 7 | 58.3% |
| Build an AI Knowledge Base | 9 | 2 | 6 | 66.7% |
| Data Analysis with AI | 6 | 1 | 4 | 66.7% |

This is a deliberately strict measure. A Concept counts only when a production Experience assigned to that Path explicitly declares the Concept in its canonical `conceptIds`.

## What Core-80 revealed

The 20 new Guides added 21 Path–Concept memberships. Nine are already explicitly practiced in the same Path:

- `concept-test-first-ai`
- `concept-streaming-backpressure`
- `concept-async-long-running`
- `concept-checkpoint-resume`
- `concept-coordination-overhead`
- `concept-rollout-fallback`
- `concept-fact-check-revision`
- `concept-data-analysis-verification`
- `concept-learning-objective-design`

The largest newly visible gaps are not random. They cluster around existing interactive surfaces:

- next-token generation and sampling already sit next to Token Playground;
- context compaction already has Context Compression Lab;
- prompt-injection defense and trust boundaries already have Instruction Conflict / Prompt Injection Attack;
- topology trade-offs and parallel work already have Agent Workflow Graph and Multi-Agent Incident;
- evaluation slices / confidence / release evidence already have Evaluation Failure and Production Release Gate;
- RAG ranking concepts already have Broken RAG Pipeline nearby.

That makes **contract reconciliation** the next highest-leverage move before creating another batch of runtimes.

## Recommendation — Practice Reconciliation before Practice Expansion

### P0 — Reconcile existing interactive evidence

Audit the current specialist/legacy Practices against canonical Concepts and add Concept mappings only when the interaction genuinely exercises the Concept. High-value candidates:

1. **Token Playground**
   - `concept-next-token-generation`
   - `concept-sampling-controls`

2. **Context Compression Lab**
   - `concept-context-compaction`
   - relevant context-budget / context-management Concepts where the controls actually test them

3. **Instruction Conflict / Prompt Injection Attack**
   - `concept-prompt-injection-defense`
   - `concept-trust-boundary`
   - runtime enforcement only if the existing intervention actually demonstrates it

4. **Agent Workflow Graph / Multi-Agent Incident**
   - `concept-topology-tradeoffs`
   - `concept-parallel-agent-work` only if the current simulation exposes real parallel coordination consequences

5. **Evaluation Failure / Production Release Gate**
   - `concept-slices-regression`
   - `concept-confidence-variance`
   - `concept-online-monitoring` only if online evidence is actually present

6. **Broken RAG Pipeline**
   - `concept-reranking` only if candidate ordering/ranking is an observable decision in the current runtime

The rule is strict: **do not improve the metric by adding labels that the interaction does not earn**.

### P1 — Recompute density after reconciliation

Run `scripts/practice_density.py --check` and compare:

- 40/80 globally explicit Guide Concept coverage;
- 52/143 same-Path explicit Practice memberships;
- the six low-density Paths above;
- Core-80 additions at 9/21.

Only then identify gaps that truly require a new Lab / Mission / Incident / Build.

### P2 — Build new Practice only for residual decision-changing gaps

A new runtime should require all of the following:

- the Concept changes an engineering decision;
- no existing Practice can exercise it without semantic distortion;
- the interaction has a meaningful variable, consequence or verification step;
- it strengthens `Understand → Decide → Practice → Transfer`, rather than merely illustrating terminology;
- it has a real completion/evidence semantic if it is expected to produce `Practiced` state.

## Implication for Core-100

Do **not** rank Core-100 solely from the current 36.4% Practice-density number. First reconcile existing Practice evidence, then use the corrected density as an input to #198.

The content strategy remains:

```text
Core-80
  ↓
Practice evidence reconciliation
  ↓
recompute real gaps
  ↓
Core-100 candidate ranking
  ↓
only then decide whether new Practice runtimes are required
```

## Reproducibility

Run:

```bash
python3 scripts/practice_density.py
python3 scripts/practice_density.py --json
python3 scripts/practice_density.py --check
```

The audit separates navigation coverage from learning evidence intentionally. A public link is not treated as proof of Practice coverage, and opening or merely attempting a Practice still does not imply `Practiced` evidence.
