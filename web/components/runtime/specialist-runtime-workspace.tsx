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

const SPECIALIST_KEYS = new Set<RuntimeExperienceKey>(["context-compression", "agent-workflow-graph", "evaluation-failure"]);

function asRecord(value: unknown): RuntimeRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RuntimeRecord) : {};
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function SpecialistRuntimeWorkspace(props: SpecialistRuntimeWorkspaceProps) {
  if (!SPECIALIST_KEYS.has(props.experienceKey)) return null;
  return <SpecialistRuntimeBody {...props} />;
}

function SpecialistRuntimeBody({ locale, experienceKey }: SpecialistRuntimeWorkspaceProps) {
  const isZh = locale === "zh-CN";
  const runtime = useLabRuntime(experienceKey);
  const [actionError, setActionError] = useState<string | null>(null);
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
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">{isZh ? "正在加载确定性 Lab Engine…" : "Loading deterministic Lab Engine…"}</div>;
  }
  if (runtime.status === "error" || !frame) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm" role="alert">{isZh ? "运行时加载失败：" : "Runtime failed to load: "}{runtime.error}</div>;
  }

  const titles: Record<string, string> = {
    "context-compression": isZh ? "压缩策略控制台" : "Compression policy console",
    "agent-workflow-graph": isZh ? "工作流图控制台" : "Workflow graph console",
    "evaluation-failure": isZh ? "发布评估控制台" : "Release evaluation console",
  };

  return (
    <div className="rounded-[26px] border border-[var(--border-strong)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="eyebrow">Canonical Lab Engine</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{titles[experienceKey]}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{isZh ? "React 只派发工程决策；状态、指标、failure type 和 diagnosis 都由现有确定性 scenario 重新计算。" : "React only dispatches engineering decisions; state, metrics, failure type, and diagnosis are recomputed by the existing deterministic scenario."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="action-secondary" type="button" onClick={() => act(() => runtime.reset())}>{isZh ? "重置基线" : "Reset baseline"}</button>
          {experienceKey === "context-compression" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_BALANCED_PRESET"))}>{isZh ? "平衡预设" : "Balanced preset"}</button> : null}
          {experienceKey === "agent-workflow-graph" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_BALANCED_GRAPH"))}>{isZh ? "平衡架构" : "Balanced graph"}</button> : null}
          {experienceKey === "evaluation-failure" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_PRODUCTION_PRESET"))}>{isZh ? "生产评估预设" : "Production preset"}</button> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-6">
          {experienceKey === "context-compression" ? <ContextControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
          {experienceKey === "agent-workflow-graph" ? <GraphControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
          {experienceKey === "evaluation-failure" ? <EvaluationControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
          {actionError ? <p className="text-sm font-medium" role="alert">{actionError}</p> : null}
        </div>

        <div>
          {experienceKey === "context-compression" ? <ContextMetrics isZh={isZh} metrics={metrics} /> : null}
          {experienceKey === "agent-workflow-graph" ? <GraphMetrics isZh={isZh} metrics={metrics} /> : null}
          {experienceKey === "evaluation-failure" ? <EvaluationMetrics isZh={isZh} metrics={metrics} derived={derived} /> : null}
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

type Dispatch = (typeOrAction: string | RuntimeRecord, payload?: RuntimeRecord) => unknown;
type Act = (callback: () => unknown) => void;

function ContextControls({ isZh, state, act, dispatch }: { isZh: boolean; state: RuntimeRecord; act: Act; dispatch: Dispatch }) {
  return <>
    <RangeControl label={isZh ? "压缩比例" : "Compression ratio"} suffix="%" value={asNumber(state.compressionRatio, 72)} min={20} max={85} step={1} onChange={(value) => act(() => dispatch("SET_COMPRESSION_RATIO", { value }))} />
    <SelectControl label={isZh ? "摘要深度" : "Summary depth"} value={asString(state.summaryDepth, "shallow")} options={{ shallow: isZh ? "浅层摘要" : "Shallow summary", balanced: isZh ? "平衡摘要" : "Balanced summary", deep: isZh ? "深层摘要" : "Deep summary" }} onChange={(value) => act(() => dispatch("SET_SUMMARY_DEPTH", { value }))} />
    <RangeControl label={isZh ? "检索证据预算" : "Retrieved evidence budget"} suffix=" tokens" value={asNumber(state.retrievalBudget, 1600)} min={800} max={4200} step={100} onChange={(value) => act(() => dispatch("SET_RETRIEVAL_BUDGET", { value }))} />
    <RangeControl label={isZh ? "长期记忆预算" : "Long-term memory budget"} suffix=" tokens" value={asNumber(state.memoryBudget, 600)} min={0} max={3000} step={100} onChange={(value) => act(() => dispatch("SET_MEMORY_BUDGET", { value }))} />
    <ToggleControl label={isZh ? "保护关键事实" : "Protect critical facts"} checked={Boolean(state.protectCritical)} onChange={(value) => act(() => dispatch("SET_PROTECT_CRITICAL", { value }))} />
  </>;
}

function GraphControls({ isZh, state, act, dispatch }: { isZh: boolean; state: RuntimeRecord; act: Act; dispatch: Dispatch }) {
  return <>
    <SelectControl label={isZh ? "拓扑" : "Topology"} value={asString(state.topology, "coordinator")} options={{ "single-agent": "Single Agent", sequential: isZh ? "顺序流水线" : "Sequential Pipeline", branched: isZh ? "分支工作流" : "Branched Workflow", parallel: isZh ? "并行专家" : "Parallel Specialists", coordinator: isZh ? "协调器 + Workers" : "Coordinator + Workers" }} onChange={(value) => act(() => dispatch("SET_TOPOLOGY", { value }))} />
    <RangeControl label={isZh ? "Agent 数量" : "Agent count"} suffix="" value={asNumber(state.agentCount, 5)} min={1} max={6} step={1} onChange={(value) => act(() => dispatch("SET_AGENT_COUNT", { value }))} />
    <RangeControl label={isZh ? "并行度" : "Parallelism"} suffix="" value={asNumber(state.parallelism, 4)} min={1} max={Math.min(4, asNumber(state.agentCount, 5))} step={1} onChange={(value) => act(() => dispatch("SET_PARALLELISM", { value }))} />
    <SelectControl label={isZh ? "状态隔离" : "State mode"} value={asString(state.stateMode, "shared")} options={{ shared: isZh ? "共享状态" : "Shared", isolated: isZh ? "隔离状态" : "Isolated" }} onChange={(value) => act(() => dispatch("SET_STATE_MODE", { value }))} />
    <SelectControl label={isZh ? "重试范围" : "Retry scope"} value={asString(state.retryScope, "graph")} options={{ graph: isZh ? "整图重试" : "Whole graph", node: isZh ? "节点重试" : "Node only" }} onChange={(value) => act(() => dispatch("SET_RETRY_SCOPE", { value }))} />
    <SelectControl label={isZh ? "Join 策略" : "Join strategy"} value={asString(state.joinStrategy, "first")} options={{ first: isZh ? "首个完成" : "First", all: isZh ? "等待全部" : "All", verified: isZh ? "验证后合并" : "Verified" }} onChange={(value) => act(() => dispatch("SET_JOIN_STRATEGY", { value }))} />
    <SelectControl label={isZh ? "人工门禁" : "Human gate"} value={asString(state.humanGate, "none")} options={{ none: isZh ? "无" : "None", "before-refund": isZh ? "退款前审批" : "Before refund" }} onChange={(value) => act(() => dispatch("SET_HUMAN_GATE", { value }))} />
  </>;
}

function EvaluationControls({ isZh, state, act, dispatch }: { isZh: boolean; state: RuntimeRecord; act: Act; dispatch: Dispatch }) {
  return <>
    <SelectControl label={isZh ? "数据集分布" : "Dataset preset"} value={asString(state.datasetPreset, "demo-biased")} options={{ "demo-biased": isZh ? "Demo 偏置" : "Demo-biased", "production-like": isZh ? "生产分布" : "Production-like", "safety-heavy": isZh ? "安全加权" : "Safety-heavy" }} onChange={(value) => act(() => dispatch("SET_DATASET_PRESET", { value }))} />
    <RangeControl label={isZh ? "通过阈值" : "Pass threshold"} suffix="" value={asNumber(state.passThreshold, 80)} min={70} max={95} step={1} onChange={(value) => act(() => dispatch("SET_PASS_THRESHOLD", { value }))} />
    <ToggleControl label={isZh ? "安全 Veto" : "Safety veto"} checked={Boolean(state.safetyVeto)} onChange={(value) => act(() => dispatch("SET_SAFETY_VETO", { value }))} />
    <SelectControl label={isZh ? "样本量" : "Sample size"} value={String(asNumber(state.sampleSize, 50))} options={{ "50": "50", "100": "100", "200": "200", "500": "500" }} onChange={(value) => act(() => dispatch("SET_SAMPLE_SIZE", { value: Number(value) }))} />
    <SelectControl label={isZh ? "Judge 模式" : "Judge mode"} value={asString(state.judgeMode, "rubric")} options={{ deterministic: isZh ? "确定性检查" : "Deterministic", rubric: isZh ? "语义 Rubric" : "Semantic rubric", mixed: isZh ? "混合评估" : "Mixed" }} onChange={(value) => act(() => dispatch("SET_JUDGE_MODE", { value }))} />
    <ToggleControl label={isZh ? "成本 Gate" : "Cost gate"} checked={Boolean(state.costGate)} onChange={(value) => act(() => dispatch("SET_COST_GATE", { value }))} />
  </>;
}

function ContextMetrics({ isZh, metrics }: { isZh: boolean; metrics: RuntimeRecord }) {
  return <MetricGrid items={[
    [isZh ? "活跃 Context" : "Active context", `${Math.round(asNumber(metrics.activeContextTokens)).toLocaleString()} t`],
    [isZh ? "Token 节省" : "Token savings", `${asNumber(metrics.savingsPercent).toFixed(1)}%`],
    [isZh ? "关键保留" : "Critical retention", `${asNumber(metrics.criticalRetentionPercent).toFixed(1)}%`],
    [isZh ? "证据覆盖" : "Evidence coverage", `${asNumber(metrics.evidenceCoveragePercent).toFixed(1)}%`],
    [isZh ? "任务质量" : "Task quality", asNumber(metrics.taskQuality).toFixed(1)],
    [isZh ? "幻觉风险" : "Hallucination risk", `${asNumber(metrics.hallucinationRisk).toFixed(1)}%`],
    [isZh ? "延迟指数" : "Latency index", asNumber(metrics.latencyIndex).toFixed(1)],
    [isZh ? "成本指数" : "Cost index", asNumber(metrics.costIndex).toFixed(1)],
  ]} />;
}

function GraphMetrics({ isZh, metrics }: { isZh: boolean; metrics: RuntimeRecord }) {
  return <MetricGrid items={[
    [isZh ? "架构分" : "Architecture", asNumber(metrics.architectureScore).toFixed(0)],
    [isZh ? "可靠性" : "Reliability", `${asNumber(metrics.reliabilityPercent).toFixed(1)}%`],
    [isZh ? "失败传播" : "Failure propagation", `${asNumber(metrics.failurePropagationPercent).toFixed(1)}%`],
    [isZh ? "危险动作" : "Unsafe actions", `${asNumber(metrics.unsafeActionPercent).toFixed(1)}%`],
    [isZh ? "协调开销" : "Coordination", asNumber(metrics.coordinationOverhead).toFixed(1)],
    [isZh ? "状态复杂度" : "State complexity", asNumber(metrics.stateComplexity).toFixed(1)],
    [isZh ? "延迟" : "Latency", `${asNumber(metrics.latencySeconds).toFixed(1)} s`],
    [isZh ? "成本" : "Cost", asNumber(metrics.costIndex).toFixed(1)],
  ]} />;
}

function EvaluationMetrics({ isZh, metrics, derived }: { isZh: boolean; metrics: RuntimeRecord; derived: RuntimeRecord }) {
  return <><MetricGrid items={[
    ["v1", asNumber(metrics.aggregateV1).toFixed(1)],
    ["v2", asNumber(metrics.aggregateV2).toFixed(1)],
    [isZh ? "变化" : "Delta", asNumber(metrics.aggregateDelta).toFixed(1)],
    [isZh ? "安全切片" : "Safety slice", asNumber(metrics.criticalSafetyScore).toFixed(1)],
    [isZh ? "回归数" : "Regressions", asNumber(metrics.regressionCount).toFixed(0)],
    [isZh ? "证据宽度" : "Evidence width", asNumber(metrics.confidenceWidth).toFixed(2)],
    [isZh ? "评估成本" : "Eval cost", asNumber(metrics.estimatedEvalCost).toFixed(2)],
    [isZh ? "成功成本" : "Cost / success", asNumber(metrics.costPerSuccessV2).toFixed(3)],
  ]} /><div className="mt-4 rounded-xl border border-[var(--border)] p-4 text-sm"><span className="text-[var(--muted)]">{isZh ? "Engine 决策：" : "Engine decision: "}</span><strong>{asString(derived.decision, "—")}</strong></div></>;
}

function RangeControl({ label, suffix, value, min, max, step, onChange }: { label: string; suffix: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="flex justify-between gap-3 text-sm font-bold"><span>{label}</span><span>{value}{suffix}</span></span><input className="mt-3 w-full accent-[var(--primary)]" type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function SelectControl({ label, value, options, onChange }: { label: string; value: string; options: Record<string, string>; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-bold">{label}</span><select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(options).map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label>;
}

function ToggleControl({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4 text-sm font-bold"><span>{label}</span><input className="h-5 w-5 accent-[var(--primary)]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function MetricGrid({ items }: { items: Array<[string, string]> }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-[18px] bg-[var(--surface-soft)] p-4"><div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div><div className="mt-2 text-lg font-black tracking-[-0.03em]">{value}</div></div>)}</div>;
}
