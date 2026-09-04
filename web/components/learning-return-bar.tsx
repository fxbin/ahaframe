"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/content";

interface ReturnNode {
  id: string;
  title: string;
  route: string;
}

interface LearningReturnBarProps {
  locale: Locale;
  nodes: ReturnNode[];
}

export function LearningReturnBar({ locale, nodes }: LearningReturnBarProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get("returnTo");
  const target = id ? nodes.find((node) => node.id === id) ?? null : null;

  if (!target) return null;
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  const prefix = locale === "zh-CN" ? "你正在补充前置内容。完成后返回" : "You are backfilling a prerequisite. Return to";

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="shell flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--brand-accent)] py-3 pl-4 text-sm">
        <span className="text-[var(--muted)]">{prefix} <strong className="text-[var(--text)]">{target.title}</strong></span>
        <Link
          href={`/${segment}${target.route}`}
          className="editorial-text-link"
          data-event="learning_prerequisite_backfill_completed"
          data-content-id={target.id}
        >
          {locale === "zh-CN" ? "返回事故" : "Return to incident"} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
