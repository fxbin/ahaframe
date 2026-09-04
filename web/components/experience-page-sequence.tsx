import type { ReactNode } from "react";
import type { Locale } from "@/lib/content";

export type ExperienceStageKey = "experience" | "reflection" | "learn-more" | "next";

interface StageCopy {
  index: string;
  title: string;
  description: string;
}

const COPY: Record<Locale, Record<ExperienceStageKey, StageCopy>> = {
  en: {
    experience: { index: "01", title: "Experience", description: "Work the problem before reading the explanation." },
    reflection: { index: "02", title: "Reflection", description: "Turn the outcome into a rule you can reuse." },
    "learn-more": { index: "03", title: "Learn More", description: "Connect the experience to concepts, references, and transfer." },
    next: { index: "04", title: "Next", description: "Carry the idea into another problem or build." },
  },
  "zh-CN": {
    experience: { index: "01", title: "体验", description: "先处理问题，再阅读解释。" },
    reflection: { index: "02", title: "反思", description: "把结果整理成可以复用的判断。" },
    "learn-more": { index: "03", title: "深入理解", description: "把这次体验连接到概念、参考与迁移。" },
    next: { index: "04", title: "下一步", description: "把这个判断带到另一个问题或构建中。" },
  },
};

interface ExperienceSequenceProps { locale: Locale; }

export function ExperienceSequence({ locale }: ExperienceSequenceProps) {
  const stages = Object.entries(COPY[locale]) as Array<[ExperienceStageKey, StageCopy]>;

  return (
    <nav className="shell mt-10" aria-label={locale === "zh-CN" ? "体验页面阶段" : "Experience page stages"} data-testid="experience-sequence">
      <ol className="grid border-y border-[var(--border)] sm:grid-cols-4">
        {stages.map(([key, stage], index) => (
          <li key={key} className={index ? "border-t border-[var(--border)] sm:border-l sm:border-t-0" : ""}>
            <a className="group flex min-h-20 gap-3 px-3 py-4 sm:block" href={`#${key}`}>
              <span className="font-mono text-[10px] font-bold text-[var(--brand-accent)]">{stage.index}</span>
              <span className="block">
                <span className="block text-sm font-semibold group-hover:text-[var(--brand-accent)]">{stage.title}</span>
                <span className="mt-1 hidden text-xs leading-5 text-[var(--muted)] lg:block">{stage.description}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface ExperienceStageProps { locale: Locale; stage: ExperienceStageKey; children: ReactNode; }

export function ExperienceStage({ locale, stage, children }: ExperienceStageProps) {
  const copy = COPY[locale][stage];

  return (
    <section id={stage} data-experience-stage={stage} className="shell scroll-mt-24 pt-14 sm:pt-16">
      <header className="grid gap-3 border-t border-[var(--border-strong)] pt-5 sm:grid-cols-[88px_1fr] sm:gap-6">
        <div className="course-number">{copy.index}</div>
        <div>
          <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.description}</p>
        </div>
      </header>
      <div className="mt-8">{children}</div>
    </section>
  );
}
