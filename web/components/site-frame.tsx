import Link from "next/link";
import type { ReactNode } from "react";
import { segmentForLocale, type Locale, type LocaleSource } from "@/lib/content";
import { LocaleSwitch } from "./locale-switch";

interface SiteFrameProps {
  locale: Locale;
  source: LocaleSource;
  children: ReactNode;
}

export function SiteFrame({ locale, source, children }: SiteFrameProps) {
  const segment = segmentForLocale(locale);
  const home = `/${segment}/`;
  const startLabel = locale === "zh-CN" ? "开始实验" : "Start Lab";

  return (
    <>
      <header className="site-header sticky top-0 z-50 backdrop-blur-lg">
        <div className="shell site-header__inner">
          <Link className="brand text-xl" href={home}>
            {source.brand}
          </Link>

          <div className="flex items-center gap-5">
            <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex" aria-label="Primary navigation">
              <Link className="transition hover:text-[var(--text)]" href={`${home}#campaign`}>
                {source.ui.nav.lessons}
              </Link>
              <Link className="transition hover:text-[var(--text)]" href={`/${segment}/learning/`}>
                {source.ui.nav.roadmap}
              </Link>
              <Link className="transition hover:text-[var(--text)]" href={`/${segment}/pricing/`}>
                {source.ui.nav.pricing}
              </Link>
            </nav>

            <LocaleSwitch locale={locale} labels={source.ui.language} />

            <Link
              className="hidden min-h-10 items-center rounded-[6px] border border-[var(--text)] bg-[var(--text)] px-4 py-2 text-sm font-bold text-white transition hover:border-[var(--primary)] hover:bg-[var(--primary)] sm:inline-flex"
              href={`/${segment}/labs/rag-failure/`}
            >
              {startLabel} <span className="ml-1" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[var(--border)] py-10">
        <div className="shell flex flex-col gap-7 text-sm text-[var(--muted)] md:flex-row md:items-end md:justify-between">
          <div>
            <div className="brand text-base text-[var(--text)]">{source.brand}</div>
            <p className="mt-2 max-w-md leading-6">{source.ui.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`${home}#about`}>{source.ui.footer.about}</Link>
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
