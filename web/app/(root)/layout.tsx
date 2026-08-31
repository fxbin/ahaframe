import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import { ValidationBootstrap } from "@/components/validation-bootstrap";
import { indexingMetadata } from "@/lib/indexing";
import "../globals.css";
import "../editorial-learning.css";

export const metadata: Metadata = {
  robots: indexingMetadata(),
};

export default function RootLandingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ValidationBootstrap />
        {children}
        <ThirdPartyAnalytics />
      </body>
    </html>
  );
}
