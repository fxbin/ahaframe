import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EarlyAccessPage } from "@/components/marketing-pages";
import { StructuredData } from "@/components/structured-data";
import { getMarketingContent, localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const content = await getMarketingContent(locale);
  return pageMetadata(locale, content.earlyAccess.title, content.earlyAccess.description, "early-access/");
}

export default async function EarlyAccessRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const content = await getMarketingContent(locale);
  return (
    <>
      <StructuredData value={webPageSchema(locale, "early-access/", content.earlyAccess.title, content.earlyAccess.description)} />
      <EarlyAccessPage locale={locale} content={content} />
    </>
  );
}
