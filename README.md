# SeeAI MVP v0.2

SeeAI is an English-first interactive visual learning product for AI engineering.

> **Understand AI by seeing it work.**

This repository is a static, dependency-light validation MVP. Version control contains source files only; `site/` is generated build output and is intentionally ignored. The project is optimized for fast launch, crawlable content, deterministic interactive simulations, and straightforward deployment to Vercel or Cloudflare Pages.

## What changed in v0.2

### Visual system

- Replaced the original blue/purple AI-SaaS look with the approved **warm white + graphite + teal** system.
- Removed large brand gradients and glow-heavy visual language.
- New outline SeeAI logo and matching OG image.
- Visual hierarchy is now closer to a technical learning product than a generic AI landing page.

### Product experience

- Interactive Token Playground in the homepage hero.
- Three interactive lessons:
  - Token Playground
  - Context Window Lab
  - Agent Loop Simulator
- Local lesson completion and progress tracking using `localStorage`.
- Share / copy-link action on lesson pages.
- `In one sentence` answer-first blocks.
- `See → Play → Build` learning model.
- Build Challenge after each lesson.
- Pricing-intent tracking through `?intent=pro`, `?intent=founder`, etc.

### SEO / generative-search readiness

- Fully crawlable lesson content in HTML (not hidden behind JS or login).
- Unique title / description / canonical / hreflang per page.
- `WebPage`, `LearningResource`, `BreadcrumbList`, `Organization`, `WebSite`, and `ItemList` JSON-LD where appropriate.
- Removed `Course` structured data from individual MVP lessons because the product does not yet satisfy Google's stricter Course rich-result definition.
- Sitemap + robots.txt.
- Optional `llms.txt`, explicitly treated as non-essential.
- Stable answer-first definitions, concept guides, FAQs, update timestamps, and simulation disclaimers.
- Optional IndexNow submission script for post-deploy discovery.


## Design source of truth

The approved warm-white / graphite / teal system is documented in `docs/VISUAL_SYSTEM.md`. Design screenshots and superseded mockups are intentionally not versioned.

## Routes

```text
/
└── /en/
    ├── /lessons/token-playground/
    ├── /lessons/context-window/
    ├── /lessons/agent-loop/
    ├── /pricing/
    └── /early-access/
```

## Source architecture

```text
content/               English content model
src/assets/            browser JavaScript + favicon
src/styles/            base / marketing / lesson / responsive CSS modules
scripts/seeai/         page-specific static-site build modules
scripts/build_site.py  small orchestration entrypoint
site/                  generated output (ignored)
```

The build concatenates the CSS modules into the public `/assets/styles.css` bundle and generates the OG image at build time, so generated binary/output files do not need to live in Git history.

## Run locally

```bash
cd seeai-mvp-v0.2
python3 scripts/build_site.py
python3 -m http.server 8080 --directory site
```

Then open:

```text
http://localhost:8080/en/
```

## Build for a real domain

Local builds default to `http://localhost:8080` and intentionally emit `noindex` safeguards. Before production launch, always provide the real public origin:

```bash
SEEAI_BASE_URL=https://your-domain.com python3 scripts/build_site.py
```

This updates canonical URLs, JSON-LD URLs, sitemap URLs, robots.txt, and `llms.txt`. The content update date comes from `content/en.json` (`meta.updated`) unless `SEEAI_UPDATED=YYYY-MM-DD` is explicitly supplied.

## Waitlist and analytics integration

Runtime endpoint configuration is generated at build time. Configure public endpoint URLs through environment variables instead of editing generated files:

```bash
SEEAI_WAITLIST_ENDPOINT=https://your-api.example.com/waitlist \
SEEAI_ANALYTICS_ENDPOINT=https://your-api.example.com/events \
SEEAI_BASE_URL=https://your-domain.com \
python3 scripts/build_site.py
```

Do **not** put API secrets in these variables: endpoint URLs are written to public browser JavaScript.

Expected waitlist request:

```json
{
  "email": "user@example.com",
  "intent": "pro",
  "source": "/en/early-access/",
  "createdAt": "2026-08-12T..."
}
```

When no waitlist endpoint is configured, the UI clearly reports **demo mode** and saves the address only in that browser. It never claims a remote signup succeeded without a backend.

## Analytics events

Examples:

```text
hero_start_learning_click
hero_temperature_changed
lesson_card_click
interaction_slider_changed
interaction_strategy_selected
lesson_step_completed
tool_error_simulated
lesson_completed
lesson_share
pricing_pro_click
pricing_founder_click
waitlist_submit
```

## Local progress

Completed lessons are stored under:

```text
seeai_progress_v02
```

No account is required in the MVP.

## i18n

MVP is English-only, but content has been separated into:

```text
content/en.json
```

A later version can add:

```text
content/zh.json
content/ja.json
content/ko.json
content/es.json
```

and extend the builder to emit locale routes.

## Development dependencies

The production build uses only the Python standard library. Validation and OG regeneration use development dependencies:

```bash
pip install -r requirements-dev.txt
```

## Validation

Run:

```bash
python3 scripts/build_site.py
python3 scripts/validate.py
```

The validator checks:

- exact route set
- internal links
- titles, descriptions, canonicals
- JSON-LD validity
- `LearningResource` semantic markup (not presented as a guaranteed Google rich-result feature)
- answer-first blocks
- share/completion controls
- explicit button types and duplicate IDs
- sitemap accuracy
- legacy blue/purple brand tokens
- JavaScript syntax
- deployment configuration

## IndexNow (optional)

IndexNow requires a publicly reachable verification key file. Build and deploy with the key first; only submit after the deployed key URL is reachable.

```bash
# Build/deploy with the key so /{KEY}.txt exists publicly
INDEXNOW_KEY=YOUR_KEY \
SEEAI_BASE_URL=https://your-domain.com \
python3 scripts/build_site.py

# After deployment, verify the key file and submit the sitemap URLs
INDEXNOW_KEY=YOUR_KEY \
SEEAI_BASE_URL=https://your-domain.com \
python3 scripts/indexnow.py
```

Never commit the IndexNow key file; `site/` is generated and ignored.

## Deployment

### Vercel

Deploy the repository root. `vercel.json` runs `python3 scripts/build_site.py` and publishes `site/` automatically, with the root redirect and basic security headers configured.

### Cloudflare Pages

Build command:

```bash
python3 scripts/build_site.py
```

Output directory:

```text
site
```

## Important MVP constraints

The following are intentionally not included yet:

- user accounts
- billing
- real LLM calls
- CMS
- admin console
- certificates
- community
- AI tutor
- production waitlist backend
- production analytics provider

The goal remains **validation before platform**.
