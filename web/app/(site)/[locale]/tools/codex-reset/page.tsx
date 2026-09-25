import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexResetCalendar } from "@/components/codex-reset-calendar";
import { buildCodexResetForecast, type ResetForecastConfidence, type ResetForecastLevel } from "@/lib/codex-reset-forecast";
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

function forecastLevelLabel(level: ResetForecastLevel, zh: boolean) {
  const labels = zh ? {
    "very-low": "较低",
    low: "偏低",
    medium: "中等",
    high: "较高",
    "very-high": "很高",
    insufficient: "数据不足",
  } : {
    "very-low": "Very low",
    low: "Low",
    medium: "Medium",
    high: "High",
    "very-high": "Very high",
    insufficient: "Insufficient data",
  };
  return labels[level];
}

function confidenceLabel(confidence: ResetForecastConfidence, zh: boolean) {
  const labels = zh ? {
    "very-low": "很低",
    low: "低",
    medium: "中",
    high: "高",
  } : {
    "very-low": "Very low",
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[confidence];
}

function formatForecastDays(value: number | null, zh: boolean) {
  if (value === null) return "—";
  const formatted = value < 10 ? value.toFixed(1) : value.toFixed(0);
  return zh ? `${formatted} 天` : `${formatted} days`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN"
    ? "Codex Reset Today — 实时状态、历史与预测 | AhaFrame"
    : "Codex Reset Today — Live Status, History & Forecast | AhaFrame";
  const description = locale === "zh-CN"
    ? "追踪 Codex 是否已重置、最近一次确认时间、历史记录，以及基于历史节奏的未来 24 小时重置概率估计。"
    : "Track whether Codex reset today, the latest confirmed reset, reset history, and a historical-model estimate for the next 24 hours.";
  return pageMetadata(locale, title, description, "tools/codex-reset/");
}

export default async function CodexResetPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();

  // The page renders a small recent-history slice, but the forecast needs a
  // substantially larger sample so UI pagination never constrains the model.
  const snapshot = await getCodexResetSnapshot(100);
  const now = new Date();
  const latest = snapshot.latest;
  const resetToday = latest ? isSameUtcDay(latest.occurredAt, now) : false;
  const recentHistory = snapshot.history.slice(0, 6);
  const recentCredits = snapshot.bankedHistory.slice(0, 3);
  const forecast = buildCodexResetForecast(
    snapshot.history.map((event) => event.occurredAt),
    now,
    1,
  );
  const zh = locale === "zh-CN";
  const copy = zh ? {
    eyebrow: "AhaFrame Tools · Codex Reset Radar",
    title: "Codex 今天重置了吗？",
    todayConfirmed: "今天已确认发生重置",
    watching: "今天暂无已确认重置 · 正在监控",
    noData: "实时源和已保存快照暂不可用",
    checked: "AhaFrame 持续监控公开重置信号，并在可验证时优先保留 Tibo (@thsottiaux) 的原始 X 帖子。",
    lastReset: "最近确认重置",
    forecast: "重置预测",
    forecastTitle: "未来 24 小时重置可能性",
    forecastSettled: "今天已经确认发生重置，当前预测窗口已结算。",
    forecastInsufficient: "正在积累历史数据",
    forecastInsufficientCopy: "至少需要 5 个可用的 Full Reset 间隔，才会公开显示概率估计。",
    confidence: "置信度",
    sinceLast: "距上次重置",
    typicalInterval: "典型历史间隔",
    percentile: "当前间隔位置",
    percentileCopy: "已超过 {value}% 的历史间隔",
    sample: "可用历史",
    sampleCopy: "{resets} 次重置 · {intervals} 个间隔",
    model: "模型",
    modelCopy: "Weibull 生存模型 + Bayesian 平滑经验 Hazard",
    forecastNote: "这是基于已确认 Full Reset 历史的统计估计，不代表 OpenAI 官方计划，也不是下一次重置时间承诺。",
    history: "最近重置历史",
    historyCopy: "绿色表示已确认全量重置，琥珀色表示重置卡动态。重置节奏与预测仅使用全量重置。",
    credits: "重置卡动态",
    creditsSubtitle: "发放重置卡与全量重置是两种不同事件。",
    creditsConfirmed: "已确认发放",
    creditsAnnounced: "发放预告 · 待确认",
    creditsEmpty: "暂未获取到可验证的重置卡公告。",
    creditsCaution: "公开公告不代表你的账号必定符合领取条件，也不代表额度已经到账。",
    eventTitle: "Codex 全量额度重置已确认",
    viewHistory: "查看完整历史 →",
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
    forecast: "Reset forecast",
    forecastTitle: "Reset likelihood in the next 24 hours",
    forecastSettled: "A reset has already been confirmed today, so the current forecast window is settled.",
    forecastInsufficient: "Building the historical sample",
    forecastInsufficientCopy: "At least 5 usable Full Reset intervals are required before a probability estimate is published.",
    confidence: "Confidence",
    sinceLast: "Since last reset",
    typicalInterval: "Typical historical interval",
    percentile: "Current gap position",
    percentileCopy: "Longer than {value}% of historical intervals",
    sample: "Usable history",
    sampleCopy: "{resets} resets · {intervals} intervals",
    model: "Model",
    modelCopy: "Weibull survival model + Bayesian-smoothed empirical hazard",
    forecastNote: "This is a statistical estimate from confirmed Full Reset history. It is not an OpenAI schedule or a promise of when the next reset will occur.",
    history: "Recent reset history",
    historyCopy: "Green marks confirmed full resets; amber marks reset-credit activity. Rhythm and forecasts use only full resets.",
    credits: "Reset-credit activity",
    creditsSubtitle: "Reset-credit grants and full usage resets are different events.",
    creditsConfirmed: "Grant confirmed",
    creditsAnnounced: "Grant announced · pending",
    creditsEmpty: "No verifiable reset-credit announcements are available.",
    creditsCaution: "A public grant announcement does not guarantee eligibility or mean a credit has reached your account.",
    eventTitle: "Full usage reset confirmed",
    viewHistory: "View full history →",
    rules: "Reset rules",
    banked: "What is a Banked Reset?",
    limits: "How do Codex usage limits work?",
    note: "AhaFrame is not affiliated with OpenAI. Reset status is assembled from public signals; whenever available, the original Tibo X post remains the preferred verifiable evidence. A confirmation-post timestamp is not the exact time every account received the reset.",
  };

  const percentileText = forecast.historicalPercentile === null
    ? "—"
    : copy.percentileCopy.replace("{value}", String(Math.round(forecast.historicalPercentile * 100)));
  const sampleText = copy.sampleCopy
    .replace("{resets}", String(forecast.sampleSize))
    .replace("{intervals}", String(forecast.intervalCount));

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

      <section className="mt-8 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="technical-label">{copy.forecast}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{copy.forecastTitle}</h2>

            {resetToday ? (
              <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--primary-soft)] p-5">
                <p className="text-lg font-semibold">{copy.todayConfirmed}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.forecastSettled}</p>
              </div>
            ) : forecast.probability !== null ? (
              <>
                <div className="mt-6 flex items-end gap-4">
                  <p className="text-6xl font-semibold tracking-[-0.06em]">
                    {Math.round(forecast.probability * 100)}%
                  </p>
                  <div className="pb-1.5">
                    <p className="text-sm font-semibold">{forecastLevelLabel(forecast.level, zh)}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {copy.confidence} · {confidenceLabel(forecast.confidence, zh)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${Math.round(forecast.probability * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                <p className="text-lg font-semibold">{copy.forecastInsufficient}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.forecastInsufficientCopy}</p>
              </div>
            )}

            <p className="mt-5 max-w-xl text-xs leading-5 text-[var(--muted)]">{copy.forecastNote}</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
            <div className="bg-[var(--paper)] p-4">
              <p className="technical-label">{copy.sinceLast}</p>
              <p className="mt-2 text-lg font-semibold">{formatForecastDays(forecast.daysSinceLastReset, zh)}</p>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <p className="technical-label">{copy.typicalInterval}</p>
              <p className="mt-2 text-lg font-semibold">{formatForecastDays(forecast.typicalIntervalDays, zh)}</p>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <p className="technical-label">{copy.percentile}</p>
              <p className="mt-2 text-sm font-semibold leading-6">{percentileText}</p>
            </div>
            <div className="bg-[var(--paper)] p-4">
              <p className="technical-label">{copy.sample}</p>
              <p className="mt-2 text-sm font-semibold leading-6">{sampleText}</p>
            </div>
            <div className="bg-[var(--paper)] p-4 sm:col-span-2">
              <p className="technical-label">{copy.model}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{copy.modelCopy}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.025em]">{copy.credits}</h2>
          <Link className="text-link text-xs font-semibold" href={localizedPath("/tools/codex-reset/banked-reset", locale)}>{copy.banked} →</Link>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{copy.creditsSubtitle}</p>
        {recentCredits.length ? (
          <div className="mt-4 divide-y divide-[var(--border)]">
            {recentCredits.map((event) => (
              <div key={event.id} className="grid gap-3 py-3 sm:grid-cols-[145px_1fr_auto] sm:items-center">
                <time className="font-mono text-xs text-[var(--muted)]">{formatUtc(event.occurredAt, locale)}</time>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                  event.status === "confirmed"
                    ? "border-[#b27719] bg-[#fff1d6] text-[#7a4b04]"
                    : "border-dashed border-[#b27719] text-[#7a4b04]"
                }`}>
                  {event.status === "confirmed" ? copy.creditsConfirmed : copy.creditsAnnounced}
                </span>
                {isTiboSource(event) ? (
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-link text-xs font-semibold">{sourceName(event, zh)}</a>
                ) : (
                  <span className="text-xs text-[var(--muted)]">{sourceName(event, zh)}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">{copy.creditsEmpty}</p>
        )}
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{copy.creditsCaution}</p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
          <div>
            <p className="technical-label">{copy.history}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.historyCopy}</p>
          </div>

          {snapshot.history.length > 0 ? (
            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <CodexResetCalendar events={snapshot.history} bankedEvents={snapshot.bankedHistory} locale={locale} months={6} />
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

        <aside>
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
