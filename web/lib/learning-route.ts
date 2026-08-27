import type { Locale } from "@/lib/content";

export function localizeLearningRoute(route: string, locale: Locale): string {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  return `/${segment}${route}`;
}
