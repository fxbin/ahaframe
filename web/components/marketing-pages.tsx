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
    <main className="editorial-marketing-page py-16 sm:py-20">
      <section className="shell">
        <p className="editorial-kicker">{pricing.kicker}</p>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
          {pricing.headlineBefore} <span className="text-[var(--brand-accent)]">{pricing.headlineAccent}</span>.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{pricing.intro}</p>

        <div className="mt-9 max-w-3xl border-y border-[var(--border)] py-5">
          <p className="technical-label">{pricing.statusLabel}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{pricing.statusCopy}</p>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-5 lg:grid-cols-2">
          {pricing.plans.map((plan) => (
            <article key={plan.name} className="flex flex-col border-t border-[var(--border)] py-7 sm:pr-10">
              <div className="editorial-kicker">{plan.badge}</div>
              <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{plan.name}</h2>
              <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">{plan.description}</p>
              <div className="mt-7 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-[family-name:var(--font-editorial)] text-4xl font-semibold tracking-[-0.05em]">{plan.price}</span>
                <span className="pb-1 text-sm text-[var(--muted)]">{plan.suffix}</span>
              </div>
              <ul className="mt-7 flex-1 space-y-3 text-sm leading-6">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-3 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0">
                    <span aria-hidden="true" className="text-[var(--brand-accent)]">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                className={plan.price === "$0" ? "editorial-primary-action mt-8 self-start" : "editorial-text-link mt-8 self-start"}
                href={localizedPath(plan.href, locale)}
                data-event={plan.event || undefined}
              >
                {plan.cta} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell mt-16 border-t border-[var(--border)] pt-10 sm:mt-20">
        <div className="max-w-3xl">
          <h2 className="font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{pricing.ctaTitle}</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">{pricing.ctaCopy}</p>
          <Link className="editorial-text-link mt-6" href={`/${segment}/early-access/`}>{pricing.ctaButton}</Link>
        </div>
      </section>
    </main>
  );
}

export function EarlyAccessPage({ locale, content }: MarketingPageProps) {
  const page = content.earlyAccess;

  return (
    <main className="editorial-marketing-page py-16 sm:py-20">
      <section className="shell grid gap-12 lg:grid-cols-[1fr_.85fr]">
        <div>
          <p className="editorial-kicker">{page.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
            {page.headlineBefore} <span className="text-[var(--brand-accent)]">{page.headlineAccent}</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{page.intro}</p>
          <div className="mt-10 border-y border-[var(--border)]">
            {page.cards.map(([number, title, description]) => (
              <div key={number} className="grid gap-3 border-b border-[var(--border)] py-5 last:border-b-0 sm:grid-cols-[44px_1fr]">
                <div className="course-number">{number}</div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="self-start border-t border-[var(--editorial-ink)] pt-6 sm:pt-7">
          <p className="editorial-kicker">EARLY ACCESS</p>
          <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">{page.eyebrow}</h2>
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
