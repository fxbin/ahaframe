import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodexResetCalendar } from "@/components/codex-reset-calendar";
import { getCodexResetSnapshot, type CodexResetEvent } from "@/lib/codex-reset-server";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

function formatUtc(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function isTiboSource(event: CodexResetEvent) {
  return /x\.com\/thsottiaux|twitter\.com\/thsottiaux/i.test(event.sourceUrl);
}

function sourceName(event: CodexResetEvent, zh: boolean) {
  return isTiboSource(event)
    ? (zh ? "Tibo 原始 X 帖子 ↗" : "Tibo on X ↗")
    : (zh ? "公开信号" : "Public signal");
}

function sourceDescription(event: CodexResetEvent, zh: boolean) {
  return isTiboSource(event)
    ? "Tibo (@thsottiaux) on X"
    : (zh ? "公开重置信号" : "Public reset signal");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "Codex Reset History — 重置历史 | AhaFrame" : "Codex Reset History — Confirmed Reset Timeline | AhaFrame";
  const description = locale === "zh-CN"
    ? "查看 Codex 已确认的全量额度重置历史、月份日历、历史间隔与公开来源。"
    : "Browse confirmed Codex full usage reset history with a calendar, interval statistics, timestamps, and public source evidence.";
  return pageMetadata(locale, title, description, "tools/codex-reset/history/");
}

export default async function CodexResetHistoryPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const snapshot = await getCodexResetSnapshot(100);
  const zh = locale === "zh-CN";

  return (
    <main className="shell py-12 md:py-16">
      <section className="max-w-4xl">
        <p className="eyebrow-label">AhaFrame Tools · Codex Reset Radar</p>
        <h1 className="editorial-display mt-5 text-4xl tracking-[-0.045em] md:text-6xl">{zh ? "Codex 重置历史" : "Codex reset history"}</h1>
        <p className="section-copy">{zh
          ? "日历同时标记全量额度重置与重置卡公告；两者分别记录，重置间隔只计算全量重置。"
          : "The calendar marks full resets and reset-credit announcements separately; interval statistics include confirmed full resets only."}</p>
      </section>

      {(snapshot.history.length > 0 || snapshot.bankedHistory.length > 0) ? (
        <>
          <section className="mt-10 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <CodexResetCalendar events={snapshot.history} bankedEvents={snapshot.bankedHistory} locale={locale} months={6} />
          </section>
        </>
      ) : null}

      <section className="mt-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        {snapshot.history.length ? (
          <div className="divide-y divide-[var(--border)]">
            {snapshot.history.map((event, index) => (
              <article key={event.id} className="grid gap-3 py-5 md:grid-cols-[48px_220px_1fr_auto] md:items-center">
                <div className="font-mono text-xs text-[var(--muted)]">#{snapshot.history.length - index}</div>
                <time className="font-mono text-xs text-[var(--muted)]">{formatUtc(event.occurredAt, locale)}</time>
                <div>
                  <p className="text-sm font-semibold">{zh ? "Codex 全量额度重置已确认" : "Full usage reset confirmed"}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{sourceDescription(event, zh)}</p>
                </div>
                {isTiboSource(event) ? (
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-link text-xs font-semibold">{sourceName(event, zh)}</a>
                ) : (
                  <span className="text-xs font-semibold text-[var(--muted)]">{sourceName(event, zh)}</span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">{zh ? "暂时没有可用的历史数据。" : "No history is available yet."}</p>
        )}
      </section>

      <section className="mt-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        <h2 className="text-xl font-semibold">{zh ? "重置卡历史" : "Reset-credit history"}</h2>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          {zh ? "预告不等于已发放；公告也不代表每个账号都具备领取资格。" : "An announcement is not a confirmed grant, and public grants do not imply every account is eligible."}
        </p>
        {snapshot.bankedHistory.length ? (
          <div className="mt-4 divide-y divide-[var(--border)]">
            {snapshot.bankedHistory.map((event) => (
              <article key={event.id} className="grid gap-3 py-4 md:grid-cols-[220px_1fr_auto] md:items-center">
                <time className="font-mono text-xs text-[var(--muted)]">{formatUtc(event.occurredAt, locale)}</time>
                <p className="text-sm font-semibold text-[#7a4b04]">
                  {event.status === "confirmed"
                    ? (zh ? "已确认发放重置卡" : "Reset-credit grant confirmed")
                    : (zh ? "重置卡发放预告 · 待确认" : "Reset-credit grant announced · pending")}
                </p>
                {isTiboSource(event) ? (
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-link text-xs font-semibold">{sourceName(event, zh)}</a>
                ) : (
                  <span className="text-xs text-[var(--muted)]">{sourceName(event, zh)}</span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">{zh ? "暂无可验证的重置卡历史。" : "No verifiable reset-credit history yet."}</p>
        )}
      </section>

      <p className="mt-8 text-xs leading-5 text-[var(--muted)]">{zh
        ? "AhaFrame 不代表 OpenAI。时间间隔仅描述已记录历史，不代表未来重置承诺或固定周期。公开信号可能共享上游数据，因此优先展示 Tibo 原始公告。"
        : "AhaFrame is not affiliated with OpenAI. Interval statistics describe recorded history only; they are not a promise or fixed reset schedule. Public signals can share upstream data, so original Tibo announcements are preferred whenever available."}</p>
    </main>
  );
}
