# AhaFrame Changelog

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
