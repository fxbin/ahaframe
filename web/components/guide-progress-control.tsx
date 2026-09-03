"use client";

import { useEffect } from "react";
import { useGuideProductProgress } from "@/hooks/use-guide-product-progress";
import type { Locale } from "@/lib/content";
import {
  guideEvidenceState,
  markGuideRead,
  markGuideSeen,
  practiceCompleted,
} from "@/lib/learning-progress";

interface GuideProgressControlProps {
  locale: Locale;
  conceptId: string;
  practiceId?: string | null;
}

export function GuideProgressControl({ locale, conceptId, practiceId }: GuideProgressControlProps) {
  const progress = useGuideProductProgress();
  const state = guideEvidenceState(progress, conceptId);
  const practiced = practiceId ? practiceCompleted(progress, practiceId) : false;
  const copy = locale === "zh-CN"
    ? {
        label: "阅读记录",
        unseen: "未打开",
        seen: "已看过",
        read: "已标记读完",
        mark: "标记为已读",
        marked: "已读",
        practiceDone: "Practice 已完成",
        practicePending: "Practice 尚未完成",
        evidence: "这里只记录你真实做过的动作，不代表掌握、熟练或认证。",
      }
    : {
        label: "Reading evidence",
        unseen: "Unseen",
        seen: "Seen",
        read: "Marked read",
        mark: "Mark as read",
        marked: "Read",
        practiceDone: "Practice completed",
        practicePending: "Practice not completed",
        evidence: "This records actions you actually took; it does not claim mastery, proficiency, or certification.",
      };

  useEffect(() => {
    markGuideSeen(conceptId);
  }, [conceptId]);

  const stateLabel = state === "READ" ? copy.read : state === "SEEN" ? copy.seen : copy.unseen;

  return (
    <section className="border-b border-[var(--border)] py-8" data-guide-progress={conceptId} data-guide-progress-state={state}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="technical-label">{copy.label}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <strong>{stateLabel}</strong>
            {practiceId ? (
              <>
                <span aria-hidden="true" className="text-[var(--muted)]">·</span>
                <span data-guide-practice-progress={practiceId} data-guide-practice-state={practiced ? "PRACTICED" : "NOT_PRACTICED"} className="text-[var(--muted)]">
                  {practiced ? copy.practiceDone : copy.practicePending}
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--muted)]">{copy.evidence}</p>
        </div>
        <button
          type="button"
          className="secondary-action shrink-0"
          onClick={() => markGuideRead(conceptId)}
          disabled={state === "READ"}
          data-guide-mark-read={conceptId}
          data-event="guide_marked_read"
        >
          {state === "READ" ? copy.marked : copy.mark}
        </button>
      </div>
    </section>
  );
}
