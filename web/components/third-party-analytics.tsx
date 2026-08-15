import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const GA_PATTERN = /^G-[A-Z0-9]+$/;

function googleAnalyticsId(): string {
  const value = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim().toUpperCase();
  if (value && !GA_PATTERN.test(value)) {
    throw new Error("NEXT_PUBLIC_GA_MEASUREMENT_ID must use GA4 format G-XXXXXXXXXX.");
  }
  return value;
}

export function ThirdPartyAnalytics() {
  const measurementId = googleAnalyticsId();

  return (
    <>
      <Analytics />
      {measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ahaframe-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(measurementId)});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
