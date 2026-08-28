# AhaFrame Development Roadmap

Date: 2026-08-28  
Version: v1.0 — AI Knowledge Graph expansion  
Status: active execution roadmap

## Current product direction

AhaFrame is an interactive **AI Knowledge & Practice Map**.

```text
AI
├── Understand AI
├── Build AI
└── Use AI
```

The learner browses a tree, but the canonical curriculum is a reusable graph:

```text
Domain / Branch
    ↓ browse hierarchy
Concept + typed Edge
    ↓ canonical knowledge identity
Path
    ↓ goal-specific projection
Content / Experience
    ↓ Guide / Lab / Mission / Incident / Build
Runtime
    ↓ deterministic interaction / simulation
```

Core product rule:

> **The library may be broad; each learner path must remain small and legible.**

AhaFrame keeps the Incident-first learning method:

```text
SEE THE FAILURE
→ INSPECT EVIDENCE
→ FORM A HYPOTHESIS
→ CHANGE POLICY / ARCHITECTURE
→ RUN
→ OBSERVE CONSEQUENCES
→ COMPARE / RETRY
→ SHIP / BLOCK / INCONCLUSIVE
→ DEBRIEF
→ TRANSFER
```

## Current sources of truth

- `docs/ROADMAP.md` — current phase order and stop lines;
- #143 — AI Knowledge Graph v1.0 population Epic;
- `content/ai-knowledge-inventory-v1.0/` — authoring inventory;
- `content/ai-content-production-v1.0.json` — Experience production waves;
- `docs/AI_KNOWLEDGE_GRAPH_V1.md` — graph architecture and authoring rules;
- `docs/AI_KNOWLEDGE_FRESHNESS_V1.md` — version-sensitive source policy;
- `docs/AI_CONTENT_PRODUCTION_V1.md` — production-wave strategy;
- #125 — Content Readiness gate;
- #14 — Billing implementation, still gated and not production-active.

---

# Phase A — Knowledge Graph foundation

**Status: COMPLETE**

Completed:

- #141 — canonical v1 schema;
- #144 — complete canonical inventory;
- 3 Domains;
- 45 browse Branches;
- 145 reusable Concepts;
- 80 typed relationships;
- 15 goal-oriented Paths;
- 52/52 v0.9 Mental Models explicitly mapped;
- EN / zh-CN presentation parity;
- v0.9 public content routes preserved.

The v1 graph remains schema-compatible with the original contract. Courses and Paths are projections over canonical Concepts rather than duplicated curricula.

---

# Phase B — Freshness and content-production plan

**Status: ACTIVE / CLOSING**

## #145 Freshness review

Version-sensitive concepts are reviewed against current primary sources while durable concepts remain vendor-neutral.

Current high-change areas include:

- MCP protocol and Tasks semantics;
- Agent evaluation methodology;
- agentic-coding sandbox / permission operations;
- adapter fine-tuning / PEFT;
- inference serving and quantization guidance.

## #146 Production waves

The first bounded content-production backlog contains 17 Experiences across 3 waves and covers all 15 v1 Paths.

Follow-up implementation packs:

- #152 — Wave 1 / first-value experiences;
- #153 — Wave 2 / systems and outcome builds;
- #154 — Wave 3 / orchestration, production, model adaptation and solo business.

Content production may continue without reorganizing the curriculum because every Experience references canonical Concept/Path IDs.

---

# Phase C — Roadmap reconciliation

**Status: CURRENT — #147**

The old v0.9 content-pack roadmap is historical input, not a parallel current plan.

Legacy issues #117 and #120–#123 contributed the Agent Engineering depth that is now absorbed by the larger v1 graph. Their useful acceptance criteria remain provenance for #152–#154, but their 10-stage / 45–55-model boundary no longer defines product scope.

#126 is satisfied when this roadmap and the legacy issue states point to one current v1 execution chain.

#125 remains open because Content Readiness is still a real gate; its inventory expectations must now be generated from v1 production data rather than the old fixed 45–55-model target.

---

# Phase D — Knowledge Map runtime projection

**Status: NEXT — #148**

After the inventory and production contract are stable, migrate `/[locale]/learning` from the v0.9 10-stage projection to the v1 Knowledge Map.

Required behavior:

- progressive disclosure instead of dumping 145 nodes;
- top-level `Understand AI / Build AI / Use AI` exploration;
- goal-oriented Path selection;
- Concept reuse visible across Paths;
- current public Experience routes preserved;
- anonymous learning state preserved/migrated;
- EN / zh-CN parity;
- no fake mastery, XP, streak or badge claims.

The Knowledge Map/catalog itself stays openly explorable.

---

# Phase E — Free-choice entitlement foundation

**Status: AFTER #148 — #149**

Commercial access policy:

```text
Visitor
→ browse the Knowledge Map
→ use the flagship open experience

Free Account
→ permanently choose 3 FREE_CHOICE Experiences

Membership
→ unlock the standard membership library
```

Important boundary:

> The number `3`, user unlocks and subscription state belong to the entitlement layer, not to curriculum data.

#149 may implement the entitlement model and lock-state behavior, but it does **not** activate payment by itself.

---

# Phase F — Content Readiness and Billing

**Status: GATED — #125 → #14**

Paid activation requires both product and content evidence.

```text
Knowledge Graph + production Experiences
        ↓
repeatable multi-session learning value
        ↓
#125 Content Readiness
        ↓
READY FOR PAID CONTENT
        ↓
#14 Waffo test-mode + verified server reconciliation
        ↓
explicit production Billing decision
```

Billing is not enabled merely because entitlement code or checkout infrastructure exists.

The final Free/Paid surface must reflect actually shipped content. Catalog visibility, free-choice selection and membership access remain provider-independent; Waffo is only the payment adapter.

---

# Current next action

```text
finish #146 production manifest
        ↓
#147 reconcile legacy roadmap
        ↓
#148 ship v1 Knowledge Map runtime projection
        ↓
#149 ship provider-independent free-choice entitlement foundation
        ↓
implement #152–#154 content waves
        ↓
run #125 Content Readiness
        ↓
only then decide whether #14 may activate Billing
```

---

# Historical provenance — v0.7 / v0.8 / v0.9

The earlier Validation Alpha roadmap remains historically valid evidence for why AhaFrame uses deterministic Labs, Incidents, anonymous-first progression and explicit Product Gates.

Completed historical work included:

- six-layer Prompt / Context / Harness / Loop / Graph / Evaluation closure;
- Token, Context, Agent Loop, RAG, Compression, Retry, Prompt Injection, Evaluation and Workflow Graph experiences;
- Reliable Support Agent Final Boss;
- validation runtime, Supabase evidence system and Product Gate tooling;
- current Next.js production migration;
- Curriculum v0.9 with 10 stages and 52 decision-changing mental models.

The old instruction **“STOP CONTENT EXPANSION BY DEFAULT”** was appropriate for the validation-sized v0.7 phase. It is no longer the current execution rule after the deliberate v0.9/v1 decision to build a deeper Knowledge Graph before paid activation.

History is preserved; the active product boundary has changed.
