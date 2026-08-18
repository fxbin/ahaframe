"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { Locale, LocaleSource } from "@/lib/content";

interface LocaleSwitchProps {
  locale: Locale;
  labels: LocaleSource["ui"]["language"];
}

const noopSubscribe = () => () => {};

function targetPath(pathname: string, locale: Locale): string {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  if (/^\/(en|zh-cn)(\/|$)/.test(pathname)) {
    return pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, `/${segment}`);
  }
  return `/${segment}/`;
}

export function LocaleSwitch({ locale, labels }: LocaleSwitchProps) {
  const pathname = usePathname() || "/";
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const otherLocale: Locale = locale === "en" ? "zh-CN" : "en";

  return (
    <Link
      className="inline-flex items-center text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--primary)]"
      href={`${targetPath(pathname, otherLocale)}${search}`}
      hrefLang={otherLocale}
    >
      {labels[otherLocale]}
    </Link>
  );
}
