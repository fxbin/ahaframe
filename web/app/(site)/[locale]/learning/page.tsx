import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPathClient } from "@/components/learning-path-client";
import { localeFromSegment } from "@/lib/content";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getLearningGraph, getLearningUxContent } from "@/lib/learning-graph-server";
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

  const [graph, knowledgeMap, ux] = await Promise.all([
    getLearningGraph(locale),
    getKnowledgeMap(locale),
    getLearningUxContent(locale),
  ]);
  return <LearningPathClient graph={graph} knowledgeMap={knowledgeMap} ux={ux} />;
}
