"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getValidationContext } from "@/lib/validation-context";

type Locale = "en" | "zh-CN";

interface WaitlistFormProps {
  locale: Locale;
  emailLabel: string;
  placeholder: string;
  button: string;
  trustNote: string;
  successTitle: string;
  successCopy: string;
  successLink: string;
}

export function WaitlistForm({
  locale,
  emailLabel,
  placeholder,
  button,
  trustNote,
  successTitle,
  successCopy,
  successLink,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  const isZh = locale === "zh-CN";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const search = new URLSearchParams(window.location.search);
    const context = getValidationContext();
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          intent: search.get("intent") || "waitlist",
          source: window.location.pathname,
          ...context,
        }),
      });
      if (!response.ok) throw new Error("submission failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-[var(--surface-soft)] p-5" role="status">
        <div className="font-bold">{successTitle}</div>
        <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{successCopy}</div>
        <Link className="mt-3 inline-flex text-sm font-bold text-[var(--primary)]" href={`/${segment}/#campaign`}>
          {successLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label className="text-sm font-bold" htmlFor="early-access-email">{emailLabel}</label>
      <input
        id="early-access-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 outline-none focus:border-[var(--primary)]"
      />
      <button
        className="mt-3 w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (isZh ? "提交中…" : "Submitting…") : button}
      </button>
      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{trustNote}</p>
      {status === "error" ? (
        <p className="mt-3 text-sm font-medium" role="alert">
          {isZh ? "提交失败，请稍后重试。" : "Submission failed. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
