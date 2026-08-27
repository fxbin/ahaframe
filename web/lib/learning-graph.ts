import type { Locale } from "@/lib/content";

export { localizeLearningRoute } from "@/lib/learning-route";

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

export interface LearningSourceRef {
  url: string;
  kind: string;
  reviewAfter: string;
}

export interface LearningGraph {
  version: string;
  locale: Locale;
  stages: LearningStage[];
  models: MentalModel[];
  contentNodes: LearningContentNode[];
  sourceRefs: Record<string, LearningSourceRef>;
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
