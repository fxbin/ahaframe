import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MissionPage } from "@/components/mission-page";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getMissionContent } from "@/lib/mission";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const mission = await getMissionContent(locale, "reliable-support-agent");
  if (!mission) return {};
  return pageMetadata(locale, mission.seoTitle, mission.description, "build/reliable-support-agent/");
}

export default async function ReliableSupportAgentRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const mission = await getMissionContent(locale, "reliable-support-agent");
  if (!mission) notFound();
  return <MissionPage locale={locale} mission={mission} />;
}
