import { createServiceRoleClient } from "@/lib/supabase/server";

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

function mapRow(row: ResetEventRow): CodexResetEvent {
  return {
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
  };
}

export async function getCodexResetSnapshot(limit = 12): Promise<CodexResetSnapshot> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("codex_reset_events")
      .select("id,occurred_at,detected_at,status,kind,source_type,source_external_id,source_url,source_label,evidence_text")
      .eq("status", "confirmed")
      .eq("kind", "full")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    const history = ((data ?? []) as ResetEventRow[]).map(mapRow);
    return { latest: history[0] ?? null, history, dataAvailable: true };
  } catch {
    return { latest: null, history: [], dataAvailable: false };
  }
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
