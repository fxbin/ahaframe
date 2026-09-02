"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/content";
import type { LearningUxContent } from "@/lib/learning-graph";
import { localizeLearningRoute } from "@/lib/learning-graph";
import {
  effectiveLearningState,
  LEARNING_PROGRESS_EVENT,
  LEARNING_PROGRESS_KEY,
  parseLearningProgress,
  setLearningState,
} from "@/lib/learning-progress";

interface LearningContextPanelProps {
  locale: Locale;
  contentId: string;
  modelTitles: Array<{ id: string; title: string }>;
  backfills: Array<{ id: string; title: string; route: string }>;
  reviewEligible: boolean;
  debrief: string;
  transfer: string;
  labels: LearningUxContent["page"];
  states: LearningUxContent["states"];
  knowledgeLabel?: string;
  embedded?: boolean;
}

function subscribeProgress(callback: () => void) {
  window.addEventListener(LEARNING_PROGRESS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LEARNING_PROGRESS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function progressSnapshot() {
  return window.localStorage.getItem(LEARNING_PROGRESS_KEY) ?? "";
}

function serverProgressSnapshot() {
  return "";
}

export function LearningContextPanel({
  locale,
  contentId,
  modelTitles,
  backfills,
  reviewEligible,
  debrief,
  transfer,
  labels,
  states,
  knowledgeLabel,
  embedded = false,
}: LearningContextPanelProps) {
  const rawProgress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const progress = useMemo(() => parseLearningProgress(rawProgress), [rawProgress]);
  const state = effectiveLearningState({ id: contentId, reviewEligible }, progress);
  const contextTitle = embedded ? (locale === "zh-CN" ? "学习连接" : "Learning context") : labels.debrief;

  function markTransferred() {
    setLearningState(contentId, "TRANSFERRED");
  }

  return (
    <section
      className={embedded ? "border-y border-[var(--border)] py-8" : "shell mt-16 border-y border-[var(--border)] py-10"}
      aria-labelledby={`learning-context-${contentId}`}
      data-learning-context={embedded ? "embedded" : "standalone"}
    >
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow-label">LEARNING CONTEXT</p>
          {embedded ? (
            <h3 id={`learning-context-${contentId}`} className="mt-3 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.04em]">
              {contextTitle}
            </h3>
          ) : (
            <h2 id={`learning-context-${contentId}`} className="mt-3 font-[family-name:var(--font-editorial)] text-3xl font-semibold tracking-[-0.04em]">
              {contextTitle}
            </h2>
          )}
          <p className="mt-4 leading-7 text-[var(--muted)]">{debrief}</p>
          <div className="mt-5 inline-flex border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--muted)]">
            {states[state]}
          </div>
        </div>

        <div className="space-y-7">
          <div>
            <p className="technical-label">{knowledgeLabel ?? labels.models}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {modelTitles.map((model) => (
                <li key={model.id} className="border-t border-[var(--border)] pt-2 text-sm leading-6">
                  <span className="mr-2 font-mono text-[10px] text-[var(--muted)]">{model.id}</span>
                  {model.title}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="technical-label">{labels.prerequisite}</p>
            {backfills.length ? (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {backfills.map((node) => (
                  <Link
                    key={node.id}
                    href={`${localizeLearningRoute(node.route, locale)}?returnTo=${encodeURIComponent(contentId)}`}
                    className="text-link"
                    data-event="learning_prerequisite_backfill_opened"
                    data-content-id={node.id}
                  >
                    {node.title} <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{labels.backfillNone}</p>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <p className="technical-label">{labels.transfer}</p>
            <p className="mt-3 text-sm leading-7">{transfer}</p>
            <button
              type="button"
              className="secondary-action mt-4"
              onClick={markTransferred}
              disabled={state === "TRANSFERRED"}
              data-event="learning_transfer_attempted"
              data-content-id={contentId}
            >
              {state === "TRANSFERRED" ? labels.transferDone : labels.transferAction}
            </button>
          </div>

          <Link className="text-link inline-flex" href={`/${locale === "zh-CN" ? "zh-cn" : "en"}/learning/`}>
            {labels.returnToMap} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
