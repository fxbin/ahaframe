export type PublicResetKind = "full" | "banked";
export type PublicResetStatus = "detected" | "confirmed";
export type PublicResetProvider = "aihot" | "codex_resets";

export interface PublicResetSignal {
  externalId: string;
  occurredAt: string;
  kind: PublicResetKind;
  status: PublicResetStatus;
  sourceUrl: string;
  sourceLabel: string;
  provider: PublicResetProvider;
  corroboratedByNextReset: boolean;
  checkedAt: string | null;
}

const AIHOT_CODEX_RESETS_URL = process.env.AIHOT_CODEX_RESETS_URL || "https://aihot.news/api/v1/codex-resets";
const CODEX_RESETS_FEED_URL = process.env.CODEX_RESETS_FEED_URL || "https://codex-resets.com/api/resets?limit=100&order=desc";
const CODEX_RESETS_STATUS_URL = process.env.CODEX_RESETS_STATUS_URL || "https://codex-resets.com/api/v1/status";
const NEXTRESET_HISTORY_URL = process.env.NEXTRESET_HISTORY_URL || "https://nextreset.ai/history/";

const USER_AGENT = "AhaFrame Codex Reset Radar/0.2 (+https://ahaframe.com/tools/codex-reset)";

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

function dateOnlyToBeijingNoon(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return parseTimestamp(`${value}T12:00:00+08:00`);
}

function extractXStatusId(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i);
  return match?.[1] ?? null;
}

function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function findSourceUrl(record: Record<string, unknown>): string | null {
  const preferred = firstNestedString(record, [
    "source_url", "sourceUrl", "tweet_url", "tweetUrl", "x_url", "xUrl",
    "post_url", "postUrl", "original_url", "originalUrl", "permalink", "url",
  ]);
  if (isHttpUrl(preferred)) return preferred;

  const generic = firstNestedString(record, ["source"]);
  return isHttpUrl(generic) ? generic : null;
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
  if (bankedFlag || /banked|credit|reset_credit/.test(descriptor)) return "banked";
  if (/direct_reset|regular|automatic|full|hard reset|usage reset|rate limit reset|reset/.test(descriptor)) return "full";
  return null;
}

function aihotPostUrl(event: Record<string, unknown>): string | null {
  const posts = event.posts;
  if (!Array.isArray(posts)) return null;
  for (const post of posts) {
    const record = asRecord(post);
    if (!record) continue;
    const url = firstString(record, ["url", "sourceUrl", "source_url", "permalink"]);
    if (isHttpUrl(url)) return url;
  }
  return null;
}

function normalizeAihotEvent(event: Record<string, unknown>, checkedAt: string | null): PublicResetSignal | null {
  const rawType = firstString(event, ["type"]);
  const rawStatus = firstString(event, ["status"]);
  const kind: PublicResetKind | null = rawType === "direct_reset"
    ? "full"
    : rawType === "reset_credit"
      ? "banked"
      : inferKind(event);
  const status: PublicResetStatus | null = rawStatus === "confirmed"
    ? "confirmed"
    : rawStatus === "announced"
      ? "detected"
      : null;
  if (!kind || !status) return null;

  const confirmedAt = parseTimestamp(firstString(event, ["confirmedAt", "confirmed_at"]));
  const announcedAt = parseTimestamp(firstString(event, ["announcedAt", "announced_at"]));
  const updatedAt = parseTimestamp(firstString(event, ["updatedAt", "updated_at"]));
  const occurredOn = dateOnlyToBeijingNoon(firstString(event, ["occurredOn", "occurred_on"]));
  const occurredAt = status === "confirmed"
    ? confirmedAt || announcedAt || occurredOn || updatedAt
    : announcedAt || updatedAt || confirmedAt || occurredOn;
  if (!occurredAt) return null;

  const postUrl = aihotPostUrl(event);
  const sourceUrl = postUrl || "https://aihot.news/codex-reset";
  const xStatusId = extractXStatusId(sourceUrl);
  const eventId = firstString(event, ["id", "eventId", "event_id"]);
  const externalId = xStatusId || eventId || `aihot:${kind}:${occurredAt}`;

  return {
    externalId,
    occurredAt,
    kind,
    status,
    sourceUrl,
    sourceLabel: xStatusId
      ? "Tibo (@thsottiaux) on X · indexed by AIHOT"
      : "AIHOT Codex reset monitor",
    provider: "aihot",
    corroboratedByNextReset: false,
    checkedAt,
  };
}

function normalizeAihotPayload(payload: unknown): PublicResetSignal[] {
  const root = asRecord(payload);
  if (!root) return [];
  const events = Array.isArray(root.events) ? root.events : [];
  const checkedAt = parseTimestamp(firstString(root, ["checkedAt", "checked_at"]));
  return events
    .map(asRecord)
    .filter((event): event is Record<string, unknown> => Boolean(event))
    .map((event) => normalizeAihotEvent(event, checkedAt))
    .filter((signal): signal is PublicResetSignal => Boolean(signal));
}

function normalizeLegacyCandidate(record: Record<string, unknown>): Omit<PublicResetSignal, "corroboratedByNextReset"> | null {
  const occurredAt = parseTimestamp(firstNestedString(record, [
    "announced_at", "announcedAt", "created_at", "createdAt", "timestamp", "time", "date", "occurred_at", "occurredAt", "reset_at", "posted_at",
  ]));
  const kind = inferKind(record);
  if (!occurredAt || !kind) return null;

  let sourceUrl = findSourceUrl(record);
  const explicitTweetId = firstNestedString(record, ["tweet_id", "tweetId", "post_id", "postId", "status_id", "statusId"]);
  const sourceStatusId = extractXStatusId(sourceUrl);
  const xStatusId = sourceStatusId || (explicitTweetId && /^\d{15,}$/.test(explicitTweetId) ? explicitTweetId : null);
  if (xStatusId) sourceUrl = `https://x.com/thsottiaux/status/${xStatusId}`;

  const fallbackId = firstNestedString(record, ["id", "external_id", "externalId", "slug"]);
  const externalId = xStatusId || fallbackId || `${occurredAt}:${kind}`;

  return {
    externalId,
    occurredAt,
    kind,
    status: xStatusId ? "confirmed" : "detected",
    sourceUrl: sourceUrl || "https://codex-resets.com/",
    sourceLabel: xStatusId
      ? "Tibo (@thsottiaux) on X · indexed by Codex Resets"
      : "Codex Resets public feed",
    provider: "codex_resets",
    checkedAt: null,
  };
}

function normalizeLegacyPayload(payload: unknown): Array<Omit<PublicResetSignal, "corroboratedByNextReset">> {
  return collectCandidates(payload)
    .map(normalizeLegacyCandidate)
    .filter((value): value is Omit<PublicResetSignal, "corroboratedByNextReset"> => Boolean(value));
}

function dedupeSignals<T extends Omit<PublicResetSignal, "corroboratedByNextReset"> | PublicResetSignal>(signals: T[]): T[] {
  const deduped = new Map<string, T>();
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
  if (!response.ok) throw new Error(`Public reset feed ${response.status} from ${new URL(url).host}`);
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

async function fetchLegacySignals(limit: number): Promise<PublicResetSignal[]> {
  let primarySignals: Array<Omit<PublicResetSignal, "corroboratedByNextReset">> = [];
  let primaryError: unknown = null;

  try {
    primarySignals = normalizeLegacyPayload(await fetchJson(CODEX_RESETS_FEED_URL));
  } catch (error) {
    primaryError = error;
  }

  let fallbackSignals: Array<Omit<PublicResetSignal, "corroboratedByNextReset">> = [];
  if (primarySignals.length === 0) {
    try {
      fallbackSignals = normalizeLegacyPayload(await fetchJson(CODEX_RESETS_STATUS_URL));
    } catch (fallbackError) {
      if (primaryError) throw primaryError;
      throw fallbackError;
    }
  }

  const candidates = dedupeSignals([...primarySignals, ...fallbackSignals])
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, limit);

  const nextResetHtml = await fetchNextResetHtml();
  return candidates.map((signal) => {
    const corroborated = corroboratedByNextReset(signal, nextResetHtml);
    return {
      ...signal,
      status: signal.status === "confirmed" || corroborated ? "confirmed" : "detected",
      corroboratedByNextReset: corroborated,
    };
  });
}

export async function fetchPublicResetSignals(limit = 100): Promise<PublicResetSignal[]> {
  try {
    const aihotSignals = dedupeSignals(normalizeAihotPayload(await fetchJson(AIHOT_CODEX_RESETS_URL)))
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      .slice(0, limit);
    if (aihotSignals.length > 0) return aihotSignals;
    console.warn("AIHOT Codex reset feed returned no usable events; falling back to Codex Resets.");
  } catch (error) {
    console.warn("AIHOT Codex reset feed unavailable; falling back to Codex Resets.", error);
  }

  return fetchLegacySignals(limit);
}
