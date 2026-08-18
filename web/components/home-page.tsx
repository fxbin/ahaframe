import Link from "next/link";
import { localizedPath, segmentForLocale, type HomeContent, type Locale } from "@/lib/content";

interface HomePageProps {
  locale: Locale;
  content: HomeContent;
}

function SectionHeading({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h2>
      {copy ? <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg">{copy}</p> : null}
    </div>
  );
}

export function HomePage({ locale, content }: HomePageProps) {
  const segment = segmentForLocale(locale);

  return (
    <main>
      <section className="border-b border-[var(--border)] py-16 sm:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              {content.hero.headlineBefore} <span className="text-[var(--primary)]">{content.hero.headlineAccent}</span> {content.hero.headlineAfter}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{content.hero.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`/${segment}/lessons/token-playground/`}>
                {content.hero.primary}
              </Link>
              <Link className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold" href={`/${segment}/labs/rag-failure/`}>
                {content.hero.secondary}
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
              {content.hero.proofs.map((proof) => (
                <span key={proof}>✓ {proof}</span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{content.hero.demoBadge}</div>
                <div className="mt-1 text-xl font-black tracking-[-0.03em]">{content.hero.demoTitle}</div>
              </div>
              <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">M2 static shell</span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <div className="text-xs font-semibold text-[var(--muted)]">{content.hero.promptLabel}</div>
                <div className="mt-2 font-medium">Explain why production AI systems fail.</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <div className="text-xs font-semibold text-[var(--muted)]">{content.hero.predictionLabel}</div>
                <div className="mt-3 space-y-3 text-sm">
                  {[["because", 72], ["when", 18], ["under", 10]].map(([token, probability]) => (
                    <div key={String(token)}>
                      <div className="flex justify-between"><span>{token}</span><span>{probability}%</span></div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${probability}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-[var(--border)] p-4"><div className="text-xs text-[var(--muted)]">{content.hero.temperature}</div><div className="mt-1 font-bold">0.7</div></div>
                <div className="rounded-2xl border border-[var(--border)] p-4"><div className="text-xs text-[var(--muted)]">{content.hero.sampleToken}</div><div className="mt-1 font-bold">because</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="foundations" className="py-20 sm:py-24">
        <div className="shell">
          <SectionHeading kicker={content.foundations.kicker} title={content.foundations.title} copy={content.foundations.copy} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {content.foundations.cards.map((card) => (
              <Link key={card.slug} className="group rounded-[24px] border border-[var(--border)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]" href={`/${segment}/lessons/${card.slug}/`}>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]"><span>{card.number}</span><span>{card.category}</span></div>
                <h3 className="mt-8 text-2xl font-black tracking-[-0.04em]">{card.name}</h3>
                <p className="mt-3 min-h-14 leading-6 text-[var(--muted)]">{card.description}</p>
                <div className="mt-6 text-sm font-bold text-[var(--primary)]">{card.link}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white py-20 sm:py-24">
        <div className="shell">
          <SectionHeading kicker={content.production.kicker} title={content.production.title} copy={content.production.copy} />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {content.production.cards.map((card) => (
              <Link key={card.slug} className="rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-6 transition hover:border-[var(--primary)]" href={`/${segment}/labs/${card.slug}/`}>
                <div className="flex items-center justify-between gap-4"><span className="text-2xl">{card.icon}</span><span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)]">{card.status} · {card.layer}</span></div>
                <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">{card.name}</h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">{card.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{card.firstLabel}</div><div className="mt-2 text-sm leading-6">{card.first}</div></div>
                  <div className="rounded-2xl bg-white p-4"><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{card.secondLabel}</div><div className="mt-2 text-sm leading-6">{card.second}</div></div>
                </div>
                <div className="mt-6 text-sm font-bold text-[var(--primary)]">{card.link}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="shell">
          <SectionHeading kicker={content.method.kicker} title={content.method.title} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {content.method.items.map((item, index) => (
              <div key={item.name} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><div className="text-xs font-bold text-[var(--primary)]">0{index + 1}</div><h3 className="mt-4 text-xl font-black">{item.name}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="border-y border-[var(--border)] bg-[var(--text)] py-20 text-white sm:py-24">
        <div className="shell">
          <div className="max-w-3xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">{content.stack.kicker}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.stack.title}</h2><p className="mt-4 text-lg leading-8 text-white/65">{content.stack.copy}</p></div>
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {content.stack.layers.map(([name, description]) => <div key={name} className="rounded-[22px] border border-white/10 bg-white/5 p-5"><div className="font-bold">{name}</div><div className="mt-2 text-sm text-white/60">{description}</div></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.audience.title}</h2>
          <div className="grid gap-3">{content.audience.items.map(([name, description]) => <div key={name} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><div className="font-bold">{name}</div><div className="mt-1 text-[var(--muted)]">{description}</div></div>)}</div>
        </div>
      </section>

      <section className="pb-8">
        <div className="shell rounded-[30px] bg-[var(--surface-soft)] p-7 sm:p-10">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div><h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.cta.title}</h2><p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{content.cta.copy}</p></div>
            <form className="flex w-full max-w-xl flex-col gap-2 sm:flex-row" action={`/${segment}/early-access/`} method="get"><label className="sr-only" htmlFor="home-email">{content.cta.email}</label><input id="home-email" name="email" type="email" autoComplete="email" placeholder={content.cta.placeholder} className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]" /><button className="rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" type="submit">{content.cta.button}</button></form>
          </div>
        </div>
      </section>
    </main>
  );
}
