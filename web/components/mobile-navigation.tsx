"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Locale } from "@/lib/content";

interface MobileNavProps {
  locale: Locale;
  links: { href: string; label: string }[];
}

export function MobileNavigation({ locale, links }: MobileNavProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const zh = locale === "zh-CN";
  function close() { if (detailsRef.current) detailsRef.current.open = false; }
  return (
    <details
      ref={detailsRef}
      className="glass-mobile-menu"
      onKeyDown={(event) => {
        if (event.key === "Escape" && detailsRef.current?.open) {
          event.preventDefault();
          close();
          detailsRef.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label={zh ? "打开导航菜单" : "Open navigation menu"}>☰</summary>
      <nav aria-label={zh ? "移动端导航" : "Mobile navigation"}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={close}>{link.label}</Link>
        ))}
      </nav>
    </details>
  );
}
