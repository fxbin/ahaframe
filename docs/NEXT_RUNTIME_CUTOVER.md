# AhaFrame Next.js Production Runtime Cutover

Status: M5 production-control runbook for #30. The code in this runbook may be rehearsed before #29 closes, but the production switch itself is blocked until #29 is merged and green on `main`.

## Invariants

The cutover must not change AhaFrame's public content contract:

- `https://ahaframe.com` remains the production origin;
- the 13 public routes remain available in both `en` and `zh-CN`;
- canonical URLs keep trailing slashes;
- `/assets/build-meta.json` remains the exact-release identity used by Production Smoke;
- the existing security response headers remain present;
- Auth, Waffo, billing and entitlement work stay outside this cutover.

The old static source is not deleted during the cutover. Source retirement is a later cleanup decision after the Next runtime has soaked successfully.

## Required green evidence before production changes

1. #112 / M2 merged to `main` and normal CI green.
2. #113 / M3 merged to `main` and Chromium interaction gate green.
3. #114 / M4 merged to `main` and legacy-to-Next parity gate green with no P0/P1 divergence.
4. M5 Cutover Rehearsal green on the exact candidate commit.
5. Record the current legacy production deployment URL and its `/assets/build-meta.json` commit SHA as the rollback target.

Do not continue if any item above is missing.

## Production-equivalent Next contract

The Next app owns these contracts before Vercel is switched:

- `next.config.ts` sets `trailingSlash: true`;
- Next emits `X-Content-Type-Options: nosniff`;
- Next emits `Referrer-Policy: strict-origin-when-cross-origin`;
- Next emits `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
- every production build writes `/assets/build-meta.json`;
- `AHAFRAME_INDEXING_ENABLED` is fail-closed: only the exact value `1` enables indexing;
- when indexing is disabled, page metadata is `noindex,nofollow` and `robots.txt` disallows `/`;
- when indexing is enabled, page metadata is `index,follow` and `robots.txt` allows `/`.

## Staged production cutover

### Stage 0 — capture rollback identity

Before touching the Vercel project:

1. Open the currently active AhaFrame production deployment in Vercel.
2. Record its deployment URL and commit SHA.
3. Confirm `https://ahaframe.com/assets/build-meta.json` reports that same full SHA.
4. Keep that deployment available as the known-good rollback target.

### Stage 1 — switch the runtime with indexing still blocked

In the existing AhaFrame Vercel project:

1. Set the project Root Directory to `web`.
2. Keep framework detection on Next.js; do not set a second custom static output directory.
3. Set Production `AHAFRAME_INDEXING_ENABLED=0` (or leave it unset; unset is intentionally fail-closed).
4. Deploy the exact approved `main` commit.
5. Confirm `/assets/build-meta.json` equals that exact commit SHA.
6. Confirm the 27-route runtime smoke, security headers, trailing-slash redirects, bilingual pages, waitlist/validation smoke and browser-secret boundary.

At this point the new runtime may serve production traffic, but crawlers remain blocked while the operator verifies the deployment.

### Stage 2 — enable indexing only after runtime verification

After Stage 1 is green:

1. Set Production `AHAFRAME_INDEXING_ENABLED=1`.
2. Redeploy the same approved `main` commit.
3. Confirm `/assets/build-meta.json` still reports the same approved SHA.
4. Confirm `robots.txt` allows `/` and still advertises `https://ahaframe.com/sitemap.xml`.
5. Confirm representative EN and zh-CN pages emit `index,follow`.
6. Run Production Smoke again against the exact commit.

Do not enable indexing on an unverified deployment.

## Rollback

Rollback is intentionally deployment-based, not a hurried source rewrite.

Trigger rollback for any P0/P1 production regression, release-marker mismatch, broken public route, broken Mission/Lab interaction, security-header loss, or unexpected browser-secret exposure.

1. In Vercel, promote/rollback to the recorded pre-cutover legacy production deployment.
2. Confirm `https://ahaframe.com/assets/build-meta.json` reports the recorded legacy SHA.
3. Run the existing manual Production Smoke using that legacy SHA as `--expected-commit`.
4. Confirm public routes and Validation POST smoke are green.
5. Keep Next indexing disabled while the incident is investigated.
6. Do not delete the failed deployment; retain it for diagnosis.

Because Vercel rollback restores the prior immutable deployment, changing the project Root Directory back is not the first recovery action. Root-directory configuration can be corrected after service has been restored.

## Post-cutover cleanup

Only after a successful soak period:

- remove temporary stacked M2/M3/M4/M5 CI workflows that are no longer needed;
- keep the canonical deterministic runtime under `src/assets/*` until a separate ADR changes that ownership;
- decide whether to archive/remove the legacy static builder in a dedicated cleanup change;
- proceed to Auth / Waffo / durable entitlement work in #12–#14.
