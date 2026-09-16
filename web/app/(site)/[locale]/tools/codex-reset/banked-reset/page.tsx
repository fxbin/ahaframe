import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  return pageMetadata(
    locale,
    locale === "zh-CN" ? "Codex Banked Reset 是什么？| AhaFrame" : "What Is a Codex Banked Reset? | AhaFrame",
    locale === "zh-CN" ? "了解 Codex Banked Reset 与全量 Usage Reset 的区别，以及为什么两者不应混在同一条重置时间线中。" : "Understand how a Codex banked reset differs from a full usage reset and why the two should be tracked separately.",
    "tools/codex-reset/banked-reset/",
  );
}

export default async function BankedResetPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const zh = locale === "zh-CN";

  return (
    <main className="shell py-12 md:py-16">
      <article className="max-w-3xl">
        <p className="eyebrow-label">AhaFrame Tools · Codex Reset Radar</p>
        <h1 className="editorial-display mt-5 text-4xl tracking-[-0.045em] md:text-6xl">{zh ? "Banked Reset 是什么？" : "What is a Banked Reset?"}</h1>
        <p className="section-copy">{zh
          ? "Banked Reset 是可由用户稍后主动使用的重置机会，不等同于 OpenAI 对大量账户统一执行的全量 Usage Reset。"
          : "A banked reset is a reset you can keep and apply later. It is different from a full usage reset that OpenAI applies broadly to accounts."}</p>

        <div className="mt-10 space-y-6">
          <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="technical-label">{zh ? "为什么要区分" : "Why we separate them"}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{zh
              ? "如果把 Banked Reset 的发放公告直接算成“Codex 已经重置”，用户会得到错误状态。因此 Reset Radar 的主时间线只记录已确认的全量重置；Banked Reset 作为独立事件类型保存。"
              : "Treating a banked-reset grant as “Codex has reset” would create false status. Reset Radar keeps confirmed full resets on the main timeline and stores banked resets as a separate event type."}</p>
          </section>
          <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="technical-label">{zh ? "使用后会发生什么" : "What happens when you use one"}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{zh
              ? "当前官方说明中，使用 Banked Reset 会刷新相关 Codex 使用窗口，并影响后续 weekly reset 日期。具体资格、可用性和规则可能调整，应以 OpenAI 当前 Usage 页面与帮助文档为准。"
              : "Under the current official rules, applying a banked reset refreshes the relevant Codex usage windows and changes the subsequent weekly reset date. Eligibility and availability can change, so the current OpenAI Usage page and help documentation remain authoritative."}</p>
            <a className="text-link mt-4 text-sm font-semibold" href="https://help.openai.com/en/articles/20001498-how-banked-codex-resets-work" target="_blank" rel="noreferrer">OpenAI help ↗</a>
          </section>
        </div>
      </article>
    </main>
  );
}
