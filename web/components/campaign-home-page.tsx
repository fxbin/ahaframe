import Link from "next/link";
import { FirstAhaPanel } from "@/components/first-aha-panel";
import { AgentFlowPreview } from "@/components/agent-flow-preview";
import { featuredCourses, type CourseCatalogItem } from "@/lib/course-catalog-server";
import { segmentForLocale, type Locale } from "@/lib/content";
import type { CampaignDiscoveryContent } from "@/lib/campaign";
import type { KnowledgeMap } from "@/lib/knowledge-map";

interface CampaignHomePageProps {
  locale: Locale;
  content: CampaignDiscoveryContent;
  knowledgeMap: KnowledgeMap;
  catalog: CourseCatalogItem[];
}

export function CampaignHomePage({ locale, content, knowledgeMap, catalog }: CampaignHomePageProps) {
  const segment = segmentForLocale(locale);
  const featured = featuredCourses(catalog);
  const labels = locale === "zh-CN"
    ? {
        headline: "看见 AI 如何工作，才能真正理解它。",
        subheadline: "用清晰的课程理解 AI，用真实的 Practice 建立判断力。",
        start: "开始学习",
        choose: "你想学什么？",
        featured: "精选课程",
        viewAll: "查看全部课程",
        understand: "理解 AI",
        understandCopy: "理解 AI 如何工作，以及它为什么会失败。",
        build: "构建 AI",
        buildCopy: "构建 AI 应用、Agent 与生产系统。",
        use: "使用 AI",
        useCopy: "把 AI 用到写作、研究、知识与业务工作流。",
        practice: "真正练一次",
        practiceTitle: "一次 Timeout，为什么会变成两次退款？",
        practiceCopy: "先看证据，再做判断。这个互动事故保留 AhaFrame 最核心的学习方式，但不再挤占首页首屏。",
        depth: "15 条学习路径 · 145 个 Concept · 17 个互动 Experience",
        map: "自由探索知识地图",
      }
    : {
        headline: "Understand AI by seeing it work.",
        subheadline: "Clear courses to build the mental model. Real practice to build judgment.",
        start: "Start Learning",
        choose: "What do you want to learn?",
        featured: "Featured Courses",
        viewAll: "View all courses",
        understand: "Understand AI",
        understandCopy: "Learn how AI works, and where it fails.",
        build: "Build AI",
        buildCopy: "Create AI apps, agents and production systems.",
        use: "Use AI",
        useCopy: "Apply AI to writing, research, knowledge and business.",
        practice: "Try one real incident",
        practiceTitle: "One timeout. Why did it become two refunds?",
        practiceCopy: "Inspect the evidence, make a decision, and watch the consequence. The core AhaFrame learning loop is still here—just no longer competing with the first screen.",
        depth: "15 Learning Paths · 145 Concepts · 17 Interactive Experiences",
        map: "Explore the Knowledge Map",
      };

  const domainCopy = [
    { title: labels.understand, copy: labels.understandCopy, symbol: "◯" },
    { title: labels.build, copy: labels.buildCopy, symbol: "◇" },
    { title: labels.use, copy: labels.useCopy, symbol: "□" },
  ] as const;
  const domainCards = knowledgeMap.domains.slice(0, 3).map((domain, index) => {
    const copy = domainCopy[index];
    if (!copy) throw new Error(`Missing homepage copy for Knowledge Map domain ${domain.id}.`);
    return { domain, ...copy };
  });

  return (
    <main className="editorial-home liquid-home">
      <section className="editorial-hero">
        <div className="shell grid liquid-hero-layout">
          <div>
            <p className="editorial-kicker">{locale === "zh-CN" ? "以直观交互，理解 AI" : "LEARN BY SEEING"}</p>
            <h1 aria-label={labels.headline} className="editorial-display liquid-hero-title mt-5 max-w-3xl">
              {locale === "zh-CN" ? <>看见 AI 如何工作，<br />才能<span className="liquid-hero-accent">真正理解它</span></> : <>Understand AI by<br /><span className="liquid-hero-accent">seeing it work.</span></>}
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[var(--muted)] sm:text-lg">{labels.subheadline}</p>
            <div className="mt-9 flex flex-wrap items-center gap-7">
              <Link className="editorial-primary-action" href={`/${segment}/courses/`}>
                {labels.start} <span aria-hidden="true">→</span>
              </Link>
              <a className="liquid-secondary-action inline-flex items-center gap-3 text-sm font-semibold" href="#home-interactive-demo">
                <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-strong)] bg-white/80">▶</span>
                {locale === "zh-CN" ? "体验一个示例" : "Try an example"}
              </a>
            </div>
            <p className="mt-10 text-xs tracking-[.13em] text-[var(--muted)]">
              {labels.understand} <span className="mx-3" aria-hidden="true">·</span> {labels.build} <span className="mx-3" aria-hidden="true">·</span> {labels.use}
            </p>
          </div>
          <div className="liquid-hero-visual">
            <AgentFlowPreview locale={locale} />
          </div>
        </div>
      </section>

      <section className="shell liquid-value-strip" aria-label={labels.choose}>
        <h2 className="col-span-full mb-0 text-xs font-semibold tracking-[0.12em] text-[var(--muted)]">{labels.choose}</h2>
        {domainCards.map(({ domain, title, copy }) => (
          <Link key={domain.id} href={`/${segment}/courses/#${domain.slug}`}>
            <strong className="block font-[family-name:var(--font-editorial)] text-xl tracking-[-0.03em]">{title} <span aria-hidden="true" className="ml-1 text-[var(--glass-copper)]">↗</span></strong>
            <span className="mt-2 block max-w-[275px] text-sm leading-6 text-[var(--muted)]">{copy}</span>
          </Link>
        ))}
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{labels.featured}</h2>
            <Link className="quiet-link hidden sm:inline-flex" href={`/${segment}/courses/`}>{labels.viewAll} →</Link>
          </div>
          <div className="featured-courses-grid mt-7">
            {featured.map((item, index) => (
              <Link key={item.path.id} className={`featured-course-card group ${index === 0 ? "is-featured" : ""}`} href={`/${segment}/courses/${item.path.slug}/`}>
                {index === 0 ? (
                  <div className="featured-course-art" aria-hidden="true">
                    <div className="featured-course-art__layers"><i /><i /><i /><i /></div>
                  </div>
                ) : null}
                <div className="featured-course-copy">
                  <div className="flex items-start justify-between gap-4">
                    <span className="course-number">{index === 0 ? (locale === "zh-CN" ? "精选课程" : "FEATURED") : String(index + 1).padStart(2, "0")}</span>
                    <span className="text-[var(--muted)]" aria-hidden="true">{index === 0 ? "↗" : "⌑"}</span>
                  </div>
                  <h3 className="mt-7 font-[family-name:var(--font-editorial)] text-2xl font-semibold leading-tight tracking-[-0.04em]">{item.path.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.path.description}</p>
                  <div className="mt-7 flex items-center gap-3 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                    <span>{item.path.milestones.length} {locale === "zh-CN" ? "章节" : "sections"}</span>
                    <span>·</span>
                    <span>{item.practices.length} {locale === "zh-CN" ? "练习" : "practices"}</span>
                    <span className="ml-auto transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link className="quiet-link mt-7 inline-flex sm:hidden" href={`/${segment}/courses/`}>{labels.viewAll} →</Link>
        </div>
      </section>

      <section id="home-interactive-demo" className="home-demo-section border-y border-[var(--border)] bg-[var(--surface)] py-14 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="editorial-kicker">{labels.practice}</p>
            <h2 className="mt-4 font-[family-name:var(--font-editorial)] text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">{labels.practiceTitle}</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--muted)]">{labels.practiceCopy}</p>
            <Link className="editorial-text-link mt-6" href={`/${segment}/labs/agent-reliability/`}>
              {locale === "zh-CN" ? "打开完整 Incident →" : "Open the full incident →"}
            </Link>
          </div>
          <FirstAhaPanel
            locale={locale}
            content={content.hero.firstAha}
            href={`/${segment}/labs/agent-reliability/`}
            ctaLabel={locale === "zh-CN" ? "调查这起事故" : "Investigate the incident"}
          />
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="shell flex flex-col gap-5 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{labels.depth}</p>
          <Link className="quiet-link" href={`/${segment}/learning/`}>{labels.map} →</Link>
        </div>
      </section>
    </main>
  );
}
