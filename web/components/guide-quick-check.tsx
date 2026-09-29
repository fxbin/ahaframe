"use client";

import { useState } from "react";
import type { Locale } from "@/lib/content";

const content = {
  "zh-CN": {
    eyebrow: "交互检查 · 1 分钟",
    title: "退款请求超时之后",
    intro: "Agent 已发送退款请求，但调用超时。没有证据表明退款成功或失败。你会怎么处理？",
    log: ["[10:15:23] 已发送退款请求", "[10:15:28] 等待远端响应…", "[10:15:33] 请求超时 · 结果未知"],
    options: [
      ["retry", "立刻使用新的请求 ID 重试", "可能触发第二次退款。"],
      ["reconcile", "先查询远端退款状态", "复用原操作 ID，确认实际结果后再决定下一步。"],
      ["failure", "向用户报告退款失败", "仅凭超时无法断定远端失败。"],
      ["stop", "停止所有处理", "仍需要明确处理不确定结果的路径。"],
    ],
    choose: "选择下一步",
    submit: "检查判断",
    resultCorrect: "判断合理：先核对，再行动",
    resultIncorrect: "还需要验证远端状态",
    explanation: "超时只是没有观察到及时响应。应通过原操作 ID 查询权威状态；无法查询时采用幂等策略或人工确认，不要直接重复不可逆操作。",
    retry: "再试一次",
    note: "这是基于当前 Guide 的知识检查；完整事故模拟在下方的实践入口。",
  },
  en: {
    eyebrow: "QUICK CHECK · 1 MIN",
    title: "After a refund request times out",
    intro: "The Agent sent a refund request but the call timed out. There is no evidence confirming success or failure. What comes next?",
    log: ["[10:15:23] Refund request sent", "[10:15:28] Awaiting remote response…", "[10:15:33] Timeout · outcome unknown"],
    options: [
      ["retry", "Immediately retry with a fresh ID", "Could trigger a duplicate refund."],
      ["reconcile", "Check the authoritative remote status", "Reuse the original operation ID before deciding how to proceed."],
      ["failure", "Report the refund as failed", "Timeout alone cannot prove failure."],
      ["stop", "Stop all processing indefinitely", "The ambiguous outcome still requires a recovery path."],
    ],
    choose: "Choose the next step",
    submit: "Check decision",
    resultCorrect: "Supported decision: reconcile before acting",
    resultIncorrect: "The remote state still needs verification",
    explanation: "A timeout is a missing timely observation, not proof of failure. Reconcile via the original operation ID. If lookup is unavailable, use a bounded idempotent or human-review fallback rather than blindly replaying irreversible actions.",
    retry: "Try again",
    note: "This is a short knowledge check based on this Guide. The full incident simulation is linked below.",
  },
} as const;

export function GuideQuickCheck({ locale }: { locale: Locale }) {
  const t = content[locale];
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = choice === "reconcile";
  return (
    <section className="guide-quick-check" aria-label={t.eyebrow} data-guide-quick-check>
      <p className="guide-quick-check__eyebrow">{t.eyebrow}</p>
      <h3 className="guide-quick-check__title">{t.title}</h3>
      <p className="guide-quick-check__intro">{t.intro}</p>
      <div className="guide-quick-check__log" aria-label={locale === "zh-CN" ? "事件日志" : "Event log"}>
        <strong>{locale === "zh-CN" ? "事件日志" : "Event log"}</strong>
        {t.log.map((line) => <code key={line}>{line}</code>)}
      </div>
      <fieldset disabled={checked} className="guide-quick-check__choices">
        <legend>{t.choose}</legend>
        {t.options.map(([value, title, description]) => (
          <label key={value} className={`guide-quick-check__option ${choice === value ? "is-chosen" : ""}`}>
            <input type="radio" name="guide-quick-check-choice" value={value} checked={choice === value} onChange={() => setChoice(value)} />
            <span><strong>{title}</strong><small>{description}</small></span>
          </label>
        ))}
      </fieldset>
      {checked ? (
        <div className={`guide-quick-check__feedback ${correct ? "is-correct" : "is-review"}`} role="status" aria-live="polite">
          <strong>{correct ? t.resultCorrect : t.resultIncorrect}</strong>
          <p>{t.explanation}</p>
        </div>
      ) : null}
      {checked ? (
        <button type="button" className="guide-quick-check__retry" onClick={() => { setChoice(null); setChecked(false); }}>{t.retry} ↻</button>
      ) : (
        <button type="button" className="guide-quick-check__submit" disabled={!choice} onClick={() => setChecked(true)}>
          {t.submit} <span aria-hidden="true">→</span>
        </button>
      )}
      <p className="guide-quick-check__note">{t.note}</p>
    </section>
  );
}
