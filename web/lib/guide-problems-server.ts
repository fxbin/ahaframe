import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/content";
import { getFoundationContent, getLabContent, getLocaleSource } from "@/lib/content";
import type { GuideProblemBundle, GuideProblemDiscoveryData } from "@/lib/guide-problems";
import { getCoreGuides } from "@/lib/guides-server";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getMissionContent } from "@/lib/mission";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

const PROBLEM_BUNDLE_COUNT = 6;

interface GuideProblemSourceItem {
  id: string;
  problem: string;
  explanation: string;
  guideConceptIds: string[];
  practiceId: string;
  pathId: string;
}

interface GuideProblemSource {
  version: "1.0.0";
  locale: Locale;
  problems: GuideProblemSourceItem[];
}

async function loadSource(locale: Locale): Promise<GuideProblemSource> {
  const source = JSON.parse(
    await readFile(path.join(CONTENT_ROOT, `guide-problems.${locale}.json`), "utf8"),
  ) as GuideProblemSource;
  if (source.version !== "1.0.0" || source.locale !== locale) {
    throw new Error(`Guide problem discovery source contract mismatch for ${locale}.`);
  }
  if (source.problems.length !== PROBLEM_BUNDLE_COUNT) {
    throw new Error(`Guide problem discovery requires exactly ${PROBLEM_BUNDLE_COUNT} bundles for ${locale}.`);
  }
  if (new Set(source.problems.map((item) => item.id)).size !== source.problems.length) {
    throw new Error(`Guide problem discovery contains duplicate problem IDs for ${locale}.`);
  }
  return source;
}

async function loadSourcesWithParity(locale: Locale): Promise<GuideProblemSource> {
  const [en, zh] = await Promise.all([loadSource("en"), loadSource("zh-CN")]);
  const enIds = en.problems.map((item) => item.id);
  const zhIds = zh.problems.map((item) => item.id);
  if (JSON.stringify(enIds) !== JSON.stringify(zhIds)) {
    throw new Error("Guide problem discovery EN/zh-CN bundle IDs are out of parity.");
  }
  return locale === "zh-CN" ? zh : en;
}

function routeForPractice(routes: string[], practiceId: string): string | null {
  const suffix = `/${practiceId}/`;
  const route = routes.find((candidate) => `/${candidate}`.endsWith(suffix)) ?? null;
  if (!route || !/^(lessons|labs|build)\//.test(route)) return null;
  return route;
}

async function practiceTitle(locale: Locale, practiceId: string): Promise<string | null> {
  const mission = await getMissionContent(locale, practiceId);
  if (mission) return mission.name;
  const lab = await getLabContent(locale, practiceId);
  if (lab) return lab.name;
  const foundation = await getFoundationContent(locale);
  return foundation.lessons[practiceId]?.name ?? null;
}

export async function getGuideProblemDiscovery(locale: Locale): Promise<GuideProblemDiscoveryData> {
  const [source, guides, map, localeSource] = await Promise.all([
    loadSourcesWithParity(locale),
    getCoreGuides(locale),
    getKnowledgeMap(locale),
    getLocaleSource(locale),
  ]);
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  const guideByConceptId = new Map(guides.map((guide) => [guide.conceptId, guide]));
  const pathById = new Map(map.paths.map((learningPath) => [learningPath.id, learningPath]));

  const bundles: GuideProblemBundle[] = [];
  for (const item of source.problems) {
    if (item.guideConceptIds.length < 2 || item.guideConceptIds.length > 4) {
      throw new Error(`Problem bundle ${item.id} must reference 2–4 mental models.`);
    }
    if (new Set(item.guideConceptIds).size !== item.guideConceptIds.length) {
      throw new Error(`Problem bundle ${item.id} contains duplicate Guide Concept references.`);
    }

    const problemGuides = item.guideConceptIds.map((conceptId) => {
      const guide = guideByConceptId.get(conceptId);
      if (!guide) throw new Error(`Problem bundle ${item.id} references unpublished Guide Concept ${conceptId}.`);
      return {
        conceptId,
        slug: guide.slug,
        title: guide.title,
        readingMinutes: guide.readingMinutes,
      };
    });

    const practiceRoute = routeForPractice(localeSource.availableRoutes, item.practiceId);
    if (!practiceRoute) {
      throw new Error(`Problem bundle ${item.id} references non-public Practice ${item.practiceId}.`);
    }
    const resolvedPracticeTitle = await practiceTitle(locale, item.practiceId);
    if (!resolvedPracticeTitle) {
      throw new Error(`Problem bundle ${item.id} references Practice without localized content: ${item.practiceId}.`);
    }

    const learningPath = pathById.get(item.pathId);
    if (!learningPath) throw new Error(`Problem bundle ${item.id} references unknown Path ${item.pathId}.`);

    bundles.push({
      id: item.id,
      problem: item.problem,
      explanation: item.explanation,
      guides: problemGuides,
      practice: {
        id: item.practiceId,
        title: resolvedPracticeTitle,
        route: `/${segment}/${practiceRoute}`,
      },
      course: {
        id: learningPath.id,
        slug: learningPath.slug,
        title: learningPath.title,
        route: `/${segment}/courses/${learningPath.slug}/`,
      },
    });
  }

  return { bundles };
}
