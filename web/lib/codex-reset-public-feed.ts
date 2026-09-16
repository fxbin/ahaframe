export type PublicResetKind = "full" | "banked";

export interface PublicResetSignal {
  externalId: string;
  occurredAt: string;
  kind: PublicResetKind;
  sourceUrl: string;
  sourceLabel: string;
  corroboratedByNextReset: boolean;
}

const CODEX_RESETS_FEED_URL = process.env.CODEX_RESETS_FEED_URL || "https://codex-resets.com/api/resets?limit=100&order=desc";
const CODEX_RESETS_STATUS_URL = process.env.CODEX_RESETS_STATUS_URL || "https://codex-resets.com/api/v1/status";
const NEXTRESET_HISTORY_URL = process.env.NEXTRESET_HISTORY_URL || "https://nextreset.ai/history/";

const USER_AGENT = "AhaFrame Codex Reset Radar/0.1 (+https://ahaframe.com/tools/codex-reset)";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function firstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function firstNestedString(record: Record<string, unknown>, keys: string[]): string | null {
  const direct = firstString(record, keys);
  if (direct) return direct;
  for (const value of Object.values(record)) {
    const nested = asRecord(value);
    if (!nested) continue;
    const match = firstString(nested, keys);
    if (match) return match;
  }
  return null;
}

function parseTimestamp(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{10,13}$/.test(value)) {
    const number = Number(value);
    const date = new Date(value.length === 10 ? number * 1000 : number);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractXStatusId(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i);
  return match?.[1] ?? null;
}

function collectCandidates(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.map(asRecord).filter((value): value is Record<string, unknown> => Boolean(value));
  const record = asRecord(payload);
  if (!record) return [];

  for (const key of ["resets", "data", "items", "results", "announcements", "events", "history"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.map(asRecord).filter((item): item is Record<string, unknown> => Boolean(item));
    }
    const nested = asRecord(value);
    if (nested) {
      for (const nestedKey of ["resets", "items", "results", "events", "announcements"]) {
        const nestedArray = nested[nestedKey];
        if (Array.isArray(nestedArray)) {
          return nestedArray.map(asRecord).filter((item): item is Record<string, unknown> => Boolean(item));
        }
      }
    }
  }

  for (const key of ["latest", "latest_reset", "last_reset", "reset", "event"]) {
    const value = asRecord(record[key]);
    if (value) return [value];
  }

  return [record];
}

function inferKind(record: Record<string, unknown>): PublicResetKind | null {
  const descriptor = [
    firstNestedString(record, ["type", "kind", "reset_type", "resetType", "category", "label"]),
    firstNestedString(record, ["text", "content", "message", "announcement", "summary", "title"]),
  ].filter(Boolean).join(" ").toLowerCase();

  const bankedFlag = record.banked === true || record.is_banked === true || record.isBanked === true;
  if (bankedFlag || /banked|credit/.test(descriptor)) return "banked";
  if (/regular|automatic|full|hard reset|usage reset|rate limit reset|reset/.test(descriptor)) return "full";
  return null;
}

function normalizeCandidate(record: Record<string, unknown>): Omit<PublicResetSignal, "corroboratedByNextReset"> | null {
  const occurredAt = parseTimestamp(firstNestedString(record, [
    "announced_at", "announcedAt", "created_at", "createdAt", "timestamp", "time", "date", "occurred_at", "occurredAt", "reset_at", "posted_at",
  ]));
  const kind = inferKind(record);
  if (!occurredAt || !kind) return null;

  let sourceUrl = firstNestedString(record, [
    "source", "source_url", "sourceUrl", "tweet_url", "tweetUrl", "x_url", "post_url", "original_url", "originalUrl", "url",
  ]);
  const explicitTweetId = firstNestedString(record, ["tweet_id", "tweetId", "post_id", "postId", "status_id", "statusId"]);
  const sourceStatusId = extractXStatusId(sourceUrl);
  const xStatusId = sourceStatusId || (explicitTweetId && /^\d{15,}$/.test(explicitTweetId) ? explicitTweetId : null);
  if (!sourceUrl && xStatusId) sourceUrl = `https://x.com/thsottiaux/status/${xStatusId}`;

  const fallbackId = firstNestedString(record, ["id", "external_id", "externalId", "slug"]);
  const externalId = xStatusId || fallbackId || `${occurredAt}:${kind}`;

  return {
    externalId,
    occurredAt,
    kind,
    sourceUrl: sourceUrl || "https://codex-resets.com/",
    sourceLabel: sourceUrl?.includes("x.com/") || sourceUrl?.includes("twitter.com/")
      ? "Tibo (@thsottiaux) · indexed by Codex Resets"
      : "Codex Resets public feed",
  };
}

function normalizePayload(payload: unknown): Array<Omit<PublicResetSignal, "corroboratedByNextReset">> {
  return collectCandidates(payload)
    .map(normalizeCandidate)
    .filter((value): value is Omit<PublicResetSignal, "corroboratedByNextReset"> => Boolean(value));
}

function dedupeSignals(signals: Array<Omit<PublicResetSignal, "corroboratedByNextReset">>) {
  const deduped = new Map<string, Omit<PublicResetSignal, "corroboratedByNextReset">>();
  for (const signal of signals) {
    const xStatusId = extractXStatusId(signal.sourceUrl);
    const key = xStatusId || `${signal.externalId}:${signal.kind}`;
    if (!deduped.has(key)) deduped.set(key, signal);
  }
  return [...deduped.values()];
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "application/json" },
    next: { revalidate: 120 },
  });
  if (!response.ok) throw new Error(`Public reset feed ${response.status}`);
  return response.json();
}

async function fetchNextResetHtml(): Promise<string> {
  try {
    const response = await fetch(NEXTRESET_HISTORY_URL, {
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      next: { revalidate: 180 },
    });
    return response.ok ? response.text() : "";
  } catch {
    return "";
  }
}

function corroboratedByNextReset(signal: Omit<PublicResetSignal, "corroboratedByNextReset">, html: string): boolean {
  if (!html) return false;
  const xStatusId = extractXStatusId(signal.sourceUrl);
  if (xStatusId && html.includes(xStatusId)) return true;
  const date = signal.occurredAt.slice(0, 10);
  return html.includes(date) && /Automatic reset|Banked credit|Reset \+ credit/i.test(html);
}

export async function fetchPublicResetSignals(limit = 100): Promise<PublicResetSignal[]> {
  let primarySignals: Array<Omit<PublicResetSignal, "corroboratedByNextReset">> = [];
  let primaryError: unknown = null;

  try {
    primarySignals = normalizePayload(await fetchJson(CODEX_RESETS_FEED_URL));
  } catch (error) {
    primaryError = error;
  }

  let fallbackSignals: Array<Omit<PublicResetSignal, "corroboratedByNextReset">> = [];
  if (primarySignals.length === 0) {
    try {
      fallbackSignals = normalizePayload(await fetchJson(CODEX_RESETS_STATUS_URL));
    } catch (fallbackError) {
      if (primaryError) throw primaryError;
      throw fallbackError;
    }
  }

  const candidates = dedupeSignals([...primarySignals, ...fallbackSignals])
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, limit);

  const nextResetHtml = await fetchNextResetHtml();
  return candidates.map((signal) => ({
    ...signal,
    corroboratedByNextReset: corroboratedByNextReset(signal, nextResetHtml),
  }));
}
