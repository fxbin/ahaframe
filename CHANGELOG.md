# AhaFrame Changelog

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
