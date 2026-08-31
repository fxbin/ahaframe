import Link from "next/link";
import { segmentForLocale, type Locale } from "@/lib/content";
import type { CourseCatalogItem } from "@/lib/course-catalog-server";
import type { KnowledgeMap } from "@/lib/knowledge-map";

interface CourseCatalogPageProps {
  locale: Locale;
  knowledgeMap: KnowledgeMap;
  catalog: CourseCatalogItem[];
}

export function CourseCatalogPage({ locale, knowledgeMap, catalog }: CourseCatalogPageProps) {
  const segment = segmentForLocale(locale);
  const labels = locale === "zh-CN"
    ? {
        kicker: "课程",
        title: "选一个目标，然后沿着清晰路径学习。",
        copy: "不用先理解整张知识地图。选择你现在最想解决的问题，按课程顺序学习，在关键节点进入真实 Practice。",
        courses: "全部课程",
        sections: "个章节",
        practices: "个互动练习",
        open: "查看课程",
        empty: "练习正在补充",
      }
    : {
        kicker: "Courses",
        title: "Choose a goal. Follow a clear path.",
        copy: "You do not need to understand the whole knowledge map first. Pick what you want to accomplish, learn in order, and enter real practice when it matters.",
        courses: "All courses",
        sections: "sections",
        practices: "interactive practices",
        open: "View course",
        empty: "Practice is being expanded",
      };

  return (
    <main className="course-catalog-page">
      <section className="border-b border-[var(--border)] py-16 sm:py-24">
        <div className="shell max-w-5xl">
          <p className="editorial-kicker">{labels.kicker}</p>
          <h1 className="editorial-display mt-5 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-[4.5rem]">{labels.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">{labels.copy}</p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell">
          {knowledgeMap.domains.map((domain) => {
            const courses = catalog.filter((item) => item.path.domainIds.includes(domain.id));
            if (!courses.length) return null;
            return (
              <section key={domain.id} id={domain.slug} className="course-domain-section border-t border-[var(--border)] py-10 sm:py-14">
                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                  <div>
                    <p className="font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{domain.title}</p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{domain.description}</p>
                  </div>
                  <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {courses.map((item, index) => (
                      <Link
                        key={item.path.id}
                        className="course-row group grid gap-3 py-6 sm:grid-cols-[44px_1fr_auto] sm:items-center"
                        href={`/${segment}/courses/${item.path.slug}/`}
                      >
                        <span className="course-number">{String(index + 1).padStart(2, "0")}</span>
                        <span>
                          <strong className="block font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{item.path.title}</strong>
                          <span className="mt-2 block max-w-2xl text-sm leading-6 text-[var(--muted)]">{item.path.description}</span>
                          <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                            <span>{item.path.milestones.length} {labels.sections}</span>
                            <span>·</span>
                            <span>{item.practices.length ? `${item.practices.length} ${labels.practices}` : labels.empty}</span>
                          </span>
                        </span>
                        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold sm:mt-0">
                          {labels.open} <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}

          <div className="mt-6 flex justify-center">
            <Link className="quiet-link" href={`/${segment}/learning/`}>
              {locale === "zh-CN" ? "想自由探索？打开知识地图 →" : "Want to explore freely? Open the Knowledge Map →"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
