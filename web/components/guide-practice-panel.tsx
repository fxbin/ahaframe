"use client";

import Link from "next/link";
import { useState } from "react";
import type { FirstAhaContent } from "@/lib/campaign";
import type { Locale } from "@/lib/content";

interface Props {
  locale: Locale;
  title: string;
  practiceHref: string | null;
  practiceTitle: string | null;
  evidence: FirstAhaContent | null;
  takeaways: string[];
}

export function GuidePracticePanel({ locale, title, practiceHref, practiceTitle, evidence, takeaways }: Props) {
  const zh = locale === "zh-CN";
  const [tab, setTab] = useState<"practice" | "reflect">("practice");
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const choice = evidence?.choices.find((item) => item.id === choiceId) ?? null;

  return (
    <aside className="guide-workspace__practice glass-panel" aria-label={zh ? "实践与验证" : "Practice and verification"}>
      <div className="guide-workspace__tabs" role="tablist" aria-label={zh ? "学习工具" : "Learning tools"}>
        <button type="button" role="tab" aria-selected={tab === "practice"} className={tab === "practice" ? "is-active" : ""} onClick={() => setTab("practice")}>
          <span aria-hidden="true">⌘</span> {zh ? "实践与验证" : "Practice"}
        </button>
        <button type="button" role="tab" aria-selected={tab === "reflect"} className={tab === "reflect" ? "is-active" : ""} onClick={() => setTab("reflect")}>
          <span aria-hidden="true">◌</span> {zh ? "讨论与反思" : "Reflect"}
        </button>
      </div>

      {tab === "reflect" ? (
        <div className="guide-workspace__practice-inner" role="tabpanel">
          <span className="guide-workspace__eyebrow">{zh ? "本节要点" : "Takeaways"}</span>
          <h2 className="guide-workspace__aside-title">{title}</h2>
          <ul className="guide-workspace__takeaways">
            {takeaways.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
          </ul>
          {practiceHref ? <Link className="guide-workspace__outline-action" href={practiceHref}>{zh ? "进入完整练习" : "Open full practice"} <span aria-hidden="true">↗</span></Link> : null}
        </div>
      ) : (
        <div className="guide-workspace__practice-inner" role="tabpanel">
          <div className="flex items-center justify-between gap-3">
            <span className="guide-workspace__eyebrow">{evidence ? (zh ? "真实交互案例" : "Interactive incident") : (zh ? "延伸练习" : "Apply this concept")}</span>
            {evidence ? <span className="text-xs text-[var(--muted)]">{zh ? "步骤 1 / 1" : "Step 1 / 1"}</span> : null}
          </div>
          <h2 className="guide-workspace__aside-title">{evidence ? evidence.title : practiceTitle ?? title}</h2>
          <p className="guide-workspace__aside-copy">{evidence ? (zh ? "阅读真实事故记录，选择一个干预方式，再验证实际后果。" : "Review the published incident, choose an intervention and then verify the consequence.") : (zh ? "先读完本节内容，再利用关联练习验证自己的判断。" : "Read this Guide, then use its linked practice to test your judgment.")}</p>

          {evidence ? (
            <>
              <div className="guide-workspace__log">
                <h3>{zh ? "事件日志" : "Incident log"}</h3>
                <ol>
                  {evidence.trace.map((item, index) => <li key={`${item.time}-${index}`}><time>{item.time}</time><span>{item.detail}</span></li>)}
                </ol>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); if (choice) setSubmitted(true); }}>
                <fieldset className="guide-workspace__choices">
                  <legend>{evidence.question}</legend>
                  {evidence.choices.map((item) => (
                    <label key={item.id} className={`guide-workspace__choice ${choiceId === item.id ? "is-selected" : ""}`}>
                      <input type="radio" name="guide-choice" value={item.id} checked={choiceId === item.id} onChange={() => { setChoiceId(item.id); setSubmitted(false); }} />
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                    </label>
                  ))}
                </fieldset>
                {submitted && choice ? (
                  <div className="guide-workspace__feedback" role="status" data-guide-practice-feedback>
                    <strong>{choice.signal}</strong>
                    <p>{choice.consequence}</p>
                  </div>
                ) : null}
                <button type="submit" disabled={!choice} className="guide-workspace__submit">
                  {submitted ? (zh ? "重新选择并验证" : "Try another decision") : (zh ? "提交判断" : "Submit decision")}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            </>
          ) : (
            <div className="guide-workspace__quiet-note">{takeaways[0]}</div>
          )}
          {practiceHref ? (
            <Link className="guide-workspace__outline-action mt-4" href={practiceHref} data-guide-workspace-practice>
              {zh ? "打开完整实践项目" : "Open the full practice"} <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              {zh ? "这节 Guide 暂无已发布的关联练习；不会展示虚构的操作结果。" : "No linked practice has been published for this Guide; no simulated results are shown."}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
