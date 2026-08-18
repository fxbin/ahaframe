import Link from "next/link";
import { localizedPath, segmentForLocale, type Locale, type MarketingContent } from "@/lib/content";
import { WaitlistForm } from "@/components/waitlist-form";

interface MarketingPageProps {
  locale: Locale;
  content: MarketingContent;
}

export function PricingPage({ locale, content }: MarketingPageProps) {
  const pricing = content.pricing;
  const segment = segmentForLocale(locale);

  return (
    <main className="py-16 sm:py-20">
      <section className="shell">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{pricing.kicker}</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          {pricing.headlineBefore} <span className="text-[var(--primary)]">{pricing.headlineAccent}</span>.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{pricing.intro}</p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {pricing.plans.map((plan) => (
            <article key={plan.name} className="flex flex-col rounded-[26px] border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="min-h-7 text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{plan.badge}</div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{plan.name}</h2>
              <p className="mt-2 min-h-14 leading-6 text-[var(--muted)]">{plan.description}</p>
              <div className="mt-6"><span className="text-4xl font-black tracking-[-0.05em]">{plan.price}</span><span className="ml-2 text-sm text-[var(--muted)]">{plan.suffix}</span></div>
              <ul className="mt-6 flex-1 space-y-3 text-sm leading-6">
                {plan.items.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--primary)]">✓</span><span>{item}</span></li>)}
              </ul>
              <Link className="mt-7 inline-flex justify-center rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={localizedPath(plan.href, locale)}>{plan.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell mt-20">
        <h2 className="text-3xl font-black tracking-[-0.04em]">{pricing.compareTitle}</h2>
        <div className="mt-6 overflow-x-auto rounded-[24px] border border-[var(--border)] bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-[var(--surface-soft)]"><tr>{pricing.matrixHeaders.map((header) => <th key={header} className="border-b border-[var(--border)] px-5 py-4 font-bold">{header}</th>)}</tr></thead>
            <tbody>{pricing.matrixRows.map((row) => <tr key={row[0]} className="border-b border-[var(--border)] last:border-0">{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-semibold" : "text-[var(--muted)]"}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="shell mt-20 grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
        <h2 className="text-3xl font-black tracking-[-0.04em]">{pricing.sequenceTitle}</h2>
        <div className="space-y-3">{pricing.sequence.map(([name, description, status]) => <div key={name} className="grid gap-2 rounded-[22px] border border-[var(--border)] bg-white p-5 sm:grid-cols-[1fr_2fr_auto]"><div className="font-bold">{name}</div><div className="text-sm leading-6 text-[var(--muted)]">{description}</div><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">{status}</div></div>)}</div>
      </section>

      <section className="shell mt-20 rounded-[30px] bg-[var(--surface-soft)] p-8 sm:p-10">
        <h2 className="text-3xl font-black tracking-[-0.04em]">{pricing.ctaTitle}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{pricing.ctaCopy}</p>
        <Link className="mt-6 inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={`/${segment}/early-access/`}>{pricing.ctaButton}</Link>
      </section>
    </main>
  );
}

export function EarlyAccessPage({ locale, content }: MarketingPageProps) {
  const page = content.earlyAccess;

  return (
    <main className="py-16 sm:py-20">
      <section className="shell grid gap-12 lg:grid-cols-[1fr_.85fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{page.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">{page.headlineBefore} <span className="text-[var(--primary)]">{page.headlineAccent}</span>.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{page.intro}</p>
          <div className="mt-8 grid gap-3">{page.cards.map(([number, title, description]) => <div key={number} className="rounded-[22px] border border-[var(--border)] bg-white p-5"><div className="text-xs font-bold text-[var(--primary)]">{number}</div><div className="mt-2 font-bold">{title}</div><div className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</div></div>)}</div>
        </div>

        <aside className="self-start rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)] sm:p-8">
          <h2 className="text-2xl font-black tracking-[-0.04em]">{page.eyebrow}</h2>
          <div className="mt-6">
            <WaitlistForm
              locale={locale}
              emailLabel={page.emailLabel}
              placeholder={page.placeholder}
              button={page.button}
              trustNote={page.trustNote}
              successTitle={page.successTitle}
              successCopy={page.successCopy}
              successLink={page.successLink}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
