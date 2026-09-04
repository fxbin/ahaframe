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
const LOCALES: Locale[] = ["en", "zh-CN"];

function targetPath(pathname: string, locale: Locale): string {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  if (/^\/(en|zh-cn)(\/|$)/.test(pathname)) return pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, `/${segment}`);
  return `/${segment}/`;
}

function localeCode(locale: Locale): string { return locale === "zh-CN" ? "ZH-CN" : "EN"; }

export function LocaleSwitch({ locale, labels }: LocaleSwitchProps) {
  const pathname = usePathname() || "/";
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const accessibleLabel = locale === "zh-CN" ? "语言选择" : "Language selector";

  return (
    <details className="group relative" data-testid="locale-switch">
      <summary
        className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-[6px] border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] [&::-webkit-details-marker]:hidden"
        aria-label={accessibleLabel}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
        <span>{localeCode(locale)}</span><span aria-hidden="true" className="text-[10px] transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="absolute right-0 z-[70] mt-2 min-w-48 overflow-hidden rounded-[8px] border border-[var(--border)] bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
        {LOCALES.map((option) => {
          const current = option === locale;
          const row = <span className="flex w-full items-center justify-between gap-5 rounded-[6px] px-3 py-2.5 text-sm"><span>{labels[option]}</span><span className="font-mono text-[10px] font-bold text-[var(--muted)]">{localeCode(option)}</span></span>;
          return current ? (
            <span key={option} aria-current="true" className="block bg-[var(--surface-soft)] text-[var(--text)]">{row}</span>
          ) : (
            <Link key={option} className="block text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-accent)]" href={`${targetPath(pathname, option)}${search}`} hrefLang={option} lang={option === "zh-CN" ? "zh-CN" : "en"}>{row}</Link>
          );
        })}
      </div>
    </details>
  );
}
