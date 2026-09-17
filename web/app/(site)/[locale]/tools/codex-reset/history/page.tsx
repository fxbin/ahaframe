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

function historyStats(events: CodexResetEvent[]) {
  const chronological = [...events].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
  const gaps = chronological.slice(1).map((event, index) => {
    return (Date.parse(event.occurredAt) - Date.parse(chronological[index].occurredAt)) / 86_400_000;
  });

  return {
    count: events.length,
    averageGap: gaps.length ? gaps.reduce((sum, value) => sum + value, 0) / gaps.length : null,
    longestGap: gaps.length ? Math.max(...gaps) : null,
  };
}

function formatDays(value: number | null, zh: boolean) {
  if (value === null) return "—";
  return zh ? `${value.toFixed(1)} 天` : `${value.toFixed(1)} days`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "Codex Reset History — 重置历史 | AhaFrame" : "Codex Reset History — Confirmed Reset Timeline | AhaFrame";
  const description = locale === "zh-CN"
    ? "查看 Codex 已确认的全量 Usage Reset 历史记录、日历、时间间隔与公开来源。"
    : "Browse confirmed Codex full usage reset history with a calendar, interval statistics, timestamps, and public source evidence.";
  return pageMetadata(locale, title, description, "tools/codex-reset/history/");
}

export default async function CodexResetHistoryPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const snapshot = await getCodexResetSnapshot(100);
  const zh = locale === "zh-CN";
  const stats = historyStats(snapshot.history);

  return (
    <main className="shell py-12 md:py-16">
      <section className="max-w-4xl">
        <p className="eyebrow-label">AhaFrame Tools · Codex Reset Radar</p>
        <h1 className="editorial-display mt-5 text-4xl tracking-[-0.045em] md:text-6xl">{zh ? "Codex 重置历史" : "Codex reset history"}</h1>
        <p className="section-copy">{zh
          ? "这里记录已确认的全量 Codex Usage Reset。Banked Reset 不会混入主时间线。每条记录都尽量指向可验证的原始公开来源。"
          : "This timeline records confirmed full Codex usage resets. Banked resets stay separate, and each event points to the strongest verifiable public source we have."}</p>
      </section>

      {snapshot.history.length > 0 ? (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="technical-label">{zh ? "已追踪重置" : "Tracked resets"}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{stats.count}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{zh ? "当前可验证历史" : "in the current verified history"}</p>
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="technical-label">{zh ? "平均间隔" : "Average gap"}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{formatDays(stats.averageGap, zh)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{zh ? "历史描述，不是重置周期" : "historical, not a reset schedule"}</p>
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="technical-label">{zh ? "最长间隔" : "Longest gap"}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{formatDays(stats.longestGap, zh)}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{zh ? "基于当前历史样本" : "within the current sample"}</p>
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="technical-label">{zh ? "最近一次" : "Latest reset"}</p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em]">{formatUtc(snapshot.history[0].occurredAt, locale)}</p>
              {isTiboSource(snapshot.history[0]) ? (
                <a className="text-link mt-2 inline-flex text-xs font-semibold" href={snapshot.history[0].sourceUrl} target="_blank" rel="noreferrer">
                  {sourceName(snapshot.history[0], zh)}
                </a>
              ) : (
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{sourceName(snapshot.history[0], zh)}</p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <CodexResetCalendar events={snapshot.history} locale={locale} weeks={26} />
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
                  <p className="text-sm font-semibold">{zh ? "全量 Usage Reset 已确认" : "Full usage reset confirmed"}</p>
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

      <p className="mt-8 text-xs leading-5 text-[var(--muted)]">{zh
        ? "AhaFrame 不代表 OpenAI。时间间隔仅描述已记录历史，不代表未来重置承诺或固定周期。公开信号可能共享上游数据，因此优先展示 Tibo 原始公告。"
        : "AhaFrame is not affiliated with OpenAI. Interval statistics describe recorded history only; they are not a promise or fixed reset schedule. Public signals can share upstream data, so original Tibo announcements are preferred whenever available."}</p>
    </main>
  );
}
