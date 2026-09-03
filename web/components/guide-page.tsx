import Link from "next/link";
import { GuideProgressControl } from "@/components/guide-progress-control";
import type { Locale } from "@/lib/content";
import { localizedPath, segmentForLocale } from "@/lib/content";
import type { GuidePageData } from "@/lib/guides";

function copy(locale: Locale) {
  return locale === "en"
    ? {
        kicker: "CORE GUIDE",
        minutes: "min read",
        mentalModel: "Mental model",
        why: "Why it matters",
        failures: "Common failure modes",
        heuristics: "Engineering heuristics",
        takeaways: "Takeaways",
        related: "Related concepts from the Knowledge Graph",
        relatedCopy: "These relationships come from the canonical graph, not a separate Guide taxonomy.",
        practice: "Apply the concept",
        map: "Back to Knowledge Map",
        guide: "Guide",
        usedIn: "Used in",
        usedInCopy: "This Concept is reused across these canonical learning paths.",
        continue: "Continue learning",
        previous: "Previous Guide",
        next: "Next Guide",
        course: "Course",
      }
    : {
        kicker: "核心 GUIDE",
        minutes: "分钟阅读",
        mentalModel: "核心心智模型",
        why: "为什么重要",
        failures: "常见失败模式",
        heuristics: "工程启发",
        takeaways: "关键结论",
        related: "来自 Knowledge Graph 的相关知识点",
        relatedCopy: "这些关系直接来自 canonical graph，不维护第二套 Guide 分类体系。",
        practice: "把知识用起来",
        map: "返回知识地图",
        guide: "Guide",
        usedIn: "用于这些学习路径",
        usedInCopy: "这个 Concept 会在多个 canonical 学习路径中复用。",
        continue: "继续学习",
        previous: "上一篇 Guide",
        next: "下一篇 Guide",
        course: "课程",
      };
}

function practiceHref(locale: Locale, guideSlug: string, href: string, pathSlug?: string | null) {
  const params = new URLSearchParams({ guide: guideSlug });
  if (pathSlug) params.set("path", pathSlug);
  return `${localizedPath(href, locale)}?${params.toString()}`;
}

function practiceContentId(href: string): string | null {
  const route = href.split("?")[0];
  const parts = route.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

export function GuidePage({ locale, data }: { locale: Locale; data: GuidePageData }) {
  const labels = copy(locale);
  const segment = segmentForLocale(locale);
  const { guide, concept, relatedConcepts, pathMemberships, activePath } = data;
  const practiceId = guide.practice ? practiceContentId(guide.practice.href) : null;

  return (
    <main>
      <article>
        <header className="border-b border-[var(--border)] py-14 sm:py-20">
          <div className="shell">
            {activePath ? (
              <nav
                aria-label={labels.course}
                className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"
                data-guide-active-path={activePath.slug}
              >
                <Link className="quiet-link" href={`/${segment}/courses/${activePath.slug}/`}>{activePath.title}</Link>
                <span aria-hidden="true">→</span>
                <span>{activePath.milestoneTitle}</span>
              </nav>
            ) : null}
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div className="max-w-4xl">
                <p className="eyebrow-label">{labels.kicker}</p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
                  <span>{concept.kind}</span>
                  <span aria-hidden="true">·</span>
                  <span>{concept.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readingMinutes} {labels.minutes}</span>
                </div>
                <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  {guide.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{guide.summary}</p>
              </div>
              <div className="border-y border-[var(--border)] py-5 lg:border-y-0 lg:border-l lg:py-2 lg:pl-8">
                <p className="technical-label">{labels.mentalModel}</p>
                <p className="mt-3 font-[family-name:var(--font-editorial)] text-2xl leading-9 tracking-[-0.025em]">{guide.mentalModel}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="shell py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <section className="grid gap-5 border-b border-[var(--border)] pb-10 md:grid-cols-[180px_1fr] md:gap-10">
              <h2 className="technical-label pt-1">{labels.why}</h2>
              <p className="max-w-3xl text-lg leading-8">{guide.whyItMatters}</p>
            </section>

            {guide.sections.map((section) => (
              <section key={section.id} className="grid gap-5 border-b border-[var(--border)] py-10 md:grid-cols-[180px_1fr] md:gap-10">
                <p className="technical-label pt-1">{section.id === "mechanism" ? "01" : "02"}</p>
                <div className="max-w-3xl">
                  <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{section.title}</h2>
                  <p className="mt-4 text-base leading-8 text-[var(--muted)]">{section.body}</p>
                </div>
              </section>
            ))}

            <section className="grid gap-8 border-b border-[var(--border)] py-10 lg:grid-cols-2">
              <div>
                <p className="technical-label">{labels.failures}</p>
                <ul className="mt-5 space-y-4">
                  {guide.failureModes.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7">
                      <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="technical-label">{labels.heuristics}</p>
                <ul className="mt-5 space-y-4">
                  {guide.heuristics.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7">
                      <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="grid gap-5 border-b border-[var(--border)] py-10 md:grid-cols-[180px_1fr] md:gap-10">
              <h2 className="technical-label pt-1">{labels.takeaways}</h2>
              <ol className="max-w-3xl space-y-4">
                {guide.takeaways.map((item, index) => (
                  <li key={item} className="grid grid-cols-[28px_1fr] gap-3 text-base leading-7">
                    <span className="font-mono text-[10px] font-bold text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <GuideProgressControl locale={locale} conceptId={concept.id} practiceId={practiceId} />

            {pathMemberships.length ? (
              <section className="border-b border-[var(--border)] py-10" data-guide-path-memberships>
                <p className="technical-label">{labels.usedIn}</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{labels.usedInCopy}</p>
                <div className="mt-6 grid gap-x-8 border-t border-[var(--border)] sm:grid-cols-2">
                  {pathMemberships.map((membership) => (
                    <Link
                      key={membership.id}
                      href={`/${segment}/courses/${membership.slug}/`}
                      data-guide-path-membership={membership.slug}
                      className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4 transition hover:text-[var(--primary)]"
                    >
                      <span>
                        <span className="block text-sm font-bold">{membership.title}</span>
                        <span className="mt-1 block text-xs text-[var(--muted)]">{membership.milestoneTitle}</span>
                      </span>
                      <span className="font-mono text-[9px] text-[var(--primary)]">{labels.course} →</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {activePath && (activePath.previous || activePath.next) ? (
              <section className="border-b border-[var(--border)] py-10" data-guide-sequence={activePath.slug}>
                <p className="technical-label">{labels.continue}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    {activePath.previous ? (
                      <Link
                        className="group block border border-[var(--border)] p-5 transition hover:border-[var(--primary)]"
                        href={`/${segment}/guides/${activePath.previous.slug}/?path=${encodeURIComponent(activePath.slug)}`}
                        data-guide-previous={activePath.previous.conceptId}
                      >
                        <span className="technical-label">← {labels.previous}</span>
                        <strong className="mt-3 block font-[family-name:var(--font-editorial)] text-xl tracking-[-0.03em] group-hover:text-[var(--primary)]">{activePath.previous.title}</strong>
                      </Link>
                    ) : null}
                  </div>
                  <div>
                    {activePath.next ? (
                      <Link
                        className="group block border border-[var(--border)] p-5 sm:text-right transition hover:border-[var(--primary)]"
                        href={`/${segment}/guides/${activePath.next.slug}/?path=${encodeURIComponent(activePath.slug)}`}
                        data-guide-next={activePath.next.conceptId}
                      >
                        <span className="technical-label">{labels.next} →</span>
                        <strong className="mt-3 block font-[family-name:var(--font-editorial)] text-xl tracking-[-0.03em] group-hover:text-[var(--primary)]">{activePath.next.title}</strong>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {relatedConcepts.length ? (
              <section className="border-b border-[var(--border)] py-10">
                <p className="technical-label">{labels.related}</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{labels.relatedCopy}</p>
                <div className="mt-6 grid gap-x-8 border-t border-[var(--border)] sm:grid-cols-2">
                  {relatedConcepts.map((item) => {
                    const content = (
                      <>
                        <span>
                          <span className="block text-sm font-bold">{item.title}</span>
                          <span className="mt-1 block font-mono text-[9px] uppercase text-[var(--muted)]">{item.relationship}</span>
                        </span>
                        {item.guideSlug ? <span className="font-mono text-[9px] text-[var(--primary)]">{labels.guide} →</span> : null}
                      </>
                    );
                    return item.guideSlug ? (
                      <Link key={item.id} href={`/${segment}/guides/${item.guideSlug}/`} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4 transition hover:text-[var(--primary)]">
                        {content}
                      </Link>
                    ) : (
                      <div key={item.id} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <footer className="grid gap-6 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="technical-label">{labels.practice}</p>
                {guide.practice ? (
                  <Link
                    className="editorial-primary-action mt-4"
                    href={practiceHref(locale, guide.slug, guide.practice.href, activePath?.slug)}
                    data-guide-practice-link={guide.slug}
                  >
                    {guide.practice.title} <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
              <Link className="editorial-text-link" href={`/${segment}/learning/`}>
                {labels.map} <span aria-hidden="true">→</span>
              </Link>
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
}
