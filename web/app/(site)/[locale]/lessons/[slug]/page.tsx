import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPage } from "@/components/lesson-page";
import { getFoundationContent, localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const LESSON_SLUGS = ["token-playground", "context-window", "agent-loop"] as const;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return LESSON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const content = await getFoundationContent(locale);
  const lesson = content.lessons[slug];
  if (!lesson) return {};
  return pageMetadata(locale, lesson.seoTitle, lesson.description, `lessons/${slug}/`);
}

export default async function LessonRoute({ params }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const content = await getFoundationContent(locale);
  const lesson = content.lessons[slug];
  if (!lesson) notFound();
  return <LessonPage locale={locale} ui={content.ui} lesson={lesson} />;
}
