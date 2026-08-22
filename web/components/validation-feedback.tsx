"use client";

import { useEffect, useState, type FormEvent } from "react";
import { submitAhaFeedback, submitProductFeedback, trackValidationEvent, type AhaRating, type ProductFeedbackType } from "@/lib/validation-client";
import type { Locale } from "@/lib/content";

const AHA_COPY = {
  en: {
    eyebrow: "Aha check",
    title: "Did this change how you think about this system?",
    intro: "This measures a mental-model shift, not whether you liked the UI.",
    ratings: { no: "No", little: "A little", yes: "Yes", aha: "Oh, I finally get it." },
    question: "What do you understand differently now?",
    placeholder: "A sentence is enough.",
    submit: "Send feedback",
    thanks: "Thanks — your feedback was recorded.",
    error: "Could not send feedback right now. Please try again.",
  },
  "zh-CN": {
    eyebrow: "Aha 检查",
    title: "这个实验改变了你理解这个系统的方式吗？",
    intro: "这里测量的是心智模型是否发生变化，而不是你是否喜欢这个界面。",
    ratings: { no: "没有", little: "一点点", yes: "有", aha: "原来如此，我终于懂了" },
    question: "你现在对什么有了不同理解？",
    placeholder: "写一句话就够了。",
    submit: "提交反馈",
    thanks: "谢谢，反馈已记录。",
    error: "暂时无法提交反馈，请稍后再试。",
  },
} as const;

const PRODUCT_COPY = {
  en: {
    trigger: "Feedback",
    title: "Send feedback",
    intro: "Found a bug, confusing content, or an idea that would make AhaFrame better?",
    type: "What kind of feedback?",
    types: { bug: "Something is broken", confusing: "Content is confusing", feature: "Feature request", other: "Other" },
    message: "What happened or what should change?",
    placeholder: "A few details are enough. The current page is attached automatically.",
    email: "Email (optional)",
    emailHint: "Only include it if you would like a reply.",
    submit: "Send feedback",
    close: "Close",
    thanks: "Thanks — your feedback was recorded.",
    error: "Could not send feedback right now. Please try again.",
  },
  "zh-CN": {
    trigger: "反馈",
    title: "提交反馈",
    intro: "遇到 Bug、内容难以理解，或者有希望 AhaFrame 改进的想法？可以直接告诉我们。",
    type: "反馈类型",
    types: { bug: "功能出现问题", confusing: "内容难以理解", feature: "功能建议", other: "其他" },
    message: "发生了什么，或者你希望如何改进？",
    placeholder: "简单描述即可，当前页面会自动附带。",
    email: "邮箱（选填）",
    emailHint: "只有希望我们回复你时才需要填写。",
    submit: "提交反馈",
    close: "关闭",
    thanks: "谢谢，反馈已经记录。",
    error: "暂时无法提交反馈，请稍后再试。",
  },
} as const;

export function AhaFeedback({ locale }: { locale: Locale }) {
  const copy = AHA_COPY[locale];
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState<AhaRating | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ name?: string }>).detail;
      if (detail?.name === "simulation_run" || detail?.name === "mission_completed") setVisible(true);
    };
    window.addEventListener("ahaframe:validation-event", onEvent);
    return () => window.removeEventListener("ahaframe:validation-event", onEvent);
  }, []);

  async function submit() {
    if (!rating || status === "sending") return;
    setStatus("sending");
    try {
      await submitAhaFeedback(rating, note);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;
  if (status === "success") {
    return <section className="shell mt-8"><div className="rounded-[20px] border border-[var(--border)] bg-white p-5 text-sm font-semibold">{copy.thanks}</div></section>;
  }

  return (
    <section className="shell mt-8">
      <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 sm:p-7">
        <p className="eyebrow-label">{copy.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.035em]">{copy.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.entries(copy.ratings) as Array<[AhaRating, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setRating(value)} className={`rounded-full border px-4 py-2 text-sm font-bold ${rating === value ? "border-[var(--text)] bg-[var(--text)] text-white" : "border-[var(--border)]"}`}>{label}</button>
          ))}
        </div>
        <label className="mt-5 block text-sm font-bold">{copy.question}<textarea value={note} maxLength={1200} onChange={(event) => setNote(event.target.value)} placeholder={copy.placeholder} className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm font-normal" /></label>
        <button type="button" disabled={!rating || status === "sending"} onClick={submit} className="action-primary mt-4 disabled:opacity-50">{status === "sending" ? "…" : copy.submit}</button>
        {status === "error" ? <p className="mt-3 text-sm" role="alert">{copy.error}</p> : null}
      </div>
    </section>
  );
}

export function ProductFeedback({ locale }: { locale: Locale }) {
  const copy = PRODUCT_COPY[locale];
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<ProductFeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function show() {
    setOpen(true);
    setStatus("idle");
    trackValidationEvent("product_feedback_opened", { source: "global_feedback" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      await submitProductFeedback(feedbackType, message, email);
      setMessage("");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button type="button" onClick={show} className="fixed bottom-5 right-5 z-[70] rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-extrabold shadow-lg">{copy.trigger}</button>
      {open ? <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 p-4 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="w-full max-w-lg rounded-[22px] bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="product-feedback-title">
          <div className="flex items-start justify-between gap-4"><div><h2 id="product-feedback-title" className="text-2xl font-black tracking-[-0.035em]">{copy.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.intro}</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" aria-label={copy.close}>×</button></div>
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-bold">{copy.type}<select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value as ProductFeedbackType)} className="rounded-xl border border-[var(--border)] bg-white p-3 font-normal">{(Object.entries(copy.types) as Array<[ProductFeedbackType, string]>).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-bold">{copy.message}<textarea required maxLength={4000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={copy.placeholder} className="min-h-28 rounded-xl border border-[var(--border)] p-3 font-normal" /></label>
            <label className="grid gap-2 text-sm font-bold">{copy.email}<input type="email" maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="rounded-xl border border-[var(--border)] p-3 font-normal" /><span className="text-xs font-normal text-[var(--muted)]">{copy.emailHint}</span></label>
            <div className="flex items-center justify-between gap-4"><span className="text-sm text-[var(--muted)]">{status === "success" ? copy.thanks : status === "error" ? copy.error : ""}</span><button type="submit" disabled={status === "sending"} className="action-primary disabled:opacity-50">{status === "sending" ? "…" : copy.submit}</button></div>
          </form>
        </div>
      </div> : null}
    </>
  );
}
