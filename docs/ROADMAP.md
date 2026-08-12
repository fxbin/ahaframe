# AhaFrame Development Roadmap

Date: 2026-08-12

## Product direction

AhaFrame is moving from a generic interactive AI-learning site toward an **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

The product ladder is:

```text
AI Engineering Learning
        ↓
Interactive Mental Models
        ↓
Failure Simulations
        ↓
Production Labs
        ↓
Build Projects
        ↓
Paid capability
```

The architecture principle remains:

> **Simulate the concept. Spend compute only to validate reality.**

## Phase 0 — Foundation complete

Status: complete

- AhaFrame brand + `ahaframe.com`
- warm-white / graphite / teal visual system
- Token Playground
- Context Window Lab
- Agent Loop Simulator
- generic Lab / Simulation Engine
- history / checkpoint / compare / replay
- CI and validation

## Phase 1 — v0.3 market + engine validation

Status: current

### Product

- ship **RAG Failure Lab** as the first Production Lab preview;
- deliberately start from a broken RAG configuration;
- expose chunk size, overlap, Top-K, retrieval strategy, and reranking;
- visualize recall, precision, context pressure, latency, cost index, and answer-quality score;
- use Lab Engine checkpoints and compare to show improvement against the broken baseline.

### Pricing

Replace the early `$19/month` + `$39/month` hypotheses with:

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

The paid boundary is capability, not access to basic explanations:

```text
Free
  mental models
  foundational simulations
  public guides
  rotating Production Lab previews

Paid
  failure simulations
  full Production Labs
  build projects
  evaluation challenges
  later: saved cloud experiments / Live Mode
```

No payment is collected in v0.3; pricing remains intent validation.

### Launch infrastructure

Before expanding the curriculum aggressively:

- deploy to `ahaframe.com`;
- connect a real waitlist endpoint;
- connect product analytics;
- measure lesson starts, completion, second-lab rate, RAG Lab usage, pricing intent, and waitlist conversion;
- collect qualitative feedback from developer communities.

## Phase 2 — optional identity, not mandatory login

Do **not** put a login wall in front of public lessons or simulations.

Authentication becomes justified when identity unlocks durable user value.

### Triggers for implementation

Start the identity layer when at least one of these features is ready:

1. save Lab checkpoints and experiment history across devices;
2. paid entitlements need to be attached to a user;
3. Live Mode credits / usage limits need metering;
4. Build Project submissions need persistence;
5. personal learning progress must survive browser/device changes.

### Recommended UX

```text
Visit AhaFrame
    ↓
Use free lessons/labs immediately
    ↓
User chooses Save / Purchase / Live Mode / Build Project
    ↓
Ask for sign-in
```

For the developer audience, GitHub sign-in should be considered first, with email magic-link as a fallback. The authentication vendor is intentionally not locked yet.

### Minimal account data

Keep the first account model small:

```text
User
LabRun
Checkpoint
Progress
Entitlement
UsageCredit (only when Live Mode exists)
```

Do not build profiles, social features, teams, organizations, certificates, or a large LMS model at this stage.

## Phase 3 — payment validation and Foundations product

Only after v0.3 behavior supports the hypothesis:

- introduce real checkout / preorder or launch purchase;
- implement entitlements;
- package **AI Engineer Foundations** around approximately 12 high-quality labs;
- include failure simulations and 2–3 meaningful Build Projects;
- test the `$49 one-time` offer with actual payment, not only intent clicks.

Candidate lab sequence:

```text
Token Prediction
Context Window
RAG Failure
Embeddings / Retrieval
Chunking
Reranking
Agent Reliability
Tool Contracts
Evaluation
Tracing / Observability
Cost + Latency
Model Routing / Caching
```

The exact count should follow user behavior rather than a fixed curriculum promise.

## Phase 4 — Live Mode

Add real compute only where it validates the simulation against reality.

```text
Simulation Mode
    ↓
Predicted trade-off
    ↓
Live Mode
    ↓
Real retrieval / model result
    ↓
Compare predicted vs actual
```

Rules:

- never sell unlimited model compute;
- meter AhaFrame-funded runs with credits;
- consider BYOK for advanced developer users;
- keep model/API keys out of static client persistence;
- record cost, latency, model, tokens, and evaluation results per run.

## Phase 5 — Build Projects + sandbox

Code execution is the most expensive and security-sensitive tier.

Introduce it after payment and learning demand are validated.

Prefer:

```text
submit project
    ↓
short-lived isolated runner
    ↓
run tests / evaluation
    ↓
return result
    ↓
destroy runner
```

Avoid long-lived per-user VMs in the early product.

## Decision rule

The next feature should answer a product question, not merely make the platform look more complete.

Current question:

> Can an experienced software developer learn a production AI trade-off faster by breaking and tuning a deterministic simulation than by reading another tutorial?

RAG Failure Lab is the first strong test of that proposition.
