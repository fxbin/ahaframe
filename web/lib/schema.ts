import { segmentForLocale, type LessonContent, type LabContent, type Locale } from "@/lib/content";
import type { CampaignContract, CampaignDiscoveryContent } from "@/lib/campaign";
import type { MissionContent } from "@/lib/mission";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ahaframe.com";

function absolute(locale: Locale, relativePath = ""): string {
  return `${BASE_URL}/${segmentForLocale(locale)}/${relativePath.replace(/^\/+/, "")}`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "AhaFrame",
    url: BASE_URL,
    description: "Interactive visual lessons for understanding and building AI systems.",
  };
}

export function campaignSchemas(locale: Locale, content: CampaignDiscoveryContent, contract: CampaignContract) {
  const byId = Object.fromEntries(contract.experiences.map((item) => [item.id, item]));
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AhaFrame",
      url: absolute(locale),
      inLanguage: locale,
      description: content.meta.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: locale === "en" ? "AhaFrame v0.8 Campaign" : "AhaFrame v0.8 Campaign 挑战路径",
      numberOfItems: contract.primaryCampaign.length,
      itemListElement: contract.primaryCampaign.map((id, index) => {
        const experience = byId[id];
        const route = experience?.route?.replace(/^\/en\//, "") ?? "";
        return {
          "@type": "ListItem",
          position: index + 1,
          name: content.campaign.cards[id]?.title ?? id,
          url: absolute(locale, route),
        };
      }),
    },
  ];
}

export function lessonSchema(locale: Locale, slug: string, lesson: LessonContent) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.name,
    description: lesson.description,
    url: absolute(locale, `lessons/${slug}/`),
    inLanguage: locale,
    educationalLevel: lesson.level,
    learningResourceType: "Interactive AI engineering lesson",
    timeRequired: `PT${lesson.minutes}M`,
    isAccessibleForFree: true,
  };
}

export function labSchema(locale: Locale, slug: string, lab: LabContent) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lab.name,
    description: lab.description,
    url: absolute(locale, `labs/${slug}/`),
    inLanguage: locale,
    educationalLevel: lab.level,
    learningResourceType: "Interactive AI engineering production lab",
    timeRequired: `PT${lab.minutes}M`,
    isAccessibleForFree: true,
  };
}

export function missionSchema(locale: Locale, relativePath: string, mission: MissionContent) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: mission.name,
    description: mission.description,
    url: absolute(locale, relativePath),
    inLanguage: locale,
    educationalLevel: mission.level,
    learningResourceType: mission.level.includes("Final Boss")
      ? "Interactive production launch challenge"
      : "Interactive production incident Mission",
    timeRequired: `PT${mission.minutes}M`,
    isAccessibleForFree: true,
  };
}

export function webPageSchema(locale: Locale, relativePath: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absolute(locale, relativePath),
    inLanguage: locale,
  };
}
