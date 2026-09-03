import type { Locale } from "@/lib/content";

export interface KnowledgeMapDomain {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string;
}

export interface KnowledgeMapBranch {
  id: string;
  domainId: string;
  parentBranchId: string | null;
  order: number;
  title: string;
  description: string;
}

export interface KnowledgeMapConcept {
  id: string;
  kind: string;
  primaryBranchId: string;
  branchIds: string[];
  title: string;
  difficulty: string;
  maturity: string;
  versionSensitive: boolean;
  legacyIds: string[];
  guideSlug: string | null;
}

export interface KnowledgeMapMilestone {
  id: string;
  title: string;
  conceptIds: string[];
  contentNodeIds: string[];
  required: boolean;
}

export interface KnowledgeMapPath {
  id: string;
  kind: string;
  slug: string;
  domainIds: string[];
  branchIds: string[];
  title: string;
  description: string;
  goal: string;
  deliverable: string;
  difficulty: string;
  lifecycle: string;
  milestones: KnowledgeMapMilestone[];
}

export interface KnowledgeMap {
  version: "1.0.0";
  locale: Locale;
  domains: KnowledgeMapDomain[];
  branches: KnowledgeMapBranch[];
  concepts: KnowledgeMapConcept[];
  paths: KnowledgeMapPath[];
}
