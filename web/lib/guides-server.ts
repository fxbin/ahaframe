import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/content";
import type {
  CoreGuide,
  CoreGuideBundle,
  CoreGuideWave,
  GuideActivePathContext,
  GuidePageData,
  GuidePathMembership,
  GuidePracticeReturnTarget,
  GuideRelatedConcept,
  GuideSequenceNeighbor,
} from "@/lib/guides";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();
const GUIDE_ROOT = path.join(CONTENT_ROOT, "guides");
const INVENTORY_ROOT = path.join(CONTENT_ROOT, "ai-knowledge-inventory-v1.0");
const CORE_GUIDE_BUNDLE_COUNT = 16;
const CORE_GUIDE_COUNT = 80;

interface EdgeSource {
  id: string;
  fromConceptId: string;
  toConceptId: string;
  type: string;
}

interface RelationshipFragment {
  version: string;
  edges?: EdgeSource[];
}

function expectedWave(filename: string): CoreGuideWave {
  const match = filename.match(/^core-(\d{2})\./);
  if (!match) throw new Error(`Invalid Core Guide filename: ${filename}`);
  const number = Number(match[1]);
  if (number <= 4) return "core-20";
  if (number <= 8) return "core-40";
  if (number <= 12) return "core-60";
  if (number <= 16) return "core-80";
  throw new Error(`Unsupported Core Guide bundle number: ${filename}`);
}

export async function getCoreGuides(locale: Locale): Promise<CoreGuide[]> {
  const filenames = (await readdir(GUIDE_ROOT))
    .filter((filename) => /^core-\d{2}\.(en|zh-CN)\.json$/.test(filename) && filename.endsWith(`.${locale}.json`))
    .sort();
  if (filenames.length !== CORE_GUIDE_BUNDLE_COUNT) {
    throw new Error(`Core Guide bundle count mismatch for ${locale}: ${filenames.length}`);
  }

  const guides: CoreGuide[] = [];
  for (const filename of filenames) {
    const bundle = JSON.parse(await readFile(path.join(GUIDE_ROOT, filename), "utf8")) as CoreGuideBundle;
    if (bundle.version !== "1.0.0" || bundle.wave !== expectedWave(filename)) {
      throw new Error(`Core Guide bundle version/wave mismatch: ${filename}`);
    }
    if (bundle.locale !== locale) throw new Error(`Core Guide locale mismatch: expected ${locale}, got ${bundle.locale}`);
    guides.push(...bundle.guides);
  }

  if (guides.length !== CORE_GUIDE_COUNT) throw new Error(`Core Guide count mismatch for ${locale}: ${guides.length}`);
  if (new Set(guides.map((guide) => guide.slug)).size !== guides.length) throw new Error(`Duplicate Core Guide slug in ${locale}.`);
  if (new Set(guides.map((guide) => guide.conceptId)).size !== guides.length) throw new Error(`Duplicate Core Guide Concept binding in ${locale}.`);
  return guides;
}

export async function getGuideIndex(locale: Locale): Promise<Record<string, string>> {
  const guides = await getCoreGuides(locale);
  return Object.fromEntries(guides.map((guide) => [guide.conceptId, guide.slug]));
}

async function loadRelationshipEdges(): Promise<EdgeSource[]> {
  const filenames = (await readdir(INVENTORY_ROOT))
    .filter((filename) => filename.startsWith("relationships-") && filename.endsWith(".json"))
    .sort();
  const edges: EdgeSource[] = [];
  for (const filename of filenames) {
    const fragment = JSON.parse(await readFile(path.join(INVENTORY_ROOT, filename), "utf8")) as RelationshipFragment;
    if (fragment.version !== "1.0.0") throw new Error(`Knowledge relationship version mismatch: ${filename}`);
    edges.push(...(fragment.edges ?? []));
  }
  return edges;
}

function pathMembershipsForConcept(
  conceptId: string,
  paths: Awaited<ReturnType<typeof getKnowledgeMap>>["paths"],
): GuidePathMembership[] {
  const memberships: GuidePathMembership[] = [];
  for (const learningPath of paths) {
    const milestone = learningPath.milestones.find((item) => item.conceptIds.includes(conceptId));
    if (!milestone) continue;
    memberships.push({
      id: learningPath.id,
      slug: learningPath.slug,
      title: learningPath.title,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
    });
  }
  return memberships;
}

function publishedPathSequence(pathConceptIds: string[], guideByConcept: Map<string, CoreGuide>): CoreGuide[] {
  const seen = new Set<string>();
  const sequence: CoreGuide[] = [];
  for (const conceptId of pathConceptIds) {
    if (seen.has(conceptId)) continue;
    seen.add(conceptId);
    const published = guideByConcept.get(conceptId);
    if (published) sequence.push(published);
  }
  return sequence;
}

function neighbor(guide: CoreGuide | undefined): GuideSequenceNeighbor | null {
  return guide ? { conceptId: guide.conceptId, slug: guide.slug, title: guide.title } : null;
}

function activePathContext(
  guide: CoreGuide,
  requestedPathSlug: string | null | undefined,
  memberships: GuidePathMembership[],
  paths: Awaited<ReturnType<typeof getKnowledgeMap>>["paths"],
  guideByConcept: Map<string, CoreGuide>,
): GuideActivePathContext | null {
  if (!requestedPathSlug) return null;
  const membership = memberships.find((item) => item.slug === requestedPathSlug);
  if (!membership) return null;
  const learningPath = paths.find((item) => item.id === membership.id);
  if (!learningPath) return null;

  const sequence = publishedPathSequence(
    learningPath.milestones.flatMap((milestone) => milestone.conceptIds),
    guideByConcept,
  );
  const index = sequence.findIndex((item) => item.conceptId === guide.conceptId);
  if (index < 0) return null;

  return {
    ...membership,
    previous: neighbor(sequence[index - 1]),
    next: neighbor(sequence[index + 1]),
  };
}

export async function getGuidePracticeReturnTargets(locale: Locale): Promise<GuidePracticeReturnTarget[]> {
  const [guides, map] = await Promise.all([getCoreGuides(locale), getKnowledgeMap(locale)]);
  const guideByConcept = new Map(guides.map((item) => [item.conceptId, item]));

  return guides
    .filter((guide) => Boolean(guide.practice))
    .map((guide) => {
      const memberships = pathMembershipsForConcept(guide.conceptId, map.paths);
      return {
        slug: guide.slug,
        title: guide.title,
        paths: memberships.map((membership) => {
          const context = activePathContext(guide, membership.slug, memberships, map.paths, guideByConcept);
          if (!context) throw new Error(`Guide practice context failed to resolve: ${guide.slug} -> ${membership.slug}`);
          return { slug: membership.slug, title: membership.title, next: context.next };
        }),
      };
    });
}

export async function getGuidePageData(
  locale: Locale,
  slug: string,
  requestedPathSlug?: string | null,
): Promise<GuidePageData | null> {
  const [guides, map, edges] = await Promise.all([getCoreGuides(locale), getKnowledgeMap(locale), loadRelationshipEdges()]);
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return null;

  const conceptById = new Map(map.concepts.map((concept) => [concept.id, concept]));
  const concept = conceptById.get(guide.conceptId);
  if (!concept) throw new Error(`Guide points to unknown Concept: ${guide.slug} -> ${guide.conceptId}`);

  const guideByConcept = new Map(guides.map((item) => [item.conceptId, item]));
  const related: GuideRelatedConcept[] = [];
  const seen = new Set<string>();
  for (const edge of edges) {
    let otherId: string | null = null;
    if (edge.fromConceptId === guide.conceptId) otherId = edge.toConceptId;
    if (edge.toConceptId === guide.conceptId) otherId = edge.fromConceptId;
    if (!otherId || seen.has(otherId)) continue;
    const other = conceptById.get(otherId);
    if (!other) continue;
    seen.add(otherId);
    related.push({
      id: other.id,
      title: other.title,
      relationship: edge.type,
      guideSlug: guideByConcept.get(other.id)?.slug ?? null,
    });
  }

  related.sort((a, b) => Number(Boolean(b.guideSlug)) - Number(Boolean(a.guideSlug)) || a.title.localeCompare(b.title));
  const pathMemberships = pathMembershipsForConcept(guide.conceptId, map.paths);

  return {
    guide,
    concept: { id: concept.id, title: concept.title, kind: concept.kind, difficulty: concept.difficulty },
    relatedConcepts: related.slice(0, 8),
    pathMemberships,
    activePath: activePathContext(guide, requestedPathSlug, pathMemberships, map.paths, guideByConcept),
  };
}
