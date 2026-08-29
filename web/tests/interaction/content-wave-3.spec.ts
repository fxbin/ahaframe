import { expect, test, type Page } from "@playwright/test";

interface ExperienceCase {
  route: string;
  heading: string;
  start: string;
  actions: string[];
  run: string;
  outcome: string;
}

const CASES: ExperienceCase[] = [
  {
    route: "/en/labs/multi-agent-coordination-incident/",
    heading: "Multi-Agent Coordination Incident",
    start: "Inspect incident",
    actions: ["Manager → workers", "Explicit task contracts", "Independent verifier", "Bounded parallelism"],
    run: "Evaluate orchestration",
    outcome: "ORCHESTRATION_READY",
  },
  {
    route: "/en/build/production-release-gate-build/",
    heading: "Production Release Gate Build",
    start: "Inspect release",
    actions: ["Regression gate + vetoes", "Bounded canary", "Trace-linked alerts", "Versioned rollback"],
    run: "Run release gate",
    outcome: "RELEASE_GATE_READY",
  },
  {
    route: "/en/labs/model-adaptation-decision-lab/",
    heading: "Model Adaptation Decision Lab",
    start: "Inspect task gap",
    actions: ["Prompt/RAG benchmark", "Curated + held-out eval", "LoRA adapter", "Adapter-aware serving"],
    run: "Evaluate adaptation",
    outcome: "ADAPTATION_READY",
  },
  {
    route: "/en/build/solo-business-operating-system-build/",
    heading: "Solo Business Operating System Build",
    start: "Inspect operations",
    actions: ["Recurring evidence loop", "Durable workflow state", "Bounded automation", "Risk-based review gates"],
    run: "Evaluate operating system",
    outcome: "SOLO_OPERATING_SYSTEM_READY",
  },
];

async function completeViableAttempt(page: Page, item: ExperienceCase) {
  await page.goto(item.route);
  await expect(page.getByRole("heading", { level: 1, name: item.heading })).toBeVisible();
  await page.getByRole("button", { name: item.start, exact: true }).click();
  await expect(page.getByText("INVESTIGATE", { exact: true })).toBeVisible();
  for (const action of item.actions) {
    await page.getByRole("button", { name: action, exact: true }).click();
  }
  await page.getByRole("button", { name: item.run, exact: true }).click();
  await expect(page.getByText(item.outcome, { exact: true }).first()).toBeVisible();
  await expect(page.getByText("REVIEW", { exact: true })).toBeVisible();
}

test.describe("Content Wave 3 scale and production experiences", () => {
  for (const item of CASES) {
    test(`${item.heading} reaches its bounded viable architecture`, async ({ page }) => {
      await completeViableAttempt(page, item);
    });
  }

  test("Production Release Gate keeps unresolved exposure as an explicit veto and supports BLOCK", async ({ page }) => {
    await page.goto("/en/build/production-release-gate-build/");
    await page.getByRole("button", { name: "Inspect release", exact: true }).click();
    for (const action of ["Regression gate + vetoes", "Trace-linked alerts", "Versioned rollback"]) {
      await page.getByRole("button", { name: action, exact: true }).click();
    }
    await page.getByRole("button", { name: "Run release gate", exact: true }).click();
    await expect(page.getByText("RELEASE_RISK_TOO_HIGH", { exact: true }).first()).toBeVisible();
    const exposureConstraint = page.locator("div").filter({ hasText: "exposure-veto" }).filter({ hasText: "MISS" }).first();
    await expect(exposureConstraint).toBeVisible();
    await page.getByRole("button", { name: "Proceed to release decision", exact: true }).click();
    await page.getByRole("button", { name: "BLOCK", exact: true }).click();
    await expect(page.getByText("DEBRIEF", { exact: true })).toBeVisible();
  });

  test("Wave 3 keeps exact zh-CN route parity with equivalent learning surfaces", async ({ page }) => {
    for (const item of CASES) {
      const route = item.route.replace("/en/", "/zh-cn/");
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("LEARNING CONTEXT", { exact: true })).toBeVisible();
      await expect(page.locator("main")).toContainText(/证据|系统|风险|发布|模型|自动化|协调|架构/);
    }
  });
});
