# Practice Density Audit — Core-100

## Decision

Core-100 expands the Guide publication from 80 to 100 without fabricating new Practice evidence.

A Guide CTA and explicit Practice evidence remain different things:

- all **100 / 100 Guides** point to real public Practice routes;
- a Concept counts as explicitly practiced only when the existing production/reconciliation contract says the interaction genuinely exercises that Concept;
- publishing a new Guide is allowed to increase the denominator without increasing the evidence numerator.

That keeps `Guide → Practice` navigation useful while preserving the meaning of `Practiced` evidence.

## Verified Core-100 publication

- published Guides: **100 / 145 Concepts = 69.0%**
- Guide-backed Path–Concept memberships: **163 / 208 = 78.4%**
- Path reach: **15 / 15**
- minimum published Guide Path coverage: **72.7%**
- Guide Practice links: **100 / 100**
- unique Guide Practice targets: **23**

## Practice evidence after publication

### Production-only evidence

The original production plan remains unchanged at **17 Experiences / 19 Path memberships / 15 Paths**.

Against the new Core-100 Guide denominator it covers:

- **49 / 100 Guide Concepts**
- **61 / 163 same-Path Guide-backed memberships = 37.4%**
- **9 / 20 Core-100 additions**

### Reconciled evidence

The bounded #214 reconciliation layer remains unchanged at **21 evidence Practices / 25 Path memberships / 15 Paths**.

Against Core-100 it covers:

- **70 / 100 Guide Concepts = 70.0%**
- **86 / 163 same-Path Guide-backed memberships = 52.8%**
- **14 / 20 Core-100 additions = 70.0%**

The difference between production-only and reconciled coverage comes only from existing runtimes whose controls, consequences or evidence already earned additional canonical Concept mappings. No new Practice runtime was created for Core-100.

## Per-Path reconciled Practice density

| Path | Published Guide Concepts | Explicitly practiced Guide Concepts | Coverage |
| --- | ---: | ---: | ---: |
| AI Foundations | 30 | 8 | 26.7% |
| Model Engineering | 7 | 2 | 28.6% |
| Research with AI | 8 | 3 | 37.5% |
| Vibe Coding & Agentic Software Engineering | 9 | 4 | 44.4% |
| LLM Application Engineering | 11 | 5 | 45.5% |
| RAG & Knowledge Systems | 12 | 6 | 50.0% |
| AI Customer Support | 10 | 5 | 50.0% |
| Write a Book with AI | 9 | 5 | 55.6% |
| Create a Course or Knowledge Product with AI | 7 | 4 | 57.1% |
| Run a Solo Business with AI | 7 | 4 | 57.1% |
| Agent Engineering | 15 | 10 | 66.7% |
| Build an AI Knowledge Base | 9 | 6 | 66.7% |
| Data Analysis with AI | 6 | 4 | 66.7% |
| Multi-Agent & Orchestration | 7 | 6 | 85.7% |
| Production AI Reliability | 16 | 14 | 87.5% |

## Core-100 additions

The #198 ranking predicted that **14 / 20** selected Concepts already had exact same-Path Practice proximity after #214. The publication audit confirms exactly **14 / 20**.

The remaining six Core-100 additions may still have useful related Practice navigation, but they are not promoted into explicit evidence merely because the Guide links to a Practice.

## Interpretation

Practice-density percentages should not be optimized as vanity metrics. When Guide coverage grows faster than Practice evidence, the denominator can increase and the percentage can fall even though no existing Practice regressed.

The next Practice-expansion decision should therefore ask:

1. Which residual Guide Concepts change a real engineering or product decision?
2. Is there already an existing runtime that exercises the Concept but is missing a justified mapping?
3. If not, can a new Lab / Mission / Incident / Build expose a meaningful variable, consequence or verification step?
4. Would the new runtime strengthen `Understand → Decide → Practice → Transfer`, rather than merely illustrate terminology?

Only gaps that survive those questions should produce new interactive runtimes.

## Reproducibility

Run:

```bash
python3 scripts/practice_density.py
python3 scripts/practice_density.py --json
python3 scripts/practice_density.py --check
```

The audit composes the canonical 17-Experience production plan with `content/practice-evidence-reconciliation-v1.0.json` and validates that every reconciled Practice, Path, Concept, public route and evidence source still resolves.
