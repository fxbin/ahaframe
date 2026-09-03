"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/content";
import type { GuideDirectoryData } from "@/lib/guides-directory";

interface GuideDirectoryPageProps {
  locale: Locale;
  data: GuideDirectoryData;
}

export function GuideDirectoryPage({ locale, data }: GuideDirectoryPageProps) {
  const segment = locale === "zh-CN" ? "zh-cn" : "en";
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [branch, setBranch] = useState("");
  const [pathId, setPathId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [practiceOnly, setPracticeOnly] = useState(false);

  const labels = locale === "zh-CN"
    ? {
        kicker: "GUIDES",
        title: "60 个可复用的 AI 心智模型。",
        copy: "Guide 用来快速理解一个 Concept；Course 用来告诉你下一步学什么。你可以直接浏览，也可以按知识域、主题、课程和难度筛选。",
        filtersRegion: "Guide 筛选条件",
        filter: "筛选 Guide",
        search: "在当前目录中过滤标题或摘要",
        allDomains: "全部知识域",
        allBranches: "全部主题",
        allCourses: "全部课程",
        allDifficulty: "全部难度",
        practiceOnly: "仅显示带 Practice 的 Guide",
        reset: "重置筛选",
        showing: "当前显示",
        of: "篇，共",
        guides: "篇 Guide",
        min: "分钟",
        usedIn: "用于",
        courses: "个课程",
        practice: "含 Practice",
        open: "阅读 Guide",
        empty: "没有 Guide 符合当前筛选条件。",
        emptyAction: "清除筛选，查看全部 60 篇",
        coursesLink: "想系统学习？查看 Courses →",
      }
    : {
        kicker: "GUIDES",
        title: "60 reusable mental models for AI.",
        copy: "Use a Guide when you need to understand one Concept now; use a Course when you want an ordered next step. Browse directly or filter by domain, topic, course, and difficulty.",
        filtersRegion: "Guide filters",
        filter: "Filter Guides",
        search: "Filter this directory by title or summary",
        allDomains: "All domains",
        allBranches: "All topics",
        allCourses: "All courses",
        allDifficulty: "All difficulties",
        practiceOnly: "Only Guides with Practice",
        reset: "Reset filters",
        showing: "Showing",
        of: "of",
        guides: "Guides",
        min: "min",
        usedIn: "Used in",
        courses: "courses",
        practice: "Practice available",
        open: "Read Guide",
        empty: "No Guides match the current filters.",
        emptyAction: "Clear filters and view all 60",
        coursesLink: "Want an ordered path? View Courses →",
      };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "zh-CN" ? "zh-CN" : "en");
    return data.items.filter((item) => {
      if (domain && item.domainId !== domain) return false;
      if (branch && item.branchId !== branch) return false;
      if (pathId && !item.pathIds.includes(pathId)) return false;
      if (difficulty && item.difficulty !== difficulty) return false;
      if (practiceOnly && !item.hasPractice) return false;
      if (normalized) {
        const haystack = `${item.title} ${item.summary} ${item.branchTitle}`.toLocaleLowerCase(locale === "zh-CN" ? "zh-CN" : "en");
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [branch, data.items, difficulty, domain, locale, pathId, practiceOnly, query]);

  const active = Boolean(query || domain || branch || pathId || difficulty || practiceOnly);
  const visibleDomains = data.domains.filter((item) => filtered.some((guide) => guide.domainId === item.id));

  function reset() {
    setQuery("");
    setDomain("");
    setBranch("");
    setPathId("");
    setDifficulty("");
    setPracticeOnly(false);
  }

  return (
    <main data-guide-directory>
      <section className="border-b border-[var(--border)] py-16 sm:py-24">
        <div className="shell max-w-5xl">
          <p className="editorial-kicker">{labels.kicker}</p>
          <h1 className="editorial-display mt-5 max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-[4.5rem]">{labels.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--muted)]">{labels.copy}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
            <strong className="text-[var(--text)]">{data.count} {labels.guides}</strong>
            <span>·</span>
            <Link className="quiet-link" href={`/${segment}/courses/`}>{labels.coursesLink}</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] py-8" aria-label={labels.filtersRegion}>
        <div className="shell">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              {labels.filter}
              <input
                className="min-h-11 border border-[var(--border)] bg-transparent px-3 text-sm font-normal normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--primary)]"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.search}
              />
            </label>
            <FilterSelect label={labels.allDomains} value={domain} onChange={setDomain} options={data.domains} />
            <FilterSelect label={labels.allBranches} value={branch} onChange={setBranch} options={data.branches} />
            <FilterSelect label={labels.allCourses} value={pathId} onChange={setPathId} options={data.paths} />
            <FilterSelect label={labels.allDifficulty} value={difficulty} onChange={setDifficulty} options={data.difficulties.map((title) => ({ id: title, title }))} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={practiceOnly} onChange={(event) => setPracticeOnly(event.target.checked)} />
              {labels.practiceOnly}
            </label>
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <span data-guide-directory-count>{labels.showing} <strong className="text-[var(--text)]">{filtered.length}</strong> {labels.of} {data.count}</span>
              {active ? <button type="button" className="quiet-link" onClick={reset}>{labels.reset}</button> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="shell">
          {!filtered.length ? (
            <div className="mx-auto max-w-xl border-y border-[var(--border)] py-14 text-center" data-guide-directory-empty>
              <p className="text-lg font-semibold">{labels.empty}</p>
              <button type="button" className="editorial-text-link mt-4" onClick={reset}>{labels.emptyAction}</button>
            </div>
          ) : visibleDomains.map((domainItem) => {
            const items = filtered.filter((item) => item.domainId === domainItem.id);
            return (
              <section key={domainItem.id} className="border-t border-[var(--border)] py-10 sm:py-14" data-guide-directory-domain={domainItem.id}>
                <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                  <div>
                    <h2 className="font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{domainItem.title}</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{items.length} {labels.guides}</p>
                  </div>
                  <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/${segment}/guides/${item.slug}/`}
                        className="group grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center"
                        data-guide-directory-item={item.slug}
                      >
                        <span>
                          <span className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                            <span>{item.branchTitle}</span><span>·</span><span>{item.difficulty}</span><span>·</span><span>{item.readingMinutes} {labels.min}</span>
                            {item.hasPractice ? <><span>·</span><span className="text-[var(--primary)]">{labels.practice}</span></> : null}
                          </span>
                          <strong className="mt-2 block font-[family-name:var(--font-editorial)] text-2xl font-semibold tracking-[-0.035em]">{item.title}</strong>
                          <span className="mt-2 block max-w-3xl text-sm leading-6 text-[var(--muted)]">{item.summary}</span>
                          <span className="mt-3 block text-xs text-[var(--muted)]">{labels.usedIn} {item.paths.length} {labels.courses}{item.paths.length ? ` · ${item.paths.slice(0, 2).map((path) => path.title).join(" · ")}` : ""}</span>
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold">{labels.open} <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; title: string }>;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
      {label}
      <select
        className="min-h-11 border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-normal normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--primary)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
      </select>
    </label>
  );
}
