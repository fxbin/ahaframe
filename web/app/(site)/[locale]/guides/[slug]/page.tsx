import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/guide-page";
import { StructuredData } from "@/components/structured-data";
import { localeFromSegment } from "@/lib/content";
import { getCoreGuides, getGuidePageData } from "@/lib/guides-server";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<{ path?: string | string[] }>;
}

export async function generateStaticParams() {
  const guides = await getCoreGuides("en");
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const data = await getGuidePageData(locale, slug);
  if (!data) return {};
  return pageMetadata(locale, `${data.guide.title} — AhaFrame`, data.guide.summary, `guides/${slug}/`);
}

export default async function GuideRoute({ params, searchParams }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const query = searchParams ? await searchParams : {};
  const requestedPath = typeof query.path === "string" ? query.path : null;
  const data = await getGuidePageData(locale, slug, requestedPath);
  if (!data) notFound();

  return (
    <>
      <StructuredData value={webPageSchema(locale, `guides/${slug}/`, data.guide.title, data.guide.summary)} />
      <GuidePage locale={locale} data={data} />
    </>
  );
}
