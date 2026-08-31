import type { Locale } from "@/lib/content";
import { getLocaleSource } from "@/lib/content";
import type { KnowledgeMapPath } from "@/lib/knowledge-map";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getProductionExperience } from "@/lib/content-access-server";

const FEATURED_PATH_SLUGS = [
  "agent-engineering",
  "vibe-coding",
  "rag-knowledge-systems",
  "write-book-ai",
] as const;

export interface CoursePractice {
  id: string;
  nodeType: "PLAYGROUND" | "LAB" | "MISSION" | "INCIDENT" | "BUILD";
  route: string;
}

export interface CourseCatalogItem {
  path: KnowledgeMapPath;
  practices: CoursePractice[];
}

function findRoute(routes: string[], contentId: string): string | null {
  const suffix = `/${contentId}/`;
  return routes.find((route) => `/${route}`.endsWith(suffix)) ?? null;
}

export async function getCourseCatalog(locale: Locale): Promise<CourseCatalogItem[]> {
  const [knowledgeMap, localeSource] = await Promise.all([getKnowledgeMap(locale), getLocaleSource(locale)]);
  const candidateContentIds = new Set<string>();
  for (const path of knowledgeMap.paths) {
    for (const milestone of path.milestones) {
      for (const contentId of milestone.contentNodeIds) candidateContentIds.add(contentId);
    }
  }

  // Production Experiences are the authoritative shipped practice layer. The
  // canonical graph still owns course/path identity; this read model only joins
  // shipped routes back onto those paths for a learner-friendly catalog.
  const productionIds = [
    "token-playground",
    "ai-code-review-mission",
    "rag-failure",
    "agent-reliability",
    "research-evidence-mission",
    "data-analysis-verification-lab",
    "structured-output-contract-lab",
    "mcp-capability-boundary-mission",
    "long-running-agent-recovery-mission",
    "write-book-with-ai-build",
    "knowledge-base-build",
    "customer-support-build",
    "course-knowledge-product-build",
    "multi-agent-coordination-incident",
    "production-release-gate-build",
    "model-adaptation-decision-lab",
    "solo-business-operating-system-build",
  ];

  const production = (
    await Promise.all(productionIds.map((contentId) => getProductionExperience(contentId)))
  ).filter((item): item is NonNullable<typeof item> => Boolean(item && item.status === "EXISTING"));

  return knowledgeMap.paths.map((path) => {
    const practices = production
      .filter((experience) => experience.pathIds.includes(path.id))
      .map((experience) => ({
        id: experience.id,
        nodeType: experience.nodeType,
        route: findRoute(localeSource.availableRoutes, experience.id) ?? "",
      }))
      .filter((practice) => Boolean(practice.route));

    return { path, practices };
  });
}

export function featuredCourses(catalog: CourseCatalogItem[]): CourseCatalogItem[] {
  const bySlug = new Map(catalog.map((item) => [item.path.slug, item]));
  return FEATURED_PATH_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (item): item is CourseCatalogItem => Boolean(item),
  );
}
