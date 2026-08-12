# AhaFrame Development Roadmap

Date: 2026-08-12

## Product direction

AhaFrame is an **Interactive AI Engineering Lab** for experienced software developers becoming AI engineers.

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

Architecture principle:

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
- pricing hypothesis reset to `$49 one-time Foundations` + future `$12/month Production Labs`

## Phase 1 — Content MVP

Status: current

The goal is not a large course catalog. The goal is a coherent 60–120 minute journey that proves the AhaFrame method before broad external promotion.

### Production Labs

```text
RAG Failure Lab            done
Agent Reliability Lab      done
Evaluation Lab             next
Context Engineering Lab    next
Build Challenge            next
```

### RAG Failure Lab

Pressure-tests retrieval decisions:

- chunk size;
- overlap;
- Top-K;
- vector vs hybrid retrieval;
- reranking;
- recall / precision / context / latency / cost / answer quality;
- broken-baseline checkpoint and compare.

### Agent Reliability Lab

Pressure-tests agent control-policy decisions:

- max steps;
- retry limits;
- tool timeout;
- result validation;
- human approval before an irreversible action;
- weak / bounded / goal-aware termination;
- success, runaway risk, unsafe-action risk, latency, cost, review load;
- unreliable-baseline checkpoint and compare.

The scenario intentionally demonstrates that an agent can have a reasonable completion rate while still being operationally unsafe or expensive.

### Evaluation Lab — next

Primary product question:

> How do you prove that a new RAG or agent configuration is actually better across representative cases instead of one happy-path demo?

Candidate controls / concepts:

```text
Evaluation set composition
Pass threshold
Exact / semantic / rubric judging
Regression budget
Failure slices
Cost / latency constraints
```

The Lab should compare two system versions and surface where aggregate scores hide regressions.

### Context Engineering Lab — next

Unify context budget decisions across:

```text
Compression
Retrieval
Memory
Chunking
Context allocation
```

The learner should see how optimizing one budget dimension changes retrieval quality, latency, and information loss elsewhere.

### Build Challenge — next

The first Build Challenge should connect the Production Labs into an architecture decision rather than add another isolated concept page.

Candidate challenge:

> Design a support agent with RAG, bounded execution, evaluation gates, and an irreversible-action approval boundary under a fixed latency/cost budget.

## Phase 2 — UX review + Soft Alpha

Only after the Content MVP stop line is complete:

1. review all English copy and technical claims;
2. verify the cross-Lab learning path and navigation;
3. deploy the reviewed build to `ahaframe.com`;
4. connect real analytics and waitlist storage;
5. invite approximately **20–50 software developers** for a Soft Alpha;
6. observe where users stop, what they tune, which Labs create the strongest “aha,” and whether paid-capability intent appears.

This is not a broad Product Hunt / Hacker News / Reddit launch yet.

## Phase 3 — optional identity, not mandatory login

Do **not** put a login wall in front of public lessons or simulations.

Authentication becomes justified when identity unlocks durable value.

### Triggers

Start the identity layer when at least one of these is ready:

1. save Lab checkpoints and experiment history across devices;
2. attach paid entitlements to a user;
3. meter Live Mode credits;
4. persist Build Project submissions;
5. persist progress beyond local browser storage.

### Intended UX

```text
Visit AhaFrame
    ↓
Use free lessons/labs immediately
    ↓
User chooses Save / Purchase / Live Mode / Build Project
    ↓
Ask for sign-in
```

GitHub sign-in should be considered first for the developer audience, with email magic-link as a fallback. The authentication vendor remains intentionally unlocked.

Minimal account model:

```text
User
LabRun
Checkpoint
Progress
Entitlement
UsageCredit (only when Live Mode exists)
```

Do not build profiles, social features, teams, organizations, certificates, or a large LMS model at this stage.

## Phase 4 — payment validation and Foundations product

Only after behavior supports the hypothesis:

- introduce real checkout / preorder or launch purchase;
- implement entitlements;
- package **AI Engineer Foundations** around a compact set of high-quality labs;
- include failure simulations and meaningful Build Projects;
- test the `$49 one-time` offer with actual payment, not only intent clicks.

Candidate larger Foundations sequence:

```text
Token Prediction
Context Window
RAG Failure
Agent Reliability
Evaluation
Context Engineering
Embeddings / Retrieval
Reranking
Tool Contracts
Tracing / Observability
Cost + Latency
Model Routing / Caching
```

The exact count follows user behavior rather than a fixed curriculum promise.

## Phase 5 — Live Mode

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

## Phase 6 — Build Projects + sandbox

Code execution is the most expensive and security-sensitive tier.

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

> Can AhaFrame teach production AI reliability by making developers tune a failing system and observe explicit trade-offs faster than another tutorial can?

RAG Failure and Agent Reliability are the first two complementary tests. Evaluation Lab is the next required piece of the Content MVP.
