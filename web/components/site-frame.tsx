import Link from "next/link";
import type { ReactNode } from "react";
import { segmentForLocale, type Locale, type LocaleSource } from "@/lib/content";
import { getSearchDocuments } from "@/lib/search-server";
import { GlobalSearch } from "./global-search";
import { HeaderNav } from "./header-nav";
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
            <span className="glass-brand-mark" aria-hidden="true">A</span>{source.brand}
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-6">
            <HeaderNav locale={locale} labels={source.ui.nav} />
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
