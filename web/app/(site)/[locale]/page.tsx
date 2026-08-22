import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { CampaignTelemetry } from "@/components/campaign-telemetry";
import { StructuredData } from "@/components/structured-data";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { localeFromSegment, localizedPath } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { campaignSchemas } from "@/lib/schema";

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
  const byId = Object.fromEntries(contract.experiences.map((experience) => [experience.id, experience]));
  const telemetryItems = contract.primaryCampaign.map((id, index) => {
    const experience = byId[id];
    if (!experience) throw new Error(`Missing Campaign experience: ${id}`);
    return {
      missionId: experience.missionId || experience.id,
      path: localizedPath(experience.route, locale),
      position: index + 1,
      campaignRole: experience.campaignRole,
    };
  });

  return (
    <>
      <StructuredData value={campaignSchemas(locale, content, contract)} />
      <CampaignTelemetry items={telemetryItems} campaignVersion={contract.version} />
      <CampaignHomePage locale={locale} content={content} contract={contract} />
    </>
  );
}
