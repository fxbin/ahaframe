import type { ReactNode } from "react";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import "../globals.css";

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
