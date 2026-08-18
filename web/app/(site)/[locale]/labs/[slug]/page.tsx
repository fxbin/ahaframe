import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabPage } from "@/components/lab-page";
import { MissionPage } from "@/components/mission-page";
import { StructuredData } from "@/components/structured-data";
import { getLabContent, localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getMissionContent } from "@/lib/mission";
import { hasRuntimeExperience } from "@/lib/runtime-manifest";
import { labSchema, missionSchema } from "@/lib/schema";

const LAB_SLUGS = [
  "instruction-conflict",
  "rag-failure",
  "context-compression",
  "agent-reliability",
  "agent-workflow-graph",
  "evaluation-failure",
] as const;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return LAB_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};

  const mission = await getMissionContent(locale, slug);
  if (mission) {
    return pageMetadata(locale, mission.seoTitle, mission.description, `labs/${slug}/`);
  }

  const lab = await getLabContent(locale, slug);
  if (!lab) return {};
  return pageMetadata(locale, lab.seoTitle, lab.description, `labs/${slug}/`);
}

export default async function LabRoute({ params }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const mission = await getMissionContent(locale, slug);
  if (mission) {
    if (!hasRuntimeExperience(slug)) notFound();
    return (
      <>
        <StructuredData value={missionSchema(locale, `labs/${slug}/`, mission)} />
        <MissionPage locale={locale} mission={mission} experienceKey={slug} />
      </>
    );
  }

  const lab = await getLabContent(locale, slug);
  if (!lab) notFound();
  return (
    <>
      <StructuredData value={labSchema(locale, slug, lab)} />
      <LabPage locale={locale} lab={lab} experienceKey={hasRuntimeExperience(slug) ? slug : undefined} />
    </>
  );
}
