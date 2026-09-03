"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/content";
import { SEARCH_TYPE_ORDER, searchDocuments, type SearchDocument, type SearchDocumentType } from "@/lib/search";

interface GlobalSearchProps {
  locale: Locale;
  documents: SearchDocument[];
}

function labels(locale: Locale) {
  return locale === "zh-CN"
    ? {
        trigger: "搜索",
        shortcut: "⌘K",
        dialog: "搜索 AhaFrame",
        placeholder: "搜索 Guide、课程、Practice 或 Concept…",
        hint: "输入关键词开始搜索。支持标题、正文、知识点与课程上下文。",
        empty: "没有找到匹配内容。换一个更具体或更短的关键词试试。",
        close: "关闭搜索",
        groups: { guide: "GUIDES", course: "课程", practice: "PRACTICE", concept: "CONCEPTS" } satisfies Record<SearchDocumentType, string>,
      }
    : {
        trigger: "Search",
        shortcut: "⌘K",
        dialog: "Search AhaFrame",
        placeholder: "Search Guides, Courses, Practice, or Concepts…",
        hint: "Type a term to search titles, Guide full text, Concepts, and learning context.",
        empty: "No matching learning surface. Try a shorter or more specific term.",
        close: "Close search",
        groups: { guide: "GUIDES", course: "COURSES", practice: "PRACTICE", concept: "CONCEPTS" } satisfies Record<SearchDocumentType, string>,
      };
}

export function GlobalSearch({ locale, documents }: GlobalSearchProps) {
  const copy = labels(locale);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => searchDocuments(documents, query), [documents, query]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  function close() {
    setOpen(false);
    setQuery("");
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => (value + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => (value - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      window.location.assign(results[Math.min(activeIndex, results.length - 1)].route);
    }
  }

  let globalIndex = 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-9 items-center gap-2 border border-[var(--border)] px-2.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:px-3"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-global-search-trigger
      >
        <span>{copy.trigger}</span>
        <kbd className="hidden font-mono text-[10px] font-normal sm:inline">{copy.shortcut}</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/35 px-3 pt-[8vh] sm:px-6 sm:pt-[12vh]" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <div className="w-full max-w-2xl overflow-hidden border border-[var(--border)] bg-[var(--background)] shadow-2xl" role="dialog" aria-modal="true" aria-label={copy.dialog} data-global-search-dialog>
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <span aria-hidden="true" className="text-[var(--muted)]">⌕</span>
              <input
                ref={inputRef}
                className="min-h-10 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={copy.placeholder}
                aria-label={copy.dialog}
                aria-activedescendant={results.length ? `search-result-${activeIndex}` : undefined}
                autoComplete="off"
              />
              <button type="button" className="quiet-link text-xs" onClick={close} aria-label={copy.close}>Esc</button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-3" data-global-search-results data-search-document-count={documents.length}>
              {!query.trim() ? (
                <p className="px-3 py-8 text-sm leading-6 text-[var(--muted)]">{copy.hint}</p>
              ) : !results.length ? (
                <p className="px-3 py-8 text-sm leading-6 text-[var(--muted)]" data-global-search-empty>{copy.empty}</p>
              ) : (
                SEARCH_TYPE_ORDER.map((type) => {
                  const group = results.filter((result) => result.type === type);
                  if (!group.length) return null;
                  return (
                    <section key={type} className="mb-3 last:mb-0" aria-label={copy.groups[type]} data-search-group={type}>
                      <h2 className="px-3 pb-1 pt-2 font-mono text-[10px] font-bold tracking-[0.12em] text-[var(--muted)]">{copy.groups[type]}</h2>
                      <div>
                        {group.map((result) => {
                          const index = globalIndex++;
                          const active = index === activeIndex;
                          return (
                            <Link
                              id={`search-result-${index}`}
                              key={result.id}
                              href={result.route}
                              className={`grid gap-1 px-3 py-2.5 outline-none transition ${active ? "bg-black/[0.055]" : "hover:bg-black/[0.035]"}`}
                              onMouseEnter={() => setActiveIndex(index)}
                              onFocus={() => setActiveIndex(index)}
                              data-search-result={result.id}
                              data-search-score={result.score}
                              data-search-reason={result.reason}
                            >
                              <span className="flex items-start justify-between gap-4">
                                <strong className="text-sm">{result.title}</strong>
                                <span className="shrink-0 font-mono text-[9px] uppercase text-[var(--muted)]">{result.context}</span>
                              </span>
                              {result.summary ? <span className="line-clamp-2 text-xs leading-5 text-[var(--muted)]">{result.summary}</span> : null}
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
