# AhaFrame Changelog

## Content MVP — Evaluation Failure Lab — 2026-08-13

- Added `/en/labs/evaluation-failure/` as the third Production Lab preview.
- Reused the customer-support agent world so evaluation follows naturally from RAG and Agent Reliability rather than becoming an isolated metrics lesson.
- Added a deterministic `evaluation-failure` scenario with demo-biased / production-like / safety-heavy datasets, threshold, safety veto, sample size, judge mode, and cost gate controls.
- Added fixed synthetic slice performance where v2 improves common FAQ, retrieval, and tool calling while regressing on long-horizon and safety-critical refund cases.
- Added `SHIP / BLOCK / INCONCLUSIVE` release decisions so insufficient evidence is represented explicitly instead of forcing every comparison into a binary answer.
- Added a naive checkpoint where the aggregate recommends shipping v2 and a production preset that correctly blocks the unresolved safety regression without pretending the preset fixes the candidate.
- Added deterministic evidence-width, judge-noise, evaluation-cost, and cost-per-success signals.
- Added engine-level regression coverage for aggregate-score traps, safety vetoes, underpowered evaluation, cost gates, invalid configuration, and checkpoint comparison.
- Added the Lab to homepage discovery, pricing sequence, sitemap, `llms.txt`, README, product spec, roadmap, and validation.
- Advanced the Content MVP stop line: Context Compression Lab is now the next Production Lab before the Reliable Support Agent Build.
- Kept real LLM judges, benchmark ingestion, accounts, backend persistence, billing, and live compute out of this implementation.

## Curriculum v1.0 — 2026-08-12

- Added `docs/CURRICULUM.md` as the curriculum source of truth.
- Mapped AhaFrame into eight tracks: LLM Mental Models, Context & Retrieval, Tools & Protocols, Agent Engineering, Evaluation & Reliability, Production AI, Multi-Agent Systems, and Build Systems.
- Added a dependency-aware Lab backlog instead of continuing topic-by-topic lesson expansion.
- Defined **AI Engineering from Scratch** as a broad curriculum / prerequisite reference and **AI Agent Book** as an Agent / Evaluation engineering-depth reference.
- Added an explicit source-use policy: research concepts and experiment methodology, but write original explanations, scenarios, simulations, and visual assets.
- Narrowed the previous broad `Context Engineering Lab` candidate into a more testable **Context Compression Lab**.
- Defined the Content MVP capstone as a **Reliable Support Agent Build** combining retrieval, bounded execution, approval, evaluation, and cost/latency constraints.
- Added `docs/EVALUATION_FAILURE_LAB.md` as the approved product and deterministic simulation specification for the next Production Lab.
- Reframed the Evaluation Lab around a broken evaluation process: aggregate score improvement can hide safety-critical and long-horizon regressions.
- Defined Evaluation Failure controls for dataset composition, pass threshold, safety veto, sample size, judge mode, and cost gate, with `SHIP / BLOCK / INCONCLUSIVE` as release-decision outcomes.
- Explicitly deferred real LLM judges, benchmark ingestion, accounts, persistence, and billing from the first Evaluation Failure implementation.

## Content MVP — Agent Reliability Lab — 2026-08-12

- Added `/en/labs/agent-reliability/` as the second Production Lab preview.
- Uses a customer-support refund scenario so retries, validation, human approval, and termination rules map to a concrete consequential workflow.
- Starts from an intentionally weak policy: 14 max steps, 4 retries, 12-second tool timeout, weak termination, no result validation, and no human approval.
- Added controls for max steps, retry limit, timeout, validation, approval, and weak / bounded / goal-aware termination.
- Added deterministic success rate, reliability score, runaway risk, unsafe-action risk, expected steps, simulated latency, cost index, human-review load, and failure diagnosis.
- Added an Engine checkpoint for the unreliable baseline and live baseline-vs-current comparison.
- Added a reliability preset that improves success and control while making approval overhead visible instead of treating guardrails as free.
- Extended Lab Engine regression tests and generated-page validation to cover the new scenario and route.
- Added the Lab to sitemap, `llms.txt`, homepage discovery, pricing roadmap, README, product spec, and development roadmap.
- Updated the homepage learning model to **SEE → PLAY → BREAK → AHA → BUILD** and surfaced RAG + Agent Reliability as a distinct Production Labs layer.
- Hardened mobile layout for the multi-column Production Lab controls and Content MVP sections.

## v0.3 validation — 2026-08-12

### RAG Failure Lab

- Added the first Production Lab preview at `/en/labs/rag-failure/`.
- Starts from an intentionally broken retrieval configuration rather than a happy-path demo.
- Exposes chunk size, overlap, Top-K, vector vs hybrid retrieval, and reranking.
- Derives deterministic recall, precision, context usage, overflow, latency, cost index, answer-quality score, and failure diagnosis.
- Uses Lab Engine checkpoints and compare to show the current configuration against the broken baseline.
- Added RAG scenario regression coverage to `scripts/test_lab_engine.js`.
- Added the lab to sitemap, `llms.txt`, validation, and generated asset checks.

### Pricing validation

- Retired the `$19/month Pro` and `$39/month Founding Member` hypotheses.
- Added a `$49 one-time` **AI Engineer Foundations** hypothesis.
- Added a future `$12/month` **Production Labs** membership hypothesis.
- Kept core mental models and selected simulations free.
- Reframed the paid boundary around failure simulations, production labs, build projects, and evaluation rather than basic explanation access.

### Product architecture

- Added `docs/ROADMAP.md` with the post-engine development sequence.
- Deferred mandatory authentication; public lessons and simulations remain no-signup.
- Defined optional identity triggers around saving experiments, paid entitlements, Live Mode credits, Build Projects, and cross-device progress.

## Lab Engine v0.1 — 2026-08-12

- Added a dependency-free generic Lab / Simulation Engine for deterministic interactive lessons.
- Introduced a reusable `Scenario → State → Action → Reducer → Derived Metrics → Adapter` contract.
- Added engine primitives for history, checkpoints, compare, replay, reset, subscriptions, and bounded action history.
- Migrated the homepage Token demo and full Token Playground to the same shared Token scenario.
- Migrated Context Window strategy state and arithmetic into a shared Context scenario.
- Migrated Agent step, failure injection, and recovery state into a shared Agent scenario while preserving the existing stale-timer protection.
- Kept analytics opt-in at the engine layer so existing semantic product events are not duplicated by high-frequency interactions.
- Added `scripts/test_lab_engine.js` behavioral regression tests and wired them into CI and `scripts/validate.py`.
- Added generated-page validation for Lab Engine asset presence and load order.
- Added `docs/LAB_ENGINE.md` as the architecture source of truth for future Production Labs.
- Locked the simulation principle: **Simulate the concept. Spend compute only to validate reality.**

## Brand migration — 2026-08-12

- Renamed the product from **SeeAI** to **AhaFrame**.
- Locked `https://ahaframe.com` as the production domain.
- Kept the primary slogan: **Understand AI by seeing it work.**
- Expanded the learning model to **SEE → PLAY → AHA → BUILD**.
- Migrated page titles, navigation, footer, structured data, Open Graph metadata, manifest, `llms.txt`, 404, and discovery output.
- Renamed browser runtime state from `SeeAI` / `SEEAI_*` / `seeai_*` to `AhaFrame` / `AHAFRAME_*` / `ahaframe_*`.
- Renamed the Python builder package from `scripts/seeai/` to `scripts/ahaframe/`.
- Renamed the generated social image to `og-ahaframe.png`.
- Updated README, product spec, visual system, SEO/GEO policy, Code Review record, and CI.
- Added CI protection that rejects legacy SeeAI branding in generated output.

## v0.2 — 2026-08-12

### Visual redesign

- Locked the approved warm-white / graphite / teal brand system.
- Removed large blue-purple gradients and AI-template glow language.
- Reworked buttons, cards, lesson states, progress, navigation, pricing, and OG image.

### Homepage

- Added a live temperature-controlled Token Playground preview.
- Added no-signup / simulation-first proof chips without fabricated social proof.
- Added local learning progress.
- Expanded the learning methodology.
- Expanded six-stage AI engineering roadmap.
- Added audience positioning for developers, builders, and technical learners.

### Lessons

- Added answer-first `In one sentence` blocks.
- Added local lesson completion state.
- Added Share / Copy Link.
- Added Build Challenge sections.
- Expanded crawlable concept guides and FAQs.
- Improved deterministic simulations.

### Conversion

- Pricing intent now persists through URL query parameters into waitlist submission.
- MVP still collects no payment.

### SEO / GEO

- Reframed GEO around standard crawlability, unique expert content, structure, and page quality.
- Replaced individual `Course` markup with `LearningResource` / `WebPage`.
- Added ItemList for the public lesson collection.
- Retained llms.txt only as an optional index, not a Google ranking/GEO mechanism.
- Added optional IndexNow submission script.

### Pre-push review hardening

- Separated versioned source assets from generated `site/` output.
- Added fail-closed local SEO behavior (`noindex` until a production origin is configured).
- Made homepage Sample/Greedy decoding behavior functional instead of decorative.
- Switched the temperature visualization to a continuous softmax-style transform over the displayed candidates.
- Corrected Context Window Lab token arithmetic.
- Fixed Agent tool-error timer races during Reset/Next.
- Prevented demo-mode waitlist from falsely claiming a remote signup succeeded.
- Added explicit button types, stronger validation, and CI.
- Corrected the IndexNow verification-key workflow.
- Split the page builder and CSS into focused source modules; generated output remained byte-for-byte identical after the refactor.

## v0.1 visual switch — 2026-08-12

- Preserved all original v0.1 interactions.
- Switched the full brand palette from blue-purple to warm white / graphite / teal.
- Removed remaining purple active states and promotional gradients.
- Updated favicon and OG image.
