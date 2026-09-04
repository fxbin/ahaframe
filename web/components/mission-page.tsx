import Link from "next/link";
import { ExperienceSequence, ExperienceStage } from "@/components/experience-page-sequence";
import { LearningContext } from "@/components/learning-context";
import { MissionRuntimeWorkspace } from "@/components/runtime/mission-runtime-workspace";
import { localizedPath, type Locale } from "@/lib/content";
import type { MissionContent } from "@/lib/mission";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";
import { commonUi } from "@/lib/ui-copy";

interface MissionPageProps {
  locale: Locale;
  mission: MissionContent;
  experienceKey: RuntimeExperienceKey;
}

export function MissionPage({ locale, mission, experienceKey }: MissionPageProps) {
  const copy = commonUi(locale);

  return (
    <main className="editorial-experience-page py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]"><span>{mission.layer}</span><span>·</span><span>{mission.level}</span><span>·</span><span>{mission.minutes} {copy.minutes}</span></div>
        <h1 className="mt-5 max-w-5xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">{mission.name}</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--muted)]">{mission.hero}</p>
      </section>

      <ExperienceSequence locale={locale} />

      <ExperienceStage locale={locale} stage="experience">
        <article className="bg-[var(--editorial-ink)] p-7 text-white sm:p-9">
          <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">{mission.brief.eyebrow}</div>
          <h3 className="mt-3 max-w-4xl font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{mission.brief.title}</h3>
          <p className="mt-3 text-sm font-semibold text-white/80">{mission.brief.role}</p>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">{mission.brief.body}</p>
          <div className="mt-7 grid gap-x-8 gap-y-0 border-y border-white/15 md:grid-cols-2"><div className="py-5 md:border-r md:border-white/15 md:pr-8"><div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">{copy.objective}</div><p className="mt-2 text-sm leading-6 text-white/75">{mission.brief.objective}</p></div><div className="border-t border-white/15 py-5 md:border-t-0 md:pl-8"><div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">{copy.stakes}</div><p className="mt-2 text-sm leading-6 text-white/75">{mission.brief.stakes}</p></div></div>
        </article>

        <div className="mt-5 border-l-2 border-[var(--brand-accent)] bg-[var(--surface)] py-4 pl-5"><div className="editorial-kicker">{copy.inOneSentence}</div><p className="mt-3 max-w-4xl font-[family-name:var(--font-editorial)] text-xl font-semibold leading-8">{mission.quick}</p></div>

        <div className="mt-8"><MissionRuntimeWorkspace locale={locale} mission={mission} experienceKey={experienceKey} /></div>
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="reflection">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="editorial-kicker">{mission.debrief.eyebrow}</p><h3 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{mission.debrief.title}</h3><p className="mt-4 font-semibold leading-7">{mission.debrief.rule}</p></div>
          <div><p className="leading-8 text-[var(--muted)]">{mission.debrief.body}</p><ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">{mission.debrief.points.map((point) => <li key={point} className="flex gap-3 py-4 text-sm leading-6"><span className="font-bold text-[var(--brand-accent)]">—</span><span>{point}</span></li>)}</ul></div>
        </div>

        {mission.takeaways?.length ? <div className="mt-12"><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{copy.keyTakeaways}</h3><div className="mt-6 grid gap-x-8 gap-y-0 md:grid-cols-3">{mission.takeaways.map(([title, body]) => <article key={title} className="border-t border-[var(--border)] py-5"><h4 className="font-semibold">{title}</h4><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></div> : null}
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="learn-more">
        <div className="space-y-12">
          {mission.incidentLedger?.length ? <div><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{copy.incidentLedger}</h3><div className="mt-6 grid gap-x-8 gap-y-0 md:grid-cols-2">{mission.incidentLedger.map(([title, body]) => <article key={title} className="border-t border-[var(--border)] py-5"><h4 className="font-semibold">{title}</h4><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></div> : null}

          <LearningContext locale={locale} contentId={experienceKey} embedded />
        </div>
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="next">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="border-t border-[var(--editorial-ink)] pt-6"><h3 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{mission.next.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{mission.next.description}</p><Link className="editorial-primary-action mt-5" href={`${localizedPath(mission.next.href, locale)}${mission.next.query ?? ""}`}>{mission.next.button}</Link></div>
          {mission.earlyAccess ? <div className="border-t border-[var(--border)] pt-6"><p className="editorial-kicker">EARLY ACCESS</p><h3 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{mission.earlyAccess.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{mission.earlyAccess.description}</p><Link className="editorial-text-link mt-5" href={`${localizedPath(mission.earlyAccess.href, locale)}${mission.earlyAccess.query ?? ""}`}>{mission.earlyAccess.button}</Link></div> : null}
        </div>
      </ExperienceStage>
    </main>
  );
}
