"use client";

import { useState } from "react";
import type { Locale } from "@/lib/content";

interface FlowStep {
  title: string;
  subtitle: string;
  detail: string;
}

const FLOWS: Record<Locale, FlowStep[]> = {
  "zh-CN": [
    { title: "问题", subtitle: "明确任务目标", detail: "把用户请求转为明确的任务和成功条件。" },
    { title: "规划", subtitle: "确定执行路径", detail: "根据目标选择要使用的步骤、资料和工具。" },
    { title: "工具", subtitle: "执行外部操作", detail: "通过工具获取信息；记录实际返回的结果与错误。" },
    { title: "验证", subtitle: "核对外部证据", detail: "检查结果是否满足预期，区分已确认与不确定状态。" },
    { title: "输出", subtitle: "交付可追溯结果", detail: "基于已核验的结果输出答案，并说明仍不确定的部分。" },
  ],
  en: [
    { title: "Input", subtitle: "Define the goal", detail: "Translate a user request into an explicit task and success criteria." },
    { title: "Plan", subtitle: "Choose next steps", detail: "Choose actions, information sources and tools that fit the goal." },
    { title: "Tools", subtitle: "Take an action", detail: "Call an external tool and capture its real results and failures." },
    { title: "Verify", subtitle: "Check the evidence", detail: "Check whether the observed result meets the goal and track uncertainty." },
    { title: "Output", subtitle: "Deliver a result", detail: "Present the verified outcome and state what remains uncertain." },
  ],
};

export function AgentFlowPreview({ locale }: { locale: Locale }) {
  const steps = FLOWS[locale];
  const zh = locale === "zh-CN";
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="agent-preview glass-panel" aria-label={zh ? "可交互的 Agent 工作流程示意" : "Interactive Agent workflow illustration"}>
      <div className="agent-preview__header">
        <div className="min-w-0">
          <span className="agent-preview__dots" aria-hidden="true"><i /><i /><i /></span>
          <p className="mt-3 font-[family-name:var(--font-editorial)] text-lg font-semibold">
            {zh ? "看见 Agent 如何工作" : "See an Agent at work"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {zh ? "交互式流程示意 · 非模型内部思维记录" : "Interactive process model · not a model's private reasoning trace"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 font-mono text-[11px] text-[var(--muted)]">
          {activeStep + 1} / {steps.length}
        </span>
      </div>

      <div className="agent-preview__stage" role="group" aria-label={zh ? "选择流程步骤" : "Select a process step"}>
        <svg aria-hidden="true" viewBox="0 0 500 280" className="pointer-events-none absolute inset-0 -z-0 h-full w-full overflow-visible" preserveAspectRatio="none">
          <path d="M68 74 C128 70 134 70 196 74 S330 74 418 74" fill="none" stroke="#d4a78c" strokeWidth="1.7" strokeDasharray="4 7" />
          <path d="M418 93 C446 186 332 205 250 212 S95 206 68 205" fill="none" stroke="#a7bfae" strokeWidth="1.7" strokeDasharray="4 7" />
        </svg>
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            className="agent-preview__node relative z-10"
            aria-pressed={activeStep === index}
            onClick={() => setActiveStep(index)}
            data-agent-step={index}
          >
            <span className="agent-preview__number">{String(index + 1).padStart(2, "0")}</span>
            <strong className="text-[13px] font-semibold">{step.title}</strong>
            <small className="max-w-full text-[11px] leading-4 text-[var(--muted)]">{step.subtitle}</small>
          </button>
        ))}
      </div>

      <div className="agent-preview__detail" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[var(--glass-copper)]">{zh ? "当前步骤" : "Selected step"} · {steps[activeStep].title}</p>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)]" aria-hidden="true" />
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{steps[activeStep].detail}</p>
      </div>
    </div>
  );
}
