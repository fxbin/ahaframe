"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Locale } from "@/lib/content";
import { SEARCH_TYPE_ORDER, searchDocuments, type SearchDocument, type SearchDocumentType } from "@/lib/search";

interface GlobalSearchProps { locale: Locale; documents: SearchDocument[]; }

const ITEM_GLYPHS: Record<SearchDocumentType, string> = {
  guide: "☷", course: "▤", practice: "⌘", concept: "◇",
};

function SearchItemIcon({ type }: { type: SearchDocumentType }) {
  return <span className="search-item__icon" aria-hidden="true">{ITEM_GLYPHS[type]}</span>;
}

function labels(locale: Locale) {
  return locale === "zh-CN"
    ? { trigger: "搜索", shortcut: "⌘K", dialog: "搜索 AhaFrame", placeholder: "搜索 Guide、课程、Practice 或 Concept…", hint: "快速找到你想学习或实践的内容。", recent: "最近访问", recommended: "推荐探索", empty: "没有找到匹配内容。换一个更具体或更短的关键词试试。", close: "关闭搜索", groups: { guide: "GUIDES", course: "课程", practice: "PRACTICE", concept: "CONCEPTS" } satisfies Record<SearchDocumentType, string> }
    : { trigger: "Search", shortcut: "⌘K", dialog: "Search AhaFrame", placeholder: "Search Guides, Courses, Practice, or Concepts…", hint: "Find your next lesson or interactive experience.", recent: "Recently visited", recommended: "Explore", empty: "No matching learning surface. Try a shorter or more specific term.", close: "Close search", groups: { guide: "GUIDES", course: "COURSES", practice: "PRACTICE", concept: "CONCEPTS" } satisfies Record<SearchDocumentType, string> };
}

export function GlobalSearch({ locale, documents }: GlobalSearchProps) {
  const copy = labels(locale);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const recentKey = `ahaframe:search-recent:${locale}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewport, setViewport] = useState<{ width: number; height: number; offsetTop: number } | null>(null);
  const results = useMemo(() => searchDocuments(documents, query), [documents, query]);
  const orderedResults = useMemo(() => SEARCH_TYPE_ORDER.flatMap((type) => results.filter((result) => result.type === type)), [results]);
  const recentDocuments = useMemo(() => recentIds.map((id) => documents.find((item) => item.id === id)).filter((item): item is SearchDocument => Boolean(item)).slice(0, 2), [recentIds, documents]);
  function remember(item: SearchDocument) {
    try {
      const next = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, 6);
      localStorage.setItem(recentKey, JSON.stringify(next));
      setRecentIds(next);
    } catch {
      // The search remains usable when local storage is unavailable.
    }
  }
  useEffect(() => {
    if (!open) return;
    // Read client-only history after opening; do not trigger a synchronous
    // state update from the effect or hydrate with user-specific markup.
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(recentKey) || "[]");
        setRecentIds(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : []);
      } catch { setRecentIds([]); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, recentKey]);

  useEffect(() => {
    function onShortcut(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault(); setActiveIndex(0); setOpen(true);
      }
    }
    window.addEventListener("keydown", onShortcut);
    const trigger = triggerRef.current;
    trigger?.setAttribute("data-search-ready", "true");
    return () => {
      window.removeEventListener("keydown", onShortcut);
      trigger?.removeAttribute("data-search-ready");
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Keep the page behind the search dialog still, and size the overlay to
    // the *visual* viewport so mobile on-screen keyboards cannot hide results.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const visualViewport = window.visualViewport;
    function updateViewport() {
      const visual = window.visualViewport;
      setViewport({
        width: visual?.width ?? window.innerWidth,
        height: visual?.height ?? window.innerHeight,
        offsetTop: visual?.offsetTop ?? 0,
      });
    }
    updateViewport();
    visualViewport?.addEventListener("resize", updateViewport);
    visualViewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);
    return () => {
      document.body.style.overflow = previousOverflow;
      visualViewport?.removeEventListener("resize", updateViewport);
      visualViewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
    };
  }, [open]);

  function close() {
    setOpen(false); setQuery(""); setActiveIndex(0);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function onDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
    ).filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!orderedResults.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => (value + 1) % orderedResults.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => (value - 1 + orderedResults.length) % orderedResults.length); }
    else if (event.key === "Enter") { event.preventDefault(); const selected = orderedResults[Math.min(activeIndex, orderedResults.length - 1)]; remember(selected); window.location.assign(selected.route); }
  }

  let globalIndex = 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="glass-search-trigger inline-flex min-h-9 min-w-9 items-center justify-center gap-2 border border-[var(--border)] px-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] sm:px-3"
        onClick={() => { setActiveIndex(0); setOpen(true); }}
        aria-label={copy.trigger}
        aria-haspopup="dialog"
        data-global-search-trigger
      >
        <span aria-hidden="true" className="search-trigger__icon">⌕</span><span className="hidden sm:inline">{copy.trigger}</span><kbd className="hidden font-mono text-[10px] font-normal lg:inline">{copy.shortcut}</kbd>
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div
          className="glass-search-overlay fixed inset-x-0 z-[1000] flex items-start justify-center overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:pb-6 sm:pt-12"
          style={{
            top: viewport?.offsetTop ?? 0,
            height: viewport ? `${viewport.height}px` : "100dvh",
          }}
          data-global-search-overlay
          onMouseDown={(event) => event.target === event.currentTarget && close()}
        >
          <div
            ref={dialogRef}
            className="glass-search-dialog flex w-full min-w-0 max-w-2xl flex-col overflow-hidden"
            style={{
              maxHeight: viewport
                ? `${Math.max(160, Math.min(760, viewport.height - (viewport.width < 640 ? 24 : 72)))}px`
                : "calc(100dvh - 2rem)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={copy.dialog}
            data-global-search-dialog
            onKeyDown={onDialogKeyDown}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 py-4">
              <span aria-hidden="true" className="search-field__icon">⌕</span>
              <input ref={inputRef} className="min-h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={onInputKeyDown} placeholder={copy.placeholder} aria-label={copy.dialog} aria-activedescendant={orderedResults.length ? `search-result-${activeIndex}` : undefined} autoComplete="off" />
              <button type="button" className="quiet-link shrink-0 text-xs" onClick={close} aria-label={copy.close}>Esc</button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" data-global-search-results data-search-document-count={documents.length}>
              {!query.trim() ? (
                <div data-search-suggestions>
                  <p className="search-default__hint">{copy.hint}</p>
                  {recentDocuments.length ? (
                    <section className="search-group" aria-label={copy.recent}>
                      <h2 className="search-group__title">{copy.recent}</h2>
                      {recentDocuments.map((item) => (
                        <Link key={item.id} href={item.route} className="search-result__row" onClick={() => remember(item)}>
                          <SearchItemIcon type={item.type} />
                          <span className="search-result__text"><strong>{item.title}</strong><small>{item.summary}</small></span>
                          <span className="search-result__tag">{copy.groups[item.type]}</span><span className="search-result__arrow" aria-hidden="true">›</span>
                        </Link>
                      ))}
                    </section>
                  ) : null}
                  {SEARCH_TYPE_ORDER.map((type) => {
                    const suggestions = documents.filter((item) => item.type === type).slice(0, 2);
                    if (!suggestions.length) return null;
                    return (
                      <section key={type} className="search-group" aria-label={copy.groups[type]}>
                        <h2 className="search-group__title">{copy.groups[type]}</h2>
                        {suggestions.map((item) => (
                          <Link key={item.id} href={item.route} className="search-result__row" onClick={() => remember(item)}>
                            <SearchItemIcon type={item.type} />
                            <span className="search-result__text"><strong>{item.title}</strong><small>{item.summary}</small></span>
                            <span className="search-result__tag">{copy.groups[item.type]}</span><span className="search-result__arrow" aria-hidden="true">›</span>
                          </Link>
                        ))}
                      </section>
                    );
                  })}
                </div>
              ) : !orderedResults.length ? <p className="px-3 py-8 text-sm leading-6 text-[var(--muted)]" data-global-search-empty>{copy.empty}</p> : SEARCH_TYPE_ORDER.map((type) => {
                const group = results.filter((result) => result.type === type);
                if (!group.length) return null;
                return (
                  <section key={type} className="search-group" aria-label={copy.groups[type]} data-search-group={type}>
                    <h2 className="search-group__title">{copy.groups[type]}</h2>
                    <div>{group.map((result) => {
                      const index = globalIndex++;
                      const active = index === activeIndex;
                      return (
                        <Link id={`search-result-${index}`} key={result.id} href={result.route}
                          className={`search-result__row ${active ? "is-active" : ""}`}
                          aria-current={active ? "true" : undefined}
                          onClick={() => remember(result)}
                          onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)}
                          data-search-result={result.id} data-search-score={result.score} data-search-reason={result.reason}>
                          <SearchItemIcon type={result.type} />
                          <span className="search-result__text"><strong>{result.title}</strong><small>{result.summary}</small></span>
                          <span className="search-result__tag">{copy.groups[result.type]}</span>
                          <span className="search-result__arrow" aria-hidden="true">›</span>
                        </Link>
                      );
                    })}</div>
                  </section>
                );
              })}
            </div>
            <div className="glass-search-foot" aria-hidden="true">
              <span><kbd>↑↓</kbd> {locale === "zh-CN" ? "选择" : "Navigate"}</span>
              <span><kbd>Enter</kbd> {locale === "zh-CN" ? "打开" : "Open"}</span>
              <span><kbd>Esc</kbd> {locale === "zh-CN" ? "关闭" : "Close"}</span>
            </div>
          </div>
        </div>, document.body
      ) : null}
    </>
  );
}
