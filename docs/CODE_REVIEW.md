# AhaFrame v0.2 — Code Review Record

Date: 2026-08-12

## Scope

This review covers repository hygiene, simulation correctness, SEO/GEO implementation, accessibility basics, responsive behavior, deployment safety, client-side state behavior, and the SeeAI → AhaFrame brand migration.

## Findings fixed before the first reviewed baseline

1. **Generated output mixed with source** — `site/` is build output only and is Git-ignored; browser assets live under `src/assets/`, styles under `src/styles/`, and page builders under `scripts/ahaframe/`.
2. **Demo waitlist could imply a real signup** — when no backend is configured, the UI explicitly says the email was saved only in that browser.
3. **Context Lab arithmetic error** — `191,250 → 112,430` reduces active context by `78,820`; `87,570` is remaining headroom, not tokens freed.
4. **Temperature visualization was bucketed** — displayed candidate probabilities use a continuous temperature-scaled softmax-style transform, with an implicit “other” probability mass so the default visible values remain 91% / 3% / 2%.
5. **Decorative sampling control** — the homepage decoding selector changes the example selection (`Sample` vs `Greedy`) rather than being visual-only.
6. **Agent error/reset race** — the pending recovery timer is cleared on Reset/Next so state no longer jumps after a user action.
7. **Mobile overflow** — grid children allow shrinking; all core pages were checked at 390px without page-level horizontal overflow.
8. **Build date could create false SEO freshness** — `lastmod` / `dateModified` use an explicit content update date rather than changing on every build.
9. **Sitemap noise** — removed `changefreq` and `priority`; retained accurate `lastmod` only.
10. **IndexNow workflow incomplete** — build can emit the verification key file from an environment variable, and the submitter verifies the deployed key before posting URLs.
11. **Accidental production indexing** — local builds default to localhost and emit `noindex`/`Disallow` until a real `AHAFRAME_BASE_URL` is configured.
12. **Accessibility hygiene** — interactive buttons have explicit button types; validation checks duplicate IDs and basic image/button semantics.
13. **CI missing** — GitHub Actions now builds and validates the project.

## Brand migration review

The product brand is now **AhaFrame**, with `https://ahaframe.com` as the production origin.

The migration covers:

- visible brand text and page titles;
- Organization / WebSite structured data;
- canonical and Open Graph asset defaults;
- `llms.txt`, web manifest, 404 and root redirect output;
- browser runtime namespace (`window.AhaFrame`);
- localStorage keys (`ahaframe_*`);
- build environment variables (`AHAFRAME_*`);
- OG asset naming (`og-ahaframe.png`);
- Python builder package (`scripts/ahaframe/`);
- README, product, visual, SEO/GEO, and changelog documentation;
- CI checks that reject legacy SeeAI strings in generated output.

Historical references to “SeeAI” may remain only when documenting the migration itself; they are not runtime or product sources of truth.

## Repository hygiene result

No API keys, GitHub tokens, private keys, container-local paths, temporary assistant file IDs, `.env` files, logs, node_modules, build caches, or generated `site/` output are intended to be committed.

`docs/VISUAL_SYSTEM.md` is the repository visual source of truth. Design screenshots and superseded mockups are intentionally excluded from Git history to avoid conflicting references and unnecessary binary weight.

## SEO / GEO posture

- Canonical HTML is the source of truth.
- Local/test builds fail closed with `noindex`.
- Production origin is `https://ahaframe.com` and must be supplied explicitly at build time.
- Lesson content is crawlable without JavaScript or login.
- `LearningResource` is used as semantic schema, not marketed as a Google rich-result entitlement.
- `Course` markup is intentionally not used for single MVP lessons.
- `llms.txt` is optional and not treated as a Google GEO mechanism.
- Sitemap `lastmod` is explicit and stable.

## Browser checks performed on the reviewed v0.2 baseline

- Homepage temperature interaction and Sample/Greedy behavior
- Token Playground high-temperature example
- Context Window RAG and Summarize arithmetic/copy
- Agent tool-error followed immediately by Reset
- Early Access with no backend (must show demo mode, not fake success)
- 390px responsive width for Home, all three Lessons, Pricing, and Early Access

## Known MVP constraints

These remain deliberate rather than blockers:

- static Python site generator rather than a full application framework;
- no production waitlist backend yet;
- no production analytics provider yet;
- no account/authentication system;
- no real LLM inference;
- no billing;
- English-only UI, with i18n-ready content organization rather than full localization.

The builder is split by page concern. If content scale grows materially, the next architecture review should consider a reusable template/component layer rather than adding another application framework prematurely.
