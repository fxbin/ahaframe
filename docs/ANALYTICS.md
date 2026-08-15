# Traffic Analytics

AhaFrame uses two third-party traffic analytics layers alongside its first-party Validation Alpha instrumentation.

## Responsibilities

- **Vercel Web Analytics**: page views, referrers, geography/device-level traffic insights in Vercel.
- **Google Analytics 4**: acquisition/channel analysis and future conversion reporting.
- **AhaFrame Validation Alpha**: product-decision events, Aha feedback, waitlist attribution, and validation metrics stored in Supabase.

Third-party analytics do not replace the Validation Alpha event pipeline.

## Current static production site

The static build post-processes every generated HTML document through `scripts/ahaframe/third_party_analytics.py`.

For public builds it injects Vercel Web Analytics using:

```html
<script>
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

GA4 is injected immediately after `<head>` only when a valid GA4 Measurement ID is configured.

Accepted environment variables, in priority order:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
AHAFRAME_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The second name is a migration compatibility alias. Prefer `NEXT_PUBLIC_GA_MEASUREMENT_ID` so the same public configuration works with the Next.js migration app.

A non-empty malformed value fails the build instead of silently shipping broken analytics.

## Next.js migration app

`web/package.json` includes:

```text
@vercel/analytics
```

`web/components/third-party-analytics.tsx` renders `Analytics` from `@vercel/analytics/next` and conditionally loads GA4 from `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

## Vercel setup

Vercel Web Analytics must be enabled for the `ahaframe` project. After deployment, verify that the page loads the Vercel analytics script and sends a page-view request to the project analytics endpoint.

## GA4 setup

Create or select the AhaFrame GA4 Web Data Stream and copy its Measurement ID (`G-...`). Configure that value in the production Vercel environment as:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Then redeploy production and verify with GA4 Realtime or Google Tag Assistant.

The Measurement ID is browser-visible configuration, not a secret.

## Privacy boundary

Do not send email addresses, free-form feedback, authentication tokens, or other user-owned private data to Vercel Analytics or GA4.

Before expanding GA4 beyond basic traffic measurement for EEA/UK visitors, review the privacy policy and consent requirements and introduce Consent Mode / a consent UI when required by the product's target jurisdictions.
