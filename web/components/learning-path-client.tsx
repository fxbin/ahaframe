"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { KnowledgeMapOverview } from "@/components/knowledge-map-overview";
import type { KnowledgeMap } from "@/lib/knowledge-map";
import type { LearningGraph, LearningProgressState, LearningUxContent } from "@/lib/learning-graph";
import { localizeLearningRoute } from "@/lib/learning-graph";
import {
  effectiveLearningState,
  LEARNING_PROGRESS_EVENT,
  LEARNING_PROGRESS_KEY,
  parseLearningProgress,
  recommendNextLearningNode,
  resetLearningProgress,
  reviewDueNodes,
} from "@/lib/learning-progress";

interface LearningPathClientProps {
  graph: LearningGraph;
  knowledgeMap: KnowledgeMap;
  ux: LearningUxContent;
}

function stateClass(state: LearningProgressState) {
  if (state === "TRANSFERRED") return "border-[var(--success)] text-[var(--success)]";
  if (state === "PRACTICED") return "border-[var(--primary)] text-[var(--primary)]";
  if (state === "REVIEW_DUE") return "border-[var(--warning)] text-[var(--warning)]";
  return "border-[var(--border)] text-[var(--muted)]";
}

function subscribeProgress(callback: () => void) {
  window.addEventListener(LEARNING_PROGRESS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LEARNING_PROGRESS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function progressSnapshot() { return window.localStorage.getItem(LEARNING_PROGRESS_KEY) ?? ""; }
function serverProgressSnapshot() { return ""; }

export function LearningPathClient({ graph, knowledgeMap, ux }: LearningPathClientProps) {
  const validIds = useMemo(() => new Set(graph.contentNodes.map((node) => node.id)), [graph.contentNodes]);
  const rawProgress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const progress = useMemo(() => parseLearningProgress(rawProgress, validIds), [rawProgress, validIds]);
  const recommendation = useMemo(() => recommendNextLearningNode(graph, progress), [graph, progress]);
  const due = useMemo(() => reviewDueNodes(graph.contentNodes, progress), [graph.contentNodes, progress]);
  const modelsById = useMemo(() => new Map(graph.models.map((model) => [model.id, model])), [graph.models]);
  const nodesByStage = useMemo(() => {
    const map = new Map<string, typeof graph.contentNodes>();
    for (const stage of graph.stages) map.set(stage.id, []);
    for (const node of graph.contentNodes) map.get(node.stageId)?.push(node);
    return map;
  }, [graph]);
  const advanced = graph.locale === "zh-CN"
    ? { kicker: "高级学习工具", title: "查看旧版 Guided Path 与浏览器学习进度", copy: "只有当你需要按旧版 10 个 Stage 查看 Experience、复习状态或 Legacy Model Index 时再展开。", legacy: "Legacy Model Index · V0.9" }
    : { kicker: "Advanced learning tools", title: "Open the legacy Guided Path and browser progress", copy: "Expand this only when you need the older 10-stage Experience progression, review state, or Legacy Model Index.", legacy: "LEGACY MODEL INDEX · V0.9" };

  function reset() {
    if (!window.confirm(ux.page.resetConfirm)) return;
    resetLearningProgress();
  }

  return (
    <div className="editorial-learning-page">
      <section className="border-b border-[var(--border)] py-14 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="editorial-kicker">{ux.page.kicker}</p>
            <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-editorial)] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">{ux.page.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">{ux.page.intro}</p>
          </div>

          <aside className="border-t border-[var(--editorial-ink)] pt-5" aria-live="polite">
            <p className="technical-label">{ux.page.nextLabel}</p>
            {recommendation.node ? (
              <>
                <h2 className="mt-3 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{recommendation.node.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{recommendation.node.promise}</p>
                <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--muted)]">{recommendation.reason === "NEW" ? ux.page.nextReasonNew : ux.page.nextReasonContinue}</p>
                <Link className="editorial-primary-action mt-5" href={localizeLearningRoute(recommendation.node.route, graph.locale)} data-event="learning_path_continued" data-content-id={recommendation.node.id}>{ux.page.continue} <span aria-hidden="true">→</span></Link>
              </>
            ) : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{ux.page.nextEmpty}</p>}
          </aside>
        </div>
      </section>

      <KnowledgeMapOverview map={knowledgeMap} />

      <section className="py-10 sm:py-12"><div className="shell">
        <details className="border-y border-[var(--border)]" data-testid="advanced-learning-tools">
          <summary className="grid cursor-pointer list-none gap-4 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)] sm:grid-cols-[1fr_auto] sm:items-end">
            <span><span className="technical-label">{advanced.kicker}</span><span className="mt-2 block font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{advanced.title}</span><span className="mt-2 block max-w-3xl text-sm leading-6 text-[var(--muted)]">{advanced.copy}</span></span>
            <span className="font-mono text-xs text-[var(--muted)]" aria-hidden="true">＋</span>
          </summary>

          <div className="border-t border-[var(--border)] pb-10 pt-8">
            <div data-testid="guided-path-v09-compat">
              <div className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl"><p className="editorial-kicker">GUIDED PATH · CURRENT EXPERIENCES</p><h2 className="section-title">{ux.page.pathTitle}</h2><p className="section-copy">{ux.page.pathCopy}</p></div><p className="max-w-sm text-xs leading-5 text-[var(--muted)]">{ux.page.anonymousNote}</p></div>

              {due.length ? <div className="mb-8 border border-[var(--warning)] p-5"><p className="technical-label">{ux.states.REVIEW_DUE}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{due.map((node) => <Link key={node.id} href={localizeLearningRoute(node.route, graph.locale)} className="text-link" data-event="learning_review_returned" data-content-id={node.id}>{node.title} <span aria-hidden="true">→</span></Link>)}</div></div> : null}

              <ol className="border-t border-[var(--border)]">
                {graph.stages.map((stage) => {
                  const stageNodes = nodesByStage.get(stage.id) ?? [];
                  return (
                    <li key={stage.id} id={stage.slug} className="grid gap-5 border-b border-[var(--border)] py-7 lg:grid-cols-[92px_.8fr_1.2fr] lg:gap-8">
                      <div className="course-number">STAGE {String(stage.order).padStart(2, "0")}</div>
                      <div><h3 className="font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{stage.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{stage.description}</p></div>
                      <div>{stageNodes.length ? <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">{stageNodes.map((node) => { const state = effectiveLearningState(node, progress); return <Link key={node.id} href={localizeLearningRoute(node.route, graph.locale)} className="group flex items-start justify-between gap-5 py-3.5" data-event="learning_path_continued" data-content-id={node.id}><span><span className="block text-sm font-bold group-hover:text-[var(--brand-accent)]">{node.title}</span><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{node.format} · {node.effortBand}</span></span><span className={`shrink-0 border px-2 py-1 font-mono text-[10px] font-bold ${stateClass(state)}`}>{ux.states[state]}</span></Link>; })}</div> : <p className="border-y border-[var(--border)] py-4 text-xs leading-5 text-[var(--muted)]">{ux.page.models}: {stage.modelIds.length}</p>}</div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-12 border-t border-[var(--border)] pt-8">
              <p className="editorial-kicker">{advanced.legacy}</p><h2 className="section-title">{ux.page.mapTitle}</h2><p className="section-copy">{ux.page.mapCopy}</p>
              <div className="mt-8 grid gap-x-10 border-t border-[var(--border)] lg:grid-cols-2">
                {graph.stages.map((stage) => (
                  <details key={stage.id} className="group border-b border-[var(--border)] py-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)]"><span><span className="course-number">{String(stage.order).padStart(2, "0")}</span><span className="ml-3 font-bold">{stage.title}</span></span><span className="font-mono text-xs text-[var(--muted)]">{stage.modelIds.length}</span></summary>
                    <ul className="mt-4 space-y-2 pl-8">{stage.modelIds.map((modelId) => { const model = modelsById.get(modelId); if (!model) return null; return <li key={model.id} className="flex gap-3 text-sm leading-6"><span className="font-mono text-[10px] text-[var(--muted)]">{model.id}</span><span>{model.title}</span></li>; })}</ul>
                  </details>
                ))}
              </div>
              <div className="mt-8 flex justify-end"><button type="button" className="editorial-text-link" onClick={reset}>{ux.page.reset}</button></div>
            </div>
          </div>
        </details>
      </div></section>
    </div>
  );
}
