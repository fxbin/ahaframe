# AhaFrame Product Spec — v0.3 Content MVP

Date: 2026-08-13

## Product thesis

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The product tests whether developers can build stronger engineering intuition by manipulating deterministic simulations, breaking systems, comparing configurations, and then applying the resulting mental model to production decisions.

## Brand system

- **Brand:** AhaFrame
- **Primary domain:** `https://ahaframe.com`
- **Category:** Interactive AI Engineering
- **Positioning:** Interactive labs for developers becoming AI engineers
- **Primary slogan:** **Understand AI by seeing it work.**

## Primary audience

- experienced software developers transitioning into AI engineering;
- technical product builders using LLMs and agents;
- technical learners who want engineering intuition rather than terminology memorization.

## Learning model

```text
SEE → PLAY → BREAK → AHA → BUILD
```

- **See** — visualize hidden AI-system behavior;
- **Play** — change meaningful parameters or state;
- **Break** — expose failure modes intentionally;
- **Aha** — connect cause and effect into a durable mental model;
- **Build** — apply the mental model to architecture, debugging, evaluation, and production trade-offs.

## Curriculum v1

`docs/CURRICULUM.md` is the curriculum source of truth.

AhaFrame uses external material as research references, not runtime or content dependencies:

- **AI Engineering from Scratch** provides a broad dependency map across LLM engineering, tools/protocols, agent engineering, production infrastructure, and capstones.
- **AI Agent Book** provides deeper references for Agent design, context, memory, tools/MCP, evaluation, continuous improvement, and multi-agent engineering.

AhaFrame transforms those references into original failure-first experiences instead of copying source lessons.

The curriculum is organized into eight tracks:

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

The map is intentionally larger than the current product. It is a prioritization and dependency tool, not a commitment to build every topic.

A new full Lab should normally require:

- a real engineering decision;
- a visible failure mode;
- a meaningful parameter trade-off;
- a deterministic low-cost first implementation;
- a reusable mental model;
- a connection to another Lab or Build Challenge.

If a topic does not satisfy these criteria, prefer a guide or reference instead of manufacturing an interactive Lab.

## Public routes

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/labs/rag-failure/
/en/labs/agent-reliability/
/en/labs/evaluation-failure/
/en/pricing/
/en/early-access/
```

The root route redirects to `/en/`.

## Foundation lessons

### Token Playground

Teaches next-token prediction, visible candidate probabilities, sampling, greedy decoding, and temperature. The simulation is deterministic and pedagogical; it does not claim to expose logits from a live production model.

### Context Window Lab

Teaches finite working context and the trade-offs between truncation, summarization, retrieval, and longer-term memory. Numerical before/after states must remain internally consistent.

### Agent Loop Simulator

Teaches task interpretation, action selection, tool use, observation, retry/error recovery, and final response. Error simulation must never race with Reset or manual progression.

## Production Lab previews

### RAG Failure Lab

The learner starts from a deliberately poor retrieval configuration and controls:

```text
Chunk Size
Overlap
Top-K
Retrieval Strategy
Reranker
```

The deterministic model derives:

```text
Recall
Precision
Context Usage
Overflow
Latency
Cost Index
Answer Quality Score
Failure Diagnosis
```

The lab uses Engine checkpoints and comparison so the learner can compare the current configuration against the broken baseline.

### Agent Reliability Lab

The learner starts from a weak control policy for a customer-support agent that may perform an irreversible refund action.

Controls:

```text
Max Steps
Retry Limit
Tool Timeout
Result Validation
Human Approval
Termination Rule
```

Derived metrics:

```text
Success Rate
Reliability Score
Runaway Risk
Unsafe-Action Risk
Expected Steps
Simulated Latency
Cost Index
Human Reviews / 100 Runs
Failure Diagnosis
```

The baseline intentionally demonstrates that a policy can complete many tasks while remaining operationally unsafe: generous retries and step budget raise success, but also allow loops and repeated actions. The reliability preset introduces bounded execution, goal-aware termination, validation, and approval around the irreversible tool boundary.

### Evaluation Failure Lab

The learner starts from a demo-biased release evaluation for the same customer-support agent world. Agent v2 has a higher aggregate score even though long-horizon and safety-critical refund cases regress.

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
Aggregate Score — v1
Aggregate Score — v2
Aggregate Delta
Slice Regressions
Critical Regression Count
Evidence Width
Judge Noise Index
Evaluation Cost Index
Cost per Successful Task
SHIP / BLOCK / INCONCLUSIVE
Failure Diagnosis
```

The naive baseline is allowed to produce `SHIP` because the evaluation policy is weak. The production preset changes the evaluation design—not the candidate system—and intentionally produces `BLOCK` while the safety regression remains unresolved. Smaller sample sizes can produce `INCONCLUSIVE`, teaching that insufficient evidence is a valid release outcome.

The core lesson is:

> **Evaluation is a decision system, not a single score.**

All Production Lab previews use deterministic educational metrics. They are not presented as benchmark results from live models, tools, vector stores, LLM judges, customer-support traffic, or human-review queues.

## Content MVP stop line

Do not launch broadly after only one or two Production Labs. The first coherent external-alpha target is:

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          done
Context Compression Lab         next
Reliable Support Agent Build    next
        ↓
UX / content review
        ↓
20–50 developer Soft Alpha
```

`Tool Contract Failure Lab` is an optional bridge if the Build Challenge exposes a missing Tools & Protocols concept. It does not delay Soft Alpha by default.

The objective is a 60–120 minute product journey that demonstrates the AhaFrame method before investing in full account, payment, or sandbox infrastructure.

## Pricing hypothesis

The previous `$19/month Pro` and `$39/month Founding Member` concepts are retired.

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

### Free boundary

- core mental models;
- foundational simulations;
- public concept guides and curriculum map;
- local progress;
- rotating Production Lab previews.

### Paid boundary

- full failure simulations;
- Production Labs;
- build projects;
- evaluation challenges;
- later: saved cloud experiments and Live Mode capabilities.

The MVP still collects no payment. Pricing clicks and waitlist intent are validation signals only.

## Conversion model

```text
Visitor
  ↓
Start free lesson / lab
  ↓
Interact with parameters
  ↓
Improve or correctly diagnose a failed scenario
  ↓
Start another lab
  ↓
View paid capability
  ↓
Select realistic pricing intent
  ↓
Waitlist
```

If no production waitlist endpoint is configured, the UI must explicitly identify demo mode and must not claim that a remote signup succeeded.

## Technical strategy

The site remains a small static Python generator with dependency-light browser JavaScript.

Principles:

- simulation first, real model second;
- **simulate the concept; spend compute only to validate reality**;
- source and generated output are separate;
- `site/` is disposable build output;
- public conceptual content is available without JavaScript or authentication;
- local builds fail closed for search indexing;
- no API secrets are shipped client-side;
- framework migration should be driven by product/content scale, not aesthetics.

## Lab / Simulation Engine

```text
Scenario
  ↓
State
  ↓
Action
  ↓
Reducer
  ↓
Derived View / Metrics
  ↓
DOM Adapter
```

Reusable capabilities:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

Registered deterministic scenarios:

```text
token-playground
context-window
rag-failure
agent-reliability
agent-loop
evaluation-failure
```

RAG Failure validates multi-parameter optimization and comparison. Agent Reliability adds a second pressure test focused on execution policy, safety, latency, and cost. Evaluation Failure adds a third pressure test focused on dataset policy, evidence strength, release gates, and three-state decision logic.

The Evaluation Failure scenario is loaded as a page-specific scenario module after the shared base registry and before its DOM adapter. This keeps the generic Engine unchanged and avoids putting evaluation-specific logic in the DOM layer.

See `docs/LAB_ENGINE.md` for the architecture contract.

## Authentication boundary

Authentication is **not** required for public Content MVP learning.

Do not introduce a login wall in front of lessons or simulations. Identity becomes justified when users need one of these durable capabilities:

1. save experiment history/checkpoints across devices;
2. own a paid entitlement;
3. receive and meter Live Mode credits;
4. submit Build Projects;
5. persist learning progress beyond local browser storage.

The intended UX is optional sign-in at the moment the learner chooses **Save / Purchase / Live Mode / Build Project**.

## Visual direction

The approved system is documented in `docs/VISUAL_SYSTEM.md`.

Core positioning:

> Future technical textbook, not AI startup template.

Use warm white, graphite, and teal. Avoid generic blue-purple AI gradients, decorative neural-network imagery, or unexplained “AI magic” effects.

## SEO / generative-search posture

The canonical HTML page is the content source of truth. Lessons and public lab previews use stable URLs, crawlable explanations, answer-first definitions, semantic structured data, sitemap/robots, and explicit modification dates.

## Validation events

Core events include:

```text
lesson_started
lesson_step_completed
lesson_completed
interaction_slider_changed
interaction_strategy_selected
tool_error_simulated
rag_parameter_changed
rag_balanced_preset_applied
rag_failure_baseline_reset
agent_reliability_parameter_changed
agent_reliability_preset_applied
agent_reliability_baseline_reset
agent_reliability_paid_intent_click
evaluation_parameter_changed
evaluation_dataset_preset_changed
evaluation_safety_veto_changed
evaluation_sample_size_changed
evaluation_judge_mode_changed
evaluation_cost_gate_changed
evaluation_production_preset_applied
evaluation_naive_baseline_reset
evaluation_build_challenge_started
evaluation_paid_intent_click
pricing_foundations_click
pricing_pro_click
waitlist_submit
```

The Lab Engine itself keeps analytics opt-in so high-frequency simulation actions do not automatically duplicate product events.

## Intentional non-goals for the Content MVP

- mandatory authentication;
- real billing;
- real LLM/retrieval inference;
- real LLM-as-judge calls;
- real benchmark ingestion;
- code sandbox;
- full LMS/CMS/admin systems;
- community;
- certificates;
- AI tutor;
- multi-language UI beyond an i18n-ready content layout.

## Exit criteria

Before Soft Alpha, complete the small coherent content path and review the end-to-end UX. After external use starts, expansion should be justified by behavior:

- lesson/lab start rate;
- successful-tuning or correct-diagnosis rate;
- second-lab rate;
- parameter interaction depth;
- baseline-vs-current comparison behavior;
- pricing intent;
- waitlist conversion;
- qualitative feedback that simulations improve understanding;
- eventually, actual payment rather than only intent.
