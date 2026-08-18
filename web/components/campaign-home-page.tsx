import Link from "next/link";
import { localizedPath, segmentForLocale, type Locale } from "@/lib/content";
import type { CampaignContract, CampaignDiscoveryContent, CampaignExperience } from "@/lib/campaign";
import { commonUi } from "@/lib/ui-copy";

interface CampaignHomePageProps {
  locale: Locale;
  content: CampaignDiscoveryContent;
  contract: CampaignContract;
}

const GROUP_STATUS: Record<string, string> = {
  foundation: "KEEP AS FOUNDATION",
  specialist: "MERGE INTO FLAGSHIP",
  prerequisite: "PREREQUISITE NODE",
};

function experienceHref(experience: CampaignExperience, locale: Locale): string {
  return localizedPath(experience.route, locale);
}

export function CampaignHomePage({ locale, content, contract }: CampaignHomePageProps) {
  const segment = segmentForLocale(locale);
  const ui = commonUi(locale);
  const byId = Object.fromEntries(contract.experiences.map((experience) => [experience.id, experience]));
  const campaign = contract.primaryCampaign.map((id) => byId[id]).filter(Boolean);

  if (campaign.length !== 4) {
    throw new Error("AhaFrame v0.8 expects exactly four primary Campaign experiences.");
  }

  const first = campaign[0];
  const firstCopy = content.campaign.cards[first.id];
  const boss = campaign[3];
  const bossCopy = content.campaign.cards[boss.id];
  const groups: Array<[string, CampaignExperience[]]> = [
    ["foundation", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.foundation)],
    ["campaign", campaign],
    ["specialist", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.specialist)],
    ["prerequisite", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.prerequisite)],
  ];

  const labels = locale === "zh-CN"
    ? {
        preview: "事故预览",
        status: "READY",
        campaignIndex: "生产事故路径",
        finalBoss: "最终发布挑战",
        mapCount: "个体验",
      }
    : {
        preview: "Incident preview",
        status: "READY",
        campaignIndex: "Production incident path",
        finalBoss: "Final release challenge",
        mapCount: "experiences",
      };

  return (
    <main>
      <section className="hero-section border-b border-[var(--border)]">
        <div className="shell grid gap-14 py-20 sm:py-28 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-32">
          <div>
            <p className="eyebrow-label">{content.hero.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[4.6rem]">
              {content.hero.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              {content.hero.subheadline}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link className="primary-action" href={experienceHref(first, locale)}>
                {content.hero.primaryCta} <span aria-hidden="true">→</span>
              </Link>
              <a className="text-link" href="#campaign">
                {content.hero.secondaryCta} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <aside className="lab-preview" aria-label={labels.preview}>
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{labels.preview}</p>
                <p className="mt-1 text-sm font-bold">{firstCopy.step}</p>
              </div>
              <span className="status-dot"><span aria-hidden="true" />{labels.status}</span>
            </div>
            <div className="py-6">
              <h2 className="text-2xl font-black tracking-[-0.04em]">{firstCopy.title}</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">{firstCopy.incident}</p>
            </div>
            <div className="border-y border-[var(--border)] py-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{ui.evidence}</p>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
                {firstCopy.dimensions.map((dimension, index) => (
                  <div key={dimension} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-[var(--primary)]">0{index + 1}</span>
                    <span>{dimension}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--primary)]" href={experienceHref(first, locale)}>
              {firstCopy.cta} <span aria-hidden="true">→</span>
            </Link>
          </aside>
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
            <p className="py-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">{labels.campaignIndex}</p>
            {campaign.slice(0, 3).map((experience, index) => {
              const card = content.campaign.cards[experience.id];
              return (
                <Link
                  key={experience.id}
                  className="incident-row group grid gap-5 border-t border-[var(--border)] py-7 sm:grid-cols-[64px_1fr_auto] sm:items-start"
                  href={experienceHref(experience, locale)}
                >
                  <span className="font-mono text-sm font-bold text-[var(--primary)]">0{index + 1}</span>
                  <span>
                    <strong className="block text-xl font-black tracking-[-0.035em] sm:text-2xl">{card.title}</strong>
                    <span className="mt-2 block max-w-3xl text-sm leading-6 text-[var(--muted)]">{card.decision}</span>
                    <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                      {card.dimensions.map((dimension) => <span key={dimension}>{dimension}</span>)}
                    </span>
                  </span>
                  <span className="flex items-center gap-4 text-sm font-bold text-[var(--muted)] sm:pt-1">
                    {card.minutes}
                    <span className="text-[var(--primary)] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <article className="final-boss mt-10 grid gap-8 rounded-[20px] bg-[var(--text)] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">{labels.finalBoss}</p>
              <p className="mt-3 text-sm font-bold text-white/55">{bossCopy.step}</p>
              <h3 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{bossCopy.title}</h3>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/72">{bossCopy.incident}</p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{content.campaign.bossCopy}</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <span className="text-sm text-white/50">{bossCopy.minutes}</span>
              <Link className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[var(--text)] transition hover:opacity-90" href={experienceHref(boss, locale)}>
                {bossCopy.cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white py-20 sm:py-24">
        <div className="shell">
          <div className="max-w-3xl">
            <p className="eyebrow-label">{content.method.kicker}</p>
            <h2 className="section-title">{content.method.title}</h2>
            <p className="section-copy">{content.method.copy}</p>
          </div>
          <div className="mt-12 grid border-y border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {content.method.steps.map(([number, title, text], index) => (
              <article key={number} className={`py-7 sm:px-6 lg:py-8 ${index > 0 ? "lg:border-l lg:border-[var(--border)]" : ""}`}>
                <div className="font-mono text-xs font-bold text-[var(--primary)]">{number}</div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="py-20 sm:py-28">
        <div className="shell">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow-label">{content.knowledge.kicker}</p>
              <h2 className="section-title">{content.knowledge.title}</h2>
              <p className="section-copy">{content.knowledge.copy}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-[var(--muted)]">{contract.experiences.length} {locale === "zh-CN" ? labels.mapCount : ui.experiences}</span>
          </div>

          <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-[var(--border)] pt-10 lg:grid-cols-2">
            {groups.map(([key, items]) => {
              const group = content.knowledge.groups[key];
              return (
                <section key={key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-black tracking-[-0.03em]">{group.title}</h3>
                    <span className="font-mono text-xs text-[var(--muted)]">{items.length}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.description}</p>
                  <div className="mt-4 divide-y divide-[var(--border)]">
                    {items.map((experience) => {
                      const copy = content.knowledge.experiences[experience.id];
                      return (
                        <Link key={experience.id} className="group flex items-center justify-between gap-5 py-3.5" href={experienceHref(experience, locale)}>
                          <span>
                            <strong className="block text-sm">{copy.name}</strong>
                            <small className="mt-1 block leading-5 text-[var(--muted)]">{copy.note}</small>
                          </span>
                          <span className="text-[var(--primary)] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

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
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{content.closing.title}</h2>
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
