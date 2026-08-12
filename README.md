# AhaFrame v0.3 Validation

AhaFrame is an English-first **Interactive AI Engineering Lab** for software developers moving toward AI engineering.

> **Understand AI by seeing it work.**

The repository is a static, dependency-light validation product. Version control contains source files only; `site/` is generated build output and intentionally ignored.

## Product direction

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

Core architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

## Current product

### Foundation lessons

- Token Playground
- Context Window Lab
- Agent Loop Simulator

### Production Lab preview

- **RAG Failure Lab** — start from a broken retrieval configuration and tune chunk size, overlap, Top-K, retrieval strategy, and reranking while watching recall, precision, context pressure, latency, cost index, and answer-quality score.

### Pricing validation

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

No payment is collected yet. The pricing page records intent only.

## Lab / Simulation Engine

AhaFrame uses a dependency-free deterministic browser runtime:

```text
Scenario
  ↓
State
  ↓
Action
  ↓
Reducer
  ↓
Derived Metrics
  ↓
DOM Adapter
```

Reusable primitives:

```text
History
Checkpoint
Compare
Replay
Reset
Failure Injection
```

Registered scenarios:

```text
token-playground
context-window
rag-failure
agent-loop
```

See `docs/LAB_ENGINE.md` for the engine contract and `docs/ROADMAP.md` for the development sequence.

## Routes

```text
/
└── /en/
    ├── /lessons/token-playground/
    ├── /lessons/context-window/
    ├── /lessons/agent-loop/
    ├── /labs/rag-failure/
    ├── /pricing/
    └── /early-access/
```

## Source architecture

```text
content/                   English content model
src/assets/                browser JavaScript + favicon
  lab-engine.js            generic deterministic Lab runtime
  lab-scenarios.js         scenario definitions
  rag.js                   RAG Failure Lab DOM adapter
src/styles/                CSS modules
scripts/ahaframe/          page-specific static-site build modules
  rag.py                   RAG Failure Lab page builder
scripts/build_site.py      build entrypoint
scripts/test_lab_engine.js Lab Engine behavioral regression suite
docs/LAB_ENGINE.md         Lab Engine architecture contract
docs/ROADMAP.md            product / auth / Live Mode roadmap
site/                      generated output (ignored)
```

## Run locally

```bash
python3 scripts/build_site.py
python3 -m http.server 8080 --directory site
```

Open:

```text
http://localhost:8080/en/
```

## Production build

Local builds default to `http://localhost:8080` and intentionally emit `noindex` safeguards.

```bash
AHAFRAME_BASE_URL=https://ahaframe.com python3 scripts/build_site.py
```

This updates canonical URLs, JSON-LD URLs, sitemap URLs, robots.txt, and `llms.txt`.

## Waitlist and analytics integration

Public runtime endpoint URLs are generated at build time:

```bash
AHAFRAME_WAITLIST_ENDPOINT=https://your-api.example.com/waitlist \
AHAFRAME_ANALYTICS_ENDPOINT=https://your-api.example.com/events \
AHAFRAME_BASE_URL=https://ahaframe.com \
python3 scripts/build_site.py
```

Do **not** put API secrets in these variables; endpoint URLs are written to public browser JavaScript.

When no waitlist endpoint is configured, the UI explicitly reports demo mode and saves the address only in that browser.

## Analytics events

Examples:

```text
hero_start_learning_click
interaction_slider_changed
interaction_strategy_selected
lesson_step_completed
tool_error_simulated
rag_parameter_changed
rag_balanced_preset_applied
rag_failure_baseline_reset
rag_paid_intent_click
pricing_foundations_click
pricing_pro_click
waitlist_submit
```

The Lab Engine keeps engine-level analytics opt-in so high-frequency state actions do not automatically duplicate product events.

## Authentication policy

No account is required for public v0.3 learning.

Authentication should be introduced when it enables durable value such as:

- cross-device Lab history/checkpoints;
- paid entitlements;
- Live Mode credits;
- Build Project submissions;
- persistent progress.

The intended UX is to ask for sign-in only when the learner chooses **Save / Purchase / Live Mode / Build Project**. See `docs/ROADMAP.md`.

## Validation

```bash
python3 scripts/build_site.py
python3 scripts/validate.py
node scripts/test_lab_engine.js
```

Validation covers:

- exact route set and internal links;
- metadata / canonical / JSON-LD;
- answer-first learning blocks;
- accessibility basics;
- sitemap accuracy;
- Lab Engine asset order;
- Token / Context / RAG / Agent behavioral invariants;
- JavaScript syntax;
- deployment configuration.

## Deployment

### Vercel

Deploy the repository root. `vercel.json` runs `python3 scripts/build_site.py` and publishes `site/`.

### Cloudflare Pages

```text
Build command: python3 scripts/build_site.py
Output directory: site
```

## Intentional non-goals for v0.3

- mandatory accounts;
- billing;
- real LLM / vector database inference;
- code sandbox;
- CMS / admin console;
- certificates;
- community;
- AI tutor.

The goal remains **validation before platform**.
