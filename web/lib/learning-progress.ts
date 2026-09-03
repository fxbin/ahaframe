import type { LearningContentNode, LearningGraph, LearningProgressState } from "@/lib/learning-graph";

export const LEARNING_PROGRESS_KEY = "ahaframe_learning_progress_v1";
export const LEARNING_STATE_EVENT = "ahaframe:learning-state";
export const LEARNING_PROGRESS_EVENT = "ahaframe:learning-progress";
export const GUIDE_PRODUCT_PROGRESS_KEY = "ahaframe_guide_product_progress_v1";
export const GUIDE_PRODUCT_PROGRESS_EVENT = "ahaframe:guide-product-progress";
export const GUIDE_PRODUCT_PROGRESS_SCHEMA_VERSION = 1 as const;
const REVIEW_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

export interface LearningProgressEntry {
  state: Exclude<LearningProgressState, "REVIEW_DUE">;
  updatedAt: string;
}

export type LearningProgress = Record<string, LearningProgressEntry>;

export interface GuideProgressEvidence {
  seenAt: string;
  readAt?: string;
}

export interface PracticeProgressEvidence {
  practicedAt: string;
}

export interface GuideProductProgress {
  version: typeof GUIDE_PRODUCT_PROGRESS_SCHEMA_VERSION;
  guides: Record<string, GuideProgressEvidence>;
  practices: Record<string, PracticeProgressEvidence>;
}

export type GuideEvidenceState = "UNSEEN" | "SEEN" | "READ";

const STATE_RANK: Record<LearningProgressEntry["state"], number> = {
  UNSEEN: 0,
  SEEN: 1,
  PRACTICED: 2,
  TRANSFERRED: 3,
};

function isStoredState(value: unknown): value is LearningProgressEntry["state"] {
  return value === "UNSEEN" || value === "SEEN" || value === "PRACTICED" || value === "TRANSFERRED";
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function parseLearningProgress(raw: string | null, validIds?: Set<string>): LearningProgress {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LearningProgressEntry>>;
    const progress: LearningProgress = {};
    for (const [id, entry] of Object.entries(parsed ?? {})) {
      if (validIds && !validIds.has(id)) continue;
      if (!isStoredState(entry?.state) || !isValidTimestamp(entry.updatedAt)) continue;
      progress[id] = { state: entry.state, updatedAt: entry.updatedAt };
    }
    return progress;
  } catch {
    return {};
  }
}

export function emptyGuideProductProgress(): GuideProductProgress {
  return { version: GUIDE_PRODUCT_PROGRESS_SCHEMA_VERSION, guides: {}, practices: {} };
}

export function parseGuideProductProgress(raw: string | null): GuideProductProgress {
  if (!raw) return emptyGuideProductProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<GuideProductProgress>;
    if (parsed.version !== GUIDE_PRODUCT_PROGRESS_SCHEMA_VERSION) return emptyGuideProductProgress();

    const guides: Record<string, GuideProgressEvidence> = {};
    if (parsed.guides && typeof parsed.guides === "object") {
      for (const [conceptId, evidence] of Object.entries(parsed.guides)) {
        if (!conceptId || !evidence || typeof evidence !== "object") continue;
        const candidate = evidence as Partial<GuideProgressEvidence>;
        if (!isValidTimestamp(candidate.seenAt)) continue;
        guides[conceptId] = {
          seenAt: candidate.seenAt,
          ...(isValidTimestamp(candidate.readAt) ? { readAt: candidate.readAt } : {}),
        };
      }
    }

    const practices: Record<string, PracticeProgressEvidence> = {};
    if (parsed.practices && typeof parsed.practices === "object") {
      for (const [experienceId, evidence] of Object.entries(parsed.practices)) {
        if (!experienceId || !evidence || typeof evidence !== "object") continue;
        const candidate = evidence as Partial<PracticeProgressEvidence>;
        if (!isValidTimestamp(candidate.practicedAt)) continue;
        practices[experienceId] = { practicedAt: candidate.practicedAt };
      }
    }

    return { version: GUIDE_PRODUCT_PROGRESS_SCHEMA_VERSION, guides, practices };
  } catch {
    return emptyGuideProductProgress();
  }
}

export function readLearningProgress(validIds?: Set<string>): LearningProgress {
  if (typeof window === "undefined") return {};
  return parseLearningProgress(window.localStorage.getItem(LEARNING_PROGRESS_KEY), validIds);
}

export function readGuideProductProgress(): GuideProductProgress {
  if (typeof window === "undefined") return emptyGuideProductProgress();
  return parseGuideProductProgress(window.localStorage.getItem(GUIDE_PRODUCT_PROGRESS_KEY));
}

export function writeLearningProgress(progress: LearningProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(LEARNING_PROGRESS_EVENT, { detail: progress }));
  } catch {
    // Anonymous progression is a convenience layer and must never block learning in privacy modes.
  }
}

export function writeGuideProductProgress(progress: GuideProductProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUIDE_PRODUCT_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(GUIDE_PRODUCT_PROGRESS_EVENT, { detail: progress }));
  } catch {
    // Local Guide evidence is optional and must never block content access.
  }
}

export function advanceLearningState(
  progress: LearningProgress,
  contentId: string,
  requested: LearningProgressEntry["state"],
  now = new Date(),
): LearningProgress {
  const current = progress[contentId];
  if (current && STATE_RANK[current.state] >= STATE_RANK[requested]) return progress;
  return {
    ...progress,
    [contentId]: { state: requested, updatedAt: now.toISOString() },
  };
}

export function setLearningState(contentId: string, requested: LearningProgressEntry["state"], validIds?: Set<string>) {
  if (validIds && !validIds.has(contentId)) return;
  const current = readLearningProgress(validIds);
  writeLearningProgress(advanceLearningState(current, contentId, requested));
}

export function markGuideSeen(conceptId: string, now = new Date()) {
  if (!conceptId) return;
  const progress = readGuideProductProgress();
  if (progress.guides[conceptId]) return;
  writeGuideProductProgress({
    ...progress,
    guides: {
      ...progress.guides,
      [conceptId]: { seenAt: now.toISOString() },
    },
  });
}

export function markGuideRead(conceptId: string, now = new Date()) {
  if (!conceptId) return;
  const progress = readGuideProductProgress();
  const current = progress.guides[conceptId];
  if (current?.readAt) return;
  const timestamp = now.toISOString();
  writeGuideProductProgress({
    ...progress,
    guides: {
      ...progress.guides,
      [conceptId]: {
        seenAt: current?.seenAt ?? timestamp,
        readAt: timestamp,
      },
    },
  });
}

export function markPracticeCompleted(experienceId: string, now = new Date()) {
  if (!experienceId) return;
  const progress = readGuideProductProgress();
  if (progress.practices[experienceId]) return;
  writeGuideProductProgress({
    ...progress,
    practices: {
      ...progress.practices,
      [experienceId]: { practicedAt: now.toISOString() },
    },
  });
}

export function guideEvidenceState(progress: GuideProductProgress, conceptId: string): GuideEvidenceState {
  const evidence = progress.guides[conceptId];
  if (!evidence) return "UNSEEN";
  return evidence.readAt ? "READ" : "SEEN";
}

export function practiceCompleted(progress: GuideProductProgress, experienceId: string): boolean {
  return Boolean(progress.practices[experienceId]?.practicedAt);
}

export function resetGuideProductProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUIDE_PRODUCT_PROGRESS_KEY);
    window.dispatchEvent(new CustomEvent(GUIDE_PRODUCT_PROGRESS_EVENT, { detail: emptyGuideProductProgress() }));
  } catch {
    // Storage may be unavailable. There is nothing else to reset.
  }
}

export function resetLearningProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEARNING_PROGRESS_KEY);
    window.localStorage.removeItem(GUIDE_PRODUCT_PROGRESS_KEY);
    window.dispatchEvent(new CustomEvent(LEARNING_PROGRESS_EVENT, { detail: {} }));
    window.dispatchEvent(new CustomEvent(GUIDE_PRODUCT_PROGRESS_EVENT, { detail: emptyGuideProductProgress() }));
  } catch {
    // Storage may be unavailable. There is nothing else to reset.
  }
}

export function effectiveLearningState(
  node: Pick<LearningContentNode, "id" | "reviewEligible">,
  progress: LearningProgress,
  now = new Date(),
): LearningProgressState {
  const entry = progress[node.id];
  if (!entry) return "UNSEEN";
  if (node.reviewEligible && entry.state === "TRANSFERRED") {
    const age = now.getTime() - Date.parse(entry.updatedAt);
    if (Number.isFinite(age) && age >= REVIEW_AFTER_MS) return "REVIEW_DUE";
  }
  return entry.state;
}

function orderedContent(graph: Pick<LearningGraph, "stages" | "contentNodes">): LearningContentNode[] {
  const stageOrder = new Map(graph.stages.map((stage) => [stage.id, stage.order]));
  return graph.contentNodes.slice().sort((a, b) => {
    const stageDelta = (stageOrder.get(a.stageId) ?? 99) - (stageOrder.get(b.stageId) ?? 99);
    if (stageDelta) return stageDelta;
    return a.id.localeCompare(b.id);
  });
}

export interface LearningRecommendation {
  node: LearningContentNode | null;
  reason: "NEW" | "CONTINUE" | "COMPLETE";
}

export function recommendNextLearningNode(
  graph: Pick<LearningGraph, "stages" | "contentNodes">,
  progress: LearningProgress,
): LearningRecommendation {
  const nodes = orderedContent(graph);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const recent = Object.entries(progress)
    .filter(([id]) => byId.has(id))
    .sort(([, a], [, b]) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  for (const [id] of recent) {
    const current = byId.get(id);
    if (!current) continue;
    const next = current.nextContentIds
      .map((nextId) => byId.get(nextId))
      .find((candidate) => candidate && effectiveLearningState(candidate, progress) === "UNSEEN");
    if (next) return { node: next, reason: "CONTINUE" };
  }

  const seenEnough = (id: string) => effectiveLearningState(byId.get(id) ?? { id, reviewEligible: false }, progress) !== "UNSEEN";
  const eligible = nodes.find((node) =>
    effectiveLearningState(node, progress) === "UNSEEN"
    && node.prerequisiteContentIds.every(seenEnough),
  );
  if (eligible) return { node: eligible, reason: recent.length ? "CONTINUE" : "NEW" };

  const anyUnseen = nodes.find((node) => effectiveLearningState(node, progress) === "UNSEEN");
  if (anyUnseen) return { node: anyUnseen, reason: recent.length ? "CONTINUE" : "NEW" };

  return { node: null, reason: "COMPLETE" };
}

export function reviewDueNodes(
  nodes: LearningContentNode[],
  progress: LearningProgress,
  now = new Date(),
): LearningContentNode[] {
  return nodes.filter((node) => effectiveLearningState(node, progress, now) === "REVIEW_DUE");
}
