import Link from "next/link";
import { ExperienceSequence, ExperienceStage } from "@/components/experience-page-sequence";
import { LearningContext } from "@/components/learning-context";
import { SpecialistRuntimeWorkspace } from "@/components/runtime/specialist-runtime-workspace";
import { localizedPath, type LabContent, type Locale } from "@/lib/content";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";
import { commonUi } from "@/lib/ui-copy";

interface LabPageProps {
  locale: Locale;
  lab: LabContent;
  experienceKey?: RuntimeExperienceKey;
}

const SPECIALIST_KEYS = new Set<RuntimeExperienceKey>(["context-compression", "agent-workflow-graph", "evaluation-failure"]);

function isSpecialistExperience(experienceKey?: RuntimeExperienceKey): boolean {
  return Boolean(experienceKey && SPECIALIST_KEYS.has(experienceKey));
}

function previewEntries(source: Record<string, unknown> | undefined): Array<[string, string]> {
  if (!source) return [];
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      entries.push([key, String(value)]);
    } else if (Array.isArray(value) && value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
      entries.push([key, value.join(" · ")]);
    } else if (value && typeof value === "object") {
      const values = Object.values(value as Record<string, unknown>).filter((item): item is string => typeof item === "string");
      if (values.length) entries.push([key, values.join(" · ")]);
    }
    if (entries.length >= 12) break;
  }
  return entries;
}

function titleCase(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function LabPage({ locale, lab, experienceKey }: LabPageProps) {
  const specialist = isSpecialistExperience(experienceKey);
  const controls = specialist ? [] : previewEntries(lab.interactive);
  const copy = commonUi(locale);

  return (
    <main className="editorial-experience-page py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]"><span>{lab.layer}</span><span>·</span><span>{lab.level}</span><span>·</span><span>{lab.minutes} {copy.minutes}</span></div>
        <h1 className="mt-5 max-w-5xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">{lab.name}</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--muted)]">{lab.hero}</p>
      </section>

      <ExperienceSequence locale={locale} />

      <ExperienceStage locale={locale} stage="experience">
        {specialist ? (
          <aside className="max-w-4xl border-l-2 border-[var(--brand-accent)] pl-5">
            <div className="editorial-kicker">{copy.inOneSentence}</div>
            <p className="mt-3 font-[family-name:var(--font-editorial)] text-2xl font-semibold leading-9 tracking-[-0.025em]">{lab.quick}</p>
          </aside>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <div className="border-y border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div><div className="editorial-kicker">{copy.productionLab}</div><h3 className="mt-2 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{lab.name}</h3></div>
              {controls.length ? <div className="mt-6 grid gap-x-6 gap-y-0 sm:grid-cols-2">{controls.map(([key, value]) => <div key={key} className="border-t border-[var(--border)] py-4"><div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{titleCase(key)}</div><div className="mt-2 text-sm leading-6">{value}</div></div>)}</div> : null}
            </div>

            <aside className="bg-[var(--editorial-ink)] p-6 text-white sm:p-8"><div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">{copy.inOneSentence}</div><p className="mt-4 font-[family-name:var(--font-editorial)] text-xl font-semibold leading-8">{lab.quick}</p></aside>
          </div>
        )}

        {experienceKey ? <div className="mt-8"><SpecialistRuntimeWorkspace locale={locale} experienceKey={experienceKey} /></div> : null}
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="reflection">
        {lab.takeaways?.length ? <div><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{copy.keyTakeaways}</h3><div className="mt-6 grid gap-x-8 gap-y-0 md:grid-cols-2">{lab.takeaways.map(([title, body]) => <article key={title} className="border-t border-[var(--border)] py-5"><h4 className="font-semibold">{title}</h4><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></div> : null}
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="learn-more">
        <div className="space-y-12">
          {lab.guide ? <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="editorial-kicker">{lab.guide.eyebrow ?? lab.layer}</p><h3 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{lab.guide.title}</h3><p className="mt-4 leading-7 text-[var(--muted)]">{lab.guide.intro}</p></div><div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">{lab.guide.sections.map((section) => <article key={section.title} className="py-6"><h4 className="font-[family-name:var(--font-editorial)] text-xl font-semibold tracking-[-0.025em]">{section.title}</h4><p className="mt-2 leading-7 text-[var(--muted)]">{section.body}</p></article>)}</div></div> : null}

          {lab.guide?.faq?.length ? <div><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{copy.commonQuestions}</h3><div className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">{lab.guide.faq.map((item) => <details key={item.q} className="py-5"><summary className="cursor-pointer font-semibold">{item.q}</summary><p className="mt-3 max-w-4xl leading-7 text-[var(--muted)]">{item.a}</p></details>)}</div><p className="mt-4 text-xs leading-5 text-[var(--muted)]">{lab.guide.note}</p></div> : null}

          {experienceKey ? <LearningContext locale={locale} contentId={experienceKey} embedded /> : null}
        </div>
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="next">
        {(lab.challenge || lab.next) ? <div className="grid gap-8 lg:grid-cols-2">{lab.challenge ? <div className="border-t border-[var(--border)] pt-6"><div className="editorial-kicker">{copy.buildChallenge}</div><h3 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{lab.challenge.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{lab.challenge.body}</p>{lab.challenge.href && lab.challenge.button ? <Link className="editorial-primary-action mt-5" href={`${localizedPath(lab.challenge.href, locale)}${lab.challenge.query ?? ""}`}>{lab.challenge.button}</Link> : null}</div> : <div />}{lab.next ? <div className="border-t border-[var(--editorial-ink)] pt-6"><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{lab.next.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{lab.next.description}</p><Link className="editorial-primary-action mt-5" href={`${localizedPath(lab.next.href, locale)}${lab.next.query ?? ""}`}>{lab.next.button}</Link></div> : null}</div> : null}
      </ExperienceStage>
    </main>
  );
}
