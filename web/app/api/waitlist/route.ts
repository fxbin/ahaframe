import { NextResponse } from "next/server";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const endpoint = process.env.AHAFRAME_WAITLIST_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "waitlist unavailable" }, { status: 503 });
  }

  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const email = text(input.email, 320).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const payload = {
    email,
    intent: text(input.intent, 120) || "waitlist",
    source: text(input.source, 500),
    anonymousUserId: text(input.anonymousUserId, 120),
    sessionId: text(input.sessionId, 120),
    cohortId: text(input.cohortId, 80),
    locale: text(input.locale, 16) === "zh-CN" ? "zh-CN" : "en",
    layer: text(input.layer, 80),
    labId: text(input.labId, 120),
    labVersion: text(input.labVersion, 40),
    utmSource: text(input.utmSource, 180),
    utmMedium: text(input.utmMedium, 180),
    utmCampaign: text(input.utmCampaign, 240),
    firstUtmSource: text(input.firstUtmSource, 180),
    referrer: text(input.referrer, 1000),
    deviceClass: text(input.deviceClass, 40),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({ ok: false }))) as Record<string, unknown>;
    if (!response.ok || result.ok !== true) {
      return NextResponse.json({ ok: false, error: "waitlist submission failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "waitlist submission failed" }, { status: 502 });
  }
}
