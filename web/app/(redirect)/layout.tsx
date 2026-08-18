import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import "../globals.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedirectRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
