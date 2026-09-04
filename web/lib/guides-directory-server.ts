import type { Locale } from "@/lib/content";
import { getCoreGuides } from "@/lib/guides-server";
import type { GuideDirectoryData, GuideDirectoryItem } from "@/lib/guides-directory";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";

const PUBLISHED_GUIDE_COUNT = 80;

export async function getGuideDirectory(locale: Locale): Promise<GuideDirectoryData> {
  const [guides, map] = await Promise.all([getCoreGuides(locale), getKnowledgeMap(locale)]);
  const conceptById = new Map(map.concepts.map((concept) => [concept.id, concept]));
  const branchById = new Map(map.branches.map((branch) => [branch.id, branch]));
  const domainById = new Map(map.domains.map((domain) => [domain.id, domain]));

  const pathsByConcept = new Map<string, Array<{ id: string; slug: string; title: string }>>();
  for (const learningPath of map.paths) {
    const seen = new Set<string>();
    for (const conceptId of learningPath.milestones.flatMap((milestone) => milestone.conceptIds)) {
      if (seen.has(conceptId)) continue;
      seen.add(conceptId);
      const memberships = pathsByConcept.get(conceptId) ?? [];
      memberships.push({ id: learningPath.id, slug: learningPath.slug, title: learningPath.title });
      pathsByConcept.set(conceptId, memberships);
    }
  }

  const items: GuideDirectoryItem[] = guides.map((guide) => {
    const concept = conceptById.get(guide.conceptId);
    if (!concept) throw new Error(`Guide Directory found unknown Concept ${guide.conceptId}.`);
    const branch = branchById.get(concept.primaryBranchId);
    if (!branch) throw new Error(`Guide Directory found unknown primary Branch ${concept.primaryBranchId}.`);
    const domain = domainById.get(branch.domainId);
    if (!domain) throw new Error(`Guide Directory found unknown Domain ${branch.domainId}.`);
    const paths = (pathsByConcept.get(concept.id) ?? []).slice().sort((a, b) => a.title.localeCompare(b.title));

    return {
      slug: guide.slug,
      conceptId: concept.id,
      title: guide.title,
      summary: guide.summary,
      readingMinutes: guide.readingMinutes,
      difficulty: concept.difficulty,
      domainId: domain.id,
      domainTitle: domain.title,
      domainSlug: domain.slug,
      branchId: branch.id,
      branchTitle: branch.title,
      pathIds: paths.map((item) => item.id),
      paths,
      hasPractice: Boolean(guide.practice),
    };
  });

  if (items.length !== PUBLISHED_GUIDE_COUNT || new Set(items.map((item) => item.slug)).size !== PUBLISHED_GUIDE_COUNT) {
    throw new Error(`Guide Directory must contain exactly ${PUBLISHED_GUIDE_COUNT} unique published Guides.`);
  }

  const domainIds = new Set(items.map((item) => item.domainId));
  const branchIds = new Set(items.map((item) => item.branchId));
  const pathIds = new Set(items.flatMap((item) => item.pathIds));

  return {
    count: items.length,
    items,
    domains: map.domains.filter((domain) => domainIds.has(domain.id)).map(({ id, title }) => ({ id, title })),
    branches: map.branches
      .filter((branch) => branchIds.has(branch.id))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(({ id, title }) => ({ id, title })),
    paths: map.paths
      .filter((learningPath) => pathIds.has(learningPath.id))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(({ id, slug, title }) => ({ id, slug, title })),
    difficulties: Array.from(new Set(items.map((item) => item.difficulty))).sort(),
  };
}
