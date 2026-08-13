# AhaFrame Development Roadmap

Date: 2026-08-13

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

Curriculum source of truth:

- `docs/CURRICULUM.md` — track map, prerequisites, candidate Labs, free/paid boundary, source-reference policy.
- `docs/EVALUATION_FAILURE_LAB.md` — implemented Evaluation Failure Lab product/simulation specification.

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
- RAG Failure Lab
- Agent Reliability Lab
- Evaluation Failure Lab

## Phase 1 — Curriculum v1 + Content MVP

Status: current

The goal is not a large course catalog. The goal is a coherent 60–120 minute journey that proves the AhaFrame method before broad external promotion.

### Curriculum v1 — complete

AhaFrame uses two external projects as research references without turning them into runtime or content dependencies:

```text
AI Engineering from Scratch
        ↓
broad AI-engineering dependency map

AI Agent Book
        ↓
Agent / Evaluation engineering depth

        ↓
AhaFrame original treatment

SEE → PLAY → BREAK → AHA → BUILD
```

The mapping is documented in `docs/CURRICULUM.md`.

The eight curriculum tracks are:

```text
01 LLM Mental Models
02 Context & Retrieval
03 Tools & Protocols
04 Agent Engineering
05 Evaluation & Reliability
06 Production AI
07 Multi-Agent Systems
08 Build Systems
```

Do not implement every mapped topic. The map exists to prevent curriculum drift and identify the highest-value failure simulations.

### Content MVP stop line

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         next
Reliable Support Agent Build    next
```

Optional bridge if user testing or the Build Challenge reveals a missing tools concept:

```text
Tool Contract Failure Lab       optional
```

It must not delay Soft Alpha by default.

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

### Evaluation Failure Lab — complete

Primary product question:

> **How do you know a new AI-system version is actually better, rather than merely better on an aggregate score or a convenient demo set?**

Implemented route:

```text
/en/labs/evaluation-failure/
```

The learner starts from a demo-biased release evaluation where Agent v2 appears stronger overall even though long-horizon and safety-critical refund slices regressed.

Controls:

```text
Dataset preset
Pass threshold
Safety veto
Sample size
Judge mode
Cost gate
```

Derived signals:

```text
Aggregate score — v1 / v2
Slice regressions
Critical regression count
Evidence width
Judge noise index
Evaluation cost index
Cost per successful task
SHIP / BLOCK / INCONCLUSIVE
```

The naive baseline can say `SHIP`; the production preset intentionally changes the **evaluation policy**, not the candidate system, and correctly produces `BLOCK` while the critical regression remains unresolved.

The Lab also proves a third release state: `INCONCLUSIVE` when the apparent improvement is smaller than the modeled evidence width.

The deterministic scenario contract remains documented in `docs/EVALUATION_FAILURE_LAB.md`.

### Context Compression Lab — next

Narrow the previously broad “Context Engineering Lab” into a concrete trade-off:

```text
Original context
      ↓
Compression / retrieval / summary policy
      ↓
Token budget ↓
Latency / cost ↓
Information loss ?
Task quality ?
```

Candidate controls:

```text
Compression ratio
Summary depth
Retrieval budget
Memory allocation
Protected instructions / facts
```

The learner should discover that reducing context cost can silently remove task-critical information.

The next design step should decide whether this Lab focuses on a support-agent working context, a coding-agent context, or a neutral synthetic task. Prefer continuity with the support-agent world if it strengthens the final capstone rather than feeling repetitive.

### Reliable Support Agent Build — Content MVP capstone

Connect the existing Labs into one architecture decision:

> Design a customer-support agent with RAG, bounded execution, evaluation gates, and approval before irreversible actions under fixed cost and latency budgets.

The challenge should require explicit trade-offs rather than boilerplate code copying.

Candidate inputs:

```text
Context budget
Retrieval configuration
Tool retry policy
Approval boundary
Evaluation policy
Cost / latency budget
```

Candidate output:

```text
Architecture decision
Trade-off explanation
Release gate
```

## Phase 2 — UX review + Soft Alpha

Only after the Content MVP stop line is complete:

1. review all English copy and technical claims;
2. verify the dependency path and cross-Lab navigation;
3. verify synthetic metrics are clearly labeled and internally coherent;
4. deploy the reviewed build to `ahaframe.com`;
5. connect real analytics and waitlist storage;
6. invite approximately **20–50 software developers** for a Soft Alpha;
7. observe where users stop, what they tune, which Labs create the strongest “aha,” and whether paid-capability intent appears.

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

The larger candidate backlog is maintained in `docs/CURRICULUM.md` rather than duplicated here.

The exact Foundations count should follow observed user behavior rather than a fixed curriculum promise.

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

> **Can AhaFrame make the cost-vs-information-loss trade-off of context compression visible enough that a developer can choose a defensible context policy instead of simply maximizing or minimizing tokens?**

Context Compression Lab is the next required Content MVP test.
