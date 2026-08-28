# AhaFrame AI Knowledge Graph v1.0

Status: **schema complete / seed graph draft**  
Issue: #141

## 1. Product model

AhaFrame v1 treats the curriculum as one reusable AI knowledge graph rather than a growing list of courses.

```text
AI
├── Understand AI
├── Build AI
└── Use AI
```

The important architectural rule is:

> **The learner may browse a tree, but the canonical knowledge model is a graph.**

A strict tree would duplicate concepts such as Context Management, Source Authority or Evaluation across Vibe Coding, RAG, Agents, long-form writing and knowledge-base projects. v1 therefore separates browse hierarchy from knowledge identity.

## 2. Canonical layers

```text
Domain / Branch
    ↓ browse hierarchy / progressive disclosure

Concept + typed Edge
    ↓ canonical reusable knowledge graph

Path
    ↓ goal-specific projection over concepts/content

Content Node
    ↓ Guide / Lab / Mission / Incident / Build / ...

Runtime
    ↓ deterministic simulation / interaction engine (separate)
```

### Domain

The stable top-level product roots:

- `domain-understand-ai`
- `domain-build-ai`
- `domain-use-ai`

Domains answer **why the learner is here**.

### Branch

Branches form a real tree using `parentBranchId`. They exist for navigation and progressive disclosure, for example:

```text
Build AI
└── AI-Native Software
    ├── Vibe Coding
    └── LLM Application Engineering

Use AI
├── Create with AI
│   └── Long-Form Creation
└── Knowledge Work
    └── AI Knowledge Base
```

Branches do **not** own knowledge. A concept may belong to several branches.

### Concept

A Concept is the durable reusable knowledge unit.

Supported kinds:

```text
CONCEPT
MENTAL_MODEL
PATTERN
PRACTICE
SYSTEM_COMPONENT
RISK
METRIC
```

Examples:

- probabilistic model behavior;
- Context Management;
- Source Authority;
- Agent Loop;
- Timeout Ambiguity;
- Idempotency Boundary;
- Evaluation Evidence;
- Human Review Boundary.

`primaryBranchId` provides one canonical display home. `branchIds` may contain many branches, which is how the same concept appears naturally in engineering and business/outcome views without cloning it.

### Edge

Typed Concept relationships:

```text
PREREQUISITE
RELATED
APPLIES_TO
CONTRASTS_WITH
ENABLES
COMPOSES_WITH
```

Only `PREREQUISITE` is required to form a DAG. The rest are ordinary graph relationships and may create cycles.

This distinction matters: knowledge has prerequisites, but real systems also contain lateral relationships and feedback loops.

### Path

A Path is a projection over Concept IDs and Content IDs. It is **not a second curriculum copy**.

Supported path kinds:

```text
FOUNDATION
ENGINEERING
OUTCOME
ROLE
PROJECT
```

Initial seed paths prove the intended model:

- Agent Engineering — engineering path;
- Vibe Coding & Agentic Software Engineering — engineering path;
- Write a Book with AI — outcome path;
- Build an AI Knowledge Base — outcome path.

A milestone references existing concepts and optionally existing experiences. The same concept may appear in many paths.

### Content Node

The v0.9 learning formats remain valid:

```text
GUIDE
PLAYGROUND
LAB
MISSION
INCIDENT
DRILL
REVIEW
BUILD
BOSS
REFERENCE
```

v1 changes the attachment model: a Content Node now links directly to reusable `conceptIds` and one `primaryBranchId`, rather than being conceptually owned by one fixed ten-stage curriculum.

Published nodes require a stable locale-neutral route. Planned nodes may have `route: null` until they are ready to ship.

## 3. Localization boundary

Two JSON Schemas are canonical:

| File | Responsibility |
|---|---|
| `content/ai-knowledge-graph-v1.0.schema.json` | semantic graph contract |
| `content/ai-knowledge-graph-presentation-v1.0.schema.json` | localized presentation contract |

Seed data:

| File | Responsibility |
|---|---|
| `content/ai-knowledge-graph-v1.0.json` | locale-neutral canonical seed graph |
| `content/ai-knowledge-graph-v1.0.en.json` | English presentation |
| `content/ai-knowledge-graph-v1.0.zh-CN.json` | Simplified Chinese presentation |

Presentation files contain copy only. They cannot alter:

- IDs;
- hierarchy;
- prerequisites/edges;
- path membership;
- access classification;
- runtime references;
- analytics identity;
- migration semantics.

The lint enforces exact EN/zh-CN parity against semantic IDs.

## 4. Why access policy is only referenced

The graph understands three content classifications:

```text
OPEN
FREE_CHOICE
MEMBERSHIP
```

This supports the agreed product direction:

> Knowledge Map is open; selected experiences may be chosen as free unlocks; the complete library can require membership.

However, the graph intentionally does **not** contain:

- user ID;
- subscription ID;
- remaining unlock count;
- `3` as the number of free choices;
- billing state.

Those belong to the entitlement/billing domain.

Therefore the commercial rule can change from three free unlocks to five, Track Packs or Team licenses without rewriting curriculum semantics.

## 5. Runtime boundary

The graph may reference:

```text
runtimeRef = mission-engine:47000-retry
```

It must not contain the actual retry algorithm, hidden scoring threshold, tool permission evaluator or scenario state machine.

Runtime code owns deterministic behavior. The Knowledge Graph owns what knowledge is exercised and how experiences relate.

## 6. v0.9 migration contract

v1.0 is a schema and seed graph, not an immediate runtime cutover.

The current v0.9 graph remains the production learning graph until the broader curriculum is designed and mapped.

Migration therefore explicitly reserves:

- all 52 current `Sxx-Mxx` mental-model IDs;
- all 10 current public content IDs;
- all 10 current locale-neutral public routes.

`migration.strategy` is:

```text
EXPLICIT_CONCEPT_MAPPING_BEFORE_CUTOVER
```

A legacy ID may be attached to a v1 Concept through `legacyIds`, but a published v0.9 Mental Model may not silently disappear or be repurposed.

## 7. Seed graph purpose

The seed is intentionally small enough to review, but broad enough to prove the architecture.

It demonstrates:

- three top-level Domains;
- nested browse Branches;
- one Concept appearing in many branches;
- typed prerequisite and lateral graph edges;
- engineering paths;
- business/outcome paths;
- published and planned Content Nodes;
- open/free-choice/membership access classification;
- EN/zh-CN presentation parity;
- v0.9 compatibility.

It is **not** the final v1 curriculum inventory. Content expansion should happen after the schema is stable.

## 8. Authoring rules

### Adding a Branch

Add a branch only when it improves navigation. Do not create a Branch merely because a topic exists.

### Adding a Concept

Ask:

> Is this knowledge reusable across situations, or am I actually describing one lesson/project?

If reusable, create/reuse a Concept. If it is primarily a learning experience, create Content attached to existing concepts.

Before creating a new concept, search the graph for an existing equivalent. Duplication is more harmful than a concept appearing in several branches.

### Adding a Path

A Path must represent a learner goal, role or outcome. It should reuse existing Concept and Content IDs.

Good:

```text
Write a Book with AI
→ Source Authority
→ Context Management
→ Workflow Decomposition
→ Long-Form Consistency
→ Human Review Boundary
```

Bad:

```text
book-context-management-v2
book-source-authority-v2
```

Do not clone knowledge just to make a new course.

### Adding Content

Every experience must:

- attach to one or more Concepts;
- have one primary browse Branch;
- keep semantic analytics identity locale-neutral;
- keep runtime behavior outside presentation data;
- include debrief + changed-case transfer presentation keys;
- reference an access classification without storing user entitlement state.

## 9. CI gate

`scripts/test_ai_knowledge_graph_v1.py` verifies:

- both JSON Schema contracts exist and use Draft 2020-12;
- exactly the agreed `Understand AI / Build AI / Use AI` root domains exist in the seed;
- branch hierarchy is valid, in-domain and acyclic;
- reusable concepts can belong to multiple branches;
- version-sensitive concepts carry source provenance;
- Concept `PREREQUISITE` edges are acyclic;
- other edge types remain valid general graph relationships;
- paths reference canonical Concepts/Content instead of cloned records;
- both engineering and outcome paths are representable;
- Vibe Coding, Write a Book with AI and Build an AI Knowledge Base seed paths exist;
- published content has stable routes;
- access policy contains no user/billing quota state;
- EN/zh-CN presentation has exact semantic parity;
- all 52 v0.9 model IDs are reserved;
- all 10 v0.9 public routes remain preserved.

The gate runs in shared core validation.

## 10. Next layer after schema approval

The next work is **curriculum population**, not another schema redesign:

1. expand Branch taxonomy under the three Domains;
2. map all 52 existing v0.9 Mental Models into canonical v1 Concepts;
3. design the complete 120–160 Concept inventory;
4. design 10–15 goal-oriented Paths;
5. prioritize high-value Experiences for production;
6. only after enough content exists, connect entitlement UI and billing.

The Knowledge Graph should become the stable product foundation; courses and paths are projections that can grow without reorganizing the whole site each time.
