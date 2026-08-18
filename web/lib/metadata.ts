import type { Metadata } from "next";
import { localeAlternates, segmentForLocale, type Locale } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ahaframe.com";

export function pageMetadata(locale: Locale, title: string, description: string, relativePath = ""): Metadata {
  const segment = segmentForLocale(locale);
  const normalized = relativePath.replace(/^\/+/, "");
  const pathname = `/${segment}/${normalized}`;
  const canonical = `${SITE_URL}${pathname}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        Object.entries(localeAlternates(normalized)).map(([key, value]) => [key, `${SITE_URL}${value}`]),
      ),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "AhaFrame",
      title,
      description,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      alternateLocale: [locale === "zh-CN" ? "en_US" : "zh_CN"],
    },
  };
}
