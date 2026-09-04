"use client";

import { useMemo, useState } from "react";
import { useLabRuntime } from "@/hooks/use-lab-runtime";
import type { Locale } from "@/lib/content";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";
import type { RuntimeRecord } from "@/lib/runtime-client";

interface FoundationRuntimeWorkspaceProps { locale: Locale; experienceKey: RuntimeExperienceKey; }
const FOUNDATION_KEYS = new Set<RuntimeExperienceKey>(["token-playground", "context-window", "agent-loop"]);

function asRecord(value: unknown): RuntimeRecord { return value && typeof value === "object" && !Array.isArray(value) ? (value as RuntimeRecord) : {}; }
function asNumber(value: unknown, fallback = 0) { return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
function asString(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback; }
function compactNumber(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value); }

export function FoundationRuntimeWorkspace({ locale, experienceKey }: FoundationRuntimeWorkspaceProps) {
  const isZh = locale === "zh-CN";
  const runtime = useLabRuntime(experienceKey);
  const [actionError, setActionError] = useState<string | null>(null);
  const percent = useMemo(() => new Intl.NumberFormat(isZh ? "zh-CN" : "en-US", { style: "percent", maximumFractionDigits: 1 }), [isZh]);
  if (!FOUNDATION_KEYS.has(experienceKey)) return null;

  const state = asRecord(runtime.frame?.state);
  const derived = asRecord(runtime.frame?.derived);
  const metrics = asRecord(derived.metrics);

  function act(callback: () => unknown) {
    try { callback(); setActionError(null); } catch (error) { setActionError(error instanceof Error ? error.message : String(error)); }
  }

  if (runtime.status === "loading") return <div className="border-y border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">{isZh ? "正在加载确定性实验运行时…" : "Loading deterministic lab runtime…"}</div>;
  if (runtime.status === "error" || !runtime.frame) return <div className="border-y border-[var(--border)] bg-[var(--surface)] p-6 text-sm" role="alert">{isZh ? "实验运行时加载失败：" : "Lab runtime failed to load: "}{runtime.error}</div>;

  return (
    <div className="border border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div><div className="eyebrow">{isZh ? "确定性运行时" : "Deterministic runtime"}</div><h2 className="mt-2 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.04em]">{isZh ? "实时实验控制台" : "Live lab console"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{isZh ? "控件直接派发到 canonical Lab Engine；状态、指标和结果都来自同一个确定性状态机。" : "Controls dispatch directly into the canonical Lab Engine; state, metrics, and outcomes come from the same deterministic state machine."}</p></div>
        <button className="action-secondary" type="button" onClick={() => act(() => runtime.reset())}>{isZh ? "重置" : "Reset"}</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.78fr_1.22fr]">
        <div className="space-y-5">
          {experienceKey === "token-playground" ? <><label className="block"><span className="text-sm font-bold">Temperature · {asNumber(state.temperature, 0.7).toFixed(1)}</span><input className="mt-3 w-full accent-[var(--brand-accent)]" type="range" min="0" max="2" step="0.1" value={asNumber(state.temperature, 0.7)} onChange={(event) => act(() => runtime.dispatch("SET_TEMPERATURE", { value: Number(event.target.value) }))} /></label><div><div className="text-sm font-bold">{isZh ? "采样策略" : "Sampling strategy"}</div><div className="mt-3 flex flex-wrap gap-2">{["sample", "greedy"].map((option) => <button key={option} type="button" className={asString(state.sampling) === option ? "action-primary" : "action-secondary"} onClick={() => act(() => runtime.dispatch("SET_SAMPLING", { value: option }))}>{option === "sample" ? (isZh ? "概率采样" : "Sample") : (isZh ? "贪心" : "Greedy")}</button>)}</div></div></> : null}

          {experienceKey === "context-window" ? <div><div className="text-sm font-bold">{isZh ? "上下文策略" : "Context strategy"}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{(["drop", "summarize", "rag", "memory"] as const).map((option) => { const labels = isZh ? { drop: "丢弃旧消息", summarize: "摘要", rag: "RAG", memory: "长期记忆" } : { drop: "Drop old messages", summarize: "Summarize", rag: "RAG", memory: "Memory" }; return <button key={option} type="button" className={asString(state.strategy) === option ? "action-primary" : "action-secondary"} onClick={() => act(() => runtime.dispatch("SELECT_STRATEGY", { strategy: option }))}>{labels[option]}</button>; })}</div></div> : null}

          {experienceKey === "agent-loop" ? <div className="grid gap-2 sm:grid-cols-2"><button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("NEXT"))}>{isZh ? "下一步" : "Next step"}</button><button className="action-secondary" type="button" onClick={() => act(() => runtime.dispatch("INJECT_TOOL_ERROR"))}>{isZh ? "注入工具错误" : "Inject tool error"}</button><button className="action-secondary sm:col-span-2" type="button" onClick={() => act(() => runtime.dispatch("RECOVER_TOOL_ERROR"))}>{isZh ? "从工具错误恢复" : "Recover tool error"}</button></div> : null}

          {actionError ? <p className="text-sm font-medium text-[var(--danger)]" role="alert">{actionError}</p> : null}
          <div className="border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">{isZh ? `Engine ${runtime.frame.version} · 历史动作 ${runtime.frame.historyLength}` : `Engine ${runtime.frame.version} · ${runtime.frame.historyLength} recorded actions`}</div>
        </div>

        <div className="bg-[var(--surface-soft)] p-5 sm:p-6">
          {experienceKey === "token-playground" ? <div><div className="text-sm font-bold">{isZh ? "下一 Token 分布" : "Next-token distribution"}</div><div className="mt-4 space-y-3">{(Array.isArray(derived.candidates) ? derived.candidates : []).map((candidate, index) => { const row = asRecord(candidate); const probability = asNumber(row.probability); return <div key={`${asString(row.token)}-${index}`}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold">{asString(row.token)}</span><span>{percent.format(probability)}</span></div><div className="mt-1 h-2 overflow-hidden bg-white"><div className="h-full bg-[var(--brand-accent)]" style={{ width: `${Math.max(0, Math.min(100, probability * 100))}%` }} /></div></div>; })}</div><div className="mt-5 border-t border-[var(--border)] pt-4 text-sm"><span className="text-[var(--muted)]">{isZh ? "选中：" : "Selected: "}</span><strong>{asString(asRecord(derived.selected).token, "—")}</strong></div></div> : null}

          {experienceKey === "context-window" ? <div className="grid gap-4 sm:grid-cols-3"><Metric label={isZh ? "活跃 Tokens" : "Active tokens"} value={compactNumber(asNumber(derived.activeTokens))} /><Metric label={isZh ? "剩余空间" : "Headroom"} value={compactNumber(asNumber(derived.headroom))} /><Metric label={isZh ? "释放 Tokens" : "Released tokens"} value={compactNumber(asNumber(derived.releasedTokens))} /><p className="sm:col-span-3 text-sm leading-6 text-[var(--muted)]">{asString(derived.note)}</p></div> : null}

          {experienceKey === "agent-loop" ? <div><div className="editorial-kicker">{isZh ? "当前状态" : "Current state"}</div><p className="mt-3 text-lg font-bold leading-7">{asString(derived.status)}</p><div className="mt-5 h-2 overflow-hidden bg-white"><div className="h-full bg-[var(--brand-accent)]" style={{ width: `${Math.max(0, Math.min(100, asNumber(metrics.progressPercent)))}%` }} /></div><div className="mt-5 border-t border-[var(--border)] pt-4"><div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{isZh ? "最终回答" : "Final answer"}</div><p className="mt-2 text-sm leading-6">{asString(derived.result)}</p></div></div> : null}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div><div className="mt-1 text-xl font-bold tracking-[-0.03em]">{value}</div></div>;
}
