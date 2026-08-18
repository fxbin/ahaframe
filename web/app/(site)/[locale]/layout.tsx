import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import { SiteFrame } from "@/components/site-frame";
import { ValidationBootstrap } from "@/components/validation-bootstrap";
import { getLocaleSource, localeFromSegment, SUPPORTED_SEGMENTS } from "@/lib/content";
import "../../globals.css";

export const metadata: Metadata = {
  title: {
    default: "AhaFrame",
    template: "%s | AhaFrame",
  },
  description: "Interactive AI Engineering labs for developers becoming AI engineers.",
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return SUPPORTED_SEGMENTS.map((locale) => ({ locale }));
}

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const source = await getLocaleSource(locale);

  return (
    <html lang={locale}>
      <body>
        <ValidationBootstrap />
        <SiteFrame locale={locale} source={source}>
          {children}
        </SiteFrame>
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
