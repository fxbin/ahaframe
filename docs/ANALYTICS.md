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

GA4 is injected immediately after `<head>` for public builds using the AhaFrame GA4 Web Data Stream:

```text
G-EWPR5QXGWJ
```

The Measurement ID is browser-visible configuration, not a secret.

Optional environment overrides, in priority order:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
AHAFRAME_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The second name is a migration compatibility alias. Prefer `NEXT_PUBLIC_GA_MEASUREMENT_ID` when an override is needed so the same public configuration works with the Next.js migration app.

Local static builds remain analytics-free by default. A non-empty malformed override fails the build instead of silently shipping broken analytics.

## Next.js migration app

`web/package.json` includes:

```text
@vercel/analytics
```

`web/components/third-party-analytics.tsx` renders `Analytics` from `@vercel/analytics/next` and uses `G-EWPR5QXGWJ` as the production GA4 default. `NEXT_PUBLIC_GA_MEASUREMENT_ID` can override that value when needed. Development mode does not load the default GA4 ID unless an explicit override is configured.

## Vercel setup

Vercel Web Analytics must be enabled for the `ahaframe` project. After deployment, verify that the page loads the Vercel analytics script and sends a page-view request to the project analytics endpoint.

## GA4 verification

After production deployment, verify `G-EWPR5QXGWJ` with GA4 Realtime or Google Tag Assistant. Confirm that page views for `ahaframe.com` appear without sending email addresses, feedback text, or other user-owned private data.

## Privacy boundary

Do not send email addresses, free-form feedback, authentication tokens, or other user-owned private data to Vercel Analytics or GA4.

Before expanding GA4 beyond basic traffic measurement for EEA/UK visitors, review the privacy policy and consent requirements and introduce Consent Mode / a consent UI when required by the product's target jurisdictions.
