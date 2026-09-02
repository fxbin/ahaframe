import Link from "next/link";
import { ExperienceSequence, ExperienceStage } from "@/components/experience-page-sequence";
import { LearningContext } from "@/components/learning-context";
import { FoundationRuntimeWorkspace } from "@/components/runtime/foundation-runtime-workspace";
import { localizedPath, type FoundationContent, type LessonContent, type Locale } from "@/lib/content";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";

interface LessonPageProps {
  locale: Locale;
  ui: FoundationContent["ui"];
  lesson: LessonContent;
  experienceKey?: RuntimeExperienceKey;
}

type LessonPathStep = LessonContent["path"][number];
type CanonicalLessonContent = Omit<LessonContent, "path"> & {
  path?: LessonContent["path"];
  nodes?: string[];
  timeline?: string[];
};

function resolveLessonPath(lesson: LessonContent): LessonPathStep[] {
  const source = lesson as CanonicalLessonContent;
  if (source.path?.length) return source.path;

  if (source.nodes?.length && source.timeline?.length) {
    if (source.nodes.length !== source.timeline.length) {
      throw new Error(`Lesson path contract mismatch for ${lesson.name}: nodes and timeline must have equal length.`);
    }
    return source.nodes.map((name, index) => ({
      name,
      description: source.timeline![index],
    }));
  }

  throw new Error(`Lesson path contract missing for ${lesson.name}: expected path or nodes + timeline.`);
}

export function LessonPage({ locale, ui, lesson, experienceKey }: LessonPageProps) {
  const lessonPath = resolveLessonPath(lesson);

  return (
    <main className="py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>{lesson.category}</span><span>·</span><span>{lesson.level}</span><span>·</span><span>{lesson.minutes} {ui.minutes}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{lesson.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{lesson.description}</p>
      </section>

      <ExperienceSequence locale={locale} />

      <ExperienceStage locale={locale} stage="experience">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 sm:p-8">
            <h3 className="text-xl font-black tracking-[-0.03em]">{ui.lessonPath}</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{lessonPath.map((step, index) => <div key={step.name} className={`rounded-2xl border p-4 ${step.state === "active" ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,white)]" : "border-[var(--border)] bg-[var(--bg)]"}`}><div className="text-xs font-bold text-[var(--primary)]">0{index + 1}</div><div className="mt-2 font-bold">{step.name}</div><div className="mt-1 text-sm text-[var(--muted)]">{step.description}</div></div>)}</div>
          </div>

          <aside className="rounded-[28px] bg-[var(--text)] p-6 text-white sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{ui.inOneSentence}</div>
            <p className="mt-4 text-xl font-semibold leading-8">{lesson.quick}</p>
            <div className="mt-8 text-xs font-bold uppercase tracking-[0.12em] text-white/50">{ui.whatYouLearn}</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">{lesson.learn.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--accent)]">✓</span><span>{item}</span></li>)}</ul>
          </aside>
        </div>

        {experienceKey ? <div className="mt-8"><FoundationRuntimeWorkspace locale={locale} experienceKey={experienceKey} /></div> : null}
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="reflection">
        <h3 className="text-2xl font-black tracking-[-0.04em]">{ui.keyTakeaways}</h3>
        <div className="mt-6 grid gap-3 md:grid-cols-2">{lesson.takeaways.map(([title, body]) => <article key={title} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><h4 className="font-bold">{title}</h4><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div>
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="learn-more">
        <div className="space-y-12">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{ui.conceptGuide}</p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">{lesson.guide.title}</h3>
              <p className="mt-4 leading-7 text-[var(--muted)]">{lesson.guide.intro}</p>
            </div>
            <div className="space-y-4">{lesson.guide.sections.map((section) => <article key={section.title} className="rounded-[22px] border border-[var(--border)] bg-white p-6"><h4 className="text-lg font-bold">{section.title}</h4><p className="mt-2 leading-7 text-[var(--muted)]">{section.body}</p></article>)}</div>
          </div>

          <div>
            <h3 className="text-2xl font-black tracking-[-0.04em]">{ui.commonQuestions}</h3>
            <div className="mt-6 divide-y divide-[var(--border)] rounded-[24px] border border-[var(--border)] bg-white">{lesson.guide.faq.map((item) => <details key={item.q} className="group p-5"><summary className="cursor-pointer font-bold">{item.q}</summary><p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">{item.a}</p></details>)}</div>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{lesson.guide.note}</p>
          </div>

          {experienceKey ? <LearningContext locale={locale} contentId={experienceKey} embedded /> : null}
        </div>
      </ExperienceStage>

      <ExperienceStage locale={locale} stage="next">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[26px] bg-[var(--surface-soft)] p-7"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{ui.buildChallenge}</div><h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">{lesson.challenge.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{lesson.challenge.body}</p></div>
          <div className="rounded-[26px] border border-[var(--border)] bg-white p-7"><h3 className="text-2xl font-black tracking-[-0.04em]">{lesson.next.title}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{lesson.next.description}</p><Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(lesson.next.href, locale)}${lesson.next.query ?? ""}`}>{lesson.next.button}</Link></div>
        </div>
      </ExperienceStage>
    </main>
  );
}
