export interface GuideDirectoryOption {
  id: string;
  title: string;
}

export interface GuideDirectoryPathOption extends GuideDirectoryOption {
  slug: string;
}

export interface GuideDirectoryItem {
  slug: string;
  conceptId: string;
  title: string;
  summary: string;
  readingMinutes: number;
  difficulty: string;
  domainId: string;
  domainTitle: string;
  domainSlug: string;
  branchId: string;
  branchTitle: string;
  pathIds: string[];
  paths: Array<{ id: string; slug: string; title: string }>;
  hasPractice: boolean;
}

export interface GuideDirectoryData {
  count: number;
  items: GuideDirectoryItem[];
  domains: GuideDirectoryOption[];
  branches: GuideDirectoryOption[];
  paths: GuideDirectoryPathOption[];
  difficulties: string[];
}
