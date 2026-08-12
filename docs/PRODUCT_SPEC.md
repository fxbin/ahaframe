# AhaFrame Product Spec — v0.3 Validation

Date: 2026-08-12

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

The product ladder is:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

- **See** — visualize hidden AI-system behavior;
- **Play** — change meaningful parameters or state;
- **Break** — expose failure modes intentionally;
- **Aha** — connect cause and effect into a durable mental model;
- **Build** — apply the mental model to architecture, debugging, evaluation, and production trade-offs.

## Public routes

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/labs/rag-failure/
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

## Production Lab preview

### RAG Failure Lab

The first lab designed specifically to pressure-test the generic Lab Engine and the paid-product thesis.

The learner starts from a deliberately poor configuration and controls:

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

All metrics are educational synthetic values. They are not presented as benchmark results from a live embedding model, vector database, reranker, or LLM.

## Pricing hypothesis

The previous `$19/month Pro` and `$39/month Founding Member` concepts are retired for v0.3.

The new validation offers are:

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

### Free boundary

- core mental models;
- foundational simulations;
- public concept guides;
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
Complete or improve scenario
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

Build-time public configuration uses the `AHAFRAME_*` environment-variable namespace.

## Lab / Simulation Engine

The runtime contract is:

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

Reusable capabilities include:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

The registered deterministic scenarios are now:

```text
token-playground
context-window
rag-failure
agent-loop
```

See `docs/LAB_ENGINE.md` for the architecture contract.

## Authentication boundary

Authentication is **not** required for v0.3 public learning.

Do not introduce a login wall in front of lessons or simulations. Identity becomes justified when users need one of these durable capabilities:

1. save experiment history/checkpoints across devices;
2. own a paid entitlement;
3. receive and meter Live Mode credits;
4. submit Build Projects;
5. persist learning progress beyond local browser storage.

The intended UX is optional sign-in at the moment the learner chooses **Save / Purchase / Live Mode / Build Project**.

See `docs/ROADMAP.md` for the phased account plan.

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
rag_paid_intent_click
pricing_foundations_click
pricing_pro_click
waitlist_submit
```

The Lab Engine itself keeps analytics opt-in so high-frequency simulation actions do not automatically duplicate product events.

## Intentional non-goals for v0.3

- mandatory authentication;
- real billing;
- real LLM/retrieval inference;
- code sandbox;
- full LMS/CMS/admin systems;
- community;
- certificates;
- AI tutor;
- multi-language UI beyond an i18n-ready content layout.

## Exit criteria

Do not expand merely because the platform architecture can support more labs. Expansion should be justified by behavior:

- lesson/lab start rate;
- completion / successful-tuning rate;
- second-lab rate;
- RAG parameter interaction depth;
- pricing intent;
- waitlist conversion;
- qualitative feedback that simulations improve understanding;
- eventually, actual payment rather than only intent.
