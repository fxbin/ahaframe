import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseCatalogPage } from "@/components/course-catalog-page";
import { StructuredData } from "@/components/structured-data";
import { getCourseCatalog } from "@/lib/course-catalog-server";
import { localeFromSegment } from "@/lib/content";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "AI 学习课程 — AhaFrame" : "AI Learning Courses — AhaFrame";
  const description = locale === "zh-CN"
    ? "按目标选择清晰的 AI 学习路径，在关键节点进入真实互动练习。"
    : "Choose a clear AI learning path by goal and enter real interactive practice when it matters.";
  return pageMetadata(locale, title, description, "courses/");
}

export default async function CoursesRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const [knowledgeMap, catalog] = await Promise.all([getKnowledgeMap(locale), getCourseCatalog(locale)]);
  const title = locale === "zh-CN" ? "AI 学习课程" : "AI Learning Courses";
  const description = locale === "zh-CN"
    ? "按目标选择清晰的 AI 学习路径。"
    : "Choose a clear AI learning path by goal.";

  return (
    <>
      <StructuredData value={webPageSchema(locale, "courses/", title, description)} />
      <CourseCatalogPage locale={locale} knowledgeMap={knowledgeMap} catalog={catalog} />
    </>
  );
}
