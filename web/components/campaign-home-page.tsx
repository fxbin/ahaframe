import Link from "next/link";
import { FirstAhaPanel } from "@/components/first-aha-panel";
import { LearningMapPreview } from "@/components/learning-map-preview";
import { localizedPath, segmentForLocale, type Locale } from "@/lib/content";
import type { CampaignContract, CampaignDiscoveryContent, CampaignExperience } from "@/lib/campaign";
import type { LearningStage } from "@/lib/learning-graph";

interface CampaignHomePageProps {
  locale: Locale;
  content: CampaignDiscoveryContent;
  contract: CampaignContract;
  learningStages: LearningStage[];
}

function experienceHref(experience: CampaignExperience, locale: Locale): string {
  return localizedPath(experience.route, locale);
}

export function CampaignHomePage({ locale, content, contract, learningStages }: CampaignHomePageProps) {
  const segment = segmentForLocale(locale);
  const byId = Object.fromEntries(contract.experiences.map((experience) => [experience.id, experience]));
  const campaign = contract.primaryCampaign.map((id) => byId[id]).filter(Boolean);

  if (campaign.length !== 4) {
    throw new Error("AhaFrame v0.8 expects exactly four primary Campaign experiences.");
  }

  const first = campaign[0];
  const firstAhaExperience = byId["agent-reliability"];
  if (!firstAhaExperience) {
    throw new Error("The First Aha homepage experience requires agent-reliability.");
  }

  const boss = campaign[3];
  const bossCopy = content.campaign.cards[boss.id];
  const labels = locale === "zh-CN"
    ? {
        campaignIndex: "事故索引",
        finalBoss: "最终发布挑战",
      }
    : {
        campaignIndex: "Incident index",
        finalBoss: "Final release challenge",
      };

  return (
    <main>
      <section className="hero-section border-b border-[var(--border)]" data-event="first_aha_incident_viewed">
        <div className="shell grid gap-12 py-16 sm:py-24 lg:grid-cols-[.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-28">
          <div>
            <p className="eyebrow-label">{content.hero.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[0.98] sm:text-6xl lg:text-[4.35rem]">
              {content.hero.headline}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              {content.hero.subheadline}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link className="primary-action" href={experienceHref(firstAhaExperience, locale)} data-event="first_aha_cta_clicked">
                {content.hero.primaryCta} <span aria-hidden="true">→</span>
              </Link>
              <a className="text-link" href="#campaign">
                {content.hero.secondaryCta} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <FirstAhaPanel
            locale={locale}
            content={content.hero.firstAha}
            href={experienceHref(firstAhaExperience, locale)}
            ctaLabel={content.hero.primaryCta}
          />
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow-label">{content.method.kicker}</p>
            <h2 className="section-title">{content.method.title}</h2>
            <p className="section-copy">{content.method.copy}</p>
          </div>

          <div className="mt-10 grid border-y border-[var(--border)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {content.method.steps.map(([number, title, text], index) => (
              <article
                key={number}
                className={`relative py-5 sm:px-5 xl:py-6 ${index > 0 ? "xl:border-l xl:border-[var(--border)]" : ""}`}
              >
                <div className="font-mono text-[11px] font-bold text-[var(--primary)]">{number}</div>
                <h3 className="mt-3 text-base font-bold tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{text}</p>
                {index < content.method.steps.length - 1 ? (
                  <span className="absolute right-[-7px] top-6 hidden text-sm text-[var(--border-strong)] xl:block" aria-hidden="true">→</span>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="campaign" className="py-20 sm:py-28">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow-label">{content.campaign.kicker}</p>
            <h2 className="section-title">{content.campaign.title}</h2>
            <p className="section-copy">{content.campaign.copy}</p>
          </div>

          <div className="mt-12 border-t border-[var(--border)]">
            <p className="py-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{labels.campaignIndex}</p>
            {campaign.slice(0, 3).map((experience, index) => {
              const card = content.campaign.cards[experience.id];
              return (
                <Link
                  key={experience.id}
                  className="incident-row group grid gap-5 border-t border-[var(--border)] py-8 sm:grid-cols-[54px_1fr_auto] sm:items-start"
                  href={experienceHref(experience, locale)}
                >
                  <span className="font-mono text-sm font-bold text-[var(--primary)]">0{index + 1}</span>
                  <span>
                    <span className="technical-label block text-[10px] text-[var(--muted)]">{card.step}</span>
                    <strong className="mt-2 block font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                      {card.title}
                    </strong>
                    <span className="mt-3 block max-w-3xl text-base leading-7 text-[var(--text)]">{card.decision}</span>
                    <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--muted)]">
                      {card.dimensions.map((dimension) => <span key={dimension}>{dimension}</span>)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-sm font-bold text-[var(--primary)] sm:pt-8">
                    <span>{card.cta}</span>
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <article className="final-boss mt-10 grid gap-8 rounded-[var(--radius)] bg-[var(--text)] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">{labels.finalBoss}</p>
              <p className="mt-3 text-sm font-bold text-white/55">{bossCopy.step}</p>
              <h3 className="mt-4 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{bossCopy.title}</h3>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">{bossCopy.incident}</p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{content.campaign.bossCopy}</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <Link className="rounded-[6px] bg-white px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:opacity-90" href={experienceHref(boss, locale)}>
                {bossCopy.cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <LearningMapPreview
        locale={locale}
        stages={learningStages}
        kicker={content.knowledge.kicker}
        title={content.knowledge.title}
        copy={content.knowledge.copy}
      />

      <section id="about" className="border-y border-[var(--border)] bg-[var(--surface-soft)] py-20 sm:py-24">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow-label">{content.about.kicker}</p>
            <h2 className="section-title">{content.about.title}</h2>
            <p className="section-copy">{content.about.copy}</p>
          </div>
          <div className="mt-12 grid gap-10 border-t border-[var(--border)] pt-9 lg:grid-cols-3">
            {content.about.points.map(([title, text], index) => (
              <article key={title}>
                <span className="font-mono text-xs font-bold text-[var(--primary)]">0{index + 1}</span>
                <h3 className="mt-4 font-black tracking-[-0.02em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="shell flex flex-col gap-7 border-b border-[var(--border)] pb-20 sm:flex-row sm:items-end sm:justify-between sm:pb-24">
          <div>
            <p className="eyebrow-label">AhaFrame</p>
            <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.closing.title}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{content.closing.copy}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-5">
            <Link className="primary-action" href={experienceHref(first, locale)}>{content.closing.primary} <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href={`/${segment}/early-access/?intent=validation-alpha`}>{content.closing.secondary}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
