"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/content";
import type { GuidePracticeReturnTarget } from "@/lib/guides";

interface GuidePracticeReturnBarProps {
  locale: Locale;
  targets: GuidePracticeReturnTarget[];
}

export function GuidePracticeReturnBar({ locale, targets }: GuidePracticeReturnBarProps) {
  const searchParams = useSearchParams();
  const guideSlug = searchParams.get("guide");
  const target = guideSlug ? targets.find((item) => item.slug === guideSlug) ?? null : null;
  if (!target) return null;

  const requestedPath = searchParams.get("path");
  const pathContext = requestedPath ? target.paths.find((item) => item.slug === requestedPath) ?? null : null;
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  const guideHref = `/${segment}/guides/${target.slug}/${pathContext ? `?path=${encodeURIComponent(pathContext.slug)}` : ""}`;
  const nextHref = pathContext?.next
    ? `/${segment}/guides/${pathContext.next.slug}/?path=${encodeURIComponent(pathContext.slug)}`
    : null;

  const copy = locale === "zh-CN"
    ? { prefix: "你正在练习这篇 Guide 的核心判断：", course: "当前课程", back: "返回 Guide", next: "继续下一篇 Guide" }
    : { prefix: "You are practicing the judgment from:", course: "Current course", back: "Return to Guide", next: "Continue to next Guide" };

  return (
    <div
      className="border-b border-[var(--border)] bg-[var(--surface)]"
      data-guide-practice-return={target.slug}
      data-guide-practice-path={pathContext?.slug ?? "direct"}
    >
      <div className="shell flex flex-wrap items-center justify-between gap-4 border-l-2 border-[var(--brand-accent)] py-3 pl-4 text-sm">
        <div className="min-w-0">
          <span className="text-[var(--muted)]">{copy.prefix} </span>
          <strong>{target.title}</strong>
          {pathContext ? <span className="ml-2 text-xs text-[var(--muted)]">· {copy.course}: {pathContext.title}</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link className="editorial-text-link" href={guideHref} data-guide-practice-back>
            {copy.back} <span aria-hidden="true">→</span>
          </Link>
          {nextHref && pathContext?.next ? (
            <Link className="editorial-text-link" href={nextHref} data-guide-practice-next={pathContext.next.conceptId}>
              {copy.next} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
