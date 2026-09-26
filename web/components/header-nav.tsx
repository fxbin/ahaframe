"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, LocaleSource } from "@/lib/content";
import { segmentForLocale } from "@/lib/content";

export function HeaderNav({ locale, labels }: { locale: Locale; labels: LocaleSource["ui"]["nav"] }) {
  const segment = segmentForLocale(locale);
  const pathname = usePathname() || "";
  const items = [
    { key: "courses", title: labels.lessons, href: `/${segment}/courses/`, mobile: "" },
    { key: "guides", title: labels.guides, href: `/${segment}/guides/`, mobile: "nav-medium" },
    { key: "tools", title: labels.tools, href: `/${segment}/tools/codex-reset/`, mobile: "nav-medium" },
    { key: "learning", title: labels.roadmap, href: `/${segment}/learning/`, mobile: "nav-large" },
    { key: "pricing", title: labels.pricing, href: `/${segment}/pricing/`, mobile: "nav-wide" },
  ];

  return (
    <nav className="site-header__nav glass-nav flex items-center gap-3 text-sm sm:gap-6 lg:gap-7" aria-label={locale === "zh-CN" ? "主导航" : "Primary navigation"}>
      {items.map((item) => {
        const active = pathname === item.href.slice(0, -1) || pathname.startsWith(item.href);
        return (
          <Link key={item.key} className={`transition ${item.mobile} ${active ? "nav--active" : ""}`}
            href={item.href} aria-current={active ? "page" : undefined}>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
