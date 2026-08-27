import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { LearningProgressTracker } from "@/components/learning-progress-tracker";
import { LearningReturnBar } from "@/components/learning-return-bar";
import { StructuredData } from "@/components/structured-data";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import { SiteFrame } from "@/components/site-frame";
import { ValidationBootstrap } from "@/components/validation-bootstrap";
import { getLocaleSource, localeFromSegment, SUPPORTED_SEGMENTS } from "@/lib/content";
import { indexingMetadata } from "@/lib/indexing";
import { getLearningGraph } from "@/lib/learning-graph-server";
import { organizationSchema } from "@/lib/schema";
import "../../globals.css";

export const metadata: Metadata = {
  title: {
    default: "AhaFrame",
    template: "%s | AhaFrame",
  },
  description: "Interactive AI Engineering labs for developers becoming AI engineers.",
  robots: indexingMetadata(),
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

  const [source, graph] = await Promise.all([getLocaleSource(locale), getLearningGraph(locale)]);
  const progressNodes = graph.contentNodes.map(({ id, route }) => ({ id, route }));
  const returnNodes = graph.contentNodes.map(({ id, title, route }) => ({ id, title, route }));

  return (
    <html lang={locale}>
      <body>
        <StructuredData value={organizationSchema()} />
        <ValidationBootstrap />
        <LearningProgressTracker locale={locale} nodes={progressNodes} />
        <SiteFrame locale={locale} source={source}>
          <Suspense fallback={null}>
            <LearningReturnBar locale={locale} nodes={returnNodes} />
          </Suspense>
          {children}
        </SiteFrame>
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
