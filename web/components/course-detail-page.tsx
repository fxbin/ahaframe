import Link from "next/link";
import { localizedPath, segmentForLocale, type Locale } from "@/lib/content";
import type { CourseCatalogItem } from "@/lib/course-catalog-server";

interface CourseDetailPageProps {
  locale: Locale;
  course: CourseCatalogItem;
}

export function CourseDetailPage({ locale, course }: CourseDetailPageProps) {
  const segment = segmentForLocale(locale);
  const labels = locale === "zh-CN"
    ? {
        back: "返回全部课程",
        outcome: "学习目标",
        deliverable: "最终产出",
        structure: "课程结构",
        topics: "个主题",
        practice: "Practice",
        practiceCopy: "在关键节点进入真实场景，而不是只读完内容。",
        open: "开始练习",
        noPractice: "这一条路径的互动练习正在扩展。",
      }
    : {
        back: "Back to all courses",
        outcome: "Learning goal",
        deliverable: "What you will build",
        structure: "Course structure",
        topics: "topics",
        practice: "Practice",
        practiceCopy: "Enter real scenarios at the moments where reading is not enough.",
        open: "Open practice",
        noPractice: "Interactive practice for this path is being expanded.",
      };

  return (
    <main className="course-detail-page">
      <section className="border-b border-[var(--border)] py-10 sm:py-16">
        <div className="shell max-w-5xl">
          <Link className="quiet-link text-sm" href={`/${segment}/courses/`}>← {labels.back}</Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="editorial-kicker">{course.path.difficulty}</p>
              <h1 className="editorial-display mt-5 text-5xl leading-[0.98] sm:text-6xl lg:text-[4.5rem]">{course.path.title}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">{course.path.description}</p>
            </div>
            <dl className="course-summary-panel">
              <div>
                <dt>{labels.outcome}</dt>
                <dd>{course.path.goal}</dd>
              </div>
              <div>
                <dt>{labels.deliverable}</dt>
                <dd>{course.path.deliverable}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
            <section>
              <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{labels.structure}</h2>
              <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {course.path.milestones.map((milestone, index) => (
                  <article key={milestone.id} className="grid gap-3 py-6 sm:grid-cols-[44px_1fr_auto] sm:items-center">
                    <span className="course-number">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="font-[family-name:var(--font-editorial)] text-xl font-semibold tracking-[-0.03em]">{milestone.title}</h3>
                    <span className="text-xs text-[var(--muted)]">{milestone.conceptIds.length} {labels.topics}</span>
                  </article>
                ))}
              </div>
            </section>

            <aside className="course-practice-panel">
              <p className="editorial-kicker">{labels.practice}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{labels.practiceCopy}</p>
              {course.practices.length ? (
                <div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {course.practices.map((practice) => (
                    <Link key={practice.id} className="group block py-5" href={localizedPath(`/${practice.route}`, locale)}>
                      <span className="technical-label block text-[10px] text-[var(--muted)]">{practice.nodeType}</span>
                      <strong className="mt-2 block font-[family-name:var(--font-editorial)] text-xl font-semibold tracking-[-0.03em]">{practice.title}</strong>
                      <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{practice.description}</span>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">{labels.open} <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">{labels.noPractice}</p>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
