import Link from "next/link";
import type { Locale } from "@/lib/content";
import type { GuideProblemDiscoveryData } from "@/lib/guide-problems";

interface GuideProblemDiscoveryProps {
  locale: Locale;
  data: GuideProblemDiscoveryData;
}

export function GuideProblemDiscovery({ locale, data }: GuideProblemDiscoveryProps) {
  const copy = locale === "zh-CN"
    ? {
        kicker: "从问题出发",
        title: "不知道术语也没关系，先从你遇到的症状开始。",
        intro: "选择一个最像你当前问题的场景。AhaFrame 会把它映射到已有的心智模型、Practice 和进一步学习的 Course；这里不会创建第二套知识路径。",
        models: "先理解这 3 个心智模型",
        min: "分钟",
        practice: "进入 Practice",
        deeper: "继续系统学习",
      }
    : {
        kicker: "START FROM YOUR PROBLEM",
        title: "You do not need the vocabulary before you can diagnose the symptom.",
        intro: "Choose the failure mode that looks most like your current problem. AhaFrame maps it to existing mental models, Practice, and a deeper Course without creating a second learning graph.",
        models: "Understand these 3 mental models first",
        min: "min",
        practice: "Open Practice",
        deeper: "Continue with Course",
      };
  const segment = locale === "zh-CN" ? "zh-cn" : "en";

  return (
    <section className="border-b border-[var(--border)] py-10 sm:py-14" data-guide-problem-discovery>
      <div className="shell">
        <div className="max-w-4xl">
          <p className="editorial-kicker">{copy.kicker}</p>
          <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">{copy.intro}</p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.bundles.map((bundle) => (
            <details key={bundle.id} className="group border border-[var(--border)] bg-[var(--background)]" data-guide-problem={bundle.id}>
              <summary className="cursor-pointer list-none p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <strong className="block font-[family-name:var(--font-editorial)] text-xl font-semibold tracking-[-0.035em]">{bundle.problem}</strong>
                    <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{bundle.explanation}</span>
                  </span>
                  <span className="shrink-0 text-lg text-[var(--muted)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </span>
              </summary>

              <div className="border-t border-[var(--border)] px-5 pb-5 pt-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{copy.models}</p>
                <ol className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {bundle.guides.map((guide, index) => (
                    <li key={guide.conceptId}>
                      <Link
                        className="flex items-center justify-between gap-3 py-3 text-sm font-semibold transition hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                        href={`/${segment}/guides/${guide.slug}/`}
                        data-guide-problem-guide={guide.conceptId}
                      >
                        <span>{index + 1}. {guide.title}</span>
                        <span className="shrink-0 font-mono text-[9px] font-normal text-[var(--muted)]">{guide.readingMinutes} {copy.min}</span>
                      </Link>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 grid gap-2">
                  <Link className="editorial-text-link" href={bundle.practice.route} data-guide-problem-practice={bundle.practice.id}>
                    {copy.practice}: {bundle.practice.title} <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="quiet-link text-sm" href={bundle.course.route} data-guide-problem-course={bundle.course.id}>
                    {copy.deeper}: {bundle.course.title} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
