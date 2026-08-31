import Link from "next/link";
import { FirstAhaPanel } from "@/components/first-aha-panel";
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

function BotanicalBranch() {
  return (
    <svg className="botanical-branch" viewBox="0 0 320 220" role="img" aria-label="">
      <path d="M210 206C211 168 205 137 191 112C177 87 162 68 145 48" />
      <path d="M190 111C214 96 232 75 245 48" />
      <path d="M176 86C154 80 134 67 118 48" />
      <path d="M204 142C229 136 249 123 264 105" />
      <path d="M158 66C151 45 151 28 157 15" />
      <path d="M236 60C245 42 258 30 276 24" />
      <circle cx="157" cy="15" r="3" />
      <circle cx="147" cy="43" r="2.5" />
      <circle cx="118" cy="48" r="3" />
      <circle cx="245" cy="48" r="3" />
      <circle cx="276" cy="24" r="3" />
      <circle cx="264" cy="105" r="3" />
      <circle cx="230" cy="133" r="2.5" />
      <circle cx="139" cy="60" r="2.5" />
    </svg>
  );
}

export function CampaignHomePage({ locale, content, knowledgeMap, catalog }: CampaignHomePageProps) {
  const segment = segmentForLocale(locale);
  const featured = featuredCourses(catalog);
  const labels = locale === "zh-CN"
    ? {
        headline: "看见 AI 如何工作，才能真正理解它。",
        subheadline: "用清晰的课程理解 AI，用真实的 Practice 建立判断力。",
        start: "开始学习",
        paths: "查看 15 条学习路径",
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
        paths: "Explore 15 learning paths",
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

  const domainCards = [
    { domain: knowledgeMap.domains[0], title: labels.understand, copy: labels.understandCopy, symbol: "◯" },
    { domain: knowledgeMap.domains[1], title: labels.build, copy: labels.buildCopy, symbol: "◇" },
    { domain: knowledgeMap.domains[2], title: labels.use, copy: labels.useCopy, symbol: "□" },
  ].filter((item) => Boolean(item.domain));

  return (
    <main className="editorial-home">
      <section className="editorial-hero border-b border-[var(--border)]">
        <div className="shell grid min-h-[560px] gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_360px] lg:items-center lg:py-24">
          <div>
            <h1 className="editorial-display max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-[4.75rem]">{labels.headline}</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">{labels.subheadline}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link className="editorial-primary-action" href={`/${segment}/courses/`}>
                {labels.start} <span aria-hidden="true">→</span>
              </Link>
              <Link className="editorial-text-link" href={`/${segment}/courses/`}>
                {labels.paths}
              </Link>
            </div>
          </div>
          <div className="hero-botanical" aria-hidden="true">
            <BotanicalBranch />
            <span className="hero-red-line" />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] py-12 sm:py-16">
        <div className="shell">
          <h2 className="text-center font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{labels.choose}</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {domainCards.map(({ domain, title, copy, symbol }) => (
              <Link key={domain.id} className="learning-goal-card group" href={`/${segment}/courses/#${domain.slug}`}>
                <span className="learning-goal-symbol" aria-hidden="true">{symbol}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{copy}</span>
                </span>
                <span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{labels.featured}</h2>
            <Link className="quiet-link hidden sm:inline-flex" href={`/${segment}/courses/`}>{labels.viewAll} →</Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((item, index) => (
              <Link key={item.path.id} className="featured-course-card group" href={`/${segment}/courses/${item.path.slug}/`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="course-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[var(--muted)]" aria-hidden="true">⌑</span>
                </div>
                <h3 className="mt-8 font-[family-name:var(--font-editorial)] text-2xl font-semibold leading-tight tracking-[-0.04em]">{item.path.title}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--muted)]">{item.path.description}</p>
                <div className="mt-8 flex items-center gap-3 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
                  <span>{item.path.milestones.length} {locale === "zh-CN" ? "章节" : "sections"}</span>
                  <span>·</span>
                  <span>{item.practices.length} {locale === "zh-CN" ? "练习" : "practices"}</span>
                  <span className="ml-auto transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
          <Link className="quiet-link mt-7 inline-flex sm:hidden" href={`/${segment}/courses/`}>{labels.viewAll} →</Link>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-14 sm:py-20">
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
