import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  return pageMetadata(
    locale,
    locale === "zh-CN" ? "Codex Usage Limits 与 Reset 规则 | AhaFrame" : "Codex Usage Limits & Reset Rules | AhaFrame",
    locale === "zh-CN" ? "了解 Codex Usage Limits、重置窗口与为什么 Reset Radar 不把预测当成官方时间表。" : "Understand Codex usage limits, reset windows, and why Reset Radar does not present predictions as an official schedule.",
    "tools/codex-reset/usage-limits/",
  );
}

export default async function UsageLimitsPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const zh = locale === "zh-CN";

  return (
    <main className="shell py-12 md:py-16">
      <article className="max-w-3xl">
        <p className="eyebrow-label">AhaFrame Tools · Codex Reset Radar</p>
        <h1 className="editorial-display mt-5 text-4xl tracking-[-0.045em] md:text-6xl">{zh ? "Codex Usage Limits 如何工作？" : "How do Codex usage limits work?"}</h1>
        <p className="section-copy">{zh
          ? "Codex 的可用额度和重置窗口会随方案、产品调整和促销机制变化。最可靠的个人状态始终是你账户自己的 Usage 页面或 Codex 会话中的 /status。"
          : "Codex allowances and reset windows can change with plan, product updates, and promotions. The most reliable personal state is always your own Usage page or /status inside an active Codex session."}</p>

        <div className="mt-10 space-y-6">
          <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="technical-label">{zh ? "公共 Reset 与个人 Reset" : "Global vs personal reset"}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{zh
              ? "Tibo 公布的全量重置属于公共事件；你的个人 weekly / short-window 使用状态仍取决于账户本身。Reset Radar 第一阶段只回答公共事件是否发生，不尝试替代个人 Usage Dashboard。"
              : "A full reset announced by Tibo is a public event, while your personal weekly and shorter usage windows still depend on your account. Reset Radar V0 tracks the public event and does not pretend to replace your personal Usage Dashboard."}</p>
          </section>
          <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="technical-label">{zh ? "如何查看自己的额度" : "How to check your own allowance"}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{zh
              ? "可以查看 ChatGPT Settings → Usage；在活跃 Codex CLI 会话中也可以使用 /status。后续 AhaFrame 会把 /status Analyzer 作为独立实验，而不是在 Reset Radar V0 里提前做客户端采集。"
              : "Check ChatGPT Settings → Usage, or use /status in an active Codex CLI session. AhaFrame may test a /status Analyzer later rather than adding local collection to Reset Radar V0."}</p>
            <a className="text-link mt-4 text-sm font-semibold" href="https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan" target="_blank" rel="noreferrer">OpenAI help ↗</a>
          </section>
        </div>
      </article>
    </main>
  );
}
