import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AhaFrame",
    template: "%s | AhaFrame",
  },
  description: "Interactive AI Engineering labs for developers becoming AI engineers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell site-header__inner">
            <span className="brand">AhaFrame</span>
            <span className="platform-badge">Next.js migration · M1</span>
          </div>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
