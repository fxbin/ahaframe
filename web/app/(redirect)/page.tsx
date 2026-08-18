import type { Metadata } from "next";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { SiteFrame } from "@/components/site-frame";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { getLocaleSource } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCampaignDiscovery("en");
  return pageMetadata("en", content.meta.title, content.meta.description);
}

export default async function RootPage() {
  const [content, contract, source] = await Promise.all([
    getCampaignDiscovery("en"),
    getCampaignContract(),
    getLocaleSource("en"),
  ]);

  return (
    <SiteFrame locale="en" source={source}>
      <CampaignHomePage locale="en" content={content} contract={contract} />
    </SiteFrame>
  );
}
