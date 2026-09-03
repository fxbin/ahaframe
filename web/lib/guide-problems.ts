export interface GuideProblemGuide {
  conceptId: string;
  slug: string;
  title: string;
  readingMinutes: number;
}

export interface GuideProblemPractice {
  id: string;
  title: string;
  route: string;
}

export interface GuideProblemCourse {
  id: string;
  slug: string;
  title: string;
  route: string;
}

export interface GuideProblemBundle {
  id: string;
  problem: string;
  explanation: string;
  guides: GuideProblemGuide[];
  practice: GuideProblemPractice;
  course: GuideProblemCourse;
}

export interface GuideProblemDiscoveryData {
  bundles: GuideProblemBundle[];
}
