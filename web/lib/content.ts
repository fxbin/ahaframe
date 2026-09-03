import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Locale = "en" | "zh-CN";
export type LocaleSegment = "en" | "zh-cn";
export type Pair = [string, string];

export const SUPPORTED_SEGMENTS: readonly LocaleSegment[] = ["en", "zh-cn"];

const SEGMENT_TO_LOCALE: Record<LocaleSegment, Locale> = {
  en: "en",
  "zh-cn": "zh-CN",
};

const LOCALE_TO_SEGMENT: Record<Locale, LocaleSegment> = {
  en: "en",
  "zh-CN": "zh-cn",
};

const CONTENT_ROOT = (() => {
  const fromRepositoryRoot = path.join(process.cwd(), "content");
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : path.resolve(process.cwd(), "..", "content");
})();

export interface LocaleSource {
  locale: Locale;
  routePrefix: LocaleSegment;
  availableRoutes: string[];
  brand: string;
  ui: {
    nav: {
      lessons: string;
      guides: string;
      roadmap: string;
      pricing: string;
      about: string;
      early_access: string;
      menu: string;
    };
    footer: {
      tagline: string;
      sitemap: string;
      about: string;
      early_access: string;
    };
    language: Record<Locale, string>;
  };
}

export interface MarketingContent {
  locale: Locale;
  pricing: {
    title: string;
    description: string;
    kicker: string;
    headlineBefore: string;
    headlineAccent: string;
    intro: string;
    statusLabel: string;
    statusCopy: string;
    plans: Array<{
      name: string;
      badge: string;
      description: string;
      price: string;
      suffix: string;
      items: string[];
      cta: string;
      href: string;
      event: string;
    }>;
    ctaTitle: string;
    ctaCopy: string;
    ctaButton: string;
  };
  earlyAccess: {
    title: string;
    description: string;
    eyebrow: string;
    headlineBefore: string;
    headlineAccent: string;
    intro: string;
    emailLabel: string;
    placeholder: string;
    button: string;
    trustNote: string;
    successTitle: string;
    successCopy: string;
    successLink: string;
    cards: string[][];
  };
}

export interface GuideContent {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faq: Array<{ q: string; a: string }>;
  note: string;
}

export interface LessonContent {
  name: string;
  category: string;
  level: string;
  minutes: number;
  description: string;
  seoTitle: string;
  quick: string;
  learn: string[];
  path: Array<{ name: string; description: string; state?: string }>;
  takeaways: Pair[];
  challenge: { title: string; body: string };
  guide: GuideContent;
  next: {
    title: string;
    description: string;
    href: string;
    query?: string;
    button: string;
    event?: string;
  };
}

export interface FoundationContent {
  locale: Locale;
  ui: Record<string, string>;
  lessons: Record<string, LessonContent>;
}

export interface LabContent {
  name: string;
  layer: string;
  level: string;
  minutes: number;
  seoTitle: string;
  description: string;
  hero: string;
  quick: string;
  interactive?: Record<string, unknown>;
  takeaways?: Pair[];
  guide?: GuideContent;
  challenge?: {
    title: string;
    body: string;
    href?: string;
    query?: string;
    button?: string;
    event?: string;
  };
  next?: {
    title: string;
    description: string;
    href: string;
    query?: string;
    button: string;
    event?: string;
  };
}

interface LabDomainContent {
  locale: Locale;
  labs: Record<string, LabContent>;
}

async function loadJson<T>(filename: string): Promise<T> {
  const source = await readFile(path.join(CONTENT_ROOT, filename), "utf8");
  return JSON.parse(source) as T;
}

function localizedFilename(domain: string | null, locale: Locale): string {
  return domain ? `${domain}.${locale}.json` : `${locale}.json`;
}

export function localeFromSegment(segment: string): Locale | null {
  return Object.prototype.hasOwnProperty.call(SEGMENT_TO_LOCALE, segment)
    ? SEGMENT_TO_LOCALE[segment as LocaleSegment]
    : null;
}

export function segmentForLocale(locale: Locale): LocaleSegment {
  return LOCALE_TO_SEGMENT[locale];
}

export function localizedPath(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href;
  const segment = segmentForLocale(locale);
  if (/^\/(en|zh-cn)(\/|$)/.test(href)) {
    return href.replace(/^\/(en|zh-cn)(?=\/|$)/, `/${segment}`);
  }
  return `/${segment}${href}`;
}

export function localeAlternates(relativePath: string): Record<string, string> {
  const normalized = relativePath.replace(/^\/+/, "");
  return {
    en: `/en/${normalized}`,
    "zh-CN": `/zh-cn/${normalized}`,
    "x-default": `/en/${normalized}`,
  };
}

export async function getLocaleSource(locale: Locale): Promise<LocaleSource> {
  return loadJson<LocaleSource>(localizedFilename(null, locale));
}

export async function getMarketingContent(locale: Locale): Promise<MarketingContent> {
  return loadJson<MarketingContent>(localizedFilename("marketing", locale));
}

export async function getFoundationContent(locale: Locale): Promise<FoundationContent> {
  return loadJson<FoundationContent>(localizedFilename("foundation", locale));
}

const LAB_DOMAINS = ["production-prompt-context", "production-harness", "production-graph-evaluation"] as const;

export async function getLabContent(locale: Locale, slug: string): Promise<LabContent | null> {
  for (const domain of LAB_DOMAINS) {
    const source = await loadJson<LabDomainContent>(localizedFilename(domain, locale));
    const lab = source.labs[slug];
    if (lab) return lab;
  }
  return null;
}
