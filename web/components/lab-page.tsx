import Link from "next/link";
import { localizedPath, type LabContent, type Locale } from "@/lib/content";
import { commonUi } from "@/lib/ui-copy";

interface LabPageProps {
  locale: Locale;
  lab: LabContent;
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

export function LabPage({ locale, lab }: LabPageProps) {
  const controls = previewEntries(lab.interactive);
  const copy = commonUi(locale);

  return (
    <main className="py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><span>{lab.layer}</span><span>·</span><span>{lab.level}</span><span>·</span><span>{lab.minutes} min</span></div>
        <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{lab.name}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-[var(--muted)]">{lab.hero}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 sm:p-8">
            <div><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{copy.productionLab}</div><h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{lab.name}</h2></div>
            {controls.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{controls.map(([key, value]) => <div key={key} className="rounded-2xl bg-[var(--surface-soft)] p-4"><div className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{titleCase(key)}</div><div className="mt-2 text-sm leading-6">{value}</div></div>)}</div> : null}
          </div>

          <aside className="rounded-[28px] bg-[var(--text)] p-6 text-white sm:p-8"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{copy.inOneSentence}</div><p className="mt-4 text-xl font-semibold leading-8">{lab.quick}</p></aside>
        </div>
      </section>

      {lab.takeaways?.length ? <section className="shell mt-16"><h2 className="text-3xl font-black tracking-[-0.04em]">{copy.keyTakeaways}</h2><div className="mt-6 grid gap-3 md:grid-cols-2">{lab.takeaways.map(([title, body]) => <article key={title} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p></article>)}</div></section> : null}

      {lab.guide ? <section className="shell mt-16 grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{lab.guide.eyebrow ?? lab.layer}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{lab.guide.title}</h2><p className="mt-4 leading-7 text-[var(--muted)]">{lab.guide.intro}</p></div><div className="space-y-4">{lab.guide.sections.map((section) => <article key={section.title} className="rounded-[22px] border border-[var(--border)] bg-white p-6"><h3 className="text-lg font-bold">{section.title}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{section.body}</p></article>)}</div></section> : null}

      {lab.guide?.faq?.length ? <section className="shell mt-16"><h2 className="text-3xl font-black tracking-[-0.04em]">{copy.commonQuestions}</h2><div className="mt-6 divide-y divide-[var(--border)] rounded-[24px] border border-[var(--border)] bg-white">{lab.guide.faq.map((item) => <details key={item.q} className="p-5"><summary className="cursor-pointer font-bold">{item.q}</summary><p className="mt-3 max-w-4xl leading-7 text-[var(--muted)]">{item.a}</p></details>)}</div><p className="mt-4 text-xs leading-5 text-[var(--muted)]">{lab.guide.note}</p></section> : null}

      {(lab.challenge || lab.next) ? <section className="shell mt-16 grid gap-4 lg:grid-cols-2">{lab.challenge ? <div className="rounded-[26px] bg-[var(--surface-soft)] p-7"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{copy.buildChallenge}</div><h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">{lab.challenge.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{lab.challenge.body}</p>{lab.challenge.href && lab.challenge.button ? <Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(lab.challenge.href, locale)}${lab.challenge.query ?? ""}`}>{lab.challenge.button}</Link> : null}</div> : <div />}{lab.next ? <div className="rounded-[26px] border border-[var(--border)] bg-white p-7"><h2 className="text-2xl font-black tracking-[-0.04em]">{lab.next.title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{lab.next.description}</p><Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(lab.next.href, locale)}${lab.next.query ?? ""}`}>{lab.next.button}</Link></div> : null}</section> : null}
    </main>
  );
}
