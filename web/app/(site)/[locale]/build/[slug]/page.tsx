import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MissionPage } from "@/components/mission-page";
import { StructuredData } from "@/components/structured-data";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getMissionContent, OUTCOME_BUILD_SLUGS } from "@/lib/mission";
import { hasRuntimeExperience } from "@/lib/runtime-manifest";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return OUTCOME_BUILD_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale || !OUTCOME_BUILD_SLUGS.includes(slug as (typeof OUTCOME_BUILD_SLUGS)[number])) return {};
  const mission = await getMissionContent(locale, slug);
  if (!mission) return {};
  return pageMetadata(locale, mission.seoTitle, mission.description, `build/${slug}/`);
}

export default async function OutcomeBuildRoute({ params }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale || !OUTCOME_BUILD_SLUGS.includes(slug as (typeof OUTCOME_BUILD_SLUGS)[number])) notFound();
  const mission = await getMissionContent(locale, slug);
  if (!mission || !hasRuntimeExperience(slug)) notFound();

  return (
    <>
      <StructuredData value={webPageSchema(locale, `build/${slug}/`, mission.name, mission.description)} />
      <MissionPage locale={locale} mission={mission} experienceKey={slug} />
    </>
  );
}
