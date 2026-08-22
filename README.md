# AhaFrame — Interactive AI Engineering

AhaFrame is an interactive learning product for experienced software developers becoming AI engineers.

> **Learn AI engineering by debugging systems that fail.**

Learning loop:

```text
SEE → PLAY → BREAK → AHA → BUILD
```

Architecture principle:

> **Simulate the concept. Spend compute only to validate reality.**

Product invariant:

> **Anonymous First, Account Enhanced.**

## Current production architecture

AhaFrame production runs on **Next.js App Router + TypeScript** from `web/` and is deployed on Vercel.

```text
web/                    Next.js application, UI, routes and adapters
content/                bilingual product and curriculum content
src/assets/             canonical deterministic Lab / Mission runtime
supabase/               validation backend migrations and Edge Function
scripts/                runtime/evidence tests and production operations
```

`src/assets/` is intentionally outside `web/`: the browser simulation engine remains framework-independent. `web/scripts/sync-runtime-assets.mjs` copies an explicit allowlist into the Next.js public runtime during build.

The retired Python static-site renderer is no longer part of the production or CI architecture.

## AI Engineering Stack

```text
Prompt shapes behavior.
Context shapes knowledge.
Harness shapes reliability.
Loop shapes iteration.
Graph shapes orchestration.
Evaluation proves whether it works.
```

## Current experiences

### Foundations

- **Token Playground** — next-token prediction, sampling, temperature.
- **Context Window Lab** — context budgets, overflow, summarization, retrieval, memory.
- **Agent Loop Simulator** — act, observe, retry, recover, terminate.

### Production incidents and specialist Labs

- **The Broken RAG Pipeline** — retrieval freshness, authority, grounding, context and cost.
- **The $47,000 Retry** — retries, idempotency, approvals and irreversible side effects.
- **The Prompt Injection Attack** — provenance, least privilege and runtime enforcement.
- **Context Compression Lab** — token savings versus critical-information retention.
- **Agent Workflow Graph Lab** — topology, state boundaries, retry scope and failure propagation.
- **Evaluation Failure Lab** — coverage, regressions, safety vetoes and release uncertainty.

### Final Boss

- **Ship the Production Support Agent** — a six-layer production launch decision spanning Prompt, Context, Harness, Loop, Graph and Evaluation.

All modeled metrics are deterministic educational quantities unless a future Live Mode explicitly reports real execution evidence.

## Public routes

AhaFrame ships equivalent `en` and `zh-CN` surfaces:

```text
/en/                              /zh-cn/
/en/lessons/...                   /zh-cn/lessons/...
/en/labs/...                      /zh-cn/labs/...
/en/build/reliable-support-agent/ /zh-cn/build/reliable-support-agent/
/en/pricing/                      /zh-cn/pricing/
/en/early-access/                 /zh-cn/early-access/
```

The current sitemap contains 13 public routes × 2 locales.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000/`.

Production-equivalent checks:

```bash
cd web
npm run lint
npm run typecheck
npm run check:browser-secrets
npm run build
npm run test:interaction
```

Focused deterministic runtime checks from the repository root:

```bash
node scripts/test_lab_engine.js
node scripts/test_mission_engine.js
node scripts/test_integrated_build.js
node scripts/test_validation_runtime.js
python3 scripts/test_lab_reconciliation.py
python3 scripts/test_content_preview_contract.py
python3 scripts/test_validation_report.py
python3 scripts/test_product_gate_memo.py
```

## Validation Alpha

AhaFrame remains evidence-driven even though the production runtime is now Next.js. The active cohort is:

```text
alpha-2026-08
```

Primary outcome:

> **Did this change how you think about this system?**

Validation data is stored through the Supabase `validation-ingest` boundary. Direct browser table access is denied; ordinary analytics events do not contain email, while waitlist/product-feedback contact data is confined to its dedicated payload.

See:

- `docs/VALIDATION.md`
- `docs/VALIDATION_METRICS.md`
- `docs/VALIDATION_CONSOLE.md`
- `docs/PRODUCT_GATE_MEMO.md`
- `docs/VALIDATION_ALPHA_RUNBOOK.md`

## Production release gate

Every Next.js build publishes:

```text
/assets/build-meta.json
```

Production Smoke waits for the exact Git SHA that triggered the release before testing public routes and validation persistence. Search indexing is build-gated by `AHAFRAME_INDEXING_ENABLED`; production currently uses the enabled mode after the completed Next.js cutover.

See `docs/PRODUCTION_RELEASE_GATE.md` and `docs/NEXT_RUNTIME_CUTOVER.md`.

## Analytics

Production includes:

- Vercel Web Analytics;
- GA4 (`G-EWPR5QXGWJ`);
- AhaFrame semantic Validation Alpha evidence.

Traffic analytics do not replace Product Gate evidence.

## Pricing hypothesis

```text
Free                       $0
AI Engineer Foundations    $39 one-time hypothesis
Production Labs            $12/month future hypothesis
```

No real payment is collected during Validation Alpha.

## Repository policy

`main` is the single production source of truth. Completed feature/migration branches are automatically pruned once their commits are fully contained in `main`. Unmerged branches are retained for explicit review rather than deleted automatically.
