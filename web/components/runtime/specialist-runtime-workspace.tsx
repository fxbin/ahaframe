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

export function isSpecialistExperience(experienceKey?: RuntimeExperienceKey): boolean {
  return Boolean(experienceKey && SPECIALIST_KEYS.has(experienceKey));
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

export function SpecialistRuntimeWorkspace(props: SpecialistRuntimeWorkspaceProps) {
  if (!isSpecialistExperience(props.experienceKey)) return null;
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
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">{isZh ? "正在加载实验…" : "Loading lab…"}</div>;
  }
  if (runtime.status === "error" || !frame) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm" role="alert">{isZh ? "实验加载失败：" : "Lab failed to load: "}{runtime.error}</div>;
  }

  const copy = specialistCopy(experienceKey, isZh);
  const hasChanged = frame.historyLength > 0;

  return (
    <div className="rounded-[26px] border border-[var(--border-strong)] bg-white p-6 sm:p-8" data-specialist-lab={experienceKey} data-specialist-state={hasChanged ? "changed" : "baseline"}>
      <div className="border-b border-[var(--border)] pb-6" data-lab-section="question">
        <div className="eyebrow">{isZh ? "问题" : "Question"}</div>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{copy.title}</h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7">{copy.question}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{copy.orientation}</p>
      </div>

      <section className="mt-6" data-lab-section="change">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow">{isZh ? "改变" : "Change"}</div>
            <h3 className="mt-2 text-xl font-black tracking-[-0.03em]">{copy.changeTitle}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.changeHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="action-secondary" type="button" onClick={() => act(() => runtime.reset())}>{isZh ? "重置基线" : "Reset baseline"}</button>
            {experienceKey === "context-compression" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_BALANCED_PRESET"))}>{isZh ? "平衡预设" : "Balanced preset"}</button> : null}
            {experienceKey === "agent-workflow-graph" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_BALANCED_GRAPH"))}>{isZh ? "平衡架构" : "Balanced graph"}</button> : null}
            {experienceKey === "evaluation-failure" ? <button className="action-primary" type="button" onClick={() => act(() => runtime.dispatch("APPLY_PRODUCTION_PRESET"))}>{isZh ? "生产评估预设" : "Production preset"}</button> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {experienceKey === "context-compression" ? <ContextControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
          {experienceKey === "agent-workflow-graph" ? <GraphControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
          {experienceKey === "evaluation-failure" ? <EvaluationControls isZh={isZh} state={state} act={act} dispatch={runtime.dispatch} /> : null}
        </div>
        {hasChanged ? <div className="mt-4 text-xs text-[var(--muted)]">{frame.historyLength} {frame.historyLength === 1 ? (isZh ? "个已记录动作" : "recorded action") : (isZh ? "个已记录动作" : "recorded actions")}</div> : null}
        {actionError ? <p className="mt-4 text-sm font-medium" role="alert">{actionError}</p> : null}
      </section>

      {hasChanged ? <>
        <section className="mt-8 border-t border-[var(--border)] pt-6" data-lab-section="observe">
          <div className="eyebrow">{isZh ? "观察" : "Observe"}</div>
          <h3 className="mt-2 text-xl font-black tracking-[-0.03em]">{copy.observeTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.observeHint}</p>
          <div className="mt-5">
            <EssentialMetrics experienceKey={experienceKey} isZh={isZh} metrics={metrics} />
          </div>
          <details className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--bg)] p-4" data-lab-section="full-metrics">
            <summary className="cursor-pointer text-sm font-bold">{isZh ? "查看全部指标" : "View all metrics"}</summary>
            <div className="mt-4">
              {experienceKey === "context-compression" ? <ContextMetrics isZh={isZh} metrics={metrics} /> : null}
              {experienceKey === "agent-workflow-graph" ? <GraphMetrics isZh={isZh} metrics={metrics} /> : null}
              {experienceKey === "evaluation-failure" ? <EvaluationMetrics isZh={isZh} metrics={metrics} derived={derived} /> : null}
            </div>
          </details>
        </section>

        <section className="mt-8 border-t border-[var(--border)] pt-6" data-lab-section="explain">
          <div className="eyebrow">{isZh ? "解释" : "Explain"}</div>
          <h3 className="mt-2 text-xl font-black tracking-[-0.03em]">{copy.explainTitle}</h3>
          <div className="mt-4 rounded-[20px] bg-[var(--surface-soft)] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{asString(derived.failureType, "runtime-state")}</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asString(derived.diagnosis)}</p>
          </div>
          <details className="mt-3 text-xs text-[var(--muted)]">
            <summary className="cursor-pointer font-semibold">{isZh ? "运行时详情" : "Runtime details"}</summary>
            <div className="mt-2">Engine {frame.version} · {frame.historyLength} {isZh ? "个已记录动作" : frame.historyLength === 1 ? "recorded action" : "recorded actions"}</div>
          </details>
        </section>
      </> : null}
    </div>
  );
}

function specialistCopy(experienceKey: RuntimeExperienceKey, isZh: boolean) {
  if (experienceKey === "context-compression") {
    return isZh ? {
      title: "压缩策略控制台",
      question: "Context 可以压缩到什么程度，才不会把关键事实和证据一起压没？",
      orientation: "先改变一个策略，再观察质量、保留率与成本如何一起变化。不要先追求某一个单独指标。",
      changeTitle: "调整 Context 策略",
      changeHint: "可以只改一个变量，也可以使用平衡预设作为对照。每一次改变都由同一个确定性 scenario 重新计算。",
      observeTitle: "发生了什么变化？",
      observeHint: "先看三个最能解释 trade-off 的指标；需要诊断细节时再展开全部指标。",
      explainTitle: "为什么会这样？",
    } : {
      title: "Compression policy console",
      question: "How far can you compress context before critical facts and evidence stop surviving?",
      orientation: "Change one policy, then observe quality, retention, and cost together. Do not optimize a single metric in isolation.",
      changeTitle: "Change the context policy",
      changeHint: "Adjust one variable or use the balanced preset as a comparison. Every change is recomputed by the same deterministic scenario.",
      observeTitle: "What changed?",
      observeHint: "Start with the three metrics that best expose the trade-off. Open the full metric set only when you need more evidence.",
      explainTitle: "Why did it happen?",
    };
  }
  if (experienceKey === "agent-workflow-graph") {
    return isZh ? {
      title: "工作流图控制台",
      question: "什么时候增加 Agent 会提升可靠性，什么时候协调本身反而成为新的失败源？",
      orientation: "改变拓扑、隔离、重试或 Join 策略，然后观察可靠性与协调成本是否真的改善。",
      changeTitle: "改变工作流架构",
      changeHint: "复杂度必须用结果证明自己。可以从一个变量开始，也可以用平衡架构做对照。",
      observeTitle: "架构真的更好吗？",
      observeHint: "先看可靠性、失败传播和协调开销，再决定是否需要展开全部指标。",
      explainTitle: "系统为什么变好或变坏？",
    } : {
      title: "Workflow graph console",
      question: "When does adding agents improve reliability—and when does coordination become the new failure mode?",
      orientation: "Change topology, isolation, retry, or join policy, then check whether reliability improves enough to justify the coordination cost.",
      changeTitle: "Change the workflow architecture",
      changeHint: "Complexity has to earn its place. Change one variable or use the balanced graph as a comparison.",
      observeTitle: "Is the architecture actually better?",
      observeHint: "Start with reliability, failure propagation, and coordination overhead before opening the full metric set.",
      explainTitle: "Why did the system improve or degrade?",
    };
  }
  return isZh ? {
    title: "发布评估控制台",
    question: "一个模型在总分上变好，是否仍可能在真正影响生产风险的切片上变差？",
    orientation: "改变数据集、阈值、Judge 与 Gate，再观察 aggregate improvement 是否经得住关键切片验证。",
    changeTitle: "改变评估策略",
    changeHint: "不要把单一总分当成发布结论。调整评估证据，或者用生产评估预设建立对照。",
    observeTitle: "这个改进值得发布吗？",
    observeHint: "先看总分变化、安全切片和回归数；完整指标与 Engine decision 保留在下方详情。",
    explainTitle: "评估为什么给出这个结果？",
  } : {
    title: "Release evaluation console",
    question: "Can a model improve on aggregate while getting worse on the slices that actually matter in production?",
    orientation: "Change the dataset, threshold, judge, and gates, then test whether aggregate improvement survives critical-slice evidence.",
    changeTitle: "Change the evaluation policy",
    changeHint: "Do not treat one aggregate score as a release decision. Change the evidence or use the production preset as a comparison.",
    observeTitle: "Is this improvement releasable?",
    observeHint: "Start with aggregate delta, safety slice, and regressions. Full metrics and the engine decision remain available below.",
    explainTitle: "Why did the evaluation reach this result?",
  };
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

function EssentialMetrics({ experienceKey, isZh, metrics }: { experienceKey: RuntimeExperienceKey; isZh: boolean; metrics: RuntimeRecord }) {
  if (experienceKey === "context-compression") {
    return <MetricGrid items={[
      [isZh ? "任务质量" : "Task quality", asNumber(metrics.taskQuality).toFixed(1)],
      [isZh ? "关键保留" : "Critical retention", `${asNumber(metrics.criticalRetentionPercent).toFixed(1)}%`],
      [isZh ? "Token 节省" : "Token savings", `${asNumber(metrics.savingsPercent).toFixed(1)}%`],
    ]} compact />;
  }
  if (experienceKey === "agent-workflow-graph") {
    return <MetricGrid items={[
      [isZh ? "可靠性" : "Reliability", `${asNumber(metrics.reliabilityPercent).toFixed(1)}%`],
      [isZh ? "失败传播" : "Failure propagation", `${asNumber(metrics.failurePropagationPercent).toFixed(1)}%`],
      [isZh ? "协调开销" : "Coordination", asNumber(metrics.coordinationOverhead).toFixed(1)],
    ]} compact />;
  }
  return <MetricGrid items={[
    [isZh ? "总分变化" : "Aggregate delta", asNumber(metrics.aggregateDelta).toFixed(1)],
    [isZh ? "安全切片" : "Safety slice", asNumber(metrics.criticalSafetyScore).toFixed(1)],
    [isZh ? "回归数" : "Regressions", asNumber(metrics.regressionCount).toFixed(0)],
  ]} compact />;
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

function MetricGrid({ items, compact = false }: { items: Array<[string, string]>; compact?: boolean }) {
  return <div className={`grid gap-3 sm:grid-cols-2 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>{items.map(([label, value]) => <div key={label} className="rounded-[18px] bg-[var(--surface-soft)] p-4"><div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div><div className="mt-2 text-lg font-black tracking-[-0.03em]">{value}</div></div>)}</div>;
}
