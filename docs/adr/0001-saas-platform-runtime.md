# ADR-0001 — AhaFrame SaaS platform runtime and migration strategy

Date: 2026-08-13
Status: Accepted
Issue: #10

## Context

AhaFrame has proven its Content MVP architecture with a dependency-light static Python builder and a deterministic browser Lab Engine. The product now needs a complete public-platform chain:

```text
Content
→ Identity
→ Durable state
→ Entitlement
→ Payment
→ Verified webhook
→ Access control
→ Analytics
→ Production operations
```

The current static runtime is excellent for public no-login learning, but identity, durable experiments, server-authoritative entitlements, payment webhooks, and future metered Live Mode require a server-capable application runtime.

Inputs already selected:

```text
Raphael StarterKit  → allowed reusable SaaS development skeleton
Supabase             → identity + application data
Waffo Pancake        → billing provider
AhaFrame Lab Engine  → deterministic simulation runtime
Vercel               → target application deployment unless a later constraint changes it
```

This ADR decides the target architecture and migration boundary before implementation issue #11 begins.

## Decision summary

AhaFrame will adopt **Next.js App Router + TypeScript** as the target application runtime, using Raphael StarterKit as the reusable SaaS foundation.

The migration will be **staged and parity-first**, but the target architecture is **not a permanent hybrid**.

During migration:

```text
Current static AhaFrame
        │
        │ remains the behavior / SEO reference
        │
        ├──────────────┐
        │              │
        ↓              ↓
existing build      new Next.js app
                   based on Raphael foundation
                         │
                         ↓
                   parity verification
                         │
                         ↓
                   production cutover
```

Auth, billing, and durable state are added only after the new application reaches public-route and Lab-behavior parity.

## Why Next.js is the target runtime

The platform now requires capabilities that are naturally server-owned:

- OAuth/session lifecycle;
- Supabase server access;
- account-owned data;
- server-authoritative entitlement checks;
- Waffo checkout creation and webhook handling;
- environment secrets;
- future Live Mode provider adapters;
- server-side rate limits and usage metering;
- production observability.

Keeping a static frontend plus a separate ad-hoc backend would preserve the current generator but create two application models and duplicate routing, session, error, and deployment concerns.

A single Next.js runtime gives AhaFrame one application boundary while still allowing public content to be statically rendered or cached where appropriate.

## Why migration is staged instead of a rewrite

The existing product already has valuable invariants:

- stable `/en/...` URLs;
- deterministic Lab behavior;
- synthetic-metric disclosure;
- SEO/canonical/robots/sitemap behavior;
- warm-white / graphite / teal visual system;
- no-login public learning;
- Lab Engine regression tests.

A platform rewrite must not silently change those while adding SaaS infrastructure.

Therefore issue #11 follows this rule:

> **Parity first. Platform features second.**

Do not redesign Labs while migrating the runtime.

## Repository migration topology

Issue #11 should initially add the Next.js application under a dedicated directory, recommended:

```text
web/
```

Temporary repository shape:

```text
ahaframe/
├── content/                   current source content
├── src/assets/                current Lab runtime / assets
├── scripts/                   current static build reference
├── docs/
│
└── web/                       new Next.js application
    ├── app/
    ├── components/
    ├── lib/
    ├── public/
    ├── supabase/
    └── package.json
```

This is a **migration topology**, not the permanent product architecture.

After parity is proven, choose one of two cleanup options in #11:

1. make `web/` the Vercel production root and retain the old static implementation temporarily under a clearly marked legacy/reference path; or
2. promote the Next.js application to repository root and remove/archive obsolete static-runtime code.

Do not keep both runtimes serving production routes.

## Raphael StarterKit reuse boundary

Raphael StarterKit is an allowed development skeleton. Reuse is encouraged for infrastructure that is generic SaaS plumbing.

### Reuse / adapt

```text
Next.js project structure
TypeScript configuration
Supabase client/server helpers
session/auth patterns
OAuth callback structure
protected-route patterns
account/dashboard shell primitives
Tailwind / reusable UI infrastructure where useful
server action / API route patterns
```

### Replace

```text
Creem billing integration  → Waffo Pancake adapter
Raphael product-specific business code
Raphael product catalog / credit package configuration
Raphael brand / landing page / visual language
```

### Preserve from AhaFrame

```text
brand / visual system
public learning routes
curriculum
learning copy
Lab Engine
Lab scenarios
failure-first product UX
pricing model
entitlement semantics
analytics event vocabulary where still useful
SEO/discovery guarantees
```

Principle:

> **Borrow the SaaS foundation; do not overwrite the product.**

## Target route architecture

Current public URLs are contractual and must remain stable.

Recommended App Router shape:

```text
web/app/
├── en/
│   ├── page.tsx
│   ├── lessons/
│   │   ├── token-playground/page.tsx
│   │   ├── context-window/page.tsx
│   │   └── agent-loop/page.tsx
│   ├── labs/
│   │   ├── rag-failure/page.tsx
│   │   ├── agent-reliability/page.tsx
│   │   ├── evaluation-failure/page.tsx
│   │   ├── context-compression/page.tsx
│   │   └── reliable-support-agent/page.tsx   # after #9
│   ├── pricing/page.tsx
│   └── early-access/page.tsx
│
├── (auth)/
│   ├── sign-in/page.tsx
│   └── auth/callback/route.ts
│
├── account/
│   ├── page.tsx
│   ├── progress/page.tsx
│   ├── experiments/page.tsx
│   └── billing/page.tsx
│
└── api/
    ├── billing/
    │   └── waffo/
    │       └── checkout/route.ts
    ├── webhooks/
    │   └── waffo/route.ts
    └── usage/                    # future Live Mode
```

The exact folder grouping may change during implementation, but the public URL contract must not.

Root `/` continues to resolve/redirect to `/en/` unless a later localization decision replaces it.

## Lab Engine boundary

The Lab Engine remains **framework-independent**.

Issue #11 must not rewrite scenario math into React components.

Migration sequence:

```text
Existing deterministic JS
        ↓
Preserve Engine + scenarios unchanged
        ↓
Mount from Next.js client-side boundary
        ↓
Keep Node behavioral regression suite passing
        ↓
Only later consider an ESM / TypeScript packaging refactor
```

For parity migration, the preferred low-risk approach is to serve the existing Engine/scenario assets through the Next.js application and create thin client adapters/components around them.

React owns lifecycle/rendering. Scenario definitions continue to own state transitions and derived calculations.

No generic Engine change is required merely because the host framework changes.

## Rendering strategy

Use server rendering/static generation for public educational content whenever possible.

Use client boundaries only for interactive Lab controls and browser-owned state.

Target split:

```text
Public explanation / SEO content  → Server Component / static output
Interactive Lab control surface   → Client Component
Auth/account state                → server-aware application boundary
Billing / secrets / webhook       → server only
```

This preserves crawlable content while avoiding a client-heavy rewrite.

## Supabase architecture

Supabase responsibilities:

```text
Auth
PostgreSQL application data
RLS
server-side persistence
```

Application authentication should use Supabase session primitives adapted from Raphael.

Preferred sign-in order:

```text
GitHub OAuth
Google OAuth (optional / later if useful)
email fallback
```

Public learning routes do not require a session.

### Data boundary

`auth.users` owns identity. AhaFrame application tables own product state.

Minimum durable domain:

```text
LabRun
Checkpoint
Progress
Purchase
Subscription
Entitlement
PaymentEvent
```

Future:

```text
CreditLedger
UsageRecord
```

All user-owned tables require explicit RLS policies before production use.

Service-role access is server-only and used only where privileged reconciliation is required.

## Entitlement architecture

`Entitlement` is the canonical authorization model.

Do not implement:

```text
has access = active subscription row exists
```

because AhaFrame has multiple grant types:

```text
Foundations purchase       → lifetime / one-time entitlement
Production Labs subscription → time-bounded recurring entitlement
Admin/support grant        → explicit entitlement if ever required
Future promotional grant   → explicit entitlement
Compute Credits            → balance/ledger, not entitlement
```

Recommended conceptual record:

```text
Entitlement
├── user_id
├── capability
├── source_type
├── source_id
├── valid_from
├── valid_until nullable
├── status
└── metadata
```

Application access checks read AhaFrame state, not Waffo synchronously.

## Waffo billing adapter

Waffo is an external payment provider behind an AhaFrame-owned adapter.

Boundary:

```text
UI
 ↓
AhaFrame checkout endpoint
 ↓
BillingProvider interface
 ↓
Waffo adapter
 ↓
Waffo Checkout

Waffo Webhook
 ↓
verify + deduplicate
 ↓
PaymentEvent
 ↓
Purchase / Subscription
 ↓
Entitlement
```

### Product mapping

```text
AI Engineer Foundations → one-time Waffo product
Production Labs         → subscription Waffo product
Compute Credits         → one-time/dynamic purchase only after Live Mode exists
```

### Server-only credentials

Expected server secrets include Waffo Merchant ID/private credential and webhook verification material according to the provider integration used by #14.

Never expose private Waffo credentials in browser JavaScript, `NEXT_PUBLIC_*` variables, repository files, or generated static assets.

### Authoritative payment rule

A successful browser redirect is **not** authoritative for access.

Access changes only after server-side reconciliation from verified provider state/webhook handling.

### Webhook idempotency

`PaymentEvent` must contain a provider event key with a uniqueness guarantee:

```text
provider = 'waffo'
provider_event_id UNIQUE
```

If the same event is delivered again:

```text
already processed
→ return success
→ no duplicate purchase / entitlement / credit
```

The same rule applies to credit purchases when #15/#20 are implemented.

### Checkout correlation

Issue #14 must confirm the exact Waffo-supported mechanism for securely correlating checkout/order state with the authenticated AhaFrame user.

Preferred order:

1. provider-supported metadata/reference passed from a server-created checkout;
2. otherwise an AhaFrame-owned pending-checkout record keyed to a provider session/order identifier.

Do not trust user-controlled query parameters to grant ownership.

## Billing event policy boundary

The Waffo adapter translates provider events into domain commands. Provider event names must not leak throughout the application.

Conceptual mapping:

```text
payment completed
→ record Purchase
→ grant/reconcile one-time Entitlement

subscription active / paid / updated
→ reconcile Subscription
→ reconcile recurring Entitlement

subscription canceling
→ record pending cancellation; access policy handled explicitly

subscription canceled / expired-equivalent state
→ close/revoke recurring Entitlement according to paid-through policy

past due
→ apply explicit grace/access policy defined in #14

refund succeeded
→ record refund and reconcile affected entitlement
```

Exact Waffo event mapping is implemented and tested in #14 against current provider docs/test mode.

## Compute-credit architecture

Credits are not part of initial public learning access.

Product rule:

```text
Simulation / learning   = free of compute credits
Saved progress          = free of compute credits
Live model / agent run  = consumes compute credits
Sandbox execution       = consumes credits later
```

When enabled, credits use an append-only ledger or transaction-safe equivalent.

Do not port Raphael's simple read-modify-write balance logic as the source of truth.

Required invariants:

- atomic debit;
- no overspend under concurrent requests;
- idempotent payment fulfillment;
- every debit references a concrete usage record;
- balance is auditable/reconstructable.

## Environment and secrets

### Browser-safe

Only values intentionally public may use browser-exposed environment variables, e.g. Supabase public project URL / publishable key according to the chosen Supabase setup.

### Server-only

Examples:

```text
Supabase privileged/service-role credential
Waffo Merchant ID/private credential
Waffo webhook verification secret/material
model provider keys for future Live Mode
internal admin/reconciliation secrets
```

Rules:

- never prefix private credentials with `NEXT_PUBLIC_`;
- never commit real secrets;
- separate test, preview, and production values;
- production secrets are managed by deployment environment configuration;
- rotate credentials if exposure is suspected.

## Deployment topology

Target production topology:

```text
GitHub
  ↓
Vercel Preview deployments
  ↓
CI + parity / E2E validation
  ↓
Vercel Production
  ↓
ahaframe.com

Supabase
  ├── Auth
  └── PostgreSQL

Waffo Pancake
  └── Checkout + billing events
```

Production webhook endpoints must use HTTPS.

Do not point production Waffo webhooks at preview deployments except for explicitly isolated test configuration.

## SEO / discovery invariants

The Next.js migration must preserve or improve:

- current exact public paths;
- canonical URLs;
- one H1 per lesson/Lab page;
- crawlable explanation content without requiring client JS;
- LearningResource/WebPage structured data;
- sitemap coverage;
- robots behavior;
- Open Graph metadata;
- synthetic-metric disclosure;
- local/preview indexing safeguards where appropriate.

Parity is tested before production cutover.

## Migration phases for issue #11

### M1 — Bootstrap

- create `web/` from Raphael-compatible Next.js foundation;
- remove/disable Creem and product-specific Raphael business code;
- install AhaFrame brand tokens and basic shell;
- establish CI build for both current static reference and new Next app during migration.

### M2 — Public route parity

Port, without redesign:

```text
/en/
/en/lessons/*
/en/labs/*
/en/pricing/
/en/early-access/
```

Preserve titles, descriptions, structured data, navigation, and public behavior.

### M3 — Lab parity

- serve/mount existing Lab Engine and scenarios;
- preserve baseline/preset/checkpoint/compare behavior;
- retain Node Engine tests;
- add route-level smoke/E2E tests for interactive mounting.

### M4 — SEO / visual parity gate

Do not proceed to SaaS feature work until current route, SEO, visual, and Lab invariants pass.

### M5 — Production runtime cutover

- select Next.js app as production build;
- preserve `ahaframe.com` URLs;
- document rollback;
- old static runtime becomes temporary reference/legacy code, not a second production application.

### M6 — Platform capabilities

Only after parity/cutover:

```text
#12 Auth
#13 durable state + Entitlement
#14 Waffo billing
#15 credit foundation
#16 analytics / waitlist
#17 production operations
```

## Testing strategy

During migration, both current and target implementations are useful as a differential oracle.

Required gates:

```text
Current Node Lab behavior tests       must stay green
Current static validation             stays green until cutover
Next.js production build              green
route parity                          green
metadata / structured-data parity     green
Lab interaction smoke tests           green
secret-leak checks                     green
```

After Auth/Billing:

```text
RLS tests
session lifecycle tests
entitlement tests
Waffo webhook signature tests
Waffo duplicate-event tests
failed-checkout / refund / cancel tests
```

## Rejected alternatives

### Keep static frontend + separate backend permanently

Rejected because it introduces a second application architecture for sessions, entitlement, APIs, deployments, and error handling while the product is still small enough to converge on one runtime.

### Big-bang rewrite directly on `main`

Rejected because it combines platform migration with regression risk across all current Labs and SEO behavior.

### Make billing-provider state the authorization model

Rejected because one-time purchases, subscriptions, support grants, refunds, and future credits are different domain concepts.

### Require login for all learning

Rejected because the no-login interactive experience is part of AhaFrame's acquisition and product-validation strategy.

### Port Raphael Credits unchanged

Rejected because compute usage requires concurrency-safe, idempotent accounting rather than a simple mutable balance pattern.

## Consequences

### Positive

- one long-term full-stack application runtime;
- direct reuse of mature generic SaaS foundation;
- preserves investment in the Lab Engine;
- provider-independent business model;
- clear server/client security boundary;
- staged rollback-friendly migration;
- Auth and billing can be added without turning public learning into a login wall.

### Costs

- temporary duplication during parity migration;
- route/content porting work before new SaaS features;
- Node/Next tooling added alongside Python during transition;
- platform migration becomes a deliberate project rather than a quick Auth patch.

These costs are accepted because the Launch Gate requires a complete, testable platform chain rather than a collection of loosely connected features.

## Exit criteria for ADR-0001

This ADR is complete when issue #11 can implement the migration without re-deciding:

- target runtime;
- migration strategy;
- Raphael reuse boundary;
- public route contract;
- Lab Engine boundary;
- Supabase ownership;
- entitlement model boundary;
- Waffo adapter boundary;
- compute-credit boundary;
- secrets model;
- deployment topology;
- parity gates.
