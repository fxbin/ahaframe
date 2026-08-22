import { NextResponse } from "next/server";

const PRIVATE_EVENT_PROP = /(email|message|note|rationale|free.?text|contact)/i;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function cleanEventProps(value: unknown) {
  const input = object(value);
  const props: Record<string, string | number | boolean | null> = {};
  for (const [key, item] of Object.entries(input).slice(0, 40)) {
    if (PRIVATE_EVENT_PROP.test(key)) continue;
    if (typeof item === "string") props[key.slice(0, 80)] = item.slice(0, 240);
    else if (typeof item === "number" && Number.isFinite(item)) props[key.slice(0, 80)] = item;
    else if (typeof item === "boolean" || item === null) props[key.slice(0, 80)] = item;
  }
  return props;
}

function common(input: Record<string, unknown>) {
  return {
    anonymousUserId: text(input.anonymousUserId, 120),
    sessionId: text(input.sessionId, 120),
    cohortId: text(input.cohortId, 80).toLowerCase(),
    locale: text(input.locale, 16) === "zh-CN" ? "zh-CN" : "en",
    layer: text(input.layer, 80),
    labId: text(input.labId, 120),
    labVersion: text(input.labVersion, 40),
    deviceClass: text(input.deviceClass, 40),
  };
}

function eventPayload(input: Record<string, unknown>) {
  return {
    schemaVersion: 1,
    eventId: text(input.eventId, 120),
    name: text(input.name, 120),
    props: cleanEventProps(input.props),
    path: text(input.path, 500),
    ts: text(input.ts, 64),
    ...common(input),
    pageType: text(input.pageType, 80),
    visitCount: Math.max(1, Math.min(10000, Number(input.visitCount) || 1)),
    returnVisit: input.returnVisit === true,
    utmSource: text(input.utmSource, 180),
    utmMedium: text(input.utmMedium, 180),
    utmCampaign: text(input.utmCampaign, 240),
    firstUtmSource: text(input.firstUtmSource, 180),
    referrer: text(input.referrer, 1000),
  };
}

function ahaPayload(input: Record<string, unknown>) {
  return {
    feedbackId: text(input.feedbackId, 120),
    ...common(input),
    path: text(input.path, 500),
    rating: text(input.rating, 20),
    strongAha: input.strongAha === true,
    note: text(input.note, 1200),
    submittedAt: text(input.submittedAt, 64),
    attribution: object(input.attribution),
  };
}

function productFeedbackPayload(input: Record<string, unknown>) {
  return {
    productFeedbackId: text(input.productFeedbackId, 120),
    ...common(input),
    pageType: text(input.pageType, 80),
    feedbackType: text(input.feedbackType, 20),
    message: text(input.message, 4000),
    email: text(input.email, 320).toLowerCase(),
    path: text(input.path, 500),
    pageUrl: text(input.pageUrl, 1000),
    submittedAt: text(input.submittedAt, 64),
    attribution: object(input.attribution),
  };
}

export async function POST(request: Request) {
  const endpoint = process.env.AHAFRAME_VALIDATION_ENDPOINT || process.env.AHAFRAME_WAITLIST_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "validation unavailable" }, { status: 503 });
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > 24_000) {
    return NextResponse.json({ ok: false, error: "payload too large" }, { status: 413 });
  }

  let input: Record<string, unknown>;
  try {
    input = object(await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  if (input.eventId && input.name) payload = eventPayload(input);
  else if (input.productFeedbackId && input.feedbackType) payload = productFeedbackPayload(input);
  else if (input.feedbackId && input.rating) payload = ahaPayload(input);
  else return NextResponse.json({ ok: false, error: "unknown payload" }, { status: 400 });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({ ok: false }))) as Record<string, unknown>;
    if (!response.ok || result.ok !== true) {
      return NextResponse.json({ ok: false, error: "validation submission failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, kind: result.kind });
  } catch {
    return NextResponse.json({ ok: false, error: "validation submission failed" }, { status: 502 });
  }
}
