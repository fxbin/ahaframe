import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/content";
import type {
  KnowledgeMap,
  KnowledgeMapBranch,
  KnowledgeMapConcept,
  KnowledgeMapDomain,
  KnowledgeMapMilestone,
  KnowledgeMapPath,
} from "@/lib/knowledge-map";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();
const INVENTORY_ROOT = path.join(CONTENT_ROOT, "ai-knowledge-inventory-v1.0");
const GUIDE_ROOT = path.join(CONTENT_ROOT, "guides");
const CORE_GUIDE_BUNDLE_COUNT = 24;
const CORE_GUIDE_COUNT = 120;
const CANONICAL_CONCEPT_COUNT = 145;

interface DomainSource { id: string; slug: string; order: number; }
interface DomainPresentation { title: string; description: string; }
interface BranchSource { id: string; domainId: string; parentBranchId: string | null; order: number; en: string; zh: string; enDescription: string; zhDescription: string; }
interface ConceptSource { id: string; kind: string; primaryBranchId: string; branchIds: string[]; en: string; zh: string; difficulty: string; maturity: string; versionSensitive: boolean; legacyIds: string[]; }
interface EdgeSource { id: string; fromConceptId: string; toConceptId: string; type: string; }
interface MilestoneSource { id: string; en: string; zh: string; conceptIds: string[]; contentNodeIds: string[]; required: boolean; }
interface PathSource { id: string; kind: string; slug: string; domainIds: string[]; branchIds: string[]; en: string; zh: string; enDescription: string; zhDescription: string; enGoal: string; zhGoal: string; enDeliverable: string; zhDeliverable: string; difficulty: string; lifecycle: string; milestones: MilestoneSource[]; }
interface InventoryFragment { version: string; branches?: BranchSource[]; concepts?: ConceptSource[]; edges?: EdgeSource[]; paths?: PathSource[]; }
interface ConciseCopy { summary: string; mentalModel: string; whyItMatters: string; }
interface ConcisePolicy { version: string; expectedConceptCount: number; genericByKind: Record<string, Record<Locale, ConciseCopy>>; overrides: Record<string, Partial<Record<Locale, ConciseCopy>>>; }
interface GuideIndexBundle { version: string; locale: Locale; wave: string; guides: Array<{ slug: string; conceptId: string }>; }

async function loadJson<T>(filename: string): Promise<T> { return JSON.parse(await readFile(path.join(CONTENT_ROOT, filename), "utf8")) as T; }

async function loadInventory(): Promise<{ branches: BranchSource[]; concepts: ConceptSource[]; edges: EdgeSource[]; paths: PathSource[] }> {
  const filenames = (await readdir(INVENTORY_ROOT)).filter((filename) => filename.endsWith(".json")).sort();
  const fragments = await Promise.all(filenames.map(async (filename) => JSON.parse(await readFile(path.join(INVENTORY_ROOT, filename), "utf8")) as InventoryFragment));
  const branches: BranchSource[] = []; const concepts: ConceptSource[] = []; const edges: EdgeSource[] = []; const paths: PathSource[] = [];
  for (const fragment of fragments) {
    if (fragment.version !== "1.0.0") throw new Error(`Knowledge Map inventory version mismatch: ${fragment.version}`);
    branches.push(...(fragment.branches ?? [])); concepts.push(...(fragment.concepts ?? [])); edges.push(...(fragment.edges ?? [])); paths.push(...(fragment.paths ?? []));
  }
  return { branches, concepts, edges, paths };
}

function expectedGuideWave(filename: string): "core-20" | "core-40" | "core-60" | "core-80" | "core-100" | "core-120" {
  const match = filename.match(/^core-(\d{2})\./); if (!match) throw new Error(`Invalid Core Guide filename: ${filename}`);
  const number = Number(match[1]);
  if (number <= 4) return "core-20"; if (number <= 8) return "core-40"; if (number <= 12) return "core-60"; if (number <= 16) return "core-80"; if (number <= 20) return "core-100"; if (number <= 24) return "core-120";
  throw new Error(`Unsupported Core Guide bundle number: ${filename}`);
}

async function loadGuideIndex(locale: Locale): Promise<Map<string, string>> {
  const filenames = (await readdir(GUIDE_ROOT)).filter((filename) => /^core-\d{2}\.(en|zh-CN)\.json$/.test(filename) && filename.endsWith(`.${locale}.json`)).sort();
  if (filenames.length !== CORE_GUIDE_BUNDLE_COUNT) throw new Error(`Knowledge Map expected ${CORE_GUIDE_BUNDLE_COUNT} Core Guide bundles for ${locale}; got ${filenames.length}.`);
  const index = new Map<string, string>();
  for (const filename of filenames) {
    const bundle = JSON.parse(await readFile(path.join(GUIDE_ROOT, filename), "utf8")) as GuideIndexBundle;
    if (bundle.version !== "1.0.0" || bundle.wave !== expectedGuideWave(filename) || bundle.locale !== locale) throw new Error(`Knowledge Map Guide index contract mismatch: ${filename}`);
    for (const guide of bundle.guides) { if (index.has(guide.conceptId)) throw new Error(`Duplicate Guide Concept binding: ${guide.conceptId}`); index.set(guide.conceptId, guide.slug); }
  }
  if (index.size !== CORE_GUIDE_COUNT) throw new Error(`Knowledge Map expected ${CORE_GUIDE_COUNT} published Core Guides; got ${index.size}.`);
  return index;
}

function resolveConciseCopy(policy: ConcisePolicy, concept: ConceptSource, locale: Locale, title: string): ConciseCopy {
  const source = policy.overrides[concept.id]?.[locale] ?? policy.genericByKind[concept.kind]?.[locale];
  if (!source) throw new Error(`Missing concise Concept copy policy for ${locale}/${concept.id}/${concept.kind}.`);
  return { summary: source.summary.replaceAll("{title}", title), mentalModel: source.mentalModel.replaceAll("{title}", title), whyItMatters: source.whyItMatters.replaceAll("{title}", title) };
}

export async function getKnowledgeMap(locale: Locale): Promise<KnowledgeMap> {
  const [seed, presentation, concisePolicy, inventory, guideIndex] = await Promise.all([
    loadJson<{ schemaVersion: string; domains: DomainSource[] }>("ai-knowledge-graph-v1.0.json"),
    loadJson<{ locale: Locale; domains: Record<string, DomainPresentation> }>(`ai-knowledge-graph-v1.0.${locale}.json`),
    loadJson<ConcisePolicy>("ai-knowledge-concise-v1.0.json"), loadInventory(), loadGuideIndex(locale),
  ]);
  if (seed.schemaVersion !== "1.0.0") throw new Error("Knowledge Map schema version mismatch.");
  if (presentation.locale !== locale) throw new Error(`Knowledge Map locale mismatch for ${locale}.`);
  if (concisePolicy.version !== "1.0.0" || concisePolicy.expectedConceptCount !== CANONICAL_CONCEPT_COUNT) throw new Error("Knowledge Map concise Concept policy version/count mismatch.");

  const isEnglish = locale === "en";
  const domains: KnowledgeMapDomain[] = seed.domains.slice().sort((a, b) => a.order - b.order).map((domain) => {
    const copy = presentation.domains[domain.id]; if (!copy) throw new Error(`Missing Knowledge Map domain copy for ${locale}/${domain.id}.`); return { ...domain, ...copy };
  });
  const branches: KnowledgeMapBranch[] = inventory.branches.map((branch) => ({ id: branch.id, domainId: branch.domainId, parentBranchId: branch.parentBranchId, order: branch.order, title: isEnglish ? branch.en : branch.zh, description: isEnglish ? branch.enDescription : branch.zhDescription }));

  const pathMembershipsByConcept = new Map<string, Array<{ id: string; slug: string; title: string }>>();
  for (const learningPath of inventory.paths) {
    const title = isEnglish ? learningPath.en : learningPath.zh;
    const seen = new Set<string>();
    for (const conceptId of learningPath.milestones.flatMap((milestone) => milestone.conceptIds)) {
      if (seen.has(conceptId)) continue; seen.add(conceptId);
      pathMembershipsByConcept.set(conceptId, [...(pathMembershipsByConcept.get(conceptId) ?? []), { id: learningPath.id, slug: learningPath.slug, title }]);
    }
  }

  const conceptBase: Array<Omit<KnowledgeMapConcept, "relatedConcepts">> = inventory.concepts.map((concept) => {
    const title = isEnglish ? concept.en : concept.zh; const copy = resolveConciseCopy(concisePolicy, concept, locale, title);
    return { id: concept.id, kind: concept.kind, primaryBranchId: concept.primaryBranchId, branchIds: concept.branchIds, title, ...copy, difficulty: concept.difficulty, maturity: concept.maturity, versionSensitive: concept.versionSensitive, legacyIds: concept.legacyIds, guideSlug: guideIndex.get(concept.id) ?? null, pathMemberships: (pathMembershipsByConcept.get(concept.id) ?? []).sort((a, b) => a.title.localeCompare(b.title)) };
  });
  if (conceptBase.length !== CANONICAL_CONCEPT_COUNT || new Set(conceptBase.map((item) => item.id)).size !== CANONICAL_CONCEPT_COUNT) throw new Error(`Knowledge Map requires exactly ${CANONICAL_CONCEPT_COUNT} unique canonical Concepts.`);

  const conceptById = new Map(conceptBase.map((concept) => [concept.id, concept])); const relatedByConcept = new Map<string, Array<{ id: string; relationship: string }>>();
  for (const edge of inventory.edges) {
    if (!conceptById.has(edge.fromConceptId) || !conceptById.has(edge.toConceptId)) throw new Error(`Knowledge Map relationship points to unknown Concept: ${edge.id}.`);
    relatedByConcept.set(edge.fromConceptId, [...(relatedByConcept.get(edge.fromConceptId) ?? []), { id: edge.toConceptId, relationship: edge.type }]);
    relatedByConcept.set(edge.toConceptId, [...(relatedByConcept.get(edge.toConceptId) ?? []), { id: edge.fromConceptId, relationship: edge.type }]);
  }
  const concepts: KnowledgeMapConcept[] = conceptBase.map((concept) => ({ ...concept, relatedConcepts: (relatedByConcept.get(concept.id) ?? []).map((relation) => {
    const related = conceptById.get(relation.id); if (!related) throw new Error(`Knowledge Map failed to resolve related Concept ${relation.id}.`); return { id: related.id, title: related.title, relationship: relation.relationship, guideSlug: related.guideSlug };
  }).sort((a, b) => a.title.localeCompare(b.title)) }));

  const paths: KnowledgeMapPath[] = inventory.paths.map((item) => ({ id: item.id, kind: item.kind, slug: item.slug, domainIds: item.domainIds, branchIds: item.branchIds, title: isEnglish ? item.en : item.zh, description: isEnglish ? item.enDescription : item.zhDescription, goal: isEnglish ? item.enGoal : item.zhGoal, deliverable: isEnglish ? item.enDeliverable : item.zhDeliverable, difficulty: item.difficulty, lifecycle: item.lifecycle, milestones: item.milestones.map((milestone): KnowledgeMapMilestone => ({ id: milestone.id, title: isEnglish ? milestone.en : milestone.zh, conceptIds: milestone.conceptIds, contentNodeIds: milestone.contentNodeIds, required: milestone.required })) }));

  if (domains.length !== 3 || branches.length < 35 || concepts.length !== CANONICAL_CONCEPT_COUNT || paths.length < 12) throw new Error(`Knowledge Map inventory is unexpectedly thin: ${domains.length} domains / ${branches.length} branches / ${concepts.length} concepts / ${paths.length} paths.`);
  return { version: "1.0.0", locale, domains, branches, concepts, paths };
}
