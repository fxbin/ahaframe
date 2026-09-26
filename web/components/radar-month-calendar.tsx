"use client";

import { useMemo, useState } from "react";

export interface RadarMarker {
  id: string;
  occurredAt: string;
  sourceUrl?: string;
  kind: "full" | "banked";
  status?: "confirmed" | "detected" | "rejected";
}
interface Props { events: RadarMarker[]; locale: string; }
const isoDay = (date: Date) => date.toISOString().slice(0,10);
const monthStart = (year: number,month: number) => new Date(Date.UTC(year,month,1));
const titleDate = (date: Date, zh: boolean) => new Intl.DateTimeFormat(zh?"zh-CN":"en-US",{year:"numeric",month:"long",timeZone:"UTC"}).format(date);
const fullDate = (date: Date,zh:boolean) => new Intl.DateTimeFormat(zh?"zh-CN":"en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(date);

export function RadarMonthCalendar({events,locale}:Props){
  const zh=locale==="zh-CN";
  const current=useMemo(()=>new Date(),[]);
  const today=isoDay(current);
  const [monthOffset,setMonthOffset]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const month=monthStart(current.getUTCFullYear(),current.getUTCMonth()+monthOffset);
  const year=month.getUTCFullYear();
  const index=month.getUTCMonth();
  const lead=month.getUTCDay();
  const count=new Date(Date.UTC(year,index+1,0)).getUTCDate();
  const start=monthStart(year,index);
  const byDay=useMemo(()=>{
    const map=new Map<string,RadarMarker[]>();
    for(const e of events){
      const stamp=new Date(e.occurredAt);
      if(Number.isNaN(stamp.getTime()))continue;
      const key=isoDay(stamp);
      map.set(key,[...(map.get(key)??[]),e]);
    }
    return map;
  },[events]);
  const chosen=selected?byDay.get(selected)??[]:[];
  const weekdays=zh?["日","一","二","三","四","五","六"]:["S","M","T","W","T","F","S"];
  function changeMonth(diff:number){setMonthOffset(v=>Math.max(-11,Math.min(0,v+diff)));setSelected(null)}
  return (
    <div className="radar-month" data-radar-month-calendar>
      <div className="radar-month__head">
        <strong className="font-[family-name:var(--font-editorial)] text-lg">{titleDate(start,zh)}</strong>
        <div className="radar-month__controls">
          <button aria-label={zh?"上个月":"Previous month"} type="button" onClick={()=>changeMonth(-1)}>‹</button>
          <button aria-label={zh?"下个月":"Next month"} type="button" disabled={monthOffset===0} onClick={()=>changeMonth(1)}>›</button>
          <button type="button" disabled={monthOffset===0} onClick={()=>{setMonthOffset(0);setSelected(null)}}>{zh?"今天":"Today"}</button>
        </div>
      </div>
      <div className="radar-month__week">{weekdays.map((name,i)=><span key={i}>{name}</span>)}</div>
      <div className="radar-month__days">
        {Array.from({length:lead},(_,i)=><span className="radar-month__blank" aria-hidden="true" key={`blank-${i}`}/>)}
        {Array.from({length:count},(_,i)=>{
          const date=new Date(Date.UTC(year,index,i+1));
          const key=isoDay(date);
          const hits=byDay.get(key)??[];
          const full=hits.some(e=>e.kind==="full");
          const credit=hits.some(e=>e.kind==="banked"&&e.status==="confirmed");
          const announced=hits.some(e=>e.kind==="banked"&&e.status!=="confirmed");
          const marked=hits.length>0;
          return <button key={key} type="button" disabled={!marked} title={marked?`${full?(zh?"完整重置":"Full reset"):""} ${credit?(zh?"重置卡已发放":"Credits confirmed"):""} ${announced?(zh?"发放预告":"Credit announced"):""}`:undefined}
            aria-label={`${fullDate(date,zh)}${full?(zh?" 完整重置":" full reset"):""}${credit?(zh?" 重置卡已发放":" credit granted"):""}${announced?(zh?" 重置卡预告":" credit announced"):""}`}
            aria-pressed={selected===key}
            data-day={key}
            className={`radar-month__day ${key===today?"is-today":""} ${selected===key?"is-selected":""}`}
            onClick={()=>setSelected(selected===key?null:key)}>
            {i+1}
            <span className="radar-month__markers" aria-hidden="true">
              {full?<i className="full"/>:null}
              {credit?<i className="credit"/>:null}
              {announced?<i className="announced"/>:null}
            </span>
          </button>;
        })}
      </div>
      <div className="radar-month__legend" aria-label={zh?"日历图例":"Calendar legend"}>
        <span><i className="full"/>{zh?"完整重置":"Full reset"}</span>
        <span><i className="credit"/>{zh?"重置卡发放":"Credit granted"}</span>
        <span><i className="announced"/>{zh?"发放预告":"Announced"}</span>
      </div>
      {selected&&chosen.length?<div className="radar-month__detail" role="region" aria-label={zh?"所选日期事件":"Selected-day events"}>
        <div className="flex items-start justify-between gap-2"><strong>{fullDate(new Date(selected+"T00:00:00Z"),zh)} UTC</strong><button type="button" onClick={()=>setSelected(null)} aria-label={zh?"关闭详情":"Close details"}>×</button></div>
        {chosen.map(e=><p key={e.id} className="mt-3 text-sm">
          <span className={e.kind==="full"?"text-[var(--success)]":"text-[#946128]"}>●</span>{" "}
          {e.kind==="full"?(zh?"已确认全量重置":"Confirmed full reset"):e.status==="confirmed"?(zh?"重置卡已确认发放":"Credits confirmed"):(zh?"重置卡发放预告":"Credit announced")}
          <span className="ml-2 text-xs text-[var(--muted)]">{new Date(e.occurredAt).toISOString().slice(11,16)} UTC</span>
          {e.sourceUrl&&/(?:x\.com|twitter\.com)\/thsottiaux\/status\//i.test(e.sourceUrl)?
           <a className="ml-2 underline underline-offset-4" href={e.sourceUrl} rel="noreferrer" target="_blank">{zh?"原始公告 ↗":"Source ↗"}</a>:null}
        </p>)}
      </div>:null}
      <p className="mt-5 text-[11px] leading-5 text-[var(--muted)]">{zh?"所有日期均为 UTC。公开发放预告不等于个人额度到账。":"All dates are UTC. Public announcements do not confirm an individual grant."}</p>
    </div>
  );
}
