# AhaFrame Validation Deployment

Status: deployment runbook for GitHub issue #17.

## Goal

Deploy the conceptually closed, no-login AhaFrame validation build at `https://ahaframe.com`, connect the production Validation Alpha ingest endpoint, and verify the complete browser-origin evidence path before inviting external developers.

## Production services

```text
AhaFrame static validation build
        ↓
Vercel
        ↓
https://ahaframe.com
        ↓
Supabase Edge Function
validation-ingest
        ↓
validation_events
aha_feedback
validation_waitlist
```

Supabase Validation Alpha project:

```text
project: ahaframe-validation
region: ap-southeast-1
endpoint: https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest
```

The endpoint is intentionally public and anonymous. The Edge Function is the security boundary: it allows only configured origins, accepts POST/OPTIONS, bounds payload sizes, validates fields, and uses the server-side service role to write into RLS-protected tables. No service-role key belongs in Vercel or browser runtime configuration.

## Vercel project

Import repository:

```text
fxbin/ahaframe
```

Use repository root as the project root. The committed `vercel.json` defines:

```text
buildCommand: python3 scripts/build_site.py
outputDirectory: site
```

Do not point Vercel at `web/` during Validation Alpha. The Next.js migration remains paused until the Product Gate says `GO PLATFORM`.

## Production environment variables

Configure these for Production:

```text
AHAFRAME_BASE_URL=https://ahaframe.com
AHAFRAME_ANALYTICS_ENDPOINT=https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest
AHAFRAME_FEEDBACK_ENDPOINT=https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest
AHAFRAME_WAITLIST_ENDPOINT=https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest
```

These values are public routing configuration, not secrets.

Do not configure:

```text
SUPABASE_SERVICE_ROLE_KEY
Waffo credentials
Auth secrets
```

for the current static validation build.

## Domain

Connect:

```text
ahaframe.com
www.ahaframe.com (optional redirect to apex)
```

Use the exact DNS records Vercel reports for the project. Do not copy stale generic A/CNAME values from documentation or another project.

HTTPS must be active before Alpha traffic.

## Smoke gate

After the production deployment and domain are active, run GitHub Actions workflow:

```text
Production Smoke
```

Defaults:

```text
base_url=https://ahaframe.com
validation_endpoint=https://swzddvprnyjrrgpzcsgp.supabase.co/functions/v1/validation-ingest
```

The workflow verifies:

- landing page;
- Prompt Lab;
- Graph Lab;
- integrated Build;
- pricing;
- early access;
- robots.txt;
- sitemap.xml;
- real event POST from `Origin: https://ahaframe.com`;
- real Aha feedback POST;
- real waitlist POST.

Every run prints deterministic row identifiers based on the GitHub run ID. Confirm those rows in Supabase before treating the smoke run as end-to-end complete.

## Database verification

For a smoke run such as `github-123456`, expect:

```text
validation_events.event_id
= smoke-event-github-123456

aha_feedback.feedback_id
= smoke-feedback-github-123456

validation_waitlist.email
= ahaframe-smoke+github-123456@example.invalid
```

Delete smoke rows after verification.

## SEO gate

Verify production output contains:

- canonical URLs using `https://ahaframe.com`;
- `robots` allowing indexing;
- sitemap URLs using production origin;
- Open Graph image and metadata;
- JSON-LD using production origin;
- `/robots.txt` pointing at the production sitemap.

The normal repository CI remains the source-code/build gate; Production Smoke is the deployment/network gate.

## Observability minimum

Before inviting Alpha users:

1. Vercel deployment failures are visible in project deployment history.
2. Supabase Edge Function logs are available for ingest failures.
3. Validation data can be queried by event, Lab, anonymous user, and session.
4. A rollback target is known: the previous successful Vercel deployment / `main` commit.
5. A failed validation backend does not block the educational Lab itself; it should fail feedback/waitlist visibly rather than claim durable success.

## Rollback

If a site deployment is bad:

1. promote/redeploy the previous known-good Vercel deployment;
2. keep Supabase validation data intact;
3. do not roll back the database merely to roll back static UI unless a schema incompatibility exists;
4. re-run Production Smoke after recovery.

If validation ingest fails but the site is healthy:

1. inspect Supabase Edge Function logs;
2. restore/redeploy the previous `validation-ingest` function version if required;
3. confirm the three RLS tables remain deny-by-default to browser roles;
4. re-run Production Smoke.

## Exit gate for #16 and #17

Close #16 only after a Production Smoke run has written all three payload types through the real HTTP endpoint and those rows have been confirmed in Postgres.

Close #17 only after:

```text
ahaframe.com HTTPS works
+ production metadata is correct
+ production endpoint config is present
+ Production Smoke passes
+ smoke rows are confirmed and cleaned
+ rollback procedure is usable
```
