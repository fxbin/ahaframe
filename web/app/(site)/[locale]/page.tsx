import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { StructuredData } from "@/components/structured-data";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { getCourseCatalog } from "@/lib/course-catalog-server";
import { localeFromSegment } from "@/lib/content";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { pageMetadata } from "@/lib/metadata";
import { campaignSchemas } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "AhaFrame — 看见 AI 如何工作" : "AhaFrame — Understand AI by seeing it work";
  const description = locale === "zh-CN"
    ? "通过清晰课程与真实互动练习理解、构建并使用 AI。"
    : "Clear courses and real interactive practice for understanding, building, and using AI.";
  return pageMetadata(locale, title, description);
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const [content, contract, knowledgeMap, catalog] = await Promise.all([
    getCampaignDiscovery(locale),
    getCampaignContract(),
    getKnowledgeMap(locale),
    getCourseCatalog(locale),
  ]);
  return (
    <>
      <StructuredData value={campaignSchemas(locale, content, contract)} />
      <CampaignHomePage locale={locale} content={content} knowledgeMap={knowledgeMap} catalog={catalog} />
    </>
  );
}
