"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/content";
import type { FirstAhaChoiceId, FirstAhaContent } from "@/lib/campaign";

interface FirstAhaPanelProps {
  locale: Locale;
  content: FirstAhaContent;
  href: string;
  ctaLabel: string;
}

const TONE_CLASS = {
  neutral: "border-[var(--border-strong)] bg-[var(--surface-soft)] text-[var(--text)]",
  danger: "border-[color-mix(in_srgb,var(--danger)_36%,var(--border))] bg-[var(--danger-soft)] text-[var(--danger)]",
  success: "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--primary-soft)] text-[var(--success)]",
} as const;

const TRACE_STATE_CLASS = {
  normal: "text-[var(--text)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  success: "text-[var(--success)]",
} as const;

export function FirstAhaPanel({ locale, content, href, ctaLabel }: FirstAhaPanelProps) {
  const [selectedId, setSelectedId] = useState<FirstAhaChoiceId | null>(null);
  const selected = content.choices.find((choice) => choice.id === selectedId) ?? null;
  const idleCopy = content.idleCopy || (locale === "zh-CN"
    ? "选择一个改动。场景保持确定性，这样你比较的是工程后果，而不是靠猜。"
    : "Choose one change. The scenario stays deterministic so you can compare the consequence instead of guessing.");
  const resultLabel = locale === "zh-CN" ? "结果" : "Result";

  return (
    <aside className="report-panel overflow-hidden" aria-labelledby="first-aha-title">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-7">
        <p className="technical-label">{content.label}</p>
        <h2 id="first-aha-title" className="mt-2 font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em] sm:text-[1.7rem]">
          {content.title}
        </h2>
      </div>

      <div className="grid lg:grid-cols-[1.02fr_.98fr]">
        <div className="border-b border-[var(--border)] p-5 sm:p-7 lg:border-b-0 lg:border-r lg:border-[var(--border)]">
          <ol className="space-y-0" aria-label={content.title}>
            {content.trace.map((row) => (
              <li key={`${row.time}-${row.detail}`} className="grid grid-cols-[76px_70px_1fr] gap-3 border-b border-[var(--border)] py-3 font-mono text-[12px] leading-5 last:border-b-0 sm:grid-cols-[82px_82px_1fr] sm:text-[13px]">
                <time className="text-[var(--muted)]">{row.time}</time>
                <span className="font-semibold text-[var(--muted)]">{row.actor}</span>
                <span className={TRACE_STATE_CLASS[row.state]}>{row.detail}</span>
              </li>
            ))}
          </ol>

          <div className="incident-note mt-5 font-mono text-sm">
            <strong>{resultLabel}:</strong> {content.result}
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h3 className="font-[family-name:var(--font-editorial)] text-xl font-semibold leading-snug tracking-[-0.03em]">
              {content.insightTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{content.insightCopy}</p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-sm font-bold">{content.question}</p>
          <div className="mt-4 space-y-2" role="group" aria-label={content.question}>
            {content.choices.map((choice) => {
              const isSelected = selectedId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={isSelected}
                  data-event="first_aha_intervention_selected"
                  data-choice={choice.id}
                  onClick={() => setSelectedId(choice.id)}
                  className={`w-full border px-4 py-3 text-left transition ${isSelected ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-transparent hover:border-[var(--border-strong)]"}`}
                >
                  <span className="block text-sm font-bold">{choice.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{choice.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 min-h-[108px] border-t border-[var(--border)] pt-5" aria-live="polite">
            {selected ? (
              <div data-event="first_aha_consequence_observed">
                <span className={`inline-flex border px-2 py-1 font-mono text-[11px] font-bold ${TONE_CLASS[selected.tone]}`}>
                  {selected.signal}
                </span>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{selected.consequence}</p>
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">{idleCopy}</p>
            )}
          </div>

          <Link className="primary-action mt-5" href={href} data-event="first_aha_cta_clicked">
            {ctaLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
