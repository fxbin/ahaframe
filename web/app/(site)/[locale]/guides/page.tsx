import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideDirectoryPage } from "@/components/guide-directory-page";
import { StructuredData } from "@/components/structured-data";
import { localeFromSegment } from "@/lib/content";
import { getGuideDirectory } from "@/lib/guides-directory-server";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "AI Guides — AhaFrame" : "AI Guides — AhaFrame";
  const description = locale === "zh-CN"
    ? "浏览 60 个可复用的 AI 心智模型，按知识域、主题、课程、难度和 Practice 快速筛选。"
    : "Browse 60 reusable AI mental models and filter by domain, topic, course, difficulty, and Practice availability.";
  return pageMetadata(locale, title, description, "guides/");
}

export default async function GuidesRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const data = await getGuideDirectory(locale);
  const title = locale === "zh-CN" ? "60 个可复用的 AI 心智模型" : "60 reusable mental models for AI";
  const description = locale === "zh-CN"
    ? "直接浏览 Guide，或按 canonical Knowledge Graph 结构筛选。"
    : "Browse Guides directly or filter them through the canonical Knowledge Graph structure.";

  return (
    <>
      <StructuredData value={webPageSchema(locale, "guides/", title, description)} />
      <GuideDirectoryPage locale={locale} data={data} />
    </>
  );
}
