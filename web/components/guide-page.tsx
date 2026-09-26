import Link from "next/link";
import { GuideProgressControl } from "@/components/guide-progress-control";
import { GuidePracticePanel } from "@/components/guide-practice-panel";
import type { FirstAhaContent } from "@/lib/campaign";
import type { Locale } from "@/lib/content";
import { localizedPath, segmentForLocale } from "@/lib/content";
import type { GuidePageData } from "@/lib/guides";

function copy(locale: Locale) {
  return locale === "en"
    ? {
        kicker: "CORE GUIDE", minutes: "min read", mentalModel: "Mental model", why: "Why it matters",
        failures: "Common failure modes", heuristics: "Engineering heuristics", takeaways: "Takeaways",
        related: "Related concepts from the Knowledge Graph", relatedCopy: "These relationships come from the canonical graph, not a separate Guide taxonomy.",
        practice: "Apply the concept", map: "Back to Knowledge Map", guide: "Guide", usedIn: "Used in",
        usedInCopy: "This Concept is reused across these canonical learning paths.", continue: "Continue learning",
        previous: "Previous Guide", next: "Next Guide", course: "Course",
      }
    : {
        kicker: "核心 GUIDE", minutes: "分钟阅读", mentalModel: "核心心智模型", why: "为什么重要",
        failures: "常见失败模式", heuristics: "工程启发", takeaways: "关键结论", related: "来自 Knowledge Graph 的相关知识点",
        relatedCopy: "这些关系直接来自 canonical graph，不维护第二套 Guide 分类体系。", practice: "把知识用起来", map: "返回知识地图",
        guide: "Guide", usedIn: "用于这些学习路径", usedInCopy: "这个 Concept 会在多个 canonical 学习路径中复用。",
        continue: "继续学习", previous: "上一篇 Guide", next: "下一篇 Guide", course: "课程",
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

export function GuidePage({ locale, data, firstAha = null }: { locale: Locale; data: GuidePageData; firstAha?: FirstAhaContent | null }) {
  const labels = copy(locale);
  const segment = segmentForLocale(locale);
  const { guide, concept, relatedConcepts, pathMemberships, activePath } = data;
  const practiceId = guide.practice ? practiceContentId(guide.practice.href) : null;

  return (
    <main className="editorial-guide-page liquid-guide-page">
      <div className="guide-workspace">
        <aside className="guide-workspace__outline glass-panel" aria-label={locale === "zh-CN" ? "课程与章节导航" : "Course and chapter navigation"}>
          <Link className="guide-workspace__back" href={activePath ? `/${segment}/courses/${activePath.slug}/` : `/${segment}/guides/`}>← {activePath ? (locale === "zh-CN" ? "返回课程" : "Back to course") : (locale === "zh-CN" ? "返回 Guide 列表" : "All Guides")}</Link>
          <h2>{activePath?.title ?? (locale === "zh-CN" ? "学习指南" : "Learning Guides")}</h2>
          <p className="guide-workspace__subline">{activePath?.milestoneTitle ?? labels.kicker}</p>
          <div className="guide-workspace__outline-divider" />
          {activePath?.previous ? (
            <Link className="guide-workspace__outline-item" href={`/${segment}/guides/${activePath.previous.slug}/?path=${encodeURIComponent(activePath.slug)}`}>
              <span className="guide-workspace__step-symbol">◌</span><span>{activePath.previous.title}</span>
            </Link>
          ) : null}
          <span className="guide-workspace__outline-item is-current" aria-current="page">
            <span className="guide-workspace__step-symbol">▸</span><span>{guide.title}</span>
          </span>
          {activePath?.next ? (
            <Link className="guide-workspace__outline-item" href={`/${segment}/guides/${activePath.next.slug}/?path=${encodeURIComponent(activePath.slug)}`}>
              <span className="guide-workspace__step-symbol">○</span><span>{activePath.next.title}</span>
            </Link>
          ) : null}
          <div className="guide-workspace__outline-divider" />
          <p className="guide-workspace__nav-label">{locale === "zh-CN" ? "本节目录" : "On this page"}</p>
          <a className="guide-workspace__outline-item" href="#guide-why">01 · {labels.why}</a>
          {guide.sections.map((section) => (
            <a key={section.id} className="guide-workspace__outline-item" href={`#guide-${section.id}`}>0{guide.sections.indexOf(section) + 2} · {section.title}</a>
          ))}
          <a className="guide-workspace__outline-item" href="#guide-failures">04 · {labels.failures}</a>
          <a className="guide-workspace__outline-item" href="#guide-takeaways">05 · {labels.takeaways}</a>
        </aside>
        <article className="guide-workspace__reading">
        <header className="guide-workspace__header">
          <div className="guide-workspace__head-inner">
            {activePath ? (
              <nav aria-label={labels.course} className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]" data-guide-active-path={activePath.slug}>
                <Link className="quiet-link" href={`/${segment}/courses/${activePath.slug}/`}>{activePath.title}</Link>
                <span aria-hidden="true">→</span><span>{activePath.milestoneTitle}</span>
              </nav>
            ) : null}
            <div className="guide-workspace__title-block">
              <p className="editorial-kicker">{labels.kicker}</p>
              <p className="guide-workspace__metadata">{concept.kind} <span aria-hidden="true">·</span> {concept.difficulty} <span aria-hidden="true">·</span> {guide.readingMinutes} {labels.minutes}</p>
              <h1>{guide.title}</h1>
              <p className="guide-workspace__summary">{guide.summary}</p>
            </div>
          </div>
        </header>

        <div className="guide-workspace__body">
          <section className="guide-workspace__insight" aria-labelledby="guide-mental-model">
            <span className="guide-workspace__insight-icon" aria-hidden="true">✧</span>
            <div><h2 id="guide-mental-model">{labels.mentalModel}</h2><p>{guide.mentalModel}</p></div>
          </section>
          <section id="guide-why" className="guide-workspace__section border-b border-[var(--border)] pb-10">
            <h2 className="technical-label pt-1">{labels.why}</h2><p className="max-w-3xl text-lg leading-8">{guide.whyItMatters}</p>
          </section>

          {guide.sections.map((section) => (
            <section key={section.id} id={`guide-${section.id}`} className="guide-workspace__section border-b border-[var(--border)] py-10">
              <p className="technical-label pt-1">{section.id === "mechanism" ? "01" : "02"}</p>
              <div className="max-w-3xl"><h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{section.title}</h2><p className="mt-4 text-base leading-8 text-[var(--muted)]">{section.body}</p></div>
            </section>
          ))}

          <section id="guide-failures" className="guide-workspace__section grid gap-8 border-b border-[var(--border)] py-10 lg:grid-cols-2">
            <div><p className="technical-label">{labels.failures}</p><ul className="mt-5 space-y-4">{guide.failureModes.map((item) => <li key={item} className="flex gap-3 text-sm leading-7"><span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
            <div><p className="technical-label">{labels.heuristics}</p><ul className="mt-5 space-y-4">{guide.heuristics.map((item) => <li key={item} className="flex gap-3 text-sm leading-7"><span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
          </section>

          <section id="guide-takeaways" className="guide-workspace__section border-b border-[var(--border)] py-10">
            <h2 className="technical-label pt-1">{labels.takeaways}</h2>
            <ol className="max-w-3xl space-y-4">{guide.takeaways.map((item, index) => <li key={item} className="grid grid-cols-[28px_1fr] gap-3 text-base leading-7"><span className="font-mono text-[10px] font-bold text-[var(--brand-accent)]">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}</ol>
          </section>

          <GuideProgressControl locale={locale} conceptId={concept.id} practiceId={practiceId} />

          {pathMemberships.length ? (
            <section className="border-b border-[var(--border)] py-10" data-guide-path-memberships>
              <p className="technical-label">{labels.usedIn}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{labels.usedInCopy}</p>
              <div className="mt-6 grid gap-x-8 border-t border-[var(--border)] sm:grid-cols-2">
                {pathMemberships.map((membership) => (
                  <Link key={membership.id} href={`/${segment}/courses/${membership.slug}/`} data-guide-path-membership={membership.slug} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4 transition hover:text-[var(--brand-accent)]">
                    <span><span className="block text-sm font-bold">{membership.title}</span><span className="mt-1 block text-xs text-[var(--muted)]">{membership.milestoneTitle}</span></span>
                    <span className="font-mono text-[9px] text-[var(--brand-accent)]">{labels.course} →</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {activePath && (activePath.previous || activePath.next) ? (
            <section className="border-b border-[var(--border)] py-10" data-guide-sequence={activePath.slug}>
              <p className="technical-label">{labels.continue}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>{activePath.previous ? <Link className="group block border border-[var(--border)] p-5 transition hover:border-[var(--brand-accent)]" href={`/${segment}/guides/${activePath.previous.slug}/?path=${encodeURIComponent(activePath.slug)}`} data-guide-previous={activePath.previous.conceptId}><span className="technical-label">← {labels.previous}</span><strong className="mt-3 block font-[family-name:var(--font-editorial)] text-xl tracking-[-0.03em] group-hover:text-[var(--brand-accent)]">{activePath.previous.title}</strong></Link> : null}</div>
                <div>{activePath.next ? <Link className="group block border border-[var(--border)] p-5 transition hover:border-[var(--brand-accent)] sm:text-right" href={`/${segment}/guides/${activePath.next.slug}/?path=${encodeURIComponent(activePath.slug)}`} data-guide-next={activePath.next.conceptId}><span className="technical-label">{labels.next} →</span><strong className="mt-3 block font-[family-name:var(--font-editorial)] text-xl tracking-[-0.03em] group-hover:text-[var(--brand-accent)]">{activePath.next.title}</strong></Link> : null}</div>
              </div>
            </section>
          ) : null}

          {relatedConcepts.length ? (
            <section className="border-b border-[var(--border)] py-10">
              <p className="technical-label">{labels.related}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{labels.relatedCopy}</p>
              <div className="mt-6 grid gap-x-8 border-t border-[var(--border)] sm:grid-cols-2">
                {relatedConcepts.map((item) => {
                  const content = <><span><span className="block text-sm font-bold">{item.title}</span><span className="mt-1 block font-mono text-[9px] uppercase text-[var(--muted)]">{item.relationship}</span></span>{item.guideSlug ? <span className="font-mono text-[9px] text-[var(--brand-accent)]">{labels.guide} →</span> : null}</>;
                  return item.guideSlug ? <Link key={item.id} href={`/${segment}/guides/${item.guideSlug}/`} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4 transition hover:text-[var(--brand-accent)]">{content}</Link> : <div key={item.id} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-4">{content}</div>;
                })}
              </div>
            </section>
          ) : null}

          <footer className="grid gap-6 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
            <div><p className="technical-label">{labels.practice}</p>{guide.practice ? <Link className="editorial-primary-action mt-4" href={practiceHref(locale, guide.slug, guide.practice.href, activePath?.slug)} data-guide-practice-link={guide.slug}>{guide.practice.title} <span aria-hidden="true">→</span></Link> : null}</div>
            <Link className="editorial-text-link" href={`/${segment}/learning/`}>{labels.map} <span aria-hidden="true">→</span></Link>
          </footer>
        </div>
        </article>
        <GuidePracticePanel
          locale={locale}
          title={guide.title}
          practiceHref={guide.practice ? practiceHref(locale, guide.slug, guide.practice.href, activePath?.slug) : null}
          practiceTitle={guide.practice?.title ?? null}
          evidence={firstAha}
          takeaways={guide.takeaways}
        />
      </div>
    </main>
  );
}
