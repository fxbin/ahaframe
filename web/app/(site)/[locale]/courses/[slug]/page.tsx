import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseDetailPage } from "@/components/course-detail-page";
import { StructuredData } from "@/components/structured-data";
import { getCourseCatalog } from "@/lib/course-catalog-server";
import { localeFromSegment } from "@/lib/content";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const knowledgeMap = await getKnowledgeMap("en");
  return knowledgeMap.paths.map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const catalog = await getCourseCatalog(locale);
  const course = catalog.find((item) => item.path.slug === slug);
  if (!course) return {};
  return pageMetadata(locale, `${course.path.title} — AhaFrame`, course.path.description, `courses/${slug}/`);
}

export default async function CourseDetailRoute({ params }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const catalog = await getCourseCatalog(locale);
  const course = catalog.find((item) => item.path.slug === slug);
  if (!course) notFound();

  return (
    <>
      <StructuredData value={webPageSchema(locale, `courses/${slug}/`, course.path.title, course.path.description)} />
      <CourseDetailPage locale={locale} course={course} />
    </>
  );
}
