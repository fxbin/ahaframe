import Link from "next/link";
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
    <main className="py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><span>{mission.layer}</span><span>·</span><span>{mission.level}</span><span>·</span><span>{mission.minutes} {copy.minutes}</span></div>
        <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{mission.name}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-[var(--muted)]">{mission.hero}</p>

        <article className="mt-10 rounded-[28px] bg-[var(--text)] p-7 text-white sm:p-9">
          <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">{mission.brief.eyebrow}</div>
          <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.04em]">{mission.brief.title}</h2>
          <p className="mt-3 text-sm font-bold text-white/80">{mission.brief.role}</p>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-white/65">{mission.brief.body}</p>
          <div className="mt-7 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-xs font-bold uppercase tracking-[0.1em] text-white/45">{copy.objective}</div><p className="mt-2 text-sm leading-6 text-white/75">{mission.brief.objective}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-xs font-bold uppercase tracking-[0.1em] text-white/45">{copy.stakes}</div><p className="mt-2 text-sm leading-6 text-white/75">{mission.brief.stakes}</p></div></div>
        </article>

        <div className="mt-4 rounded-[24px] border border-[var(--border)] bg-white p-6"><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">{copy.inOneSentence}</div><p className="mt-3 max-w-4xl text-lg font-semibold leading-7">{mission.quick}</p></div>
      </section>

      <section className="shell mt-8"><MissionRuntimeWorkspace locale={locale} mission={mission} experienceKey={experienceKey} /></section>

      {mission.incidentLedger?.length ? <section className="shell mt-16"><h2 className="text-3xl font-black tracking-[-0.04em]">{copy.incidentLedger}</h2><div className="mt-6 grid gap-3 md:grid-cols-2">{mission.incidentLedger.map(([title, body]) => <article key={title} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></section> : null}

      {mission.takeaways?.length ? <section className="shell mt-16"><h2 className="text-3xl font-black tracking-[-0.04em]">{copy.keyTakeaways}</h2><div className="mt-6 grid gap-3 md:grid-cols-3">{mission.takeaways.map(([title, body]) => <article key={title} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></section> : null}

      <section className="shell mt-16 grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{mission.debrief.eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{mission.debrief.title}</h2><p className="mt-4 font-semibold leading-7">{mission.debrief.rule}</p></div>
        <div><p className="leading-8 text-[var(--muted)]">{mission.debrief.body}</p><ul className="mt-6 space-y-3">{mission.debrief.points.map((point) => <li key={point} className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6"><span className="font-bold text-[var(--primary)]">✓</span><span>{point}</span></li>)}</ul></div>
      </section>

      <LearningContext locale={locale} contentId={experienceKey} />

      <section className="shell mt-16 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[26px] bg-[var(--surface-soft)] p-7"><h2 className="text-2xl font-black tracking-[-0.04em]">{mission.next.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{mission.next.description}</p><Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(mission.next.href, locale)}${mission.next.query ?? ""}`}>{mission.next.button}</Link></div>
        {mission.earlyAccess ? <div className="rounded-[26px] border border-[var(--border)] bg-white p-7"><h2 className="text-2xl font-black tracking-[-0.04em]">{mission.earlyAccess.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{mission.earlyAccess.description}</p><Link className="mt-5 inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold" href={`${localizedPath(mission.earlyAccess.href, locale)}${mission.earlyAccess.query ?? ""}`}>{mission.earlyAccess.button}</Link></div> : null}
      </section>
    </main>
  );
}
