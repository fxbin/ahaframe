import Link from "next/link";
import type { Locale } from "@/lib/content";
import type { LearningStage } from "@/lib/learning-graph";
import { localizeLearningRoute } from "@/lib/learning-route";

interface LearningMapPreviewProps {
  locale: Locale;
  stages: LearningStage[];
  kicker: string;
  title: string;
  copy: string;
}

export function LearningMapPreview({ locale, stages, kicker, title, copy }: LearningMapPreviewProps) {
  const labels = locale === "zh-CN"
    ? { count: "10 个阶段", cta: "查看完整学习路径", stage: "阶段" }
    : { count: "10 stages", cta: "Explore full learning path", stage: "Stage" };
  const learningHref = localizeLearningRoute("/learning/", locale);

  if (stages.length !== 10) {
    throw new Error(`Homepage learning-map preview requires exactly 10 canonical stages; received ${stages.length}.`);
  }

  return (
    <section id="roadmap" className="editorial-learning-page border-y border-[var(--border)] bg-[var(--surface)] py-20 sm:py-24" aria-labelledby="learning-map-preview-title">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="editorial-kicker">{kicker}</p>
            <h2 id="learning-map-preview-title" className="section-title">{title}</h2>
            <p className="section-copy">{copy}</p>
          </div>
          <span className="shrink-0 font-mono text-xs text-[var(--muted)]">{labels.count}</span>
        </div>

        <ol className="mt-12 grid border-t border-l border-[var(--border)] sm:grid-cols-2 lg:grid-cols-5" aria-label={title}>
          {stages.map((stage) => (
            <li key={stage.id} className="min-w-0 border-r border-b border-[var(--border)]">
              <Link
                href={`${learningHref}#${stage.slug}`}
                className="group flex h-full min-h-40 flex-col p-5 transition hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-accent)] sm:p-6"
                data-stage-id={stage.id}
              >
                <span className="flex items-center justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <span className="group-hover:text-[var(--brand-accent)]">{labels.stage} {String(stage.order).padStart(2, "0")}</span>
                  <span aria-hidden="true" className="text-[var(--border-strong)] transition-transform group-hover:translate-x-1">→</span>
                </span>
                <strong className="mt-4 block text-sm leading-5 tracking-[-0.015em]">{stage.title}</strong>
                <span className="mt-3 block text-xs leading-5 text-[var(--muted)]">{stage.description}</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-end">
          <Link className="editorial-text-link" href={learningHref} data-event="homepage_learning_map_opened">
            {labels.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
