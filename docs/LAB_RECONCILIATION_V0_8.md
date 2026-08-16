# AhaFrame v0.8 Lab Reconciliation

Status: **active**  
Issue: #90  
Machine-readable contract: `content/lab-reconciliation-v0.8.json`

## Decision

AhaFrame v0.8 has two intentionally different discovery surfaces:

1. **Campaign** — incident-first, small, memorable, and opinionated;
2. **Knowledge Map / Labs** — broad, route-preserving reference and playground surface.

The Campaign is **not** a renamed list of every current Lab. Existing public routes remain valuable for SEO, direct links, historical continuity, and optional mental-model practice, but only experiences that earn a clear role appear in the primary Campaign.

## Invariants

- Do not delete or redirect an existing public Lab/lesson merely because it leaves the primary Campaign.
- Stable `lab_id`, route semantics, and existing interaction events remain compatible with Validation evidence.
- Mission identity is additive (`missionId`) rather than a replacement for route `lab_id`.
- No fourth flagship Mission is introduced during v0.8 reconciliation.
- A specialist Lab may remain indexed and useful even when its mechanics have been absorbed into a flagship Mission.
- #91 owns homepage/Campaign discovery changes; #90 defines the contract it must render.

## Primary Campaign after reconciliation

```text
The Broken RAG Pipeline
        ↓
The $47,000 Retry
        ↓
The Prompt Injection Attack
        ↓
Final Boss: Production Support Launch
```

Supporting Foundation and prerequisite nodes are available from the Knowledge Map and contextual links, but they are not mandatory gates before a developer can try a flagship incident.

## Inventory decisions

| Experience | Primary status | Campaign role | Public route | Decision |
|---|---|---|---|---|
| Token Playground | KEEP AS FOUNDATION | Optional Foundation | `/lessons/token-playground/` | Keep the compact mechanics playground. Do not incident-frame tokenization. |
| Context Window | KEEP AS FOUNDATION | Optional Foundation | `/lessons/context-window/` | Keep as a direct context-budget mental model; no duplicate Campaign step. |
| Agent Loop | KEEP AS FOUNDATION | Optional Foundation | `/lessons/agent-loop/` | Keep bounded-loop mechanics; consequential retry reasoning now belongs to `$47,000 Retry`. |
| RAG Failure | REFRAME AS MISSION | Flagship Incident 1 | `/labs/rag-failure/` | Already converted to **The Broken RAG Pipeline**; preserve `lab_id=rag-failure`. |
| Context Compression | MERGE INTO FLAGSHIP | Knowledge-map sandbox | `/labs/context-compression/` | Compression mechanics feed Broken RAG + Final Boss; keep specialist route indexed but remove it from the primary Campaign. |
| Agent Reliability | REFRAME AS MISSION | Flagship Incident 2 | `/labs/agent-reliability/` | Already converted to **The $47,000 Retry**; preserve `lab_id=agent-reliability` and paid-intent semantics. |
| Instruction Conflict | REFRAME AS MISSION | Flagship Incident 3 | `/labs/instruction-conflict/` | Already converted to **The Prompt Injection Attack**; preserve `lab_id=instruction-conflict`. |
| Evaluation Failure | PREREQUISITE NODE | Final Boss prerequisite/reference | `/labs/evaluation-failure/` | Keep as Evaluation evidence practice. Do not create a fourth flagship incident in v0.8. |
| Agent Workflow Graph | PREREQUISITE NODE | Final Boss prerequisite/reference | `/labs/agent-workflow-graph/` | Keep graph topology sandbox; complexity earns a place only when measured. |
| Reliable Support Agent | REFRAME AS MISSION | Final Boss | `/build/reliable-support-agent/` | Upgrade via #89 into bounded cross-layer production launch challenge. Preserve capstone `lab_id`. |

## Experience-by-experience rationale

### Token Playground — KEEP AS FOUNDATION

**Learner promise:** manipulate tokenization/generation mechanics directly.  
**Production decision:** understand representation/generation constraints before interpreting larger system behavior.  
**Current strength:** small and concrete; it does not need fictional incident stakes.  
**Aha:** human text boundaries are not model token boundaries.  
**Overlap:** Prompt/Context foundations only.  
**Migration:** optional Foundation node in Knowledge Map; preserve route and events.

### Context Window — KEEP AS FOUNDATION

**Learner promise:** make finite working context visible.  
**Production decision:** decide what deserves scarce working-context budget.  
**Current strength:** useful direct mental model with little narrative overhead.  
**Aha:** a larger context window does not remove the need for context policy.  
**Overlap:** Broken RAG and Context Compression.  
**Migration:** optional Foundation node; contextual link from Context concepts, not a Campaign gate.

### Agent Loop — KEEP AS FOUNDATION

**Learner promise:** manipulate bounded iteration/termination behavior.  
**Production decision:** trade completion, retries, and stopping behavior.  
**Current strength:** good mechanics sandbox; weak as a standalone high-stakes incident.  
**Aha:** an Agent loop is a production control system, not unlimited model calls.  
**Overlap:** `$47,000 Retry` now owns irreversible retry consequences.  
**Migration:** retain foundation route; avoid teaching retry safety twice in the Campaign.

### RAG Failure — REFRAME AS MISSION

**Learner promise:** fix stale/wrong evidence despite current data being available.  
**Production decision:** balance freshness, authority, grounding, latency, and context cost.  
**Current strength:** now a flagship evidence-first incident.  
**Aha:** retrieval quality is a pipeline property; more context is not better evidence.  
**Overlap:** Context Window, Context Compression, Evaluation.  
**Migration:** completed as **The Broken RAG Pipeline**. Indexed route and `lab_id` remain stable; `missionId=broken-rag-pipeline` is additive.

### Context Compression — MERGE INTO FLAGSHIP

**Learner promise:** see savings vs critical-information loss.  
**Production decision:** preserve decision-critical evidence under budget.  
**Current strength:** strong specialist simulation, but too close to the Context trade-off already embedded in Broken RAG and Final Boss.  
**Aha:** compression quality is evidence retention, not token reduction.  
**Overlap:** substantial with #86 and #89.  
**Migration:** keep indexed as a specialist sandbox/reference; remove from primary Campaign sequence.

### Agent Reliability — REFRAME AS MISSION

**Learner promise:** stabilize an irreversible tool workflow after timeout/retry duplication.  
**Production decision:** balance recovery, idempotency, approval, latency, and cost.  
**Current strength:** now flagship production incident.  
**Aha:** retry and idempotency are one reliability design problem.  
**Overlap:** Agent Loop + Final Boss.  
**Migration:** completed as **The $47,000 Retry**. Preserve `lab_id`, route, interaction event, and Early Access intent.

### Instruction Conflict — REFRAME AS MISSION

**Learner promise:** keep useful external content without granting it capability authority.  
**Production decision:** define trust, least privilege, approvals, and runtime enforcement under false-positive pressure.  
**Current strength:** now a deterministic security incident with explicit/subtle/benign cases.  
**Aha:** prompt injection is a trust/capability boundary failure.  
**Overlap:** Harness, tools/permissions, Final Boss.  
**Migration:** completed as **The Prompt Injection Attack**. Preserve route/lab telemetry; machine semantics stay locale-neutral.

### Evaluation Failure — PREREQUISITE NODE

**Learner promise:** see how dataset coverage, uncertainty, thresholds, and vetoes alter release evidence.  
**Production decision:** decide whether evidence justifies shipping.  
**Current strength:** strong specialist Lab; it becomes more valuable immediately before/inside Final Boss than as a fourth flagship incident.  
**Aha:** aggregate score cannot wash away critical slice/veto failure.  
**Overlap:** all three flagship Missions eventually feed a release gate.  
**Migration:** keep indexed; surface as optional Final Boss prerequisite/reference.

### Agent Workflow Graph — PREREQUISITE NODE

**Learner promise:** compare topology, coordination, state coupling, retry scope, and failure propagation.  
**Production decision:** earn orchestration complexity with measured value.  
**Current strength:** useful architecture sandbox, but less immediate than an incident card.  
**Aha:** more agents/coordination can reduce reliability.  
**Overlap:** Final Boss architecture choices.  
**Migration:** keep indexed and link as optional Final Boss prerequisite/reference.

### Reliable Support Agent — REFRAME AS MISSION / FINAL BOSS

**Learner promise:** own the final production launch decision for a flawed Support Agent.  
**Production decision:** inspect cross-layer evidence, spend a finite intervention budget, compare attempts, and defend `SHIP`, `BLOCK`, or `INCONCLUSIVE`.  
**Current strength:** existing deterministic six-layer engine is a strong base but currently behaves like a configuration form with a computed answer.  
**Aha:** production readiness is a system property; critical vetoes cannot be averaged away.  
**Overlap:** intentionally consumes all three flagship incident mental models plus Evaluation/Graph.  
**Migration:** #89 upgrades the existing route using Mission Engine semantics; no new capstone URL.

## SEO policy

All ten current public experience routes remain indexable during v0.8. Primary discovery changes do not imply URL deletion.

- Flagship Mission conversions keep their existing canonical Lab routes.
- Foundation/prerequisite/sandbox routes remain reachable through Knowledge Map/reference discovery.
- No redirects are introduced by #90.
- #91 may change navigation prominence but must not silently alter canonical/hreflang equivalents.

## Validation / telemetry policy

The route remains the formal Validation identity boundary:

- existing `lab_id` values remain unchanged;
- old stable interaction events remain valid;
- Mission lifecycle events and `missionId` are additive;
- moving a route out of the primary Campaign does **not** create a new telemetry identity;
- preview cohort #92 and formal Alpha #19 remain separate experiments.

## Hand-off to #89 and #91

#89 may assume:
- the three flagship Missions are canonical incident knowledge;
- Evaluation Failure and Agent Workflow Graph are optional prerequisite/reference nodes;
- Final Boss is the only new primary Campaign step after the three incidents;
- old Foundation/Sandbox routes must not be duplicated inside the Boss as long explanations.

#91 may consume `content/lab-reconciliation-v0.8.json` to render:
- **Campaign:** 3 flagship incidents + Final Boss;
- **Knowledge Map:** all retained Foundations, Labs, prerequisites, and sandbox/reference experiences.

## Exit decision

There is no ambiguous existing experience left. The v0.8 Campaign is bounded to three flagship incidents plus one Final Boss, while the broader Lab inventory remains available as a route-preserving knowledge/reference surface.
