import type { Locale } from "@/lib/content";
import { getFoundationContent, getLabContent, getLocaleSource } from "@/lib/content";
import type { KnowledgeMapPath } from "@/lib/knowledge-map";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getProductionExperience } from "@/lib/content-access-server";
import { getMissionContent } from "@/lib/mission";

const FEATURED_PATH_SLUGS = [
  "agent-engineering",
  "vibe-coding",
  "rag-knowledge-systems",
  "write-book-ai",
] as const;

const PRODUCTION_IDS = [
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
] as const;

export interface CoursePractice {
  id: string;
  nodeType: "PLAYGROUND" | "LAB" | "MISSION" | "INCIDENT" | "BUILD";
  route: string;
  title: string;
  description: string;
}

export interface CourseCatalogItem {
  path: KnowledgeMapPath;
  practices: CoursePractice[];
}

function findRoute(routes: string[], contentId: string): string | null {
  const suffix = `/${contentId}/`;
  return routes.find((route) => `/${route}`.endsWith(suffix)) ?? null;
}

async function resolvePracticeCopy(locale: Locale, contentId: string): Promise<{ title: string; description: string }> {
  const mission = await getMissionContent(locale, contentId);
  if (mission) return { title: mission.name, description: mission.description };

  const lab = await getLabContent(locale, contentId);
  if (lab) return { title: lab.name, description: lab.description };

  const foundation = await getFoundationContent(locale);
  const lesson = foundation.lessons[contentId];
  if (lesson) return { title: lesson.name, description: lesson.description };

  return { title: contentId, description: "" };
}

export async function getCourseCatalog(locale: Locale): Promise<CourseCatalogItem[]> {
  const [knowledgeMap, localeSource] = await Promise.all([getKnowledgeMap(locale), getLocaleSource(locale)]);
  const production = (
    await Promise.all(PRODUCTION_IDS.map((contentId) => getProductionExperience(contentId)))
  ).filter((item): item is NonNullable<typeof item> => Boolean(item && item.status === "EXISTING"));

  const copyById = new Map(
    await Promise.all(
      production.map(async (experience) => [experience.id, await resolvePracticeCopy(locale, experience.id)] as const),
    ),
  );

  return knowledgeMap.paths.map((path) => {
    const practices = production
      .filter((experience) => experience.pathIds.includes(path.id))
      .map((experience) => {
        const copy = copyById.get(experience.id) ?? { title: experience.id, description: "" };
        return {
          id: experience.id,
          nodeType: experience.nodeType,
          route: findRoute(localeSource.availableRoutes, experience.id) ?? "",
          title: copy.title,
          description: copy.description,
        };
      })
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
