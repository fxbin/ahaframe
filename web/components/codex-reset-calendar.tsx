interface CalendarEvent {
  occurredAt: string;
}

interface CodexResetCalendarProps {
  events: CalendarEvent[];
  locale: string;
  weeks?: number;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcWeek(date: Date) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  value.setUTCDate(value.getUTCDate() - value.getUTCDay());
  return value;
}

function formatDay(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function CodexResetCalendar({ events, locale, weeks = 26 }: CodexResetCalendarProps) {
  const today = new Date();
  const currentWeek = startOfUtcWeek(today);
  const start = new Date(currentWeek);
  start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);

  const countByDay = new Map<string, number>();
  for (const event of events) {
    const key = dayKey(new Date(event.occurredAt));
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const days = Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date;
  });

  const monthMarkers = Array.from({ length: weeks }, (_, weekIndex) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + weekIndex * 7);
    const previous = new Date(date);
    previous.setUTCDate(date.getUTCDate() - 7);
    return weekIndex === 0 || date.getUTCMonth() !== previous.getUTCMonth()
      ? new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
          month: "short",
          timeZone: "UTC",
        }).format(date)
      : "";
  });

  const zh = locale === "zh-CN";
  const todayKey = dayKey(today);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="technical-label">{zh ? "重置日历" : "Reset calendar"}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            {zh ? `过去 ${weeks} 周已确认的全量 Usage Reset。` : `Confirmed full usage resets across the last ${weeks} weeks.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="h-3 w-3 rounded-[3px] border border-[var(--border)] bg-[var(--surface-soft)]" />
          <span>{zh ? "无记录" : "No entry"}</span>
          <span className="ml-2 h-3 w-3 rounded-[3px] bg-[var(--primary)]" />
          <span>{zh ? "已确认" : "Confirmed"}</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <div className="mb-2 grid grid-cols-[32px_1fr] gap-2">
            <div />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
              {monthMarkers.map((label, index) => (
                <div key={`${label}-${index}`} className="font-mono text-[10px] text-[var(--muted)]">{label}</div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[32px_1fr] gap-2">
            <div className="grid grid-rows-7 gap-1 font-mono text-[10px] text-[var(--muted)]">
              <span />
              <span>{zh ? "一" : "M"}</span>
              <span />
              <span>{zh ? "三" : "W"}</span>
              <span />
              <span>{zh ? "五" : "F"}</span>
              <span />
            </div>
            <div
              className="grid gap-1"
              style={{
                gridTemplateRows: "repeat(7, 14px)",
                gridAutoFlow: "column",
                gridAutoColumns: "14px",
              }}
            >
              {days.map((date) => {
                const key = dayKey(date);
                const count = countByDay.get(key) ?? 0;
                const future = date.getTime() > today.getTime();
                const title = count > 0
                  ? `${formatDay(date, locale)} · ${count} ${zh ? "次已确认重置" : count === 1 ? "confirmed reset" : "confirmed resets"}`
                  : `${formatDay(date, locale)} · ${zh ? "无已确认重置记录" : "no confirmed reset recorded"}`;

                return (
                  <span
                    key={key}
                    title={title}
                    aria-label={title}
                    className={`h-[14px] w-[14px] rounded-[3px] border transition-colors ${
                      future
                        ? "border-transparent bg-transparent"
                        : count > 0
                          ? "border-[color:var(--primary)] bg-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--surface-soft)]"
                    } ${key === todayKey ? "ring-1 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--surface)]" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
