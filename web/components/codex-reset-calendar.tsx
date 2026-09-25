interface CalendarEvent {
  id?: string;
  occurredAt: string;
  sourceUrl?: string;
  status?: "confirmed" | "detected" | "rejected";
}

interface CodexResetCalendarProps {
  events: CalendarEvent[];
  /** Credit announcements and confirmed grants are markers, not full resets. */
  bankedEvents?: CalendarEvent[];
  locale: string;
  months?: number;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addUtcMonths(date: Date, offset: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function formatMonth(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: locale === "zh-CN" ? "long" : "long",
    timeZone: "UTC",
  }).format(date);
}

function formatDay(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatShortDay(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatUtcTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function isTiboSource(url?: string) {
  return Boolean(url && /(?:x\.com|twitter\.com)\/thsottiaux\/status\/\d+/i.test(url));
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function formatGap(value: number | null, zh: boolean) {
  if (value === null) return "—";
  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return zh ? `${rounded} 天` : `${rounded} days`;
}

function sinceReset(value: Date | null, now: Date, zh: boolean) {
  if (!value) return "—";
  const hours = Math.max(0, Math.floor((now.getTime() - value.getTime()) / 3_600_000));
  if (hours < 24) return zh ? `${hours} 小时` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return zh ? `${days} 天` : `${days}d`;
}

function buildMonthDays(month: Date) {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leading = month.getUTCDay();
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(Date.UTC(year, monthIndex, index + 1))),
  ];
}

export function CodexResetCalendar({ events, bankedEvents = [], locale, months = 6 }: CodexResetCalendarProps) {
  const zh = locale === "zh-CN";
  const now = new Date();
  const todayKey = dayKey(now);
  const currentMonth = startOfUtcMonth(now);
  const visibleMonths = Array.from({ length: months }, (_, index) =>
    addUtcMonths(currentMonth, index - (months - 1)),
  );

  const sortedEvents = [...events]
    .filter((event) => !Number.isNaN(Date.parse(event.occurredAt)))
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of sortedEvents) {
    const key = dayKey(new Date(event.occurredAt));
    const bucket = eventsByDay.get(key) ?? [];
    bucket.push(event);
    eventsByDay.set(key, bucket);
  }

  const bankedByDay = new Map<string, CalendarEvent[]>();
  for (const event of bankedEvents) {
    if (Number.isNaN(Date.parse(event.occurredAt))) continue;
    const key = dayKey(new Date(event.occurredAt));
    const bucket = bankedByDay.get(key) ?? [];
    bucket.push(event);
    bankedByDay.set(key, bucket);
  }

  const latestEvent = sortedEvents.at(-1) ?? null;
  const latestDate = latestEvent ? new Date(latestEvent.occurredAt) : null;
  const gaps = sortedEvents.slice(1).map((event, index) =>
    (Date.parse(event.occurredAt) - Date.parse(sortedEvents[index].occurredAt)) / 86_400_000,
  );
  const typicalGap = median(gaps);
  const rhythmEvents = sortedEvents.slice(-5);
  const weekdayLabels = zh
    ? ["日", "一", "二", "三", "四", "五", "六"]
    : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="technical-label">{zh ? "重置日历" : "Reset calendar"}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted)]">
            {zh
              ? `最近 ${months} 个月的全量重置与重置卡动态，按 UTC 日期展示。预告不代表已经发放；空白表示暂无相关记录。`
              : `Full resets and reset-credit activity over the last ${months} months (UTC). Announcements are not confirmed grants; unmarked days have no recorded activity.`}
          </p>
        </div>
        <div className="flex w-fit flex-wrap items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-[11px] text-[var(--muted)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          <span>{zh ? "全量重置" : "Full reset"}</span>
          <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#b27719]" />
          <span>{zh ? "重置卡已发放" : "Credit granted"}</span>
          <span className="ml-2 h-2.5 w-2.5 rounded-full border border-[#b27719]" />
          <span>{zh ? "重置卡预告" : "Credit announced"}</span>
          <span className="ml-2 h-2.5 w-2.5 rounded-full border border-[var(--foreground)] bg-transparent" />
          <span>{zh ? "今天" : "Today"}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
        <div className="bg-[var(--surface)] p-4">
          <p className="technical-label">{zh ? "最近一次重置" : "Last reset"}</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">
            {latestDate ? formatShortDay(latestDate, locale) : "—"}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[var(--muted)]">
            {latestDate ? `${formatUtcTime(latestDate, locale)} UTC` : (zh ? "等待确认记录" : "Waiting for a confirmed event")}
          </p>
        </div>
        <div className="bg-[var(--surface)] p-4">
          <p className="technical-label">{zh ? "距上次重置" : "Since last reset"}</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">{sinceReset(latestDate, now, zh)}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{zh ? "按确认时间计算" : "from the confirmation timestamp"}</p>
        </div>
        <div className="bg-[var(--surface)] p-4">
          <p className="technical-label">{zh ? "典型重置间隔" : "Typical interval"}</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">{formatGap(typicalGap, zh)}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{zh ? "历史中位数，不代表未来周期" : "historical median, not a future schedule"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleMonths.map((month) => {
          const monthDays = buildMonthDays(month);
          return (
            <section key={month.toISOString()} className="rounded-[14px] border border-[var(--border)] bg-[var(--paper)] p-4">
              <h3 className="text-sm font-semibold tracking-[-0.015em]">{formatMonth(month, locale)}</h3>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[var(--muted)]">
                {weekdayLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="py-1">{label}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {monthDays.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} className="aspect-square" aria-hidden="true" />;

                  const key = dayKey(date);
                  const dayEvents = eventsByDay.get(key) ?? [];
                  const cardEvents = bankedByDay.get(key) ?? [];
                  const confirmed = dayEvents.length > 0;
                  const creditGranted = cardEvents.some((event) => event.status === "confirmed");
                  const creditAnnounced = cardEvents.length > 0 && !creditGranted;
                  const isToday = key === todayKey;
                  const future = date.getTime() > now.getTime();
                  const label = [
                    formatDay(date, locale),
                    confirmed ? (zh ? "已确认全量重置" : "confirmed full reset") : null,
                    creditGranted ? (zh ? "重置卡已发放" : "reset credits confirmed") : null,
                    creditAnnounced ? (zh ? "重置卡已预告" : "reset credits announced") : null,
                  ].filter(Boolean).join(" · ");

                  if (confirmed || cardEvents.length > 0) {
                    const detailEvents = [
                      ...dayEvents.map((event) => ({ ...event, kind: "full" as const })),
                      ...cardEvents.map((event) => ({ ...event, kind: "banked" as const })),
                    ].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));

                    return (
                      <details key={key} className="group relative">
                        <summary
                          aria-label={label}
                          className={`relative flex aspect-square cursor-pointer list-none items-center justify-center rounded-[9px] text-xs font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden ${
                            confirmed ? "bg-[var(--primary)] text-white shadow-sm"
                              : creditGranted ? "border border-[#b27719] bg-[#fff1d6] text-[#7a4b04]"
                                : "border border-dashed border-[#b27719] bg-[var(--paper)] text-[#7a4b04]"
                          } ${isToday ? "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--paper)]" : ""}`}
                        >
                          {date.getUTCDate()}
                          {cardEvents.length > 0 && confirmed ? (
                            <span
                              aria-hidden="true"
                              className={`absolute -bottom-0.5 right-0 h-2.5 w-2.5 rounded-full border border-[var(--paper)] ${creditGranted ? "bg-[#b27719]" : "bg-[var(--paper)] ring-1 ring-[#b27719]"}`}
                            />
                          ) : null}
                          {dayEvents.length + cardEvents.length > 2 ? (
                            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[var(--foreground)] px-1 text-[9px] leading-4 text-[var(--surface)]">
                              {dayEvents.length + cardEvents.length}
                            </span>
                          ) : null}
                        </summary>
                        <div className="fixed inset-x-4 bottom-4 z-50 max-h-[65vh] overflow-y-auto rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-paper)] md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:top-full md:mt-2 md:w-72 md:-translate-x-1/2">
                          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{formatDay(date, locale)} UTC</p>
                          <div className="mt-2 divide-y divide-[var(--border)]">
                            {detailEvents.map((event) => {
                              const credit = event.kind === "banked";
                              const granted = event.status === "confirmed";
                              return (
                                <div key={event.id ?? `${event.kind}:${event.occurredAt}`} className="py-3 first:pt-1 last:pb-0">
                                  <p className="text-sm font-semibold">
                                    {credit
                                      ? (granted ? (zh ? "重置卡已确认发放" : "Reset-credit grant confirmed")
                                        : (zh ? "重置卡发放预告" : "Reset-credit grant announced"))
                                      : (zh ? "Codex 全量额度重置" : "Codex full usage reset")}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                    <span className="text-[var(--muted)]">{formatUtcTime(new Date(event.occurredAt), locale)} UTC</span>
                                    <span className={`rounded-full px-2 py-1 font-semibold ${credit ? "bg-[#fff1d6] text-[#7a4b04]" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}>
                                      {credit && !granted ? (zh ? "待确认" : "Pending") : (zh ? "已确认" : "Confirmed")}
                                    </span>
                                  </div>
                                  {isTiboSource(event.sourceUrl) ? (
                                    <a className="text-link mt-3 inline-flex text-xs font-semibold" href={event.sourceUrl} target="_blank" rel="noreferrer">
                                      {zh ? "查看原始公告 ↗" : "View original announcement ↗"}
                                    </a>
                                  ) : (
                                    <p className="mt-3 text-xs text-[var(--muted)]">{zh ? "公开信号" : "Public signal"}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    );
                  }

                  return (
                    <span
                      key={key}
                      title={label}
                      aria-label={label}
                      className={`flex aspect-square items-center justify-center rounded-[9px] text-xs transition-colors ${future ? "text-[var(--muted)] opacity-[0.35]" : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"} ${isToday ? "ring-1 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--paper)]" : ""}`}
                    >
                      {date.getUTCDate()}
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {rhythmEvents.length >= 2 ? (
        <section className="mt-7 border-t border-[var(--border)] pt-6">
          <div>
            <p className="technical-label">{zh ? "重置节奏" : "Reset rhythm"}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              {zh ? "最近几次已确认重置之间的实际历史间隔。" : "Observed historical gaps between the most recent confirmed resets."}
            </p>
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {rhythmEvents.map((event, index) => {
              const date = new Date(event.occurredAt);
              const next = rhythmEvents[index + 1];
              const gap = next
                ? (Date.parse(next.occurredAt) - Date.parse(event.occurredAt)) / 86_400_000
                : null;
              return (
                <div key={event.id ?? event.occurredAt} className="grid grid-cols-[12px_1fr_auto] items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                  <div>
                    <p className="text-xs font-semibold">{formatShortDay(date, locale)}</p>
                    <p className="font-mono text-[10px] text-[var(--muted)]">{formatUtcTime(date, locale)} UTC</p>
                  </div>
                  {gap !== null ? <span className="font-mono text-[10px] text-[var(--muted)]">+{formatGap(gap, zh)}</span> : null}
                </div>
              );
            })}
          </div>

          <div
            className="mt-6 hidden items-start md:grid"
            style={{
              gridTemplateColumns: rhythmEvents
                .map((_, index) => index < rhythmEvents.length - 1 ? "minmax(0,1fr) 72px" : "minmax(0,1fr)")
                .join(" "),
            }}
          >
            {rhythmEvents.flatMap((event, index) => {
              const date = new Date(event.occurredAt);
              const next = rhythmEvents[index + 1];
              const gap = next
                ? (Date.parse(next.occurredAt) - Date.parse(event.occurredAt)) / 86_400_000
                : null;
              const eventNode = (
                <div key={`event-${event.id ?? event.occurredAt}`} className="min-w-0 text-center">
                  <span className="mx-auto block h-3 w-3 rounded-full bg-[var(--primary)] ring-4 ring-[var(--primary-soft)]" />
                  <p className="mt-3 truncate text-xs font-semibold">{formatShortDay(date, locale)}</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{formatUtcTime(date, locale)} UTC</p>
                </div>
              );
              if (gap === null) return [eventNode];
              const gapNode = (
                <div key={`gap-${event.id ?? event.occurredAt}`} className="pt-[5px] text-center">
                  <div className="h-px bg-[var(--border)]" />
                  <span className="relative -top-2 rounded-full bg-[var(--surface)] px-2 font-mono text-[10px] text-[var(--muted)]">
                    {formatGap(gap, zh)}
                  </span>
                </div>
              );
              return [eventNode, gapNode];
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
