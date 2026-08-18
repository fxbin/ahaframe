import Link from "next/link";
import { localizedPath, type IntegratedBuildContent, type Locale } from "@/lib/content";

interface BuildPageProps {
  locale: Locale;
  content: IntegratedBuildContent;
}

export function BuildPage({ locale, content }: BuildPageProps) {
  const build = content.build;

  return (
    <main className="py-12 sm:py-16">
      <section className="shell">
        <div className="flex flex-wrap gap-2">{build.badges.map((badge) => <span key={badge} className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-bold text-[var(--muted)]">{badge}</span>)}</div>
        <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{build.name}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-[var(--muted)]">{build.hero}</p>
        <div className="mt-3 text-sm text-[var(--muted)]">{build.level} · {build.minutes} min</div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black tracking-[-0.04em]">Six-layer architecture</h2><span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">M2 static parity shell</span></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{Object.entries(build.groups).map(([key, group]) => <article key={key} className="rounded-2xl bg-[var(--surface-soft)] p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">{group.label}</div><div className="mt-3 space-y-2">{Object.values(group.options).map((option, index) => <div key={option} className={`rounded-xl border px-3 py-2 text-sm ${index === 1 ? "border-[var(--primary)] bg-white font-semibold" : "border-[var(--border)] bg-white/65 text-[var(--muted)]"}`}>{option}</div>)}</div></article>)}</div>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_5%,white)] p-4 text-sm leading-6 text-[var(--muted)]"><strong className="text-[var(--text)]">M3 boundary:</strong> architecture scoring, release decisions, blockers, warnings, checkpoints, and compare behavior stay in the existing deterministic Engine. This page only ports the crawlable content and control contract.</div>
          </div>
          <aside className="rounded-[28px] bg-[var(--text)] p-6 text-white sm:p-8"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">In one sentence</div><p className="mt-4 text-xl font-semibold leading-8">{build.quick}</p></aside>
        </div>
      </section>

      <section className="shell mt-16 grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{build.explainer.eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{build.explainer.title}</h2></div>
        <div className="space-y-5">{build.explainer.paragraphs.map((paragraph, index) => <p key={index} className="leading-8 text-[var(--muted)]">{paragraph}</p>)}</div>
      </section>

      <section className="shell mt-16 rounded-[28px] bg-[var(--surface-soft)] p-7 sm:p-9"><h2 className="text-2xl font-black tracking-[-0.04em]">{build.next.title}</h2><p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">{build.next.description}</p><Link className="mt-5 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`${localizedPath(build.next.href, locale)}${build.next.query ?? ""}`}>{build.next.button}</Link></section>
    </main>
  );
}
