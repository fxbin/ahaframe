# Content Entitlements v1

Status: implemented foundation; activation intentionally paused.

## Product boundary

Knowledge Graph and entitlement data are separate systems.

```text
Knowledge Graph / content production
  → says what an Experience is and which access class it belongs to

Entitlement layer
  → says what one authenticated account may access

Billing adapter
  → may later change membership state only after verified server reconciliation
```

The Knowledge Graph never stores user quota, purchases, subscriptions or account state.

## v1 access model

- `OPEN` — available without an account.
- `FREE_CHOICE` — a Free Account may permanently choose up to three shipped Experiences.
- `MEMBERSHIP` — unlocked by active membership.

`FREE_CHOICE_LIMIT = 3` lives in `web/lib/entitlements.ts`, not in curriculum/content JSON.

## Durable data

`public.account_access`

- one row per authenticated user when durable access state exists;
- `membership_status`: `FREE | MEMBER`;
- payment-provider independent.

`public.content_entitlements`

- permanent per-content grants;
- `source`: `FREE_CHOICE | ADMIN`;
- primary key `(user_id, content_id)` makes re-claim idempotent.

The database function `claim_free_content_choice(uuid,text)` serializes claims per account and enforces the hard maximum of three FREE_CHOICE grants.

## Security boundary

Browser clients may read only their own access rows through RLS.

Browser clients cannot:

- insert/update entitlement rows;
- call the privileged claim function;
- choose an arbitrary user id;
- reclassify MEMBERSHIP content as FREE_CHOICE.

The claim flow is:

```text
browser
  → Next /api/entitlements
  → cookie-bound Supabase auth.getUser()
  → canonical content-production eligibility check
  → server-only service-role client
  → atomic claim_free_content_choice(...)
```

The service-role credential must never enter browser/static/prerender output.

## Activation gate

`content/ai-content-production-v1.0.json` currently declares:

```json
"billingActivation": false,
"freeChoiceActivation": false
```

This is deliberate. #149 installs the entitlement foundation but does not activate claiming before #125 Content Readiness.

While `freeChoiceActivation=false`:

- POST `/api/entitlements` returns `409 FREE_CHOICE_CLAIMS_PAUSED`;
- no user can consume a free-choice slot through the product runtime;
- existing public learning routes remain unchanged;
- Billing remains inactive.

When #125 eventually returns `READY FOR PAID CONTENT`, activation still requires an explicit reviewed change. At minimum that change must verify:

1. the chosen FREE_CHOICE Experiences are actually shipped (`status=EXISTING`), not merely `SEEDED` or `PLANNED`;
2. Auth UI/session lifecycle is production-ready;
3. entitlement GET/POST behavior is exercised with authenticated users;
4. EN/zh-CN access messaging is ready;
5. lock-state UX does not make the open Knowledge Map itself inaccessible;
6. #14 Billing remains independently gated until its own release requirements pass.

Changing `freeChoiceActivation` must never be bundled implicitly with a payment-provider rollout.

## Tests

CI covers:

- all Supabase migrations on PostgreSQL 17;
- own-row RLS;
- no authenticated browser write privilege;
- server-only claim RPC privilege;
- idempotent permanent grants;
- exactly three FREE_CHOICE grants maximum;
- dormant claim API behavior;
- Next lint/typecheck/build;
- browser secret boundary;
- existing interaction regression suite.

Refs #125 #143 #146 #149 #14
