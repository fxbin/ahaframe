"use client";

import { useMemo, useState } from "react";

interface CalendarEvent {
  id?: string;
  occurredAt: string;
  sourceUrl?: string;
  status?: "confirmed" | "detected" | "rejected";
}
interface Props {
  events: CalendarEvent[];
  bankedEvents: CalendarEvent[];
  locale: string;
}
type MarkedEvent = CalendarEvent & { kind: "full" | "credit" };
function utcMonth(date: Date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); }
function monthKey(date: Date) { return date.toISOString().slice(0, 7); }
function dayKey(date: Date) { return date.toISOString().slice(0, 10); }

export function CodexResetCompactCalendar({ events, bankedEvents, locale }: Props) {
  const zh = locale === "zh-CN";
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => utcMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const allEvents = useMemo(() => [
    ...events.map((event) => ({ ...event, kind: "full" as const })),
    ...bankedEvents.map((event) => ({ ...event, kind: "credit" as const })),
  ].filter((event) => !Number.isNaN(Date.parse(event.occurredAt))), [events, bankedEvents]);

  const byDay = useMemo(() => {
    const map = new Map<string, MarkedEvent[]>();
    for (const event of allEvents) {
      const key = dayKey(new Date(event.occurredAt));
      const values = map.get(key) ?? [];
      values.push(event);
      map.set(key, values);
    }
    return map;
  }, [allEvents]);

  const days = useMemo(() => {
    const leading = month.getUTCDay();
    const count = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, index) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), index + 1))),
    ];
  }, [month]);
  const currentMonth = monthKey(utcMonth(now));
  const isCurrent = currentMonth === monthKey(month);
  const details = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const dateFormatter = new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const dayLabels = zh ? ["日", "一", "二", "三", "四", "五", "六"] : ["S", "M", "T", "W", "T", "F", "S"];
  function shift(offset: number) {
    setMonth((value) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + offset, 1)));
    setSelectedDay(null);
  }

  return (
    <div className="radar-month" data-radar-month={monthKey(month)}>
      <div className="radar-month__heading">
        <div>
          <span className="radar-month__eyebrow">{zh ? "重置历史 · UTC" : "Reset history · UTC"}</span>
          <h3>{dateFormatter.format(month)}</h3>
        </div>
        <div className="radar-month__nav">
          <button type="button" onClick={() => shift(-1)} aria-label={zh ? "上个月" : "Previous month"}>‹</button>
          <button type="button" onClick={() => shift(1)} disabled={isCurrent} aria-label={zh ? "下个月" : "Next month"}>›</button>
          <button type="button" className="radar-month__today" onClick={() => { setMonth(utcMonth(now)); setSelectedDay(null); }}>{zh ? "今天" : "Today"}</button>
        </div>
      </div>
      <div className="radar-month__grid" role="group" aria-label={dateFormatter.format(month)}>
        {dayLabels.map((day, index) => <span key={index} className="radar-month__weekday">{day}</span>)}
        {days.map((date, index) => {
          if (!date) return <span aria-hidden="true" className="radar-month__empty" key={`padding-${index}`} />;
          const key = dayKey(date);
          const records = byDay.get(key) ?? [];
          const full = records.some((record) => record.kind === "full");
          const creditConfirmed = records.some((record) => record.kind === "credit" && record.status === "confirmed");
          const creditAnnounced = records.some((record) => record.kind === "credit" && record.status !== "confirmed");
          const hasEvent = full || creditConfirmed || creditAnnounced;
          const today = dayKey(now) === key;
          const selected = key === selectedDay;
          const common = { key, "aria-label": `${key} UTC${full ? (zh ? "，全量重置" : ", full reset") : ""}${creditConfirmed ? (zh ? "，重置卡已发放" : ", credit granted") : ""}${creditAnnounced ? (zh ? "，重置卡预告" : ", credit announced") : ""}` };
          const inner = <><span className={full ? "radar-month__number radar-month__number--full" : "radar-month__number"}>{date.getUTCDate()}</span>{hasEvent ? <span className="radar-month__marks" aria-hidden="true">{full ? <i className="radar-month__mark--full" /> : null}{creditConfirmed ? <i className="radar-month__mark--credit" /> : null}{creditAnnounced ? <i className="radar-month__mark--announced" /> : null}</span> : null}</>;
          return hasEvent
            ? <button {...common} type="button" className={`radar-month__day ${today ? "radar-month__day--today" : ""} ${selected ? "radar-month__day--selected" : ""}`} aria-pressed={selected} onClick={() => setSelectedDay((previous) => previous === key ? null : key)}>{inner}</button>
            : <span {...common} className={`radar-month__day radar-month__day--empty ${today ? "radar-month__day--today" : ""}`}>{inner}</span>;
        })}
      </div>
      <div className="radar-month__legend">
        <span><i className="radar-month__mark--full" />{zh ? "全量重置" : "Full reset"}</span>
        <span><i className="radar-month__mark--credit" />{zh ? "重置卡发放" : "Credit granted"}</span>
        <span><i className="radar-month__mark--announced" />{zh ? "发放预告" : "Announced"}</span>
      </div>
      {selectedDay ? (
        <section className="radar-month__details" aria-live="polite" aria-label={zh ? "所选日期事件" : "Selected day events"}>
          <div className="flex items-center justify-between gap-3">
            <strong>{selectedDay} UTC</strong>
            <button type="button" onClick={() => setSelectedDay(null)} aria-label={zh ? "关闭详情" : "Close details"}>×</button>
          </div>
          {details.map((event, index) => (
            <div className="radar-month__detail-row" key={event.id ?? `${event.kind}-${event.occurredAt}-${index}`}>
              <span>{event.kind === "full" ? (zh ? "全量重置" : "Full reset") : event.status === "confirmed" ? (zh ? "重置卡已发放" : "Credit granted") : (zh ? "重置卡预告" : "Credit announced")}</span>
              <time>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(event.occurredAt))} UTC</time>
              {event.sourceUrl && /https:\/\/(?:x\.com|twitter\.com)\/thsottiaux\/status\/\d+/i.test(event.sourceUrl) ? (
                <a className="text-link" href={event.sourceUrl} rel="noreferrer" target="_blank">{zh ? "原始公告 ↗" : "Original post ↗"}</a>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
