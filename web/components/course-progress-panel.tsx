"use client";

import Link from "next/link";
import { useGuideProductProgress } from "@/hooks/use-guide-product-progress";
import type { Locale } from "@/lib/content";
import { guideEvidenceState, practiceCompleted } from "@/lib/learning-progress";

interface CourseProgressGuide {
  conceptId: string;
  slug: string;
  title: string;
}

interface CourseProgressPractice {
  id: string;
  title: string;
  route: string;
}

interface CourseProgressPanelProps {
  locale: Locale;
  pathId: string;
  pathSlug: string;
  guides: CourseProgressGuide[];
  practices: CourseProgressPractice[];
}

function segmentFor(locale: Locale) {
  return locale === "zh-CN" ? "zh-cn" : "en";
}

function localizedPracticeRoute(route: string, locale: Locale) {
  const segment = segmentFor(locale);
  const normalized = route.replace(/^\/+/, "");
  return `/${segment}/${normalized}`;
}

export function CourseProgressPanel({ locale, pathId, pathSlug, guides, practices }: CourseProgressPanelProps) {
  const progress = useGuideProductProgress();
  const readGuides = guides.filter((guide) => guideEvidenceState(progress, guide.conceptId) === "READ");
  const practiced = practices.filter((practice) => practiceCompleted(progress, practice.id));
  const firstUnread = guides.find((guide) => guideEvidenceState(progress, guide.conceptId) !== "READ") ?? null;
  const firstUnpracticed = practices.find((practice) => !practiceCompleted(progress, practice.id)) ?? null;
  const segment = segmentFor(locale);
  const copy = locale === "zh-CN"
    ? {
        label: "本地学习记录",
        guides: "个可用 Guide 已读",
        practices: "个 Practice 已完成",
        continue: "继续学习",
        done: "当前 Course 的可记录步骤都已有证据",
        note: "只统计已发布 Guide 与有确定完成信号的 Practice，不把浏览行为解释为掌握。",
      }
    : {
        label: "Local learning evidence",
        guides: "available Guides read",
        practices: "Practices completed",
        continue: "Continue learning",
        done: "All trackable steps in this Course have evidence",
        note: "Counts only published Guides and Practice completion signals; page views are never presented as mastery.",
      };

  const target = firstUnread
    ? {
        title: firstUnread.title,
        href: `/${segment}/guides/${firstUnread.slug}/?path=${encodeURIComponent(pathSlug)}`,
        kind: "guide",
      }
    : firstUnpracticed
      ? {
          title: firstUnpracticed.title,
          href: localizedPracticeRoute(firstUnpracticed.route, locale),
          kind: "practice",
        }
      : null;

  return (
    <section className="border-b border-[var(--border)] py-7" data-course-progress={pathId}>
      <div className="shell max-w-5xl">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="technical-label">{copy.label}</p>
            <p className="mt-2 text-sm">
              <strong data-course-guides-read>{readGuides.length} / {guides.length}</strong> {copy.guides}
              <span className="mx-2 text-[var(--muted)]" aria-hidden="true">·</span>
              <strong data-course-practices-completed>{practiced.length} / {practices.length}</strong> {copy.practices}
            </p>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--muted)]">{copy.note}</p>
          </div>
          {target ? (
            <Link
              className="editorial-text-link"
              href={target.href}
              data-course-continue={target.kind}
              data-event="learning_continued"
            >
              {copy.continue}: {target.title} <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="text-sm font-semibold" data-course-progress-complete>{copy.done}</span>
          )}
        </div>
      </div>
    </section>
  );
}
