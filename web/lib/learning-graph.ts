import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/content";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

export const LEARNING_NODE_TYPES = [
  "GUIDE",
  "PLAYGROUND",
  "LAB",
  "MISSION",
  "INCIDENT",
  "DRILL",
  "REVIEW",
  "BUILD",
  "BOSS",
  "REFERENCE",
] as const;

export type LearningNodeType = (typeof LEARNING_NODE_TYPES)[number];
export type LearningEffortBand = "SHORT" | "MEDIUM" | "DEEP";
export type LearningProgressState = "UNSEEN" | "SEEN" | "PRACTICED" | "TRANSFERRED" | "REVIEW_DUE";

export interface LearningStageDefinition {
  id: string;
  order: number;
  slug: string;
  labelKey: string;
  descriptionKey: string;
  modelIds: string[];
}

export interface MentalModelDefinition {
  id: string;
  stageId: string;
  titleKey: string;
  primaryFormat: LearningNodeType;
  prerequisiteModelIds: string[];
  versionSensitive: boolean;
  sourceRefs?: string[];
}

export interface LearningContentNodeDefinition {
  id: string;
  route: string;
  format: LearningNodeType;
  stageId: string;
  titleKey: string;
  promiseKey: string;
  modelIds: string[];
  prerequisiteContentIds: string[];
  recommendedBackfillIds?: string[];
  nextContentIds: string[];
  effortBand: LearningEffortBand;
  reviewEligible: boolean;
  analyticsId: string;
  provenance: string[];
}

interface LearningGraphSource {
  version: string;
  status: string;
  locales: Locale[];
  nodeTypes: LearningNodeType[];
  effortBands: LearningEffortBand[];
  stages: LearningStageDefinition[];
  models: MentalModelDefinition[];
  contentNodes: LearningContentNodeDefinition[];
  sourceRefs: Record<string, {
    url: string;
    kind: string;
    reviewAfter: string;
  }>;
}

interface LearningGraphLabels {
  locale: Locale;
  stages: Record<string, { title: string; description: string }>;
  models: Record<string, { title: string }>;
  content: Record<string, { title: string; promise: string }>;
}

export interface LearningStage extends LearningStageDefinition {
  title: string;
  description: string;
}

export interface MentalModel extends MentalModelDefinition {
  title: string;
}

export interface LearningContentNode extends LearningContentNodeDefinition {
  title: string;
  promise: string;
}

export interface LearningGraph {
  version: string;
  locale: Locale;
  stages: LearningStage[];
  models: MentalModel[];
  contentNodes: LearningContentNode[];
  sourceRefs: LearningGraphSource["sourceRefs"];
}

export interface LearningUxContent {
  locale: Locale;
  meta: { title: string; description: string };
  page: {
    kicker: string;
    title: string;
    intro: string;
    nextLabel: string;
    nextEmpty: string;
    nextReasonNew: string;
    nextReasonContinue: string;
    pathTitle: string;
    pathCopy: string;
    mapTitle: string;
    mapCopy: string;
    available: string;
    models: string;
    open: string;
    continue: string;
    reset: string;
    resetConfirm: string;
    anonymousNote: string;
    specialist: string;
    prerequisite: string;
    backfillNone: string;
    returnToMap: string;
    transfer: string;
    transferAction: string;
    transferDone: string;
    debrief: string;
  };
  states: Record<LearningProgressState, string>;
  content: Record<string, { debrief: string; transfer: string }>;
}

async function loadJson<T>(filename: string): Promise<T> {
  const source = await readFile(path.join(CONTENT_ROOT, filename), "utf8");
  return JSON.parse(source) as T;
}

export async function getLearningGraph(locale: Locale): Promise<LearningGraph> {
  const [graph, labels] = await Promise.all([
    loadJson<LearningGraphSource>("learning-graph-v0.9.json"),
    loadJson<LearningGraphLabels>(`learning-graph.${locale}.json`),
  ]);

  if (graph.status !== "active") {
    throw new Error("The v0.9 learning graph must be active before it can drive product UX.");
  }
  if (!graph.locales.includes(locale) || labels.locale !== locale) {
    throw new Error(`Learning graph locale mismatch for ${locale}.`);
  }

  const stages = graph.stages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const label = labels.stages[stage.id];
      if (!label) throw new Error(`Missing ${locale} stage label for ${stage.id}.`);
      return { ...stage, ...label };
    });

  const models = graph.models.map((model) => {
    const label = labels.models[model.id];
    if (!label) throw new Error(`Missing ${locale} model label for ${model.id}.`);
    return { ...model, ...label };
  });

  const contentNodes = graph.contentNodes.map((node) => {
    const label = labels.content[node.id];
    if (!label) throw new Error(`Missing ${locale} content label for ${node.id}.`);
    return { ...node, ...label };
  });

  return {
    version: graph.version,
    locale,
    stages,
    models,
    contentNodes,
    sourceRefs: graph.sourceRefs,
  };
}

export async function getLearningUxContent(locale: Locale): Promise<LearningUxContent> {
  const content = await loadJson<LearningUxContent>(`learning-ux.${locale}.json`);
  if (content.locale !== locale) throw new Error(`Learning UX locale mismatch for ${locale}.`);
  return content;
}

export function localizeLearningRoute(route: string, locale: Locale): string {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  return `/${segment}${route}`;
}
