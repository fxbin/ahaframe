import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale, Pair } from "@/lib/content";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

export interface MissionControl {
  label: string;
  options: Record<string, string>;
  intervention?: string;
}

export interface MissionContent {
  name: string;
  seoTitle: string;
  description: string;
  level: string;
  layer: string;
  minutes: number;
  hero: string;
  quick: string;
  transferPrompt?: string;
  brief: {
    eyebrow: string;
    title: string;
    role: string;
    body: string;
    objective: string;
    stakes: string;
  };
  ui: Record<string, string>;
  evidenceLabels: Record<string, string>;
  controls?: Record<string, MissionControl>;
  groups?: Record<string, MissionControl>;
  metrics: Array<{ key: string; label: string; format: string }>;
  debrief: {
    eyebrow: string;
    title: string;
    rule: string;
    body: string;
    points: string[];
  };
  takeaways?: Pair[];
  incidentLedger?: Pair[];
  next: {
    title: string;
    description: string;
    button: string;
    href: string;
    query?: string;
    event?: string;
  };
  earlyAccess?: {
    title: string;
    description: string;
    button: string;
    href: string;
    query?: string;
    event?: string;
  };
}

const MISSION_DOMAINS = {
  "rag-failure": "mission-broken-rag",
  "agent-reliability": "mission-47000-retry",
  "instruction-conflict": "mission-prompt-injection",
  "reliable-support-agent": "mission-final-boss",
  "ai-code-review-mission": "mission-ai-code-review",
  "research-evidence-mission": "mission-research-evidence",
  "data-analysis-verification-lab": "mission-data-analysis-verification",
} as const;

const WAVE_2_SLUGS = new Set([
  "structured-output-contract-lab",
  "mcp-capability-boundary-mission",
  "long-running-agent-recovery-mission",
  "write-book-with-ai-build",
  "knowledge-base-build",
  "customer-support-build",
  "course-knowledge-product-build",
]);

export const WAVE_2_BUILD_SLUGS = [
  "write-book-with-ai-build",
  "knowledge-base-build",
  "customer-support-build",
  "course-knowledge-product-build",
] as const;

export const WAVE_2_LAB_SLUGS = [
  "structured-output-contract-lab",
  "mcp-capability-boundary-mission",
  "long-running-agent-recovery-mission",
] as const;

type MissionSlug = keyof typeof MISSION_DOMAINS;

function isMissionSlug(slug: string): slug is MissionSlug {
  return Object.prototype.hasOwnProperty.call(MISSION_DOMAINS, slug);
}

export function missionDomain(slug: string): string | null {
  return isMissionSlug(slug) ? MISSION_DOMAINS[slug] : WAVE_2_SLUGS.has(slug) ? "content-wave-2" : null;
}

export async function getMissionContent(locale: Locale, slug: string): Promise<MissionContent | null> {
  const domain = missionDomain(slug);
  if (!domain) return null;
  const source = await readFile(path.join(CONTENT_ROOT, `${domain}.${locale}.json`), "utf8");
  if (domain === "content-wave-2") {
    const parsed = JSON.parse(source) as { locale: Locale; missions: Record<string, MissionContent> };
    return parsed.missions[slug] ?? null;
  }
  const parsed = JSON.parse(source) as { locale: Locale; mission: MissionContent };
  return parsed.mission;
}
