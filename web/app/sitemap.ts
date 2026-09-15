import type { MetadataRoute } from "next";
import { getLocaleSource, segmentForLocale, type Locale } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ahaframe.com";
const LOCALES: Locale[] = ["en", "zh-CN"];
const TOOL_ROUTES = [
  "tools/codex-reset/",
  "tools/codex-reset/history/",
  "tools/codex-reset/banked-reset/",
  "tools/codex-reset/usage-limits/",
] as const;

function routeUrl(locale: Locale, relative: string): string {
  const segment = segmentForLocale(locale);
  const normalized = relative.replace(/^\/+/, "");
  return `${SITE_URL}/${segment}/${normalized}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [en, zh] = await Promise.all([getLocaleSource("en"), getLocaleSource("zh-CN")]);
  if (JSON.stringify(en.availableRoutes) !== JSON.stringify(zh.availableRoutes)) {
    throw new Error("Sitemap generation requires exact en/zh-CN public-route parity.");
  }

  const sources = { en, "zh-CN": zh } as const;
  return LOCALES.flatMap((locale) => {
    const routes = [...sources[locale].availableRoutes, ...TOOL_ROUTES];
    return routes.map((relative) => ({
      url: routeUrl(locale, relative),
      alternates: {
        languages: {
          en: routeUrl("en", relative),
          "zh-CN": routeUrl("zh-CN", relative),
          "x-default": routeUrl("en", relative),
        },
      },
    }));
  });
}
