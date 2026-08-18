import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabPage } from "@/components/lab-page";
import { getLabContent, localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

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
  const lab = await getLabContent(locale, slug);
  if (!lab) return {};
  return pageMetadata(locale, lab.seoTitle, lab.description, `labs/${slug}/`);
}

export default async function LabRoute({ params }: PageProps) {
  const { locale: segment, slug } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const lab = await getLabContent(locale, slug);
  if (!lab) notFound();
  return <LabPage locale={locale} lab={lab} />;
}
