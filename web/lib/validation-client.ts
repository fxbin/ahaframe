"use client";

import { getValidationContext } from "@/lib/validation-context";

export type ValidationEventProps = Record<string, string | number | boolean | null | undefined>;
export type AhaRating = "no" | "little" | "yes" | "aha";
export type ProductFeedbackType = "bug" | "confusing" | "feature" | "other";

const PRIVATE_EVENT_PROP = /(email|message|note|rationale|free.?text|contact)/i;
const STRONG_AHA = new Set<AhaRating>(["yes", "aha"]);

function uuid(prefix: string) {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function cleanEventProps(props: ValidationEventProps): Record<string, string | number | boolean | null> {
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (PRIVATE_EVENT_PROP.test(key) || value === undefined) continue;
    if (typeof value === "string") clean[key] = value.slice(0, 240);
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean" || value === null) clean[key] = value;
  }
  return clean;
}

async function post(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const response = await fetch("/api/validation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  });
  if (!response.ok) throw new Error("validation submission failed");
  return response;
}

export function trackValidationEvent(name: string, props: ValidationEventProps = {}) {
  if (typeof window === "undefined") return null;
  const context = getValidationContext();
  const payload = {
    schemaVersion: 1,
    eventId: uuid("evt"),
    name: name.slice(0, 120),
    props: cleanEventProps(props),
    path: window.location.pathname,
    ts: new Date().toISOString(),
    ...context,
  };

  window.dispatchEvent(new CustomEvent("ahaframe:validation-event", { detail: payload }));

  const body = JSON.stringify(payload);
  let sent = false;
  try {
    if (navigator.sendBeacon) {
      sent = navigator.sendBeacon("/api/validation", new Blob([body], { type: "application/json" }));
    }
  } catch {
    sent = false;
  }
  if (!sent) void post(payload).catch(() => {});
  return payload;
}

export async function submitAhaFeedback(rating: AhaRating, note = "") {
  const context = getValidationContext();
  if (!context.labId) throw new Error("Aha feedback requires a Lab or Mission context.");
  const normalizedNote = note.trim().slice(0, 1200);
  const payload = {
    feedbackId: uuid("feedback"),
    anonymousUserId: context.anonymousUserId,
    sessionId: context.sessionId,
    cohortId: context.cohortId,
    locale: context.locale,
    layer: context.layer,
    labId: context.labId,
    labVersion: context.labVersion,
    path: window.location.pathname,
    rating,
    strongAha: STRONG_AHA.has(rating),
    note: normalizedNote,
    submittedAt: new Date().toISOString(),
    deviceClass: context.deviceClass,
    attribution: {
      cohortId: context.cohortId,
      utmSource: context.utmSource,
      utmMedium: context.utmMedium,
      utmCampaign: context.utmCampaign,
      firstUtmSource: context.firstUtmSource,
      referrer: context.referrer,
    },
  };
  await post(payload);
  trackValidationEvent("aha_feedback_submitted", {
    rating,
    strongAha: STRONG_AHA.has(rating),
    qualitativePresent: Boolean(normalizedNote),
    remote: true,
  });
  return payload;
}

export async function submitProductFeedback(feedbackType: ProductFeedbackType, message: string, email = "") {
  const normalizedMessage = message.trim().slice(0, 4000);
  const normalizedEmail = email.trim().toLowerCase().slice(0, 320);
  if (!normalizedMessage) throw new RangeError("Feedback message is required.");
  if (normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new RangeError("Enter a valid email address.");

  const context = getValidationContext();
  const payload = {
    productFeedbackId: uuid("product_feedback"),
    anonymousUserId: context.anonymousUserId,
    sessionId: context.sessionId,
    cohortId: context.cohortId,
    locale: context.locale,
    pageType: context.pageType,
    layer: context.layer,
    labId: context.labId,
    labVersion: context.labVersion,
    feedbackType,
    message: normalizedMessage,
    email: normalizedEmail,
    path: window.location.pathname,
    pageUrl: `${window.location.origin}${window.location.pathname}`,
    submittedAt: new Date().toISOString(),
    deviceClass: context.deviceClass,
    attribution: {
      cohortId: context.cohortId,
      utmSource: context.utmSource,
      utmMedium: context.utmMedium,
      utmCampaign: context.utmCampaign,
      firstUtmSource: context.firstUtmSource,
      referrer: context.referrer,
    },
  };
  await post(payload);
  trackValidationEvent("product_feedback_submitted", {
    feedbackType,
    emailPresent: Boolean(normalizedEmail),
    remote: true,
  });
  return payload;
}
