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
  const boss = campaign[3];
  const bossCopy = content.campaign.cards[boss.id];
  const groups: Array<[string, CampaignExperience[]]> = [
    ["foundation", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.foundation)],
    ["campaign", campaign],
    ["specialist", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.specialist)],
    ["prerequisite", contract.experiences.filter((item) => item.primaryStatus === GROUP_STATUS.prerequisite)],
  ];

  return (
    <main>
      <section className="border-b border-[var(--border)] py-16 sm:py-24">
        <div className="shell grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{content.hero.headline}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.hero.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white" href={experienceHref(first, locale)}>{content.hero.primaryCta} →</Link>
              <a className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-bold" href="#campaign">{content.hero.secondaryCta}</a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {content.hero.proof.map(([value, label]) => <div key={label} className="rounded-2xl border border-[var(--border)] bg-white p-4"><strong className="block text-2xl font-black tracking-[-0.04em]">{value}</strong><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{label}</span></div>)}
            </div>
          </div>

          <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--text)] p-6 text-white shadow-[var(--shadow)] sm:p-7">
            <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">{content.hero.queueTitle}</span><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">{content.hero.queueStatus}</span></div>
            <div className="mt-5 divide-y divide-white/10">{content.hero.queue.map(([number, title, text]) => <div key={number} className="grid grid-cols-[auto_1fr] gap-4 py-4"><div className="text-xs font-black text-[var(--accent)]">{number}</div><div><div className="font-bold">{title}</div><p className="mt-1 text-sm leading-6 text-white/55">{text}</p></div></div>)}</div>
          </aside>
        </div>
      </section>

      <section id="campaign" className="py-20 sm:py-24">
        <div className="shell">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.campaign.kicker}</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.campaign.title}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.campaign.copy}</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {campaign.slice(0, 3).map((experience) => {
              const card = content.campaign.cards[experience.id];
              return <Link key={experience.id} className="rounded-[24px] border border-[var(--border)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]" href={experienceHref(experience, locale)}><div className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--primary)]">{card.step}</div><h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">{card.title}</h3><p className="mt-3 leading-7 text-[var(--text)]">{card.incident}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.decision}</p><div className="mt-5 flex flex-wrap gap-2">{card.dimensions.map((dimension) => <span key={dimension} className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--muted)]">{dimension}</span>)}</div><div className="mt-6 flex items-center justify-between text-sm"><span className="text-[var(--muted)]">{card.minutes}</span><strong className="text-[var(--primary)]">{card.cta} →</strong></div></Link>;
            })}
          </div>

          <article className="mt-4 grid gap-7 rounded-[28px] bg-[var(--text)] p-7 text-white sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">{content.campaign.bossKicker}</p><h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">{bossCopy.title}</h3><p className="mt-3 max-w-3xl text-lg leading-8 text-white/75">{bossCopy.incident}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{content.campaign.bossCopy}</p><div className="mt-5 flex flex-wrap gap-2">{bossCopy.dimensions.map((dimension) => <span key={dimension} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">{dimension}</span>)}</div></div>
            <div className="flex flex-col items-start gap-3 lg:items-end"><span className="text-sm text-white/55">{bossCopy.minutes}</span><Link className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--text)]" href={experienceHref(boss, locale)}>{bossCopy.cta} →</Link></div>
          </article>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white py-20 sm:py-24">
        <div className="shell">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.method.kicker}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.method.title}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.method.copy}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{content.method.steps.map(([number, title, text]) => <article key={number} className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-5"><div className="text-xs font-black text-[var(--primary)]">{number}</div><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="roadmap" className="py-20 sm:py-24">
        <div className="shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.knowledge.kicker}</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.knowledge.title}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.knowledge.copy}</p></div><span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs text-[var(--muted)]">{contract.experiences.length} {ui.experiences}</span></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">{groups.map(([key, items]) => { const group = content.knowledge.groups[key]; return <article key={key} className="rounded-[24px] border border-[var(--border)] bg-white p-6"><h3 className="text-xl font-black">{group.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{group.description}</p><div className="mt-5 divide-y divide-[var(--border)]">{items.map((experience) => { const copy = content.knowledge.experiences[experience.id]; return <Link key={experience.id} className="flex items-center justify-between gap-4 py-4" href={experienceHref(experience, locale)}><span><strong className="block">{copy.name}</strong><small className="mt-1 block leading-5 text-[var(--muted)]">{copy.note}</small></span><span aria-hidden="true" className="text-[var(--primary)]">→</span></Link>; })}</div></article>; })}</div>
        </div>
      </section>

      <section id="about" className="border-y border-[var(--border)] bg-[var(--surface-soft)] py-20 sm:py-24"><div className="shell"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">{content.about.kicker}</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">{content.about.title}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{content.about.copy}</p><div className="mt-9 grid gap-4 lg:grid-cols-3">{content.about.points.map(([title, text]) => <article key={title} className="rounded-[22px] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></article>)}</div></div></section>

      <section className="py-16 sm:py-20"><div className="shell grid gap-7 rounded-[30px] bg-[var(--text)] p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="text-3xl font-black tracking-[-0.04em]">{content.closing.title}</h2><p className="mt-3 max-w-2xl leading-7 text-white/65">{content.closing.copy}</p></div><div className="flex flex-wrap gap-3"><Link className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--text)]" href={experienceHref(first, locale)}>{content.closing.primary} →</Link><Link className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold" href={`/${segment}/early-access/?intent=validation-alpha`}>{content.closing.secondary}</Link></div></div></section>
    </main>
  );
}
