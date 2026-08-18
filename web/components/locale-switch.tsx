"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale, LocaleSource } from "@/lib/content";

interface LocaleSwitchProps {
  locale: Locale;
  labels: LocaleSource["ui"]["language"];
}

function targetPath(pathname: string, locale: Locale): string {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  if (/^\/(en|zh-cn)(\/|$)/.test(pathname)) {
    return pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, `/${segment}`);
  }
  return `/${segment}/`;
}

export function LocaleSwitch({ locale, labels }: LocaleSwitchProps) {
  const pathname = usePathname() || "/";
  const [search, setSearch] = useState("");
  const otherLocale: Locale = locale === "en" ? "zh-CN" : "en";

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  return (
    <Link
      className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      href={`${targetPath(pathname, otherLocale)}${search}`}
      hrefLang={otherLocale}
    >
      {labels[otherLocale]}
    </Link>
  );
}
