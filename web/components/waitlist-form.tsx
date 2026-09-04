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
      <div className="border-y border-[var(--border)] bg-[var(--surface)] py-5" role="status">
        <div className="font-semibold">{successTitle}</div>
        <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{successCopy}</div>
        <Link className="editorial-text-link mt-4" href={`/${segment}/#campaign`}>
          {successLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label className="text-sm font-semibold" htmlFor="early-access-email">{emailLabel}</label>
      <input
        id="early-access-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--brand-accent)]"
      />
      <button
        className="mt-3 w-full border border-[var(--editorial-ink)] bg-[var(--editorial-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (isZh ? "提交中…" : "Submitting…") : button}
      </button>
      <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{trustNote}</p>
      {status === "error" ? (
        <p className="mt-3 text-sm font-medium text-[var(--danger)]" role="alert">
          {isZh ? "提交失败，请稍后重试。" : "Submission failed. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
