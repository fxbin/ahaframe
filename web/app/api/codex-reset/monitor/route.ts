import { NextRequest, NextResponse } from "next/server";
import { ingestTiboPosts, syncPublicCodexResetFeed, type TiboPost } from "@/lib/codex-reset-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const X_API_BASE = process.env.X_API_BASE_URL || "https://api.x.com/2";
const TIBO_USERNAME = process.env.TIBO_X_USERNAME || "thsottiaux";

interface XUserResponse {
  data?: { id?: string };
  errors?: unknown;
}

interface XTweetsResponse {
  data?: Array<{ id: string; text: string; created_at?: string }>;
  meta?: { newest_id?: string; oldest_id?: string; result_count?: number };
  errors?: unknown;
}

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.CODEX_RESET_CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function xFetch<T>(path: string): Promise<T> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is not configured.");

  const response = await fetch(`${X_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

async function resolveTiboUserId(): Promise<string> {
  if (process.env.TIBO_X_USER_ID) return process.env.TIBO_X_USER_ID;
  const result = await xFetch<XUserResponse>(`/users/by/username/${encodeURIComponent(TIBO_USERNAME)}`);
  const id = result.data?.id;
  if (!id) throw new Error(`Could not resolve X user @${TIBO_USERNAME}.`);
  return id;
}

async function fetchRecentTiboPosts(): Promise<TiboPost[]> {
  const userId = await resolveTiboUserId();
  const params = new URLSearchParams({
    max_results: "25",
    "tweet.fields": "created_at",
    exclude: "retweets",
  });
  const result = await xFetch<XTweetsResponse>(`/users/${userId}/tweets?${params.toString()}`);
  return (result.data ?? [])
    .filter((post) => Boolean(post.created_at))
    .map((post) => ({ id: post.id, text: post.text, createdAt: post.created_at! }));
}

async function runMonitor(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!process.env.X_BEARER_TOKEN) {
      const result = await syncPublicCodexResetFeed(100);
      const source = result.primarySource === "aihot"
        ? "AIHOT /api/v1/codex-resets"
        : result.primarySource === "codex_resets"
          ? "codex-resets.com fallback + NextReset cross-check"
          : "no usable public reset source";
      return NextResponse.json({
        ok: true,
        source,
        ...result,
        checkedAt: new Date().toISOString(),
      });
    }

    const posts = await fetchRecentTiboPosts();
    const accepted = await ingestTiboPosts(posts);
    return NextResponse.json({
      ok: true,
      source: `@${TIBO_USERNAME} via X API`,
      checked: posts.length,
      accepted,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown monitor error";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  return runMonitor(request);
}

export async function POST(request: NextRequest) {
  return runMonitor(request);
}
