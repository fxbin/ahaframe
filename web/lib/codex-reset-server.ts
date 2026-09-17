import { fetchPublicResetSignals, type PublicResetSignal } from "@/lib/codex-reset-public-feed";
import { createPublicDataClient, createServiceRoleClient } from "@/lib/supabase/server";

export type CodexResetStatus = "detected" | "confirmed" | "rejected";
export type CodexResetKind = "full" | "banked";

export interface CodexResetEvent {
  id: string;
  occurredAt: string;
  detectedAt: string;
  status: CodexResetStatus;
  kind: CodexResetKind;
  sourceType: string;
  sourceExternalId: string | null;
  sourceUrl: string;
  sourceLabel: string;
  evidenceText: string;
}

interface ResetEventRow {
  id: string;
  occurred_at: string;
  detected_at: string;
  status: CodexResetStatus;
  kind: CodexResetKind;
  source_type: string;
  source_external_id: string | null;
  source_url: string;
  source_label: string;
  evidence_text: string;
}

export interface CodexResetSnapshot {
  latest: CodexResetEvent | null;
  history: CodexResetEvent[];
  dataAvailable: boolean;
}

export interface TiboPost {
  id: string;
  text: string;
  createdAt: string;
}

interface Classification {
  status: CodexResetStatus;
  kind: CodexResetKind;
  evidenceText: string;
}

export interface PublicFeedSyncResult {
  checked: number;
  accepted: number;
  corroborated: number;
  primarySource: "aihot" | "codex_resets" | "none";
}

function isDirectTiboSource(url: string): boolean {
  return /(?:x\.com|twitter\.com)\/thsottiaux\/status\/\d+/i.test(url);
}

function isExternalHttpSource(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function eventSummary(status: CodexResetStatus, kind: CodexResetKind) {
  if (kind === "banked") {
    return status === "confirmed"
      ? "Banked Codex reset credit confirmed."
      : "Banked Codex reset credit detected; confirmation is pending.";
  }
  return status === "confirmed"
    ? "Full Codex usage reset confirmed."
    : "Codex usage reset detected; rollout confirmation is pending.";
}

function normalizeUserFacingEvent(event: CodexResetEvent): CodexResetEvent {
  let sourceUrl = event.sourceUrl;
  const externalIdLooksLikeTweet = Boolean(event.sourceExternalId && /^\d{15,}$/.test(event.sourceExternalId));

  if (!isExternalHttpSource(sourceUrl)) {
    sourceUrl = externalIdLooksLikeTweet
      ? `https://x.com/thsottiaux/status/${event.sourceExternalId}`
      : event.sourceType.includes("aihot")
        ? "https://aihot.news/codex-reset"
        : "https://codex-resets.com/";
  }

  const directTibo = isDirectTiboSource(sourceUrl);
  const indexedByAihot = /aihot/i.test(event.sourceLabel) || event.sourceType.includes("aihot");
  const crossChecked = /nextreset/i.test(event.sourceLabel);
  const sourceLabel = directTibo
    ? `Tibo (@thsottiaux) on X${indexedByAihot ? " · indexed by AIHOT" : crossChecked ? " · cross-checked with NextReset" : ""}`
    : indexedByAihot
      ? "AIHOT Codex reset monitor"
      : crossChecked
        ? "Codex Resets public feed · cross-checked with NextReset"
        : "Codex Resets public feed";

  return {
    ...event,
    sourceUrl,
    sourceLabel,
    evidenceText: eventSummary(event.status, event.kind),
  };
}

function mapRow(row: ResetEventRow): CodexResetEvent {
  return normalizeUserFacingEvent({
    id: row.id,
    occurredAt: row.occurred_at,
    detectedAt: row.detected_at,
    status: row.status,
    kind: row.kind,
    sourceType: row.source_type,
    sourceExternalId: row.source_external_id,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label,
    evidenceText: row.evidence_text,
  });
}

function sourceRank(event: CodexResetEvent) {
  if (isDirectTiboSource(event.sourceUrl)) return 4;
  if (event.sourceType.includes("aihot")) return 3;
  if (isExternalHttpSource(event.sourceUrl)) return 2;
  return 1;
}

function dedupeEvents(events: CodexResetEvent[]) {
  const deduped = new Map<string, CodexResetEvent>();
  for (const event of events) {
    const key = `${event.kind}:${new Date(event.occurredAt).toISOString()}`;
    const existing = deduped.get(key);
    if (!existing || sourceRank(event) > sourceRank(existing)) {
      deduped.set(key, event);
    }
  }
  return [...deduped.values()].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

function sourceTypeForSignal(signal: PublicResetSignal) {
  if (isDirectTiboSource(signal.sourceUrl)) {
    return signal.provider === "aihot" ? "x_tibo_aihot" : "x_tibo";
  }
  return signal.provider === "aihot" ? "aihot" : "codex_resets_api";
}

function mapPublicSignal(signal: PublicResetSignal): CodexResetEvent {
  const detectedAt = signal.checkedAt || new Date().toISOString();
  const status: CodexResetStatus = signal.status;

  return normalizeUserFacingEvent({
    id: `public:${signal.provider}:${signal.kind}:${signal.externalId}`,
    occurredAt: signal.occurredAt,
    detectedAt,
    status,
    kind: signal.kind,
    sourceType: sourceTypeForSignal(signal),
    sourceExternalId: signal.externalId,
    sourceUrl: signal.sourceUrl,
    sourceLabel: signal.corroboratedByNextReset
      ? `${signal.sourceLabel} · cross-checked with NextReset`
      : signal.sourceLabel,
    evidenceText: eventSummary(status, signal.kind),
  });
}

async function readPersistedConfirmedHistory(limit: number, privileged: boolean): Promise<CodexResetEvent[]> {
  const supabase = privileged ? createServiceRoleClient() : createPublicDataClient();
  const { data, error } = await supabase
    .from("codex_reset_events")
    .select("id,occurred_at,detected_at,status,kind,source_type,source_external_id,source_url,source_label,evidence_text")
    .eq("status", "confirmed")
    .eq("kind", "full")
    .order("occurred_at", { ascending: false })
    .limit(Math.max(limit * 3, limit));

  if (error) throw error;
  return dedupeEvents(((data ?? []) as ResetEventRow[]).map(mapRow)).slice(0, limit);
}

export async function syncPublicCodexResetFeed(limit = 100): Promise<PublicFeedSyncResult> {
  const signals = await fetchPublicResetSignals(limit);
  if (!signals.length) return { checked: 0, accepted: 0, corroborated: 0, primarySource: "none" };

  const now = new Date().toISOString();
  const rows = signals.map((signal) => ({
    occurred_at: signal.occurredAt,
    detected_at: signal.checkedAt || now,
    status: signal.status,
    kind: signal.kind,
    source_type: sourceTypeForSignal(signal),
    source_external_id: signal.externalId,
    source_url: signal.sourceUrl,
    source_label: signal.corroboratedByNextReset
      ? `${signal.sourceLabel} · cross-checked with NextReset`
      : signal.sourceLabel,
    evidence_text: eventSummary(signal.status, signal.kind),
    updated_at: now,
  }));

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("codex_reset_events")
    .upsert(rows, { onConflict: "source_type,source_external_id", ignoreDuplicates: false });
  if (error) throw error;

  return {
    checked: signals.length,
    accepted: rows.length,
    corroborated: signals.filter((signal) => signal.corroboratedByNextReset).length,
    primarySource: signals[0]?.provider ?? "none",
  };
}

export async function getCodexResetSnapshot(limit = 12): Promise<CodexResetSnapshot> {
  const hasServiceRole = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (hasServiceRole) {
    try {
      const syncResult = await syncPublicCodexResetFeed(Math.max(12, limit));
      if (syncResult.accepted > 0) {
        const history = await readPersistedConfirmedHistory(limit, true);
        if (history.length > 0) return { latest: history[0], history, dataAvailable: true };
      }
    } catch (error) {
      console.warn("Codex reset upstream sync failed; trying live fallback sources.", error);
    }
  }

  try {
    const signals = await fetchPublicResetSignals(Math.max(12, limit));
    const history = dedupeEvents(signals
      .map(mapPublicSignal)
      .filter((event) => event.status === "confirmed" && event.kind === "full"))
      .slice(0, limit);

    if (history.length > 0) {
      return { latest: history[0], history, dataAvailable: true };
    }
  } catch (error) {
    console.warn("Codex reset live sources unavailable; trying persisted snapshot.", error);
  }

  const hasPublicSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (hasPublicSupabase) {
    try {
      const history = await readPersistedConfirmedHistory(limit, false);
      if (history.length > 0) {
        return { latest: history[0], history, dataAvailable: true };
      }
    } catch (error) {
      console.warn("Codex reset persisted public snapshot unavailable.", error);
    }
  }

  return { latest: null, history: [], dataAvailable: false };
}

export function classifyTiboResetPost(text: string): Classification | null {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized.includes("reset")) return null;

  const hasCodexScope = /codex|chatgpt work|usage|rate limit|weekly/.test(normalized);
  const banked = /banked reset|reset bank|into (the )?bank|credit.+reset/.test(normalized);
  if (banked) {
    return {
      status: "detected",
      kind: "banked",
      evidenceText: "Tibo announced or discussed a banked Codex reset.",
    };
  }

  if (!hasCodexScope) return null;

  const confirmed = [
    /have (now )?reset/,
    /has been reset/,
    /limits have (now )?been reset/,
    /reset (has been )?propagated/,
    /reset all propagated/,
    /all reset for/,
    /reset button pressed/,
    /brand new usage for/,
    /it is done/,
  ].some((pattern) => pattern.test(normalized));

  if (confirmed) {
    return {
      status: "confirmed",
      kind: "full",
      evidenceText: "Tibo confirmed a Codex usage reset or confirmed that it had propagated.",
    };
  }

  const announced = [
    /will (be )?(fully )?reset/,
    /will reset/,
    /will be resetting/,
    /we('re| are) resetting/,
    /reset incoming/,
    /reset.+lands? (in|over|by)/,
    /reset.+next hour/,
    /giving.+usage reset/,
    /resetting.+usage limits/,
  ].some((pattern) => pattern.test(normalized));

  if (announced) {
    return {
      status: "detected",
      kind: "full",
      evidenceText: "Tibo announced an incoming Codex usage reset; propagation is not yet confirmed.",
    };
  }

  return null;
}

export async function ingestTiboPosts(posts: TiboPost[]) {
  const supabase = createServiceRoleClient();
  const accepted: Array<{ id: string; status: CodexResetStatus; kind: CodexResetKind }> = [];

  for (const post of posts) {
    const classification = classifyTiboResetPost(post.text);
    if (!classification) continue;

    const row = {
      occurred_at: post.createdAt,
      detected_at: new Date().toISOString(),
      status: classification.status,
      kind: classification.kind,
      source_type: "x_tibo",
      source_external_id: post.id,
      source_url: `https://x.com/thsottiaux/status/${post.id}`,
      source_label: "Tibo (@thsottiaux) on X",
      evidence_text: classification.evidenceText,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("codex_reset_events")
      .upsert(row, { onConflict: "source_type,source_external_id", ignoreDuplicates: false });

    if (error) throw error;
    accepted.push({ id: post.id, status: classification.status, kind: classification.kind });
  }

  return accepted;
}
