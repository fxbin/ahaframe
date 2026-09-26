import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexResetCalendar } from "@/components/codex-reset-calendar";
import { CodexResetCompactCalendar } from "@/components/codex-reset-compact-calendar";
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
    checked: "追踪公开的 Codex 完整重置与额外重置卡公告。公开事件不等于你的个人账号额度到账。",
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
    checked: "Follow public Codex full resets and additional reset-credit announcements. Public events do not confirm credit delivery to your personal account.",
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

  const recentEvents = [
    ...snapshot.history.slice(0, 6).map((event) => ({ ...event, eventKind: "full" as const })),
    ...snapshot.bankedHistory.slice(0, 6).map((event) => ({ ...event, eventKind: "banked" as const })),
  ].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, 5);

  return (
    <main className="liquid-radar">
      <div className="shell">
        <section className="liquid-radar-hero" aria-labelledby="radar-title">
          <div>
            <p className="editorial-kicker">{copy.eyebrow}</p>
            <h1 id="radar-title" className="editorial-display mt-6 max-w-3xl text-4xl leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {zh ? <>Codex 今天<span className="liquid-hero-accent">重置了吗？</span></> : copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">{copy.checked}</p>
          </div>

          <div className="liquid-radar-status glass-panel" data-state={!snapshot.dataAvailable ? "unknown" : resetToday ? "confirmed" : "watching"}>
            <span className="radar-status__beacon" aria-hidden="true">{resetToday ? "✓" : snapshot.dataAvailable ? "↻" : "!"}</span>
            <p className="technical-label">{zh ? "今日公开状态 · UTC" : "Public status today · UTC"}</p>
            <p className={`mt-5 font-[family-name:var(--font-editorial)] text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl ${resetToday ? "text-[var(--success)]" : ""}`}>
              <span className="liquid-status-dot" style={{ background: !snapshot.dataAvailable ? "var(--danger)" : resetToday ? "var(--success)" : "var(--warning)" }} aria-hidden="true" />
              {!snapshot.dataAvailable ? copy.noData : resetToday ? copy.todayConfirmed : copy.watching}
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              {latest ? `${copy.lastReset}: ${formatUtc(latest.occurredAt, locale)}` : copy.forecastInsufficient}
            </p>
            {latest && isTiboSource(latest) ? (
              <a className="text-link mt-4 w-fit" href={latest.sourceUrl} target="_blank" rel="noreferrer">{sourceName(latest, zh)}</a>
            ) : null}
          </div>
        </section>

        <section className="liquid-radar-metrics" aria-label={zh ? "重置时间与预测" : "Reset timing and forecast"}>
          <div className="glass-panel liquid-radar-metric">
            <span className="radar-metric__icon" aria-hidden="true">◷</span>
            <p className="technical-label">{copy.lastReset}</p>
            {latest ? (
              <>
                <strong className="font-[family-name:var(--font-editorial)] text-2xl font-semibold leading-8">{formatUtc(latest.occurredAt, locale)}</strong>
                <p className="mt-3 text-xs text-[var(--muted)]">{elapsed(latest.occurredAt, locale)}</p>
              </>
            ) : (
              <strong className="text-xl font-semibold">{zh ? "暂无可核实记录" : "No verified record yet"}</strong>
            )}
          </div>

          <div className="glass-panel liquid-radar-metric">
            <span className="radar-metric__icon" aria-hidden="true">%</span>
            <p className="technical-label">{copy.forecastTitle}</p>
            {resetToday ? (
              <p className="mt-5 text-lg font-semibold text-[var(--success)]">{copy.forecastSettled}</p>
            ) : forecast.probability !== null ? (
              <>
                <div className="mt-3 flex flex-wrap items-baseline gap-4">
                  <span className="font-[family-name:var(--font-editorial)] text-5xl font-semibold">{Math.round(forecast.probability * 100)}%</span>
                  <span className="text-sm text-[var(--muted)]">{forecastLevelLabel(forecast.level, zh)} · {copy.confidence}: {confidenceLabel(forecast.confidence, zh)}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]" aria-hidden="true">
                  <div className="h-full rounded-full bg-[var(--brand-accent)]" style={{ width: `${Math.round(forecast.probability * 100)}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-5 text-lg font-semibold">{copy.forecastInsufficient}</p>
            )}
            <details className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
              <summary className="w-fit cursor-pointer font-semibold text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)]">
                {zh ? "查看统计依据与限制" : "Method and limitations"} ↓
              </summary>
              <p className="mt-3 leading-6">{copy.forecastNote}</p>
              <p className="mt-2 leading-6">{copy.forecastInsufficientCopy}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="font-semibold">{copy.sinceLast}</dt><dd className="mt-1">{formatForecastDays(forecast.daysSinceLastReset, zh)}</dd></div>
                <div><dt className="font-semibold">{copy.typicalInterval}</dt><dd className="mt-1">{formatForecastDays(forecast.typicalIntervalDays, zh)}</dd></div>
                <div><dt className="font-semibold">{copy.percentile}</dt><dd className="mt-1">{percentileText}</dd></div>
                <div><dt className="font-semibold">{copy.sample}</dt><dd className="mt-1">{sampleText}</dd></div>
              </dl>
              <p className="mt-4 font-semibold">{copy.model}: <span className="font-normal">{copy.modelCopy}</span></p>
            </details>
          </div>
        </section>

        <section className="liquid-radar-details mt-6" aria-label={copy.history}>
          <div className="glass-panel liquid-radar-calendar">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h2 className="font-[family-name:var(--font-editorial)] text-2xl font-semibold">{zh ? "重置日历" : "Reset calendar"}</h2>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{copy.historyCopy}</p>
              </div>
              <Link className="text-link shrink-0" href={localizedPath("/tools/codex-reset/history", locale)}>{copy.viewHistory}</Link>
            </div>
            {snapshot.history.length || snapshot.bankedHistory.length ? (
              <div className="mt-6">
                <CodexResetCompactCalendar events={snapshot.history} bankedEvents={snapshot.bankedHistory} locale={locale} />
                <details className="radar-extended-history">
                  <summary>{zh ? "展开过去六个月的完整记录" : "View full six-month history"} <span aria-hidden="true">↓</span></summary>
                  <CodexResetCalendar events={snapshot.history} bankedEvents={snapshot.bankedHistory} locale={locale} months={6} />
                </details>
              </div>
            ) : (
              <p className="mt-7 text-sm text-[var(--muted)]">{snapshot.dataAvailable ? copy.watching : copy.noData}</p>
            )}
          </div>

          <aside className="glass-panel liquid-radar-activity">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-[family-name:var(--font-editorial)] text-2xl font-semibold">{zh ? "最近事件" : "Recent events"}</h2>
              <Link className="text-link shrink-0 text-sm" href={localizedPath("/tools/codex-reset/history", locale)}>{copy.viewHistory}</Link>
            </div>
            <div className="mt-5 divide-y divide-[var(--border)]">
              {recentEvents.length ? recentEvents.map((event) => (
                <div className="radar-event-row" key={event.id} title={sourceDescription(event, zh)}>
                  <time className="radar-event__time">{new Date(event.occurredAt).toISOString().slice(0, 16).replace("T", " ")} UTC</time>
                  <span className={`radar-event__dot ${event.eventKind === "full" ? "is-full" : "is-credit"}`} aria-hidden="true" />
                  {isTiboSource(event) ? (
                    <a className="radar-event__title text-link" href={event.sourceUrl} target="_blank" rel="noreferrer">
                      {event.eventKind === "full" ? copy.eventTitle : copy.credits} ↗
                    </a>
                  ) : <strong className="radar-event__title">{event.eventKind === "full" ? copy.eventTitle : copy.credits}</strong>}
                  <span className={`radar-event__tag ${event.eventKind === "full" ? "is-full" : "is-credit"}`}>
                    {event.eventKind === "full" ? (zh ? "全量重置" : "Full reset") : event.status === "confirmed" ? copy.creditsConfirmed : copy.creditsAnnounced}
                  </span>
                </div>
              )) : <p className="py-4 text-sm text-[var(--muted)]">{copy.noData}</p>}
            </div>

            <div className="credits-section mt-7 border-t border-[var(--border)] pt-6">
              <h3 className="font-[family-name:var(--font-editorial)] text-xl font-semibold">{copy.credits}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy.creditsSubtitle}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{copy.creditsCaution}</p>
              {recentCredits.length ? (
                <p className="mt-3 text-xs font-semibold text-[#825016]">
                  {recentCredits[0].status === "confirmed" ? copy.creditsConfirmed : copy.creditsAnnounced}
                  {" · "}{formatUtc(recentCredits[0].occurredAt, locale)}
                </p>
              ) : <p className="mt-3 text-xs text-[var(--muted)]">{copy.creditsEmpty}</p>}
              <div className="mt-4 flex flex-col gap-3">
                <Link className="text-link w-fit" href={localizedPath("/tools/codex-reset/banked-reset", locale)}>{copy.banked} →</Link>
                <Link className="text-link w-fit" href={localizedPath("/tools/codex-reset/usage-limits", locale)}>{copy.limits} →</Link>
              </div>
            </div>
          </aside>
        </section>

        <p className="mt-7 max-w-4xl text-xs leading-6 text-[var(--muted)]">{copy.note}</p>
      </div>
    </main>
  );
}
