import Link from "next/link";
import { GuideProgressControl } from "@/components/guide-progress-control";
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

export function GuidePage({ locale, data }: { locale: Locale; data: GuidePageData }) {
  const labels = copy(locale);
  const segment = segmentForLocale(locale);
  const { guide, concept, relatedConcepts, pathMemberships, activePath } = data;
  const practiceId = guide.practice ? practiceContentId(guide.practice.href) : null;

  return (
    <main className="editorial-guide-page liquid-guide-page">
      <article>


        <div className="shell guide-workspace-shell py-12 sm:py-16">
          <div className={`guide-workspace-layout ${activePath ? "" : "guide-workspace-layout--no-path"}`}>
            {activePath ? (
              <aside className="guide-workspace-sidebar" aria-label={locale === "zh-CN" ? "课程目录" : "Course outline"}>
                <Link href={`/${segment}/courses/${activePath.slug}/`} className="text-xs text-[var(--muted)] hover:text-[var(--brand-accent)]">
                  ← {locale === "zh-CN" ? "返回课程" : "Back to course"}
                </Link>
                <h2 className="mt-6 font-[family-name:var(--font-editorial)] text-xl font-semibold leading-snug">{activePath.title}</h2>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{activePath.milestoneTitle}</p>
                <div className="guide-workspace-navigation">
                  {activePath.previous ? <Link href={`/${segment}/guides/${activePath.previous.slug}/?path=${encodeURIComponent(activePath.slug)}`}>
                    <span className="guide-workspace-step">✓</span><span>{activePath.previous.title}</span>
                  </Link> : null}
                  <span aria-current="page" className="is-active"><span className="guide-workspace-step">●</span><strong>{guide.title}</strong></span>
                  {activePath.next ? <Link href={`/${segment}/guides/${activePath.next.slug}/?path=${encodeURIComponent(activePath.slug)}`}>
                    <span className="guide-workspace-step">›</span><span>{activePath.next.title}</span>
                  </Link> : null}
                </div>
                <Link href={`/${segment}/courses/${activePath.slug}/`} className="mt-8 inline-block text-xs font-semibold text-[var(--brand-accent)]">
                  {locale === "zh-CN" ? "查看完整课程目录 →" : "Full course outline →"}
                </Link>
              </aside>
            ) : null}
            <div className="guide-workspace-body min-w-0">
        <header className="course-detail-hero border-b border-[var(--border)] py-14 sm:py-20">
          <div className="shell">
            {activePath ? (
              <nav aria-label={labels.course} className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]" data-guide-active-path={activePath.slug}>
                <Link className="quiet-link" href={`/${segment}/courses/${activePath.slug}/`}>{activePath.title}</Link>
                <span aria-hidden="true">→</span><span>{activePath.milestoneTitle}</span>
              </nav>
            ) : null}
            <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div className="max-w-4xl">
                <p className="editorial-kicker">{labels.kicker}</p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
                  <span>{concept.kind}</span><span aria-hidden="true">·</span><span>{concept.difficulty}</span><span aria-hidden="true">·</span><span>{guide.readingMinutes} {labels.minutes}</span>
                </div>
                <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-editorial)] text-4xl font-semibold leading-[1.1] tracking-[-0.05em] sm:text-5xl">{guide.title}</h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{guide.summary}</p>
              </div>
              <div className="guide-header-model border-y border-[var(--border)] py-5 lg:border-y-0 lg:border-l lg:py-2 lg:pl-8">
                <p className="technical-label">{labels.mentalModel}</p>
                <p className="mt-3 font-[family-name:var(--font-editorial)] text-2xl leading-9 tracking-[-0.025em]">{guide.mentalModel}</p>
              </div>
            </div>
          </div>
        </header>
          <section className="grid gap-5 border-b border-[var(--border)] pb-10 md:grid-cols-[180px_1fr] md:gap-10">
            <h2 className="technical-label pt-1">{labels.why}</h2><p className="max-w-3xl text-lg leading-8">{guide.whyItMatters}</p>
          </section>

          {guide.slug === "timeout-ambiguity" ? (
            <section className="guide-timeout-figure" aria-label={locale === "zh-CN" ? "超时的不确定状态示意图" : "Timeout uncertainty diagram"}>
              <div className="mb-5">
                <h2 className="font-[family-name:var(--font-editorial)] text-xl font-semibold">
                  {locale === "zh-CN" ? "超时并不等于失败" : "A timeout is not a confirmed failure"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {locale === "zh-CN" ? "同一笔退款请求超时后，远端可能处于不同状态。必须先核对，再决定是否重试。" : "A refund can time out while its actual remote result is unknown. Reconcile before retrying."}
                </p>
              </div>
              <div className="guide-timeout-flow">
                <div className="guide-timeout-node"><span aria-hidden="true">◇</span><strong>Agent</strong><small>{locale === "zh-CN" ? "发送退款请求" : "Sends refund request"}</small></div>
                <div className="guide-timeout-link" aria-label={locale === "zh-CN" ? "调用过程发生网络超时" : "Network timeout"}><span aria-hidden="true">⏱</span><small>{locale === "zh-CN" ? "网络超时" : "Timeout"}</small><i aria-hidden="true">→</i></div>
                <div className="guide-timeout-node"><span aria-hidden="true">▤</span><strong>{locale === "zh-CN" ? "远端服务" : "Remote service"}</strong><small>{locale === "zh-CN" ? "可能仍在执行" : "May still execute"}</small></div>
                <div className="guide-timeout-outcomes">
                  <strong>{locale === "zh-CN" ? "结果仍不确定" : "Outcome remains unknown"}</strong>
                  <span><i className="success" aria-hidden="true">✓</i>{locale === "zh-CN" ? "可能已经执行成功" : "May have succeeded"}</span>
                  <span><i className="pending" aria-hidden="true">···</i>{locale === "zh-CN" ? "也可能仍在处理中" : "May still be pending"}</span>
                  <span><i className="failed" aria-hidden="true">×</i>{locale === "zh-CN" ? "也可能尚未执行" : "May not have executed"}</span>
                </div>
              </div>
            </section>
          ) : null}

          {guide.sections.map((section) => (
            <section key={section.id} className="grid gap-5 border-b border-[var(--border)] py-10 md:grid-cols-[180px_1fr] md:gap-10">
              <p className="technical-label pt-1">{section.id === "mechanism" ? "01" : "02"}</p>
              <div className="max-w-3xl"><h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{section.title}</h2><p className="mt-4 text-base leading-8 text-[var(--muted)]">{section.body}</p></div>
            </section>
          ))}

          <section className="grid gap-8 border-b border-[var(--border)] py-10 lg:grid-cols-2">
            <div><p className="technical-label">{labels.failures}</p><ul className="mt-5 space-y-4">{guide.failureModes.map((item) => <li key={item} className="flex gap-3 text-sm leading-7"><span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
            <div><p className="technical-label">{labels.heuristics}</p><ul className="mt-5 space-y-4">{guide.heuristics.map((item) => <li key={item} className="flex gap-3 text-sm leading-7"><span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" /><span>{item}</span></li>)}</ul></div>
          </section>

          <section className="grid gap-5 border-b border-[var(--border)] py-10 md:grid-cols-[180px_1fr] md:gap-10">
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
            <aside className="guide-workspace-practice" aria-label={locale === "zh-CN" ? "实践与验证" : "Practice and verification"}>
              <p className="guide-workspace-aside-heading">{locale === "zh-CN" ? "实践与验证" : "Practice & Verify"}</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-accent)]">{locale === "zh-CN" ? "本节重点" : "Lesson focus"}</p>
              <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-lg font-semibold leading-snug">{guide.mentalModel}</h2>
              <div className="mt-7 border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-semibold">{locale === "zh-CN" ? "本节提醒" : "Keep in mind"}</h3>
                <ul className="mt-3 space-y-3">
                  {guide.takeaways.slice(0, 3).map((point,index)=>(
                    <li key={point} className="flex gap-3 text-xs leading-5 text-[var(--muted)]"><span className="font-mono text-[var(--brand-accent)]">{index+1}.</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
              {guide.practice ? (
                <div className="guide-workspace-practice-cta">
                  <p className="text-xs leading-5 text-[var(--muted)]">{locale === "zh-CN" ? "准备好后，在真实交互实验中运用本节知识。" : "Apply this lesson in the linked interactive practice."}</p>
                  <Link className="primary-action mt-4 w-full justify-center" href={practiceHref(locale, guide.slug, guide.practice.href, activePath?.slug)}>
                    {locale === "zh-CN" ? "进入实践" : "Open practice"} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                <p className="mt-8 border-t border-[var(--border)] pt-5 text-xs leading-5 text-[var(--muted)]">
                  {locale === "zh-CN" ? "这一节目前提供阅读与自我总结，交互练习正在扩展。" : "This lesson currently offers reading and reflection; interactive practice is being expanded."}
                </p>
              )}
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}
