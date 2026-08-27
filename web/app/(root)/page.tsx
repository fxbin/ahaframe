import type { Metadata } from "next";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { SiteFrame } from "@/components/site-frame";
import { StructuredData } from "@/components/structured-data";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { getLocaleSource } from "@/lib/content";
import { getLearningGraph } from "@/lib/learning-graph-server";
import { pageMetadata } from "@/lib/metadata";
import { campaignSchemas } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCampaignDiscovery("en");
  return pageMetadata("en", content.meta.title, content.meta.description);
}

export default async function RootPage() {
  const [content, contract, source, learningGraph] = await Promise.all([
    getCampaignDiscovery("en"),
    getCampaignContract(),
    getLocaleSource("en"),
    getLearningGraph("en"),
  ]);

  return (
    <SiteFrame locale="en" source={source}>
      <StructuredData value={campaignSchemas("en", content, contract)} />
      <CampaignHomePage locale="en" content={content} contract={contract} learningStages={learningGraph.stages} />
    </SiteFrame>
  );
}
