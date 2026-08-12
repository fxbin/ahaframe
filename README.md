# AhaFrame v0.3 Content MVP

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

## Curriculum

AhaFrame now has a formal curriculum map rather than adding Labs topic-by-topic.

See:

- `docs/CURRICULUM.md` — AhaFrame Curriculum v1.0, prerequisites, tracks, Lab backlog, source-reference policy, and free/paid boundary.
- `docs/EVALUATION_FAILURE_LAB.md` — next Production Lab product + simulation specification.
- `docs/ROADMAP.md` — Content MVP stop line, Soft Alpha, identity, payment, Live Mode, and sandbox sequence.

The curriculum uses **AI Engineering from Scratch** as a broad dependency-map reference and **AI Agent Book** as an Agent/Evaluation engineering-depth reference. AhaFrame does not copy their lessons; it independently re-models useful engineering concepts into original failure-first simulations.

Eight curriculum tracks:

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

The learning method is:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

## Current product

### Foundation lessons

- Token Playground
- Context Window Lab
- Agent Loop Simulator

### Production Lab previews

- **RAG Failure Lab** — start from a broken retrieval configuration and tune chunk size, overlap, Top-K, retrieval strategy, and reranking while watching recall, precision, context pressure, latency, cost index, and answer-quality score.
- **Agent Reliability Lab** — start from a weak customer-support agent control policy and tune max steps, retry limits, timeouts, result validation, human approval, and termination while watching success, runaway risk, unsafe-action risk, latency, cost, and review load.

Both labs use synthetic deterministic metrics for teaching. They are not presented as benchmark measurements from live model, retrieval, tool, or human-review systems.

### Pricing validation

```text
Free                       $0
AI Engineer Foundations    $49 one-time hypothesis
Production Labs            $12/month future hypothesis
```

No payment is collected yet. The pricing page records intent only.

## Content MVP stop line

AhaFrame is not launching broadly yet. The closed-development target is a small coherent journey rather than a large course catalog:

```text
RAG Failure Lab                 done
Agent Reliability Lab           done
Evaluation Failure Lab          next
Context Compression Lab         next
Reliable Support Agent Build    next
        ↓
UX / content review
        ↓
Soft Alpha with 20–50 developers
```

`Tool Contract Failure Lab` is an optional bridge only if the Build Challenge reveals a real missing Tools & Protocols concept.

Authentication, payment, Live Mode, and sandbox infrastructure stay behind this content-validation work unless a concrete feature requires them.

## Next Lab: Evaluation Failure

The learner starts with a candidate that appears better on the aggregate score and then discovers that the evaluation design is hiding safety-critical and long-horizon regressions.

Core controls:

```text
Dataset preset
Pass threshold
Safety veto
Sample size
Judge mode
Cost gate
```

Core outcome:

```text
SHIP / BLOCK / INCONCLUSIVE
```

The Lab teaches that **evaluation is a decision system, not a single score**. See `docs/EVALUATION_FAILURE_LAB.md` for the deterministic scenario contract.

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
agent-reliability
agent-loop
```

See `docs/LAB_ENGINE.md` for the engine contract.

## Routes

```text
/
└── /en/
    ├── /lessons/token-playground/
    ├── /lessons/context-window/
    ├── /lessons/agent-loop/
    ├── /labs/rag-failure/
    ├── /labs/agent-reliability/
    ├── /pricing/
    └── /early-access/
```

## Source architecture

```text
content/                          English content model
src/assets/                       browser JavaScript + favicon
  lab-engine.js                   generic deterministic Lab runtime
  lab-scenarios.js                scenario definitions
  rag.js                          RAG Failure Lab DOM adapter
  agent-reliability.js            Agent Reliability Lab DOM adapter
src/styles/                       CSS modules
scripts/ahaframe/                 page-specific static-site build modules
  rag.py                          RAG Failure Lab page builder
  agent_reliability.py            Agent Reliability Lab page builder
scripts/build_site.py             build entrypoint
scripts/test_lab_engine.js        Lab Engine behavioral regression suite
docs/CURRICULUM.md                curriculum + source mapping
docs/EVALUATION_FAILURE_LAB.md    next Lab product/simulation spec
docs/LAB_ENGINE.md                Lab Engine architecture contract
docs/ROADMAP.md                   content / auth / Live Mode roadmap
site/                             generated output (ignored)
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
agent_reliability_parameter_changed
agent_reliability_preset_applied
agent_reliability_baseline_reset
pricing_foundations_click
pricing_pro_click
waitlist_submit
```

The Lab Engine keeps engine-level analytics opt-in so high-frequency state actions do not automatically duplicate product events.

## Authentication policy

No account is required for public Content MVP learning.

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
- Token / Context / RAG / Agent Reliability / Agent Loop behavioral invariants;
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

## Intentional non-goals for the Content MVP

- mandatory accounts;
- billing;
- real LLM / vector database inference;
- code sandbox;
- CMS / admin console;
- certificates;
- community;
- AI tutor.

The goal remains **validation before platform**.
