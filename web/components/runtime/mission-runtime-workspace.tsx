"use client";

import { useMemo, useState } from "react";
import { useMissionRuntime } from "@/hooks/use-mission-runtime";
import type { Locale } from "@/lib/content";
import type { MissionContent, MissionControl } from "@/lib/mission";
import type { RuntimeExperienceKey } from "@/lib/runtime-manifest";
import type { RuntimeRecord } from "@/lib/runtime-client";

interface MissionRuntimeWorkspaceProps {
  locale: Locale;
  mission: MissionContent;
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

function normalizeOption(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function formatMetric(value: unknown, format: string, locale: Locale) {
  const number = asNumber(value, Number.NaN);
  if (!Number.isFinite(number)) return "—";
  const lang = locale === "zh-CN" ? "zh-CN" : "en-US";
  switch (format) {
    case "percent": return `${number.toFixed(0)}%`;
    case "percent1": return `${number.toFixed(1)}%`;
    case "usd": return new Intl.NumberFormat(lang, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(number);
    case "ms": return `${Math.round(number).toLocaleString(lang)} ms`;
    case "seconds": return `${number.toFixed(1)} s`;
    case "integer": return Math.round(number).toLocaleString(lang);
    case "score": return number.toFixed(0);
    default: return number.toFixed(1);
  }
}

function printable(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function phaseIs(phase: string, values: string[]) {
  return values.includes(phase);
}

export function MissionRuntimeWorkspace({ locale, mission, experienceKey }: MissionRuntimeWorkspaceProps) {
  const isZh = locale === "zh-CN";
  const runtime = useMissionRuntime(experienceKey);
  const [actionError, setActionError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{ id: string; value: unknown } | null>(null);
  const [comparison, setComparison] = useState<RuntimeRecord | null>(null);
  const [rationale, setRationale] = useState("");
  const controls = useMemo(() => mission.controls ?? mission.groups ?? {}, [mission.controls, mission.groups]);

  if (runtime.status === "loading") {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">{isZh ? "正在加载 Mission Engine…" : "Loading Mission Engine…"}</div>;
  }
  if (runtime.status === "error" || !runtime.snapshot) {
    return <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 text-sm" role="alert">{isZh ? "Mission 运行时加载失败：" : "Mission runtime failed to load: "}{runtime.error}</div>;
  }

  const snapshot = runtime.snapshot;
  const missionState = asRecord(snapshot.mission);
  const metrics = asRecord(snapshot.frame.derived.metrics);
  const phase = asString(missionState.phase, "BRIEF");
  const attempts = Array.isArray(missionState.attemptFrames) ? missionState.attemptFrames.map(asRecord) : [];
  const inspectedEvidenceIds = Array.isArray(missionState.inspectedEvidenceIds) ? missionState.inspectedEvidenceIds : [];
  const outcomeCode = asString(missionState.outcomeCode);
  const releaseDecision = asString(missionState.releaseDecision);
  const remainingBudget = missionState.remainingBudget;

  const isBrief = phase === "BRIEF";
  const showInvestigation = phaseIs(phase, ["INVESTIGATE", "INTERVENE", "REVIEW"]);
  const showReview = attempts.length > 0 && phaseIs(phase, ["REVIEW", "DECIDE", "DEBRIEF", "COMPLETE"]);
  const showRelease = phaseIs(phase, ["REVIEW", "DECIDE", "DEBRIEF", "COMPLETE"]);
  const canOperate = phaseIs(phase, ["INVESTIGATE", "INTERVENE", "REVIEW"]);

  function act(callback: () => unknown) {
    try {
      callback();
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }

  function inspect(id: string) {
    act(() => setEvidence(runtime.inspectEvidence(id)));
  }

  function intervene(key: string, control: MissionControl, option: string) {
    const intervention = control.intervention ?? key;
    act(() => runtime.intervene(intervention, { value: normalizeOption(option) }));
  }

  function reset() {
    act(() => runtime.reset());
    setEvidence(null);
    setComparison(null);
    setRationale("");
  }

  function decide(decision: string) {
    if (mission.ui.rationale && !rationale.trim()) {
      setActionError(mission.ui.rationaleRequired ?? (isZh ? "请先填写工程判断依据。" : "Add a short engineering rationale before deciding."));
      return;
    }
    act(() => runtime.submitReleaseDecision(decision));
  }

  return (
    <div
      className="rounded-[28px] border border-[var(--border-strong)] bg-white p-6 sm:p-8"
      data-mission-phase={phase}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="max-w-3xl">
          <div className="eyebrow">{mission.ui.workspace ?? (isZh ? "事故控制台" : "Incident console")}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black tracking-[-0.04em]">{mission.ui.policy ?? mission.name}</h2>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-bold">{phase}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {isZh
              ? "先检查证据，再做有依据的改动。运行系统、比较结果，最后再做发布判断。"
              : "Start with the evidence. Change only what you can justify, run the system, compare the result, then make the release call."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBrief ? (
            <button className="action-primary" type="button" onClick={() => act(() => runtime.start())}>
              {mission.ui.start ?? (isZh ? "开始事故" : "Start incident")}
            </button>
          ) : null}
          {!isBrief ? (
            <button className="action-secondary" type="button" onClick={reset}>
              {mission.ui.reset ?? (isZh ? "重置" : "Reset")}
            </button>
          ) : null}
        </div>
      </div>

      {isBrief ? (
        <section className="mt-6 rounded-[20px] bg-[var(--surface-soft)] p-5" data-mission-section="start">
          <p className="text-sm font-bold">{isZh ? "先理解任务，不要急着调参数。" : "Understand the task before changing the system."}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {isZh ? "开始后，你会先看到可检查的证据与当前可做的工程干预。" : "Once you start, the evidence and the engineering interventions that matter now will appear."}
          </p>
        </section>
      ) : null}

      {showInvestigation ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[.72fr_1.28fr]" data-mission-stage="investigate">
          <aside className="space-y-5">
            <section data-mission-section="evidence">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-[0.1em]">{mission.ui.evidence ?? (isZh ? "证据" : "Evidence")}</h3>
                <span className="text-xs text-[var(--muted)]">{inspectedEvidenceIds.length} / {Object.keys(mission.evidenceLabels).length}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {Object.entries(mission.evidenceLabels).map(([id, label]) => (
                  <button
                    key={id}
                    className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    type="button"
                    disabled={!canOperate}
                    onClick={() => inspect(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {evidence ? (
                <div className="mt-3 rounded-xl bg-[var(--surface-soft)] p-4">
                  <div className="text-xs font-bold text-[var(--primary)]">{mission.evidenceLabels[evidence.id] ?? evidence.id}</div>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--muted)]">{printable(evidence.value)}</pre>
                </div>
              ) : null}
            </section>

            <section className="border-t border-[var(--border)] pt-5" data-mission-section="budget">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-bold">{mission.ui.budget ?? (isZh ? "变更预算" : "Change budget")}</span>
                <span className="text-[var(--muted)]">{remainingBudget === null ? "∞" : String(remainingBudget)}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                {isZh ? "预算有限。优先做你能用证据解释的改动。" : "The budget is finite. Prefer changes you can explain with evidence."}
              </p>
            </section>
          </aside>

          <section className="space-y-5" data-mission-section="interventions">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.1em]">{mission.ui.policy ?? (isZh ? "工程干预" : "Engineering interventions")}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {Object.entries(controls).map(([key, control]) => (
                  <div key={key} className="rounded-[18px] bg-[var(--surface-soft)] p-4">
                    <div className="text-xs font-bold text-[var(--muted)]">{control.label}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(control.options).map(([option, label]) => (
                        <button
                          key={option}
                          type="button"
                          disabled={!canOperate}
                          className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                          onClick={() => intervene(key, control, option)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="action-primary mt-4" type="button" disabled={!canOperate} onClick={() => act(() => runtime.runSimulation())}>
                {mission.ui.run ?? (isZh ? "运行模拟" : "Run simulation")}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showReview ? (
        <div className="mt-6 space-y-6" data-mission-stage="review">
          <section className="border-t border-[var(--border)] pt-5" data-mission-section="outcome">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-[0.1em]">{mission.ui.outcome ?? (isZh ? "当前结果" : "Current outcome")}</h3>
              <span className="text-xs font-bold text-[var(--primary)]">{outcomeCode || mission.ui.waiting || "—"}</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mission.metrics.map((metric) => <Metric key={metric.key} label={metric.label} value={formatMetric(metrics[metric.key], metric.format, locale)} />)}
            </div>
          </section>

          <section className="border-t border-[var(--border)] pt-5" data-mission-section="constraints">
            <h3 className="text-sm font-black uppercase tracking-[0.1em]">{isZh ? "约束" : "Constraints"}</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {snapshot.constraints.map((constraint, index) => {
                const row = asRecord(constraint);
                const pass = Boolean(row.pass);
                return (
                  <div key={asString(row.id, String(index))} className="rounded-xl border border-[var(--border)] p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{asString(row.id)}</strong>
                      <span className={pass ? "text-[var(--success)]" : "text-[var(--danger)]"}>{pass ? "PASS" : "MISS"}</span>
                    </div>
                    <div className="mt-1 text-[var(--muted)]">{asString(row.severity)} · {String(row.actual ?? "—")} {asString(row.op)} {String(row.expected ?? "—")}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-t border-[var(--border)] pt-5" data-mission-section="attempts">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-[0.1em]">{mission.ui.attempts ?? (isZh ? "尝试记录" : "Attempts")}</h3>
              {attempts.length >= 2 ? (
                <button className="action-secondary" type="button" onClick={() => act(() => setComparison(runtime.compareAttempts(1, attempts.length)))}>
                  {mission.ui.compared ?? (isZh ? "比较首尾" : "Compare first → latest")}
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2">
              {attempts.map((attempt, index) => (
                <div key={String(attempt.attemptNumber ?? index)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-soft)] p-3 text-sm">
                  <div>
                    <strong>#{String(attempt.attemptNumber ?? index + 1)}</strong>
                    <span className="ml-2 text-[var(--muted)]">{String(attempt.outcomeCode ?? "")}</span>
                  </div>
                  {phaseIs(phase, ["REVIEW", "DECIDE"]) ? (
                    <button className="text-xs font-bold text-[var(--primary)]" type="button" onClick={() => act(() => runtime.restoreAttempt(Number(attempt.attemptNumber)))}>
                      {isZh ? "恢复" : "Restore"}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {comparison ? <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-[var(--text)] p-4 text-xs leading-5 text-white/75">{printable(comparison)}</pre> : null}
          </section>
        </div>
      ) : null}

      {showRelease ? (
        <section className="mt-6 border-t border-[var(--border)] pt-5" data-mission-section="release">
          <h3 className="text-sm font-black uppercase tracking-[0.1em]">{mission.ui.release ?? (isZh ? "发布决策" : "Release decision")}</h3>
          {phase === "REVIEW" ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button className="action-primary" type="button" onClick={() => act(() => runtime.readyToDecide())}>
                {isZh ? "进入发布决策" : "Proceed to release decision"}
              </button>
              <span className="text-xs leading-5 text-[var(--muted)]">{isZh ? "先确认结果与约束，再做最终判断。" : "Review the outcome and constraints before making the final call."}</span>
            </div>
          ) : null}
          {phase === "DECIDE" ? (
            <div className="mt-3 space-y-3">
              {mission.ui.rationale ? (
                <label className="block">
                  <span className="text-xs font-bold text-[var(--muted)]">{mission.ui.rationale}</span>
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm"
                    value={rationale}
                    placeholder={mission.ui.rationalePlaceholder ?? ""}
                    onChange={(event) => setRationale(event.target.value)}
                  />
                </label>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button className="action-primary" type="button" onClick={() => decide("SHIP")}>{mission.ui.ship ?? "SHIP"}</button>
                <button className="action-secondary" type="button" onClick={() => decide("BLOCK")}>{mission.ui.block ?? "BLOCK"}</button>
                <button className="action-secondary" type="button" onClick={() => decide("INCONCLUSIVE")}>{mission.ui.inconclusive ?? "INCONCLUSIVE"}</button>
              </div>
            </div>
          ) : null}
          {phase === "DEBRIEF" ? (
            <button className="action-primary mt-3" type="button" onClick={() => act(() => runtime.complete())}>
              {mission.ui.complete ?? (isZh ? "完成 Mission" : "Complete mission")}
            </button>
          ) : null}
          {releaseDecision ? (
            <p className="mt-3 text-sm"><span className="text-[var(--muted)]">{isZh ? "已提交：" : "Submitted: "}</span><strong>{releaseDecision}</strong></p>
          ) : null}
        </section>
      ) : null}

      {actionError ? <p className="mt-5 rounded-xl border border-[var(--border)] p-3 text-sm font-medium" role="alert">{actionError}</p> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[16px] bg-[var(--surface-soft)] p-4"><div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div><div className="mt-2 text-lg font-black tracking-[-0.03em]">{value}</div></div>;
}
