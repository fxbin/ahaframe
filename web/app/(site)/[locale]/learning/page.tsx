import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPathClient } from "@/components/learning-path-client";
import { localeFromSegment } from "@/lib/content";
import { getLearningGraph, getLearningUxContent } from "@/lib/learning-graph";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const ux = await getLearningUxContent(locale);
  return pageMetadata(locale, ux.meta.title, ux.meta.description, "learning/");
}

export default async function LearningPathRoute({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const [graph, ux] = await Promise.all([getLearningGraph(locale), getLearningUxContent(locale)]);
  return <LearningPathClient graph={graph} ux={ux} />;
}
