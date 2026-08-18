import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import { ValidationBootstrap } from "@/components/validation-bootstrap";
import "../globals.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
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
