# Concise Concept Surface — Content Completeness V1

## Decision

AhaFrame now treats a concise Concept explanation as the **baseline readable surface for every canonical Concept**.

The canonical inventory contains **145 Concepts**. Core-120 provides **120 substantial OPEN Guides**, while #199 intentionally leaves **25 Concepts without full Guides**. A full Guide is therefore an enrichment layer, not a prerequisite for understanding what a Concept means.

The structural contract is:

```text
145 canonical Concepts
        ↓
145 bilingual concise Concept explanations
        ↓
├─ 120 Concepts → optional deeper full Guide
└─ 25 Concepts → intentional non-Guide treatment from #199
```

This completes the readable surface without introducing Core-140/Core-145 publication waves.

## Canonical copy source

`content/ai-knowledge-concise-v1.0.json` is the canonical concise presentation policy.

Every Concept resolves three localized fields:

- `summary` — what the Concept is;
- `mentalModel` — how to think about or apply the boundary;
- `whyItMatters` — why the distinction changes engineering or workflow decisions.

The policy contains bilingual templates for every canonical Concept kind and exact authored EN / zh-CN overrides for the **25 post-Core-120 residual Concepts**.

Those 25 authored overrides are required because the residual set is exactly where the product has deliberately chosen *not* to rely on a full Guide. Their concise copy must therefore be meaningful on its own rather than being generated from a generic fallback.

The 120 Guide-backed Concepts also resolve a concise baseline independently of Guide bodies. The Guide can be richer, but deleting or changing a Guide does not erase the Concept's basic explanation contract.

## Presentation architecture

The architecture remains one canonical knowledge system:

```text
Canonical Concept inventory
      │
      ├─ identity / kind / branches / sources
      │
      ├─ concise presentation policy
      │      └─ EN + zh-CN summary / mental model / why-it-matters
      │
      ├─ canonical Paths
      │      └─ Concept Course memberships
      │
      ├─ canonical relationship edges
      │      └─ Related Concepts
      │
      └─ Guide binding
             └─ optional deeper Guide
```

No second curriculum, relationship graph, Guide ordering graph, or Concept membership source is introduced.

### Backward-compatible materialization

The existing localized Knowledge Graph artifacts remain backward compatible with their established `{ title, summary }` Concept shape.

`scripts/build_ai_knowledge_graph_v1.py` now derives the localized `summary` from the canonical concise policy. The richer `mentalModel` and `whyItMatters` fields are resolved from the same policy by the runtime read model.

This keeps old graph consumers stable while making the richer concise surface available to the current product.

## Knowledge Map

The Knowledge Map is the primary readable surface for canonical Concepts.

Each Concept can now be expanded to show:

- localized title;
- concise summary;
- mental model;
- why it matters;
- canonical Course memberships;
- graph-derived related Concepts;
- a full Guide link only when the Concept actually has a published Guide.

Course membership is derived from canonical `Path.milestones[].conceptIds`. Related Concepts are derived from canonical relationship edges. Neither is authored inside the concise copy policy.

A residual Concept such as `concept-sequence-ordering` therefore remains fully readable even though it has no Guide. It can link to its canonical Course but must not fabricate a Guide destination.

## Search

Unified Search consumes the same Knowledge Map read model.

Every Concept search document now indexes:

- its canonical concise summary;
- mental model;
- why-it-matters copy;
- graph-derived related Concept titles;
- branch / domain / Path metadata.

A Concept with a Guide still routes to the Guide. A Concept without a Guide remains a Concept result and routes to the Knowledge Map rather than inventing a Guide route.

The search corpus count does not change because #202 enriches the existing **145 Concept documents** rather than adding a second document type.

## EN / zh-CN parity

Parity is structural and machine-checked:

- exactly 145 canonical Concept IDs;
- every Concept resolves all three concise fields in both `en` and `zh-CN`;
- exact 25 residual Concepts have authored overrides in both locales;
- unresolved `{title}`, `TODO`, or `TBD` placeholders fail validation;
- localized materialized summaries must match the canonical concise policy;
- Guide binding remains 120 / 120 in exact EN / zh-CN parity.

## Validation

Run:

```bash
python3 scripts/build_ai_knowledge_graph_v1.py --write
python3 scripts/test_concise_concepts.py
```

The normal core validation chain also executes this contract before lint, typecheck, Next build, route smoke and browser interaction tests.

Browser coverage verifies both sides of the hierarchy:

- a non-Guide Concept exposes its authored concise explanation and canonical Course membership without a fake Guide link;
- a Guide-backed Concept exposes the same concise layer plus its real Guide destination;
- Chinese preserves the same interaction and authored residual copy.

## Completion boundary

#202 completes the **readable Concept layer** for Content Completeness V1.

It does not:

- increase the Guide count above 120;
- create Concept detail routes or a second navigation system;
- create new Practice evidence;
- change Course ordering;
- change Guide membership;
- change billing/auth behavior;
- change deterministic Practice runtimes.

Future individual Guide promotion remains governed by the #199 `FULL_GUIDE_ON_TRIGGER` policy and requires new evidence.
