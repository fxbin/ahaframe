"use client";

import { useState } from "react";
import { useLabRuntime } from "@/hooks/use-lab-runtime";
import type { Locale } from "@/lib/content";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";
import type { RuntimeRecord } from "@/lib/runtime-client";

interface SpecialistRuntimeWorkspaceProps {
  locale: Locale;
  experienceKey: RuntimeExperienceKey;
}

function asRecord(value: unknown): RuntimeRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RuntimeRecord) : {};
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function SpecialistRuntimeWorkspace({ locale, experienceKey }: SpecialistRuntimeWorkspaceProps) {
  const isZh = locale === "zh-CN";
  const runtime = useLabRuntime(experienceKey);
  const [actionError, setActionError] = useState<string | null>(null);

  if (experienceKey !== "context-compression") return null;

  const frame = runtime.frame;
  const state = asRecord(frame?.state);
  const derived = asRecord(frame?.derived);
  const metrics = asRecord(derived.metrics);

  function act(callback: () => unknown) {
    try {
      callback();
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }

  if (runtime.status === "loading") {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">{isZh ? "正在加载 Context Compression Engine…" : "Loading Context Compression Engine…"}</div>;
  }
  if (runtime.status === "error" || !frame) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm" role="alert">{isZh ? "运行时加载失败：" : "Runtime failed to load: "}{runtime.error}</div>;
  }

  return (
    <div className="rounded-[26px] border border-[var(--border-strong)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="eyebrow">{isZh ? "Context Engineering · Canonical Engine" : "Context Engineering · Canonical Engine"}</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{isZh ? "压缩策略控制台" : "Compression policy console"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{isZh ? "调整策略后，所有 token、保留率、风险和质量指标都由原有确定性 scenario 重新计算。" : "Change the policy and let the existing deterministic scenario recompute tokens, retention, risk, and quality."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="action-secondary" type="button" onClick={() => act(() => runtime.reset())}>{isZh ? "重置基线" : "Reset baseline"}</button>
          <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_BALANCED_PRESET"))}>{isZh ? "平衡预设" : "Balanced preset"}</button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-6">
          <RangeControl label={isZh ? "压缩比例" : "Compression ratio"} suffix="%" value={asNumber(state.compressionRatio, 72)} min={20} max={85} step={1} onChange={(value) => act(() => runtime.dispatch("SET_COMPRESSION_RATIO", { value }))} />
          <div>
            <label className="text-sm font-bold" htmlFor="summary-depth">{isZh ? "摘要深度" : "Summary depth"}</label>
            <select id="summary-depth" className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm" value={asString(state.summaryDepth, "shallow")} onChange={(event) => act(() => runtime.dispatch("SET_SUMMARY_DEPTH", { value: event.target.value }))}>
              <option value="shallow">{isZh ? "浅层摘要" : "Shallow summary"}</option>
              <option value="balanced">{isZh ? "平衡摘要" : "Balanced summary"}</option>
              <option value="deep">{isZh ? "深层摘要" : "Deep summary"}</option>
            </select>
          </div>
          <RangeControl label={isZh ? "检索证据预算" : "Retrieved evidence budget"} suffix=" tokens" value={asNumber(state.retrievalBudget, 1600)} min={800} max={4200} step={100} onChange={(value) => act(() => runtime.dispatch("SET_RETRIEVAL_BUDGET", { value }))} />
          <RangeControl label={isZh ? "长期记忆预算" : "Long-term memory budget"} suffix=" tokens" value={asNumber(state.memoryBudget, 600)} min={0} max={3000} step={100} onChange={(value) => act(() => runtime.dispatch("SET_MEMORY_BUDGET", { value }))} />
          <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4 text-sm font-bold">
            <span>{isZh ? "保护关键事实" : "Protect critical facts"}</span>
            <input className="h-5 w-5 accent-[var(--primary)]" type="checkbox" checked={Boolean(state.protectCritical)} onChange={(event) => act(() => runtime.dispatch("SET_PROTECT_CRITICAL", { value: event.target.checked }))} />
          </label>
          {actionError ? <p className="text-sm font-medium" role="alert">{actionError}</p> : null}
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={isZh ? "活跃 Context" : "Active context"} value={`${Math.round(asNumber(metrics.activeContextTokens ?? derived.activeContextTokens)).toLocaleString()} t`} />
            <Metric label={isZh ? "Token 节省" : "Token savings"} value={`${asNumber(metrics.savingsPercent ?? derived.savingsPercent).toFixed(1)}%`} />
            <Metric label={isZh ? "关键保留" : "Critical retention"} value={`${asNumber(metrics.criticalRetentionPercent ?? derived.criticalRetentionPercent).toFixed(1)}%`} />
            <Metric label={isZh ? "证据覆盖" : "Evidence coverage"} value={`${asNumber(metrics.evidenceCoveragePercent ?? derived.evidenceCoveragePercent).toFixed(1)}%`} />
            <Metric label={isZh ? "任务质量" : "Task quality"} value={asNumber(metrics.taskQuality ?? derived.taskQuality).toFixed(1)} />
            <Metric label={isZh ? "幻觉风险" : "Hallucination risk"} value={`${asNumber(metrics.hallucinationRisk ?? derived.hallucinationRisk).toFixed(1)}%`} />
            <Metric label={isZh ? "延迟指数" : "Latency index"} value={asNumber(metrics.latencyIndex ?? derived.latencyIndex).toFixed(1)} />
            <Metric label={isZh ? "成本指数" : "Cost index"} value={asNumber(metrics.costIndex ?? derived.costIndex).toFixed(1)} />
          </div>
          <div className="mt-5 rounded-[20px] bg-[var(--surface-soft)] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{asString(derived.failureType, "runtime-state")}</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asString(derived.diagnosis)}</p>
          </div>
          <div className="mt-4 text-xs text-[var(--muted)]">Engine {frame.version} · {frame.historyLength} {isZh ? "个已记录动作" : "recorded actions"}</div>
        </div>
      </div>
    </div>
  );
}

function RangeControl({ label, suffix, value, min, max, step, onChange }: { label: string; suffix: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="flex justify-between gap-3 text-sm font-bold"><span>{label}</span><span>{value}{suffix}</span></span><input className="mt-3 w-full accent-[var(--primary)]" type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] bg-[var(--surface-soft)] p-4"><div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div><div className="mt-2 text-lg font-black tracking-[-0.03em]">{value}</div></div>;
}
