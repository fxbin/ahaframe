import type { Metadata } from "next";
import { CampaignHomePage } from "@/components/campaign-home-page";
import { SiteFrame } from "@/components/site-frame";
import { StructuredData } from "@/components/structured-data";
import { getCampaignContract, getCampaignDiscovery } from "@/lib/campaign";
import { getCourseCatalog } from "@/lib/course-catalog-server";
import { getLocaleSource } from "@/lib/content";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { pageMetadata } from "@/lib/metadata";
import { campaignSchemas } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    "en",
    "AhaFrame — Understand AI by seeing it work",
    "Clear courses and real interactive practice for understanding, building, and using AI.",
  );
}

export default async function RootPage() {
  const [content, contract, source, knowledgeMap, catalog] = await Promise.all([
    getCampaignDiscovery("en"),
    getCampaignContract(),
    getLocaleSource("en"),
    getKnowledgeMap("en"),
    getCourseCatalog("en"),
  ]);

  return (
    <SiteFrame locale="en" source={source}>
      <StructuredData value={campaignSchemas("en", content, contract)} />
      <CampaignHomePage locale="en" content={content} knowledgeMap={knowledgeMap} catalog={catalog} />
    </SiteFrame>
  );
}
