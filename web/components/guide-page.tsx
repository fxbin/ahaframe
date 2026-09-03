import Link from "next/link";
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
      };
}

export function GuidePage({ locale, data }: { locale: Locale; data: GuidePageData }) {
  const labels = copy(locale);
  const segment = segmentForLocale(locale);
  const { guide, concept, relatedConcepts } = data;

  return (
    <main>
      <article>
        <header className="border-b border-[var(--border)] py-14 sm:py-20">
          <div className="shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
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
                  <Link className="editorial-primary-action mt-4" href={localizedPath(guide.practice.href, locale)}>
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
