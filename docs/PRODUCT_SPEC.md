# SeeAI Product Spec — v0.2 Validation MVP

Date: 2026-08-12

## Product thesis

SeeAI is an English-first interactive visual learning product for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The MVP tests whether developers prefer learning abstract AI concepts through deterministic visual simulations rather than passive explanation alone.

## Primary audience

- experienced software developers transitioning into AI engineering;
- technical product builders using LLMs and agents;
- technical learners who want engineering intuition rather than terminology memorization.

## Learning model

Every lesson follows:

```text
See → Play → Build
```

- **See** — visualize a hidden AI-system behavior;
- **Play** — change a meaningful parameter or state;
- **Build** — connect the concept to an engineering decision or challenge.

## MVP routes

```text
/en/
/en/lessons/token-playground/
/en/lessons/context-window/
/en/lessons/agent-loop/
/en/pricing/
/en/early-access/
```

The root route redirects to `/en/`.

## Lessons

### Token Playground

Teaches next-token prediction, visible candidate probabilities, sampling, greedy decoding, and temperature. The simulation is deterministic and pedagogical; it does not claim to expose logits from a live production model.

### Context Window Lab

Teaches finite working context and the trade-offs between truncation, summarization, retrieval, and longer-term memory. Numerical before/after states must remain internally consistent.

### Agent Loop Simulator

Teaches task interpretation, action selection, tool use, observation, retry/error recovery, and final response. Error simulation must never race with Reset or manual progression.

## MVP conversion model

The product does not charge users in v0.2. Pricing pages test intent only.

```text
Visitor
  ↓
Start lesson
  ↓
Complete lesson
  ↓
Start another lesson
  ↓
View pricing / early access
  ↓
Waitlist intent
```

If no production waitlist endpoint is configured, the UI must explicitly identify demo mode and must not claim that a remote signup succeeded.

## Technical strategy

v0.2 deliberately uses a small static Python site generator with dependency-light browser JavaScript.

Principles:

- simulation first, real model second;
- source and generated output are separate;
- `site/` is disposable build output;
- public conceptual content is available without JavaScript or authentication;
- local builds fail closed for search indexing;
- no API secrets are shipped client-side;
- move to a component/template framework only when validation or content scale justifies the migration.

## Visual direction

The approved system is documented in `docs/VISUAL_SYSTEM.md`.

Core positioning:

> Future technical textbook, not AI startup template.

Use warm white, graphite, and teal. Avoid generic blue-purple AI gradients, decorative neural-network imagery, or unexplained “AI magic” effects.

## SEO / generative-search posture

The canonical HTML page is the content source of truth. Lessons use stable URLs, crawlable explanations, answer-first definitions, semantically appropriate structured data, sitemap/robots, and explicit modification dates.

See `docs/SEO_GEO.md` for the detailed policy.

## Validation events

Core events include:

```text
lesson_started
lesson_step_completed
lesson_completed
second_lesson_started
interaction_slider_changed
interaction_strategy_selected
tool_error_simulated
pricing_pro_click
pricing_founder_click
waitlist_submit
```

## Intentional non-goals for v0.2

- authentication and accounts;
- billing;
- real LLM inference;
- full LMS/CMS/admin systems;
- community;
- certificates;
- AI tutor;
- multi-language UI beyond an i18n-ready content layout;
- production waitlist/analytics vendor integration.

## Exit criteria for the validation phase

Do not expand into a full platform merely because the MVP is technically complete. Expansion should be justified by real behavior: lesson starts, completions, second-lesson rate, pricing intent, waitlist conversion, qualitative user feedback, and evidence that the interactive format improves understanding.
