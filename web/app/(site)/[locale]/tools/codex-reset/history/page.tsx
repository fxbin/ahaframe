import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCodexResetSnapshot } from "@/lib/codex-reset-server";
import { localeFromSegment } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

function formatUtc(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) return {};
  const title = locale === "zh-CN" ? "Codex Reset History — 重置历史 | AhaFrame" : "Codex Reset History — Confirmed Reset Timeline | AhaFrame";
  const description = locale === "zh-CN"
    ? "查看 Codex 已确认的全量 Usage Reset 历史记录、时间与公开来源。"
    : "Browse confirmed Codex full usage reset history with timestamps and public source evidence.";
  return pageMetadata(locale, title, description, "tools/codex-reset/history/");
}

export default async function CodexResetHistoryPage({ params }: PageProps) {
  const { locale: segment } = await params;
  const locale = localeFromSegment(segment);
  if (!locale) notFound();
  const snapshot = await getCodexResetSnapshot(100);
  const zh = locale === "zh-CN";

  return (
    <main className="shell py-12 md:py-16">
      <section className="max-w-4xl">
        <p className="eyebrow-label">AhaFrame Tools · Codex Reset Radar</p>
        <h1 className="editorial-display mt-5 text-4xl tracking-[-0.045em] md:text-6xl">{zh ? "Codex 重置历史" : "Codex reset history"}</h1>
        <p className="section-copy">{zh
          ? "这里记录已确认的全量 Codex Usage Reset。Banked Reset 不会混入主时间线。每条记录都保留可验证的公开来源。"
          : "This timeline records confirmed full Codex usage resets. Banked resets stay separate, and every event keeps a verifiable public source."}</p>
      </section>

      <section className="mt-10 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        {snapshot.history.length ? (
          <div className="divide-y divide-[var(--border)]">
            {snapshot.history.map((event, index) => (
              <article key={event.id} className="grid gap-3 py-5 md:grid-cols-[48px_220px_1fr_auto] md:items-center">
                <div className="font-mono text-xs text-[var(--muted)]">#{snapshot.history.length - index}</div>
                <time className="font-mono text-xs text-[var(--muted)]">{formatUtc(event.occurredAt, locale)}</time>
                <p className="text-sm leading-6">{event.evidenceText}</p>
                <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-link text-xs font-semibold">X source ↗</a>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">{zh ? "暂时没有可用的历史数据。" : "No history is available yet."}</p>
        )}
      </section>

      <p className="mt-8 text-xs leading-5 text-[var(--muted)]">{zh
        ? "AhaFrame 不代表 OpenAI。事件状态来自公开、可验证的重置公告。"
        : "AhaFrame is not affiliated with OpenAI. Event status is derived from public, verifiable reset announcements."}</p>
    </main>
  );
}
