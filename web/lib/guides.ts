import type { Locale } from "@/lib/content";

export type GuideAccess = "OPEN";
export type CoreGuideWave = "core-20" | "core-40" | "core-60" | "core-80" | "core-100";

export interface GuidePracticeLink {
  title: string;
  href: string;
}

export interface GuideSection {
  id: "mechanism" | "example";
  title: string;
  body: string;
}

export interface CoreGuide {
  slug: string;
  conceptId: string;
  title: string;
  summary: string;
  readingMinutes: number;
  access: GuideAccess;
  mentalModel: string;
  whyItMatters: string;
  sections: GuideSection[];
  failureModes: string[];
  heuristics: string[];
  takeaways: string[];
  practice: GuidePracticeLink | null;
}

export interface CoreGuideBundle {
  version: "1.0.0";
  locale: Locale;
  wave: CoreGuideWave;
  guides: CoreGuide[];
}

export interface GuideRelatedConcept {
  id: string;
  title: string;
  relationship: string;
  guideSlug: string | null;
}

export interface GuidePathMembership {
  id: string;
  slug: string;
  title: string;
  milestoneId: string;
  milestoneTitle: string;
}

export interface GuideSequenceNeighbor {
  conceptId: string;
  slug: string;
  title: string;
}

export interface GuideActivePathContext extends GuidePathMembership {
  previous: GuideSequenceNeighbor | null;
  next: GuideSequenceNeighbor | null;
}

export interface GuidePracticePathContext {
  slug: string;
  title: string;
  next: GuideSequenceNeighbor | null;
}

export interface GuidePracticeReturnTarget {
  slug: string;
  title: string;
  paths: GuidePracticePathContext[];
}

export interface GuidePageData {
  guide: CoreGuide;
  concept: {
    id: string;
    title: string;
    kind: string;
    difficulty: string;
  };
  relatedConcepts: GuideRelatedConcept[];
  pathMemberships: GuidePathMembership[];
  activePath: GuideActivePathContext | null;
}
