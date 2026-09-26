import Link from "next/link";
import type { ReactNode } from "react";
import { segmentForLocale, type Locale, type LocaleSource } from "@/lib/content";
import { getSearchDocuments } from "@/lib/search-server";
import { GlobalSearch } from "./global-search";
import { LocaleSwitch } from "./locale-switch";

interface SiteFrameProps {
  locale: Locale;
  source: LocaleSource;
  children: ReactNode;
}

export async function SiteFrame({ locale, source, children }: SiteFrameProps) {
  const segment = segmentForLocale(locale);
  const home = `/${segment}/`;
  const searchDocuments = await getSearchDocuments(locale);

  return (
    <>
      <header className="site-header sticky top-0 z-50">
        <div className="shell site-header__inner glass-header">
          <Link className="brand inline-flex shrink-0 items-center" href={home}>
            <span className="glass-brand-mark" aria-hidden="true"><svg viewBox="0 0 34 38" role="presentation"><defs><linearGradient id="brandLeft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1ceae"/><stop offset="1" stopColor="#965037"/></linearGradient><linearGradient id="brandRight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4d231b"/><stop offset="1" stopColor="#ab6541"/></linearGradient></defs><path d="M15.2 2.5C13.8 7.5 6.9 19.1 3.9 25c-2.1 4.1.7 9.4 5.9 9.4 4.7 0 7.5-5.1 9.2-9.4l-3.8-22.5Z" fill="url(#brandLeft)"/><path d="M18.9 1.6c3.4 8.8 7.1 14.6 11.4 23.1 2.9 5.5-.1 10.3-5.1 10.3-5.9 0-8-5.4-8.3-10.5L18.9 1.6Z" fill="url(#brandRight)"/></svg></span>{source.brand}
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6">
            <nav className="site-header__nav glass-nav flex items-center gap-3 text-sm sm:gap-6 lg:gap-7" aria-label="Primary navigation">
              <Link className="transition hover:text-[var(--text)]" href={`/${segment}/courses/`}>
                {source.ui.nav.lessons}
              </Link>
              <Link className="transition hover:text-[var(--text)]" href={`/${segment}/guides/`}>
                {source.ui.nav.guides}
              </Link>
              <Link className="hidden transition hover:text-[var(--text)] sm:inline" href={`/${segment}/tools/codex-reset/`}>
                {source.ui.nav.tools}
              </Link>
              <Link className="hidden transition hover:text-[var(--text)] md:inline" href={`/${segment}/learning/`}>
                {source.ui.nav.roadmap}
              </Link>
              <Link className="hidden transition hover:text-[var(--text)] lg:inline" href={`/${segment}/pricing/`}>
                {source.ui.nav.pricing}
              </Link>
            </nav>
            <GlobalSearch locale={locale} documents={searchDocuments} />
            <LocaleSwitch locale={locale} labels={source.ui.language} />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--border)] py-10">
        <div className="shell flex flex-col gap-7 text-sm text-[var(--muted)] md:flex-row md:items-end md:justify-between">
          <div>
            <div className="brand text-lg text-[var(--text)]">{source.brand}</div>
            <p className="mt-2 max-w-md leading-6">{source.ui.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`/${segment}/courses/`}>{source.ui.nav.lessons}</Link>
            <Link href={`/${segment}/guides/`}>{source.ui.nav.guides}</Link>
            <Link href={`/${segment}/tools/codex-reset/`}>{source.ui.nav.tools}</Link>
            <Link href={`/${segment}/learning/`}>{source.ui.nav.roadmap}</Link>
            <Link href={`/${segment}/pricing/`}>{source.ui.nav.pricing}</Link>
            <Link href={`/${segment}/early-access/`}>{source.ui.footer.early_access}</Link>
            <a href="mailto:support@ahaframe.com">support@ahaframe.com</a>
          </div>
        </div>
      </footer>
    </>
  );
}
