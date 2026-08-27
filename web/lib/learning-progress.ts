import type { LearningContentNode, LearningGraph, LearningProgressState } from "@/lib/learning-graph";

export const LEARNING_PROGRESS_KEY = "ahaframe_learning_progress_v1";
export const LEARNING_STATE_EVENT = "ahaframe:learning-state";
export const LEARNING_PROGRESS_EVENT = "ahaframe:learning-progress";
const REVIEW_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

export interface LearningProgressEntry {
  state: Exclude<LearningProgressState, "REVIEW_DUE">;
  updatedAt: string;
}

export type LearningProgress = Record<string, LearningProgressEntry>;

const STATE_RANK: Record<LearningProgressEntry["state"], number> = {
  UNSEEN: 0,
  SEEN: 1,
  PRACTICED: 2,
  TRANSFERRED: 3,
};

function isStoredState(value: unknown): value is LearningProgressEntry["state"] {
  return value === "UNSEEN" || value === "SEEN" || value === "PRACTICED" || value === "TRANSFERRED";
}

export function parseLearningProgress(raw: string | null, validIds?: Set<string>): LearningProgress {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LearningProgressEntry>>;
    const progress: LearningProgress = {};
    for (const [id, entry] of Object.entries(parsed ?? {})) {
      if (validIds && !validIds.has(id)) continue;
      if (!isStoredState(entry?.state) || typeof entry.updatedAt !== "string") continue;
      if (Number.isNaN(Date.parse(entry.updatedAt))) continue;
      progress[id] = { state: entry.state, updatedAt: entry.updatedAt };
    }
    return progress;
  } catch {
    return {};
  }
}

export function readLearningProgress(validIds?: Set<string>): LearningProgress {
  if (typeof window === "undefined") return {};
  return parseLearningProgress(window.localStorage.getItem(LEARNING_PROGRESS_KEY), validIds);
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

export function resetLearningProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEARNING_PROGRESS_KEY);
    window.dispatchEvent(new CustomEvent(LEARNING_PROGRESS_EVENT, { detail: {} }));
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
