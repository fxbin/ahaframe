# zh-CN Release QA — `release/zh-cn-v1`

Status: release-candidate checklist for issue #47.

## Scope

The bilingual Validation Alpha surface contains 13 public route pairs (26 localized URLs):

- landing
- pricing
- early access
- 3 Foundation lessons
- 6 standalone Production Labs
- Reliable Support Agent Integrated Build

English remains the intentional `x-default` locale. Simplified Chinese is served under `/zh-cn/`.

## Architecture invariants

Localization must not fork behavior. The release keeps:

- one Lab Engine;
- one scenario/action/formula/preset/checkpoint implementation per Lab;
- one Integrated Build release-decision implementation;
- stable semantic IDs, `failureType` values, slice IDs, topology states, diagnostic codes, and `SHIP` / `BLOCK` / `INCONCLUSIVE` decisions;
- the same analytics event names across locales.

Locale-specific code is limited to presentation, routing/discovery metadata, and the `locale` dimension attached to validation evidence.

## Editorial review outcome

Structured review used four lenses: Chinese Technical Editor, AI Engineering Educator, Product/UX Localization Writer, and i18n/SEO Engineer. This is AI-assisted review, not external expert endorsement.

Outcome:

- Keep established engineering nouns such as Prompt, Context, Harness, Loop, Graph, Evaluation, RAG, Judge, Gate, Hybrid, Top-K, and Schema when translating them would make the material less recognizable to engineers.
- Translate surrounding explanation, controls, diagnoses, feedback UI, status text, and release guidance into natural Simplified Chinese.
- Do not translate by matching English runtime sentences. Dynamic diagnoses and release messages must render from stable semantic keys/codes.
- Do not create locale-specific scenario files or analytics event names.
- English remains the intentional `x-default`; this is a product choice, not a missing localization.

Release QA found and corrected two concrete cross-locale defects before release:

1. Shared validation UI injected English feedback copy into zh-CN pages.
2. Capstone completion instrumentation compared visible text `SHIP`; after localization that visible label becomes `可以发布`, so completion events could be lost. The runtime now checks stable `data-decision="SHIP"` instead.

It also corrected the Integrated Build duration presentation from `35 min` to `35 分钟` on zh-CN.

## Automated release gates

`CI` protects the existing engine, scenarios, Integrated Build, static build, localization contracts, validation instrumentation, JavaScript syntax, Next.js migration app, and deployment config.

`Localization Release QA` additionally verifies:

- every English/zh-CN public route pair exists;
- self-canonical URLs are locale-correct;
- `en`, `zh-CN`, and `x-default` hreflang links are reciprocal;
- sitemap discovery contains all 26 localized URLs and alternate links;
- `llms.txt` exposes both language surfaces;
- localized metadata and structured-data `inLanguage` are correct;
- an intentional technical-term allowlist distinguishes accepted English terminology from untranslated leakage;
- dynamic shared runtime copy is bilingual;
- analytics events keep stable names while event/feedback/waitlist evidence carries `locale`;
- Supabase schema/ingest persist locale for all three validation streams;
- representative desktop/mobile HTML structure and interactive controls are present;
- the production smoke harness covers representative English and zh-CN routes.

## Backend rollout

Before final production smoke:

- apply `supabase/migrations/202608150001_validation_locale.sql`;
- deploy the updated `validation-ingest` Edge Function;
- verify `validation_events.locale`, `aha_feedback.locale`, and `validation_waitlist.locale` accept `en` / `zh-CN`;
- retain default `en` so older clients/rows remain backward-compatible.

## Release-train checklist: `release/zh-cn-v1` → `main`

- [ ] PR #57 is green in both `CI` and `Localization Release QA`.
- [ ] Merge PR #57 into `release/zh-cn-v1` and close #47.
- [ ] Confirm parent localization issue #42 has no remaining child implementation gap.
- [ ] Apply the additive Supabase locale migration.
- [ ] Deploy the updated `validation-ingest` function.
- [ ] Open one release PR from `release/zh-cn-v1` to `main`; do not merge feature branches directly to `main`.
- [ ] Require normal CI plus localization release QA on the release PR.
- [ ] Merge the release PR only after the branch is fully green.
- [ ] Confirm the production deployment serves `/en/` and `/zh-cn/` route pairs.
- [ ] Run `scripts/smoke_production.py` against the production validation endpoint.
- [ ] Verify the smoke event, feedback, and waitlist rows persist `locale='zh-CN'`.
- [ ] Verify production `sitemap.xml`, reciprocal hreflang, and `x-default -> /en/`.
- [ ] Check one representative mobile route in each locale after deployment.

## Known boundary

The localization release validates shared deterministic educational simulations. It does not convert synthetic Lab metrics into production benchmarks or universal release thresholds.
