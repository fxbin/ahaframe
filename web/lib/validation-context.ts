import type { Locale } from "@/lib/content";

const IDENTITY_KEY = "ahaframe_validation_identity_v1";
const SESSION_KEY = "ahaframe_validation_session_v1";
const ATTR_KEY = "ahaframe_validation_attribution_v1";
const COHORT_KEY = "ahaframe_validation_cohort_v1";

interface Identity {
  anonymousUserId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
}

interface Session {
  sessionId: string;
  startedAt: string;
}

interface Touch {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
}

interface Attribution {
  firstTouch: Touch;
  sessionTouch: Touch;
}

interface RouteMeta {
  pageType: string;
  layer: string;
  labId?: string;
  labVersion?: string;
}

export interface ValidationContext {
  anonymousUserId: string;
  sessionId: string;
  firstSeenAt: string;
  visitCount: number;
  returnVisit: boolean;
  cohortId: string;
  locale: Locale;
  pageType: string;
  layer: string;
  labId: string;
  labVersion: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  firstUtmSource: string;
  referrer: string;
  deviceClass: string;
}

const ROUTES: Record<string, RouteMeta> = {
  "": { pageType: "landing", layer: "Overview" },
  "learning/": { pageType: "learning", layer: "Learning System" },
  "lessons/token-playground/": { pageType: "lesson", labId: "token-playground", labVersion: "1.0.0", layer: "Foundation" },
  "lessons/context-window/": { pageType: "lesson", labId: "context-window", labVersion: "1.0.0", layer: "Context" },
  "lessons/agent-loop/": { pageType: "lesson", labId: "agent-loop", labVersion: "1.0.0", layer: "Loop" },
  "labs/instruction-conflict/": { pageType: "lab", labId: "instruction-conflict", labVersion: "1.0.0", layer: "Prompt" },
  "labs/rag-failure/": { pageType: "lab", labId: "rag-failure", labVersion: "1.0.0", layer: "Context" },
  "labs/context-compression/": { pageType: "lab", labId: "context-compression", labVersion: "1.0.0", layer: "Context" },
  "labs/agent-reliability/": { pageType: "lab", labId: "agent-reliability", labVersion: "1.0.0", layer: "Harness" },
  "labs/agent-workflow-graph/": { pageType: "lab", labId: "agent-workflow-graph", labVersion: "1.0.0", layer: "Graph" },
  "labs/evaluation-failure/": { pageType: "lab", labId: "evaluation-failure", labVersion: "1.0.0", layer: "Evaluation" },
  "build/reliable-support-agent/": { pageType: "capstone", labId: "reliable-support-agent", labVersion: "2.0.0", layer: "Integrated" },
  "pricing/": { pageType: "pricing", layer: "Commercial" },
  "early-access/": { pageType: "waitlist", layer: "Commercial" },
};

function read<T>(store: Storage, key: string, fallback: T): T {
  try {
    return (JSON.parse(store.getItem(key) || "") as T) || fallback;
  } catch {
    return fallback;
  }
}

function write(store: Storage, key: string, value: unknown) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes. Validation must not block product use.
  }
}

function uuid(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeCohort(value: unknown): string {
  const parsed = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,79}$/.test(parsed) ? parsed : "";
}

function currentTouch(): Touch {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    referrer: document.referrer || "",
  };
}

function routeMeta(): RouteMeta & { locale: Locale } {
  const path = window.location.pathname || "/";
  const match = path.match(/^\/([^/]+)\/(.*)$/);
  const prefix = match?.[1] || "";
  const locale: Locale = prefix === "zh-cn" ? "zh-CN" : "en";
  const relative = prefix === "en" || prefix === "zh-cn" ? (match?.[2] || "") : path.replace(/^\/+/, "");
  return { ...(ROUTES[relative] || { pageType: "other", layer: "Other" }), locale };
}

function deviceClass(): string {
  const width = window.innerWidth || 0;
  return width && width < 760 ? "mobile" : width && width < 1100 ? "tablet" : "desktop";
}

function ensureIdentity() {
  const now = new Date().toISOString();
  let identity = read<Identity | null>(localStorage, IDENTITY_KEY, null);
  if (!identity?.anonymousUserId) {
    identity = { anonymousUserId: uuid(), firstSeenAt: now, lastSeenAt: now, visitCount: 0 };
  }

  let session = read<Session | null>(sessionStorage, SESSION_KEY, null);
  if (!session?.sessionId) {
    session = { sessionId: uuid(), startedAt: now };
    identity.visitCount = Number(identity.visitCount || 0) + 1;
    identity.lastSeenAt = now;
    write(localStorage, IDENTITY_KEY, identity);
    write(sessionStorage, SESSION_KEY, session);

    const incoming = currentTouch();
    const prior = read<{ firstTouch: Touch } | null>(localStorage, ATTR_KEY, null);
    const attribution: Attribution = { firstTouch: prior?.firstTouch || incoming, sessionTouch: incoming };
    write(sessionStorage, ATTR_KEY, attribution);
    if (!prior) write(localStorage, ATTR_KEY, { firstTouch: incoming });

    const params = new URLSearchParams(window.location.search);
    const incomingCohort = normalizeCohort(params.get("cohort"));
    const cohort = incomingCohort || normalizeCohort(read(localStorage, COHORT_KEY, ""));
    write(sessionStorage, COHORT_KEY, cohort);
    if (cohort) write(localStorage, COHORT_KEY, cohort);
  }

  const attribution = read<Attribution>(sessionStorage, ATTR_KEY, {
    firstTouch: currentTouch(),
    sessionTouch: currentTouch(),
  });
  const cohortId = normalizeCohort(read(sessionStorage, COHORT_KEY, read(localStorage, COHORT_KEY, "")));
  return { identity, session, attribution, cohortId };
}

export function getValidationContext(): ValidationContext {
  const base = ensureIdentity();
  const meta = routeMeta();
  const touch = base.attribution.sessionTouch || currentTouch();
  const first = base.attribution.firstTouch || touch;
  const visits = Number(base.identity.visitCount || 1);

  return {
    anonymousUserId: base.identity.anonymousUserId,
    sessionId: base.session.sessionId,
    firstSeenAt: base.identity.firstSeenAt,
    visitCount: visits,
    returnVisit: visits > 1,
    cohortId: base.cohortId,
    locale: meta.locale,
    pageType: meta.pageType,
    layer: meta.layer,
    labId: meta.labId || "",
    labVersion: meta.labVersion || "",
    utmSource: touch.utmSource || "",
    utmMedium: touch.utmMedium || "",
    utmCampaign: touch.utmCampaign || "",
    firstUtmSource: first.utmSource || "",
    referrer: touch.referrer || "",
    deviceClass: deviceClass(),
  };
}
