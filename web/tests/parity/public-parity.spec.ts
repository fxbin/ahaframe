import { expect, test, type Browser, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LEGACY_BASE = "http://127.0.0.1:4100";
const NEXT_BASE = "http://127.0.0.1:4200";

type LocaleSource = { availableRoutes: string[] };

const en = JSON.parse(readFileSync(resolve(process.cwd(), "../content/en.json"), "utf8")) as LocaleSource;
const zh = JSON.parse(readFileSync(resolve(process.cwd(), "../content/zh-CN.json"), "utf8")) as LocaleSource;
if (JSON.stringify(en.availableRoutes) !== JSON.stringify(zh.availableRoutes)) {
  throw new Error("Parity browser gate requires exact en/zh-CN route parity.");
}

function localizedPath(segment: "en" | "zh-cn", relative: string): string {
  const normalized = relative.replace(/^\/+/, "");
  return `/${segment}/${normalized}`;
}

const LOCALIZED_ROUTES = [
  ...en.availableRoutes.map((route) => localizedPath("en", route)),
  ...zh.availableRoutes.map((route) => localizedPath("zh-cn", route)),
];
const ALLOWED_INTERNAL_PATHS = new Set(["/", ...LOCALIZED_ROUTES.map(normalizePath)]);

function normalizeSpace(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizePath(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stable(nested)]),
    );
  }
  return value;
}

async function metadataSnapshot(page: Page) {
  return page.evaluate(() => {
    const meta = (selector: string) => document.querySelector<HTMLMetaElement>(selector)?.content || "";
    const link = (selector: string) => document.querySelector<HTMLLinkElement>(selector)?.href || "";
    const alternates = Object.fromEntries(
      Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'))
        .map((item) => [item.hreflang, item.href])
        .sort(([a], [b]) => a.localeCompare(b)),
    );
    const structuredData = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'))
      .map((item) => JSON.parse(item.textContent || "null"));

    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: link('link[rel="canonical"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogUrl: meta('meta[property="og:url"]'),
      robots: meta('meta[name="robots"]'),
      alternates,
      structuredData,
      h1: document.querySelector("h1")?.textContent || "",
      bodyText: document.body.textContent || "",
    };
  });
}

function canonicalStructuredData(values: unknown[]): string[] {
  return values.map((value) => JSON.stringify(stable(value))).sort();
}

async function noJsPage(browser: Browser) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  return { context, page: await context.newPage() };
}

function internalPath(href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  const parsed = new URL(href, NEXT_BASE);
  if (!["127.0.0.1", "localhost", "ahaframe.com", "www.ahaframe.com"].includes(parsed.hostname)) return null;
  return normalizePath(parsed.pathname);
}

function sitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).sort();
}

test.describe("AhaFrame M4 parity", () => {
  test("26 localized routes preserve crawlable SEO and structured-data semantics", async ({ browser }) => {
    const legacy = await noJsPage(browser);
    const next = await noJsPage(browser);

    try {
      for (const path of LOCALIZED_ROUTES) {
        const [legacyResponse, nextResponse] = await Promise.all([
          legacy.page.goto(`${LEGACY_BASE}${path}`, { waitUntil: "domcontentloaded" }),
          next.page.goto(`${NEXT_BASE}${path}`, { waitUntil: "domcontentloaded" }),
        ]);
        expect(legacyResponse?.status(), `legacy ${path}`).toBe(200);
        expect(nextResponse?.status(), `next ${path}`).toBe(200);

        const [before, after] = await Promise.all([metadataSnapshot(legacy.page), metadataSnapshot(next.page)]);
        expect(after.title, `${path} title`).toBe(before.title);
        expect(after.description, `${path} description`).toBe(before.description);
        expect(after.canonical, `${path} canonical`).toBe(before.canonical);
        expect(after.ogTitle, `${path} og:title`).toBe(before.ogTitle);
        expect(after.ogDescription, `${path} og:description`).toBe(before.ogDescription);
        expect(after.ogUrl, `${path} og:url`).toBe(before.ogUrl);
        expect(after.alternates, `${path} hreflang`).toEqual(before.alternates);
        expect(canonicalStructuredData(after.structuredData), `${path} JSON-LD`).toEqual(canonicalStructuredData(before.structuredData));
        expect(normalizeSpace(after.h1), `${path} crawlable H1`).toBe(normalizeSpace(before.h1));
        expect(normalizeSpace(after.bodyText).length, `${path} crawlable body`).toBeGreaterThan(200);
        expect(after.robots.toLowerCase(), `${path} pre-cutover noindex`).toContain("noindex");
        expect(after.robots.toLowerCase(), `${path} pre-cutover nofollow`).toContain("nofollow");
      }
    } finally {
      await legacy.context.close();
      await next.context.close();
    }
  });

  test("Next internal links stay inside the exact public route contract and resolve", async ({ browser, request }) => {
    const { context, page } = await noJsPage(browser);
    const discovered = new Set<string>();

    try {
      for (const route of LOCALIZED_ROUTES) {
        const response = await page.goto(`${NEXT_BASE}${route}`, { waitUntil: "domcontentloaded" });
        expect(response?.status(), route).toBe(200);
        const hrefs = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
        for (const href of hrefs) {
          const path = internalPath(href);
          if (path) discovered.add(path);
        }
      }
    } finally {
      await context.close();
    }

    const unexpected = [...discovered].filter((path) => !ALLOWED_INTERNAL_PATHS.has(path)).sort();
    expect(unexpected, "stale or out-of-contract internal routes").toEqual([]);

    for (const path of [...discovered].sort()) {
      const response = await request.get(`${NEXT_BASE}${path}`);
      expect(response.status(), `internal link ${path}`).toBe(200);
    }
  });

  test("sitemap keeps the 26 canonical localized URLs while robots blocks pre-cutover indexing", async ({ request }) => {
    const [legacySitemap, nextSitemap, nextRobots] = await Promise.all([
      request.get(`${LEGACY_BASE}/sitemap.xml`),
      request.get(`${NEXT_BASE}/sitemap.xml`),
      request.get(`${NEXT_BASE}/robots.txt`),
    ]);

    expect(legacySitemap.status()).toBe(200);
    expect(nextSitemap.status()).toBe(200);
    expect(nextRobots.status()).toBe(200);

    const legacyLocations = sitemapLocations(await legacySitemap.text());
    const nextLocations = sitemapLocations(await nextSitemap.text());
    expect(nextLocations).toHaveLength(26);
    expect(nextLocations).toEqual(legacyLocations);

    const robots = await nextRobots.text();
    expect(robots).toMatch(/User-Agent:\s*\*/i);
    expect(robots).toMatch(/Disallow:\s*\//i);
    expect(robots).toContain("https://ahaframe.com/sitemap.xml");
  });

  test("critical Next routes keep the approved visual system and mobile layout without runtime errors", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const critical = [
      "/en/",
      "/en/lessons/token-playground/",
      "/en/labs/context-compression/",
      "/en/labs/rag-failure/",
      "/en/build/reliable-support-agent/",
      "/zh-cn/labs/rag-failure/",
    ];

    try {
      for (const path of critical) {
        errors.length = 0;
        const response = await page.goto(`${NEXT_BASE}${path}`, { waitUntil: "domcontentloaded" });
        expect(response?.status(), path).toBe(200);
        await page.waitForTimeout(250);

        const visual = await page.evaluate(() => {
          const root = getComputedStyle(document.documentElement);
          return {
            bg: root.getPropertyValue("--bg").trim().toLowerCase(),
            text: root.getPropertyValue("--text").trim().toLowerCase(),
            primary: root.getPropertyValue("--primary").trim().toLowerCase(),
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          };
        });

        expect(visual.bg, `${path} warm-white token`).toBe("#fbfbf8");
        expect(visual.text, `${path} graphite token`).toBe("#17201e");
        expect(visual.primary, `${path} teal token`).toBe("#0f766e");
        expect(visual.scrollWidth, `${path} horizontal overflow`).toBeLessThanOrEqual(visual.clientWidth + 1);
        expect(errors, `${path} page errors`).toEqual([]);
      }
    } finally {
      await context.close();
    }
  });
});
