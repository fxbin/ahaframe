import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildPage } from "@/components/build-page";
import { getIntegratedBuildContent, localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const content = await getIntegratedBuildContent(locale);
  return pageMetadata(locale, content.build.seoTitle, content.build.description, "build/reliable-support-agent/");
}

export default async function ReliableSupportAgentRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const content = await getIntegratedBuildContent(locale);
  return <BuildPage locale={locale} content={content} />;
}
