# Practice Density Audit — Core-120

## Decision

Core-120 expands the Guide publication from 100 to 120 without fabricating new Practice evidence.

A Guide CTA and explicit Practice evidence remain different claims:

- every published Guide must point to a real public Practice route;
- a Concept counts as explicitly practiced only when the canonical production/reconciliation evidence says an existing interaction genuinely exercises that Concept;
- expanding Guide breadth is allowed to increase the denominator without inventing new runtime mappings.

## Core-120 publication target

- published Guides: 120 / 145 Concepts = 82.8%
- Guide-backed Path–Concept memberships: 183 / 208 = 88.0%
- Path reach: 15 / 15
- minimum published Guide Path coverage: 85.0%
- Guide Practice links: 120 / 120

## Expected evidence after publication

The production plan remains unchanged at 17 Experiences / 19 Path memberships / 15 Paths.

The bounded #214 reconciliation layer remains unchanged at 21 evidence Practices / 25 Path memberships / 15 Paths.

Repository checks are expected to establish the following reconciled Core-120 state:

- 80 / 120 Guide Concepts with explicit Practice evidence = 66.7%
- 96 / 183 same-Path Guide-backed memberships = 52.5%
- 10 / 20 Core-120 additions with exact same-Path Practice evidence = 50.0%

These numbers are not granted by this document. `scripts/practice_density.py --check` recomputes them from the canonical production plan, reconciliation contract, current Guide set and canonical Paths. If repository computation disagrees, the implementation must inspect the evidence and correct the frozen expectation rather than adding mappings to make the metric fit.

## The ten already-evidenced Core-120 additions

- `concept-prompt-specificity`
- `concept-delegation-state`
- `concept-compensation-recovery`
- `concept-release-economics`
- `concept-failure-attribution`
- `concept-finetune-dataset-design`
- `concept-research-to-outline`
- `concept-claim-evidence-matrix`
- `concept-media-quality-review`
- `concept-customer-problem-research`

The other ten additions may link to related existing Practice for navigation, but that does not promote them into explicit evidence.

## Interpretation

Core-120 is a teaching-coverage decision, not a Practice-percentage optimization. A lower percentage after publication is acceptable when the numerator remains honest and the new Guides close meaningful learning gaps.

New Practice work after Core-120 should be created only when an interaction exposes a real variable, consequence or verification decision that strengthens `Understand → Decide → Practice → Transfer`. No runtime should be added merely to defend a target density percentage.

## Reproducibility

```bash
python3 scripts/practice_density.py
python3 scripts/practice_density.py --json
python3 scripts/practice_density.py --check
```
