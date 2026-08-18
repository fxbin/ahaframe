import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const content = await getCampaignDiscovery(locale);
  return pageMetadata(locale, content.meta.title, content.meta.description);
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const [content, contract] = await Promise.all([getCampaignDiscovery(locale), getCampaignContract()]);
  return <CampaignHomePage locale={locale} content={content} contract={contract} />;
}
