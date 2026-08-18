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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-xl">
        <div className="shell flex min-h-[68px] items-center justify-between gap-5">
          <Link className="text-lg font-black tracking-[-0.04em]" href={home}>
            {source.brand}
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex" aria-label="Primary navigation">
            <Link className="transition hover:text-[var(--text)]" href={`${home}#campaign`}>
              {source.ui.nav.lessons}
            </Link>
            <Link className="transition hover:text-[var(--text)]" href={`${home}#roadmap`}>
              {source.ui.nav.roadmap}
            </Link>
            <Link className="transition hover:text-[var(--text)]" href={`${home}#about`}>
              {source.ui.nav.about}
            </Link>
            <Link className="transition hover:text-[var(--text)]" href={`/${segment}/pricing/`}>
              {source.ui.nav.pricing}
            </Link>
            <Link
              className="rounded-full bg-[var(--text)] px-4 py-2 font-semibold text-white transition hover:opacity-85"
              href={`/${segment}/early-access/`}
            >
              {source.ui.nav.early_access}
            </Link>
          </nav>
          <LocaleSwitch locale={locale} labels={source.ui.language} />
        </div>
      </header>
      {children}
      <footer className="mt-24 border-t border-[var(--border)] py-10">
        <div className="shell flex flex-col gap-6 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-bold text-[var(--text)]">{source.brand}</div>
            <p className="mt-1">{source.ui.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`${home}#about`}>{source.ui.footer.about}</Link>
            <Link href={`/${segment}/pricing/`}>{source.ui.nav.pricing}</Link>
            <Link href={`/${segment}/early-access/`}>{source.ui.footer.early_access}</Link>
            <a href="mailto:support@ahaframe.com">support@ahaframe.com</a>
          </div>
        </div>
      </footer>
    </>
  );
}
