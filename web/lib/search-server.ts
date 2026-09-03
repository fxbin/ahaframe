import type { Locale } from "@/lib/content";
import { getFoundationContent, getLabContent, getLocaleSource } from "@/lib/content";
import { getProductionExperiences } from "@/lib/content-access-server";
import { getCoreGuides } from "@/lib/guides-server";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";
import { getMissionContent } from "@/lib/mission";
import type { SearchDocument } from "@/lib/search";

function segmentFor(locale: Locale): string {
  return locale === "zh-CN" ? "zh-cn" : "en";
}

function routeForContent(routes: string[], contentId: string): string | null {
  const suffix = `/${contentId}/`;
  return routes.find((route) => `/${route}`.endsWith(suffix)) ?? null;
}

async function practiceCopy(locale: Locale, contentId: string): Promise<{ title: string; summary: string; body: string }> {
  const mission = await getMissionContent(locale, contentId);
  if (mission) {
    return {
      title: mission.name,
      summary: mission.description,
      body: [mission.hero, mission.quick, mission.brief?.body, mission.brief?.objective, mission.brief?.stakes, mission.debrief?.body, ...(mission.debrief?.points ?? [])].filter(Boolean).join(" "),
    };
  }

  const lab = await getLabContent(locale, contentId);
  if (lab) {
    return {
      title: lab.name,
      summary: lab.description,
      body: [lab.quick, lab.hero, ...(lab.takeaways ?? []).flatMap(([label, value]) => [label, value])].filter(Boolean).join(" "),
    };
  }

  const foundation = await getFoundationContent(locale);
  const lesson = foundation.lessons[contentId];
  if (lesson) {
    return { title: lesson.name, summary: lesson.description, body: lesson.quick };
  }

  return { title: contentId, summary: "", body: "" };
}

export async function getSearchDocuments(locale: Locale): Promise<SearchDocument[]> {
  const [guides, map, source, production] = await Promise.all([
    getCoreGuides(locale),
    getKnowledgeMap(locale),
    getLocaleSource(locale),
    getProductionExperiences(),
  ]);
  const segment = segmentFor(locale);
  const branchById = new Map(map.branches.map((branch) => [branch.id, branch]));
  const domainById = new Map(map.domains.map((domain) => [domain.id, domain]));
  const pathById = new Map(map.paths.map((path) => [path.id, path]));
  const conceptById = new Map(map.concepts.map((concept) => [concept.id, concept]));
  const pathTitlesByConcept = new Map<string, string[]>();

  for (const path of map.paths) {
    for (const conceptId of path.milestones.flatMap((milestone) => milestone.conceptIds)) {
      const current = pathTitlesByConcept.get(conceptId) ?? [];
      if (!current.includes(path.title)) current.push(path.title);
      pathTitlesByConcept.set(conceptId, current);
    }
  }

  const guideDocuments: SearchDocument[] = guides.map((guide) => {
    const concept = conceptById.get(guide.conceptId);
    if (!concept) throw new Error(`Search Guide points to unknown Concept: ${guide.slug} -> ${guide.conceptId}`);
    const branch = branchById.get(concept.primaryBranchId);
    const domain = branch ? domainById.get(branch.domainId) : undefined;
    return {
      id: `guide:${guide.slug}`,
      type: "guide",
      title: guide.title,
      summary: guide.summary,
      route: `/${segment}/guides/${guide.slug}/`,
      slug: guide.slug,
      aliases: [concept.id, ...concept.legacyIds],
      body: [guide.mentalModel, guide.whyItMatters, ...guide.sections.flatMap((section) => [section.title, section.body]), ...guide.failureModes, ...guide.heuristics, ...guide.takeaways].join(" "),
      metadata: [concept.kind, concept.difficulty, branch?.title, domain?.title, ...(pathTitlesByConcept.get(concept.id) ?? [])].filter(Boolean).join(" "),
      context: [branch?.title, `${guide.readingMinutes} min`].filter(Boolean).join(" · "),
    };
  });

  const courseDocuments: SearchDocument[] = map.paths.map((path) => ({
    id: `course:${path.id}`,
    type: "course",
    title: path.title,
    summary: path.description,
    route: `/${segment}/courses/${path.slug}/`,
    slug: path.slug,
    aliases: [path.id],
    body: [path.goal, path.deliverable, ...path.milestones.flatMap((milestone) => [milestone.title, ...milestone.conceptIds.map((id) => conceptById.get(id)?.title ?? id)])].join(" "),
    metadata: [path.kind, path.difficulty, ...path.domainIds.map((id) => domainById.get(id)?.title ?? id), ...path.branchIds.map((id) => branchById.get(id)?.title ?? id)].join(" "),
    context: path.difficulty,
  }));

  const conceptDocuments: SearchDocument[] = map.concepts.map((concept) => {
    const branch = branchById.get(concept.primaryBranchId);
    const domain = branch ? domainById.get(branch.domainId) : undefined;
    return {
      id: `concept:${concept.id}`,
      type: "concept",
      title: concept.title,
      summary: [branch?.description, domain?.description].filter(Boolean).join(" "),
      route: concept.guideSlug ? `/${segment}/guides/${concept.guideSlug}/` : `/${segment}/learning/`,
      slug: concept.id,
      aliases: concept.legacyIds,
      body: "",
      metadata: [concept.kind, concept.difficulty, branch?.title, domain?.title, ...(pathTitlesByConcept.get(concept.id) ?? [])].filter(Boolean).join(" "),
      context: [branch?.title, concept.guideSlug ? (locale === "zh-CN" ? "已有 Guide" : "Guide available") : (locale === "zh-CN" ? "知识地图" : "Knowledge Map")].filter(Boolean).join(" · "),
    };
  });

  const practiceDocuments: SearchDocument[] = [];
  for (const experience of production) {
    const route = routeForContent(source.availableRoutes, experience.id);
    if (!route) throw new Error(`Published Practice is missing a public route: ${experience.id}`);
    const copy = await practiceCopy(locale, experience.id);
    practiceDocuments.push({
      id: `practice:${experience.id}`,
      type: "practice",
      title: copy.title,
      summary: copy.summary,
      route: `/${segment}/${route}`,
      slug: experience.id,
      aliases: [],
      body: copy.body,
      metadata: [experience.nodeType, ...experience.pathIds.map((id) => pathById.get(id)?.title ?? id), ...experience.conceptIds.map((id) => conceptById.get(id)?.title ?? id)].join(" "),
      context: experience.nodeType,
    });
  }

  if (guideDocuments.length !== 60) throw new Error(`Unified search requires 60 published Guides, got ${guideDocuments.length}.`);
  if (courseDocuments.length !== 15) throw new Error(`Unified search requires 15 canonical Courses, got ${courseDocuments.length}.`);
  if (conceptDocuments.length !== 145) throw new Error(`Unified search requires 145 canonical Concepts, got ${conceptDocuments.length}.`);

  return [...guideDocuments, ...courseDocuments, ...practiceDocuments, ...conceptDocuments];
}
