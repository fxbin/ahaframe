import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexResetCalendar } from "@/components/codex-reset-calendar";
import { getCodexResetSnapshot, type CodexResetEvent } from "@/lib/codex-reset-server";
import { localeFromSegment, localizedPath } from "@/lib/content";
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

function elapsed(value: string, locale: string) {
  const ms = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return locale === "zh-CN" ? `${minutes} 分钟前` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return locale === "zh-CN" ? `${hours} 小时前` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "zh-CN" ? `${days} 天前` : `${days}d ago`;
}

function isSameUtcDay(value: string, now = new Date()) {
  const date = new Date(value);
  return date.getUTCFullYear() === now.getUTCFullYear()
    && date.getUTCMonth() === now.getUTCMonth()
    && date.getUTCDate() === now.getUTCDate();
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
  const title = locale === "zh-CN"
    ? "Codex Reset Today — 实时状态、历史与提醒 | AhaFrame"
    : "Codex Reset Today — Live Status, History & Alerts | AhaFrame";
  const description = locale === "zh-CN"
    ? "追踪 Codex 是否已重置、最近一次确认时间、历史记录与来自 Tibo 的公开重置信号。"
    : "Track whether Codex reset today, the latest confirmed reset, reset history, and public reset signals from Tibo.";
  return pageMetadata(locale, title, description, "tools/codex-reset/");
}

export default async function CodexResetPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  const snapshot = await getCodexResetSnapshot(20);
  const latest = snapshot.latest;
  const resetToday = latest ? isSameUtcDay(latest.occurredAt) : false;
  const recentHistory = snapshot.history.slice(0, 6);
  const zh = locale === "zh-CN";
  const copy = zh ? {
    eyebrow: "AhaFrame Tools · Codex Reset Radar",
    title: "Codex 今天重置了吗？",
    todayConfirmed: "今天已确认发生重置",
    watching: "今天暂无已确认重置 · 正在监控",
    noData: "实时源和已保存快照暂不可用",
    checked: "AhaFrame 持续监控公开重置信号，并在可验证时优先保留 Tibo (@thsottiaux) 的原始 X 帖子。",
    lastReset: "最近确认重置",
    history: "最近重置历史",
    historyCopy: "主时间线只统计已确认的 Codex 全量额度重置；Banked Reset 单独处理。",
    eventTitle: "Codex 全量额度重置已确认",
    viewHistory: "查看完整历史 →",
    notify: "提醒功能即将上线",
    notifyCopy: "第一阶段先把检测准确性与历史数据跑稳，再接 Email / Browser Push。",
    rules: "了解重置规则",
    banked: "Banked Reset 是什么？",
    limits: "Codex Usage Limits 如何工作？",
    note: "AhaFrame 不代表 OpenAI。页面根据公开信号整理重置状态；能取得原帖时，始终优先展示 Tibo 原始 X 帖子作为可验证证据。确认帖时间也不等于每个账号实际到账时间。",
  } : {
    eyebrow: "AhaFrame Tools · Codex Reset Radar",
    title: "Did Codex reset today?",
    todayConfirmed: "Reset confirmed today",
    watching: "No confirmed reset today · watching",
    noData: "Live sources and saved snapshot are temporarily unavailable",
    checked: "AhaFrame continuously monitors public reset signals and preserves the original Tibo (@thsottiaux) X post whenever it is available for verification.",
    lastReset: "Last confirmed reset",
    history: "Recent reset history",
    historyCopy: "The main timeline only counts confirmed full usage resets. Banked resets are tracked separately.",
    eventTitle: "Full usage reset confirmed",
    viewHistory: "View full history →",
    notify: "Alerts are next",
    notifyCopy: "We are stabilizing detection and history first, then adding Email / Browser Push.",
    rules: "Reset rules",
    banked: "What is a Banked Reset?",
    limits: "How do Codex usage limits work?",
    note: "AhaFrame is not affiliated with OpenAI. Reset status is assembled from public signals; whenever available, the original Tibo X post remains the preferred verifiable evidence. A confirmation-post timestamp is not the exact time every account received the reset.",
  };

  return (
    <main className="shell py-12 md:py-16">
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-paper)] md:p-10">
        <p className="eyebrow-label">{copy.eyebrow}</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="editorial-display max-w-3xl text-4xl leading-[0.98] tracking-[-0.045em] md:text-6xl">{copy.title}</h1>
            <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${!snapshot.dataAvailable ? "bg-[var(--danger)]" : resetToday ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} />
              {!snapshot.dataAvailable ? copy.noData : resetToday ? copy.todayConfirmed : copy.watching}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.checked}</p>
          </div>

          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--paper)] p-5">
            <p className="technical-label">{copy.lastReset}</p>
            {latest ? (
              <>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{formatUtc(latest.occurredAt, locale)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{elapsed(latest.occurredAt, locale)}</p>
                {isTiboSource(latest) ? (
                  <a className="text-link mt-5 inline-flex text-sm font-semibold" href={latest.sourceUrl} target="_blank" rel="noreferrer">{sourceName(latest, zh)}</a>
                ) : (
                  <p className="mt-5 text-sm font-semibold text-[var(--muted)]">{sourceName(latest, zh)}</p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.watching}</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <div>
            <p className="technical-label">{copy.history}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.historyCopy}</p>
          </div>

          {snapshot.history.length > 0 ? (
            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <CodexResetCalendar events={snapshot.history} locale={locale} months={6} />
            </div>
          ) : null}

          <div className="mt-7 border-t border-[var(--border)] pt-2">
            <div className="divide-y divide-[var(--border)]">
              {recentHistory.length > 0 ? recentHistory.map((event) => (
                <div key={event.id} className="grid gap-3 py-4 sm:grid-cols-[160px_1fr_auto] sm:items-center">
                  <time className="font-mono text-xs text-[var(--muted)]">{formatUtc(event.occurredAt, locale)}</time>
                  <div>
                    <p className="text-sm font-semibold">{copy.eventTitle}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{sourceDescription(event, zh)}</p>
                  </div>
                  {isTiboSource(event) ? (
                    <a className="text-link text-xs font-semibold" href={event.sourceUrl} target="_blank" rel="noreferrer">{sourceName(event, zh)}</a>
                  ) : (
                    <span className="text-xs font-semibold text-[var(--muted)]">{sourceName(event, zh)}</span>
                  )}
                </div>
              )) : (
                <p className="py-5 text-sm text-[var(--muted)]">{copy.watching}</p>
              )}
            </div>
          </div>

          <Link className="text-link mt-5 inline-flex text-sm font-semibold" href={localizedPath("/tools/codex-reset/history", locale)}>{copy.viewHistory}</Link>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--primary-soft)] p-6">
            <p className="technical-label">{copy.notify}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.notifyCopy}</p>
          </div>
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="technical-label">{copy.rules}</p>
            <div className="mt-4 flex flex-col gap-3 text-sm font-semibold">
              <Link className="text-link" href={localizedPath("/tools/codex-reset/banked-reset", locale)}>{copy.banked} →</Link>
              <Link className="text-link" href={localizedPath("/tools/codex-reset/usage-limits", locale)}>{copy.limits} →</Link>
            </div>
          </div>
        </aside>
      </section>

      <p className="mt-8 text-xs leading-5 text-[var(--muted)]">{copy.note}</p>
    </main>
  );
}
