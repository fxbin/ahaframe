import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AhaFrame platform migration shell",
  description: "Temporary parity-first Next.js shell for AhaFrame platform migration.",
};

export default function MigrationShellPage() {
  return (
    <main className="migration-page">
      <div className="shell">
        <section className="migration-card">
          <span className="eyebrow">Platform migration · M1</span>
          <h1>AhaFrame, without the rewrite gamble.</h1>
          <p className="lede">
            This isolated Next.js application is the target SaaS runtime. The current static AhaFrame remains the
            behavior and SEO reference until public routes, visual identity, and deterministic Lab interactions reach
            parity.
          </p>
          <div className="architecture-strip" aria-label="Target platform architecture">
            <span>Next.js</span>
            <span>Supabase</span>
            <span>Waffo</span>
            <span>Lab Engine</span>
          </div>
        </section>
      </div>
    </main>
  );
}
