import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/content";
import type { CoreGuide, CoreGuideBundle, GuidePageData, GuideRelatedConcept } from "@/lib/guides";
import { getKnowledgeMap } from "@/lib/knowledge-map-server";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();
const GUIDE_ROOT = path.join(CONTENT_ROOT, "guides");
const INVENTORY_ROOT = path.join(CONTENT_ROOT, "ai-knowledge-inventory-v1.0");

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

export async function getCoreGuides(locale: Locale): Promise<CoreGuide[]> {
  const filenames = (await readdir(GUIDE_ROOT))
    .filter((filename) => /^core-\d{2}\.(en|zh-CN)\.json$/.test(filename) && filename.endsWith(`.${locale}.json`))
    .sort();
  if (filenames.length !== 4) throw new Error(`Core Guide bundle count mismatch for ${locale}: ${filenames.length}`);

  const guides: CoreGuide[] = [];
  for (const filename of filenames) {
    const bundle = JSON.parse(await readFile(path.join(GUIDE_ROOT, filename), "utf8")) as CoreGuideBundle;
    if (bundle.version !== "1.0.0" || bundle.wave !== "core-20") throw new Error(`Core Guide bundle version mismatch: ${filename}`);
    if (bundle.locale !== locale) throw new Error(`Core Guide locale mismatch: expected ${locale}, got ${bundle.locale}`);
    guides.push(...bundle.guides);
  }

  if (guides.length !== 20) throw new Error(`Core Guide count mismatch for ${locale}: ${guides.length}`);
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

export async function getGuidePageData(locale: Locale, slug: string): Promise<GuidePageData | null> {
  const [guides, map, edges] = await Promise.all([getCoreGuides(locale), getKnowledgeMap(locale), loadRelationshipEdges()]);
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return null;

  const conceptById = new Map(map.concepts.map((concept) => [concept.id, concept]));
  const concept = conceptById.get(guide.conceptId);
  if (!concept) throw new Error(`Guide points to unknown Concept: ${guide.slug} -> ${guide.conceptId}`);

  const guideByConcept = new Map(guides.map((item) => [item.conceptId, item.slug]));
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
      guideSlug: guideByConcept.get(other.id) ?? null,
    });
  }

  related.sort((a, b) => Number(Boolean(b.guideSlug)) - Number(Boolean(a.guideSlug)) || a.title.localeCompare(b.title));

  return {
    guide,
    concept: { id: concept.id, title: concept.title, kind: concept.kind, difficulty: concept.difficulty },
    relatedConcepts: related.slice(0, 8),
  };
}
