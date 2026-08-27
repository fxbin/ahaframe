import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale, Pair } from "@/lib/content";

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

export interface CampaignExperience {
  id: string;
  route: string;
  pageType: string;
  layer: string;
  primaryStatus: string;
  campaignRole: string;
  missionId?: string;
}

export interface CampaignContract {
  version: string;
  status: "active" | string;
  principle: string;
  primaryCampaign: string[];
  experiences: CampaignExperience[];
}

export type FirstAhaChoiceId = "timeout" | "retry" | "idempotency";

export interface FirstAhaChoice {
  id: FirstAhaChoiceId;
  label: string;
  description: string;
  consequence: string;
  signal: string;
  tone: "neutral" | "danger" | "success";
}

export interface FirstAhaContent {
  label: string;
  title: string;
  trace: Array<{
    time: string;
    actor: string;
    detail: string;
    state: "normal" | "warning" | "danger" | "success";
  }>;
  result: string;
  insightTitle: string;
  insightCopy: string;
  question: string;
  choices: FirstAhaChoice[];
}

export interface CampaignDiscoveryContent {
  locale: Locale;
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    proof: Pair[];
    queueTitle: string;
    queueStatus: string;
    queue: Array<[string, string, string]>;
    firstAha: FirstAhaContent;
  };
  campaign: {
    kicker: string;
    title: string;
    copy: string;
    cards: Record<string, {
      step: string;
      title: string;
      incident: string;
      decision: string;
      dimensions: string[];
      minutes: string;
      cta: string;
    }>;
    bossKicker: string;
    bossCopy: string;
  };
  method: {
    kicker: string;
    title: string;
    copy: string;
    steps: Array<[string, string, string]>;
  };
  knowledge: {
    kicker: string;
    title: string;
    copy: string;
    groups: Record<string, { title: string; description: string }>;
    experiences: Record<string, { name: string; note: string }>;
    open: string;
  };
  about: {
    kicker: string;
    title: string;
    copy: string;
    points: Pair[];
  };
  closing: {
    title: string;
    copy: string;
    primary: string;
    secondary: string;
  };
}

async function loadJson<T>(filename: string): Promise<T> {
  const source = await readFile(path.join(CONTENT_ROOT, filename), "utf8");
  return JSON.parse(source) as T;
}

export async function getCampaignDiscovery(locale: Locale): Promise<CampaignDiscoveryContent> {
  return loadJson<CampaignDiscoveryContent>(`campaign-discovery.${locale}.json`);
}

export async function getCampaignContract(): Promise<CampaignContract> {
  const contract = await loadJson<CampaignContract>("lab-reconciliation-v0.8.json");
  if (contract.status !== "active") {
    throw new Error("The v0.8 Campaign reconciliation contract must be active.");
  }
  return contract;
}
