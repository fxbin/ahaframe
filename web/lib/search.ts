export type SearchDocumentType = "guide" | "course" | "practice" | "concept";

export interface SearchDocument {
  id: string;
  type: SearchDocumentType;
  title: string;
  summary: string;
  route: string;
  slug: string;
  aliases: string[];
  body: string;
  metadata: string;
  context: string;
}

export interface SearchResult extends SearchDocument {
  score: number;
  reason: "exact" | "prefix" | "alias" | "summary" | "body" | "metadata";
}

const TYPE_BONUS: Record<SearchDocumentType, number> = {
  guide: 40,
  course: 30,
  practice: 20,
  concept: 0,
};

export const SEARCH_TYPE_ORDER: SearchDocumentType[] = ["guide", "course", "practice", "concept"];

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .trim();
}

function compact(value: string): string {
  return normalizeSearchText(value).replace(/[^\p{L}\p{N}]+/gu, "");
}

function scoreDocument(document: SearchDocument, query: string): SearchResult | null {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;
  const queryCompact = compact(normalized);
  const title = normalizeSearchText(document.title);
  const slug = normalizeSearchText(document.slug).replace(/-/g, " ");
  const aliases = document.aliases.map(normalizeSearchText);
  const summary = normalizeSearchText(document.summary);
  const body = normalizeSearchText(document.body);
  const metadata = normalizeSearchText(`${document.metadata} ${document.context}`);
  const titleCompact = compact(document.title);
  const slugCompact = compact(document.slug);

  let base = 0;
  let reason: SearchResult["reason"] = "metadata";

  if (title === normalized || slug === normalized || titleCompact === queryCompact || slugCompact === queryCompact) {
    base = 1000;
    reason = "exact";
  } else if (title.startsWith(normalized) || slug.startsWith(normalized)) {
    base = 850;
    reason = "prefix";
  } else if (aliases.some((alias) => alias === normalized || alias.startsWith(normalized))) {
    base = 780;
    reason = "alias";
  } else if (title.includes(normalized) || slug.includes(normalized)) {
    base = 720;
    reason = "prefix";
  } else if (summary.includes(normalized)) {
    base = 600;
    reason = "summary";
  } else if (body.includes(normalized)) {
    base = 420;
    reason = "body";
  } else if (metadata.includes(normalized)) {
    base = 240;
    reason = "metadata";
  } else {
    const tokens = normalized.split(" ").filter(Boolean);
    const combined = `${title} ${summary} ${body} ${metadata}`;
    if (!tokens.every((token) => combined.includes(token))) return null;
    const titleMatches = tokens.filter((token) => title.includes(token)).length;
    const summaryMatches = tokens.filter((token) => summary.includes(token)).length;
    base = 180 + titleMatches * 70 + summaryMatches * 35;
    reason = titleMatches ? "prefix" : summaryMatches ? "summary" : "body";
  }

  return { ...document, score: base + TYPE_BONUS[document.type], reason };
}

export function searchDocuments(documents: SearchDocument[], query: string, limit = 24): SearchResult[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  return documents
    .map((document) => scoreDocument(document, normalized))
    .filter((result): result is SearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score || SEARCH_TYPE_ORDER.indexOf(a.type) - SEARCH_TYPE_ORDER.indexOf(b.type) || a.title.localeCompare(b.title))
    .slice(0, limit);
}
