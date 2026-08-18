import { segmentForLocale, type LessonContent, type LabContent, type Locale } from "@/lib/content";
import type { CampaignContract, CampaignDiscoveryContent } from "@/lib/campaign";
import type { MissionContent } from "@/lib/mission";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ahaframe.com";
const UPDATED = process.env.AHAFRAME_UPDATED || "2026-08-13";

type LearningEntity = Pick<LessonContent | LabContent | MissionContent, "name" | "description" | "level" | "minutes">;

function absolute(locale: Locale, relativePath = ""): string {
  return `${BASE_URL}/${segmentForLocale(locale)}/${relativePath.replace(/^\/+/, "")}`;
}

function breadcrumbSchema(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item,
    })),
  };
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

export function lessonSchema(locale: Locale, slug: string, lesson: LessonContent, lessonsLabel: string) {
  const root = absolute(locale);
  const url = absolute(locale, `lessons/${slug}/`);
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: lesson.name,
          description: lesson.description,
          inLanguage: locale,
          dateModified: UPDATED,
          mainEntity: { "@id": `${url}#learning-resource` },
        },
        {
          "@type": "LearningResource",
          "@id": `${url}#learning-resource`,
          name: lesson.name,
          description: lesson.description,
          url,
          inLanguage: locale,
          educationalLevel: lesson.level,
          learningResourceType: "Interactive resource",
          timeRequired: `PT${lesson.minutes}M`,
          isAccessibleForFree: true,
          publisher: { "@id": `${BASE_URL}/#organization` },
        },
      ],
    },
    breadcrumbSchema([
      ["AhaFrame", root],
      [lessonsLabel, `${root}#lessons`],
      [lesson.name, url],
    ]),
  ];
}

export function productionLabSchemas(
  locale: Locale,
  slug: string,
  entity: LearningEntity,
  productionLabsLabel: string,
) {
  const root = absolute(locale);
  const url = absolute(locale, `labs/${slug}/`);
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: entity.name,
          description: entity.description,
          inLanguage: locale,
          dateModified: UPDATED,
          mainEntity: { "@id": `${url}#learning-resource` },
        },
        {
          "@type": "LearningResource",
          "@id": `${url}#learning-resource`,
          name: entity.name,
          description: entity.description,
          url,
          inLanguage: locale,
          educationalLevel: entity.level,
          learningResourceType: "Interactive simulation",
          timeRequired: `PT${entity.minutes}M`,
          isAccessibleForFree: true,
          publisher: { "@id": `${BASE_URL}/#organization` },
        },
      ],
    },
    breadcrumbSchema([
      ["AhaFrame", root],
      [productionLabsLabel, `${root}#production-labs`],
      [entity.name, url],
    ]),
  ];
}

export function finalBossSchemas(locale: Locale, mission: MissionContent) {
  const root = absolute(locale);
  const url = absolute(locale, "build/reliable-support-agent/");
  const finalBossLabel = locale === "en" ? "Final Boss" : "最终挑战";
  return [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: mission.name,
      description: mission.description,
      url,
      inLanguage: locale,
      educationalLevel: mission.level,
      learningResourceType: "Interactive production launch challenge",
      timeRequired: `PT${mission.minutes}M`,
      isAccessibleForFree: true,
    },
    breadcrumbSchema([
      ["AhaFrame", root],
      [finalBossLabel, url],
      [mission.name, url],
    ]),
  ];
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
