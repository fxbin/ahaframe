import Link from "next/link";
import { localizedPath, type FoundationContent, type LessonContent, type Locale } from "@/lib/content";

interface LessonPageProps {
  locale: Locale;
  ui: FoundationContent["ui"];
  lesson: LessonContent;
}

export function LessonPage({ locale, ui, lesson }: LessonPageProps) {
  return (
    <main className="py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>{lesson.category}</span><span>·</span><span>{lesson.level}</span><span>·</span><span>{lesson.minutes} {ui.minutes}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{lesson.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{lesson.description}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-black tracking-[-0.03em]">{ui.lessonPath}</h2><span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">M2 · server rendered</span></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lesson.path.map((step, index) => <div key={step.name} className={`rounded-2xl border p-4 ${step.state === "active" ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,white)]" : "border-[var(--border)] bg-[var(--bg)]"}`}><div className="text-xs font-bold text-[var(--primary)]">0{index + 1}</div><div className="mt-2 font-bold">{step.name}</div><div className="mt-1 text-sm text-[var(--muted)]">{step.description}</div></div>)}</div>
            {lesson.labels ? <div className="mt-6 rounded-2xl bg-[var(--surface-soft)] p-5"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Interactive surface contract</div><div className="mt-4 grid gap-2 sm:grid-cols-2">{Object.values(lesson.labels).slice(0, 8).map((label) => <div key={label} className="rounded-xl bg-white px-3 py-2 text-sm">{label.replace(/<br\s*\/?>(.*)?/gi, " ")}</div>)}</div><p className="mt-4 text-xs leading-5 text-[var(--muted)]">The deterministic Lab Engine is intentionally mounted in Platform M3 (#28). M2 keeps the learning content crawlable without client JavaScript.</p></div> : null}
          </div>

          <aside className="rounded-[28px] bg-[var(--text)] p-6 text-white sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{ui.inOneSentence}</div>
            <p className="mt-4 text-xl font-semibold leading-8">{lesson.quick}</p>
            <div className="mt-8 text-xs font-bold uppercase tracking-[0.12em] text-white/50">{ui.whatYouLearn}</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">{lesson.learn.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--accent)]">✓</span><span>{item}</span></li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="shell mt-16">
        <h2 className="text-3xl font-black tracking-[-0.04em]">{ui.keyTakeaways}</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">{lesson.takeaways.map(([title, body]) => <article key={title} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div>
      </section>

      <section className="shell mt-16 grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{ui.conceptGuide}</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{lesson.guide.title}</h2>
          <p className="mt-4 leading-7 text-[var(--muted)]">{lesson.guide.intro}</p>
        </div>
        <div className="space-y-4">{lesson.guide.sections.map((section) => <article key={section.title} className="rounded-[22px] border border-[var(--border)] bg-white p-6"><h3 className="text-lg font-bold">{section.title}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{section.body}</p></article>)}</div>
      </section>

      <section className="shell mt-16">
        <h2 className="text-3xl font-black tracking-[-0.04em]">{ui.commonQuestions}</h2>
        <div className="mt-6 divide-y divide-[var(--border)] rounded-[24px] border border-[var(--border)] bg-white">{lesson.guide.faq.map((item) => <details key={item.q} className="group p-5"><summary className="cursor-pointer font-bold">{item.q}</summary><p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">{item.a}</p></details>)}</div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{lesson.guide.note}</p>
      </section>

      <section className="shell mt-16 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[26px] bg-[var(--surface-soft)] p-7"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{ui.buildChallenge}</div><h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">{lesson.challenge.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{lesson.challenge.body}</p></div>
        <div className="rounded-[26px] border border-[var(--border)] bg-white p-7"><h2 className="text-2xl font-black tracking-[-0.04em]">{lesson.next.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{lesson.next.description}</p><Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(lesson.next.href, locale)}${lesson.next.query ?? ""}`}>{lesson.next.button}</Link></div>
      </section>
    </main>
  );
}
