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
    route: "/en/labs/structured-output-contract-lab/",
    heading: "Structured Output Contract Lab",
    start: "Inspect failure",
    actions: ["Versioned schema", "Schema + semantic rules", "Bounded repair", "Incremental structured state"],
    run: "Evaluate contract",
    outcome: "CONTRACT_READY",
  },
  {
    route: "/en/labs/mcp-capability-boundary-mission/",
    heading: "MCP Capability Boundary Mission",
    start: "Inspect capability surface",
    actions: ["Server discovery + policy filter", "Least privilege identity", "Dry run + approval", "Tasks extension boundary"],
    run: "Evaluate boundary",
    outcome: "CAPABILITY_BOUNDARY_READY",
  },
  {
    route: "/en/labs/long-running-agent-recovery-mission/",
    heading: "Long-Running Agent Recovery Mission",
    start: "Replay failure",
    actions: ["Durable events / step state", "Step idempotency", "Verified-step resume", "Bounded cancellation"],
    run: "Test recovery",
    outcome: "RECOVERY_READY",
  },
  {
    route: "/en/build/write-book-with-ai-build/",
    heading: "Write a Book with AI",
    start: "Inspect draft system",
    actions: ["Authority-tagged source library", "Argument map", "Scoped chapter briefs", "Claim + source check"],
    run: "Evaluate manuscript system",
    outcome: "MANUSCRIPT_SYSTEM_READY",
  },
  {
    route: "/en/build/knowledge-base-build/",
    heading: "Build an AI Knowledge Base",
    start: "Inspect corpus",
    actions: ["Authority-aware ingestion", "Hybrid + rerank", "Incremental sync", "Versioned failure set"],
    run: "Evaluate knowledge system",
    outcome: "KNOWLEDGE_SYSTEM_READY",
  },
  {
    route: "/en/build/customer-support-build/",
    heading: "AI Customer Support Build",
    start: "Inspect support incident",
    actions: ["Authority-aware RAG", "Intent-scoped tools", "Approval by risk", "Confidence + intent policy"],
    run: "Evaluate support system",
    outcome: "SUPPORT_SYSTEM_READY",
  },
  {
    route: "/en/build/course-knowledge-product-build/",
    heading: "Course / Knowledge Product Build",
    start: "Inspect production pipeline",
    actions: ["Measurable outcomes", "Canonical concept graph", "Human-readable review rubric", "QA + provenance gate"],
    run: "Evaluate product system",
    outcome: "KNOWLEDGE_PRODUCT_READY",
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

test.describe("Content Wave 2 system and outcome experiences", () => {
  for (const item of CASES) {
    test(`${item.heading} reaches its bounded viable architecture`, async ({ page }) => {
      await completeViableAttempt(page, item);
    });
  }

  test("Wave 2 keeps exact zh-CN route parity with equivalent learning surfaces", async ({ page }) => {
    for (const item of CASES) {
      const route = item.route.replace("/en/", "/zh-cn/");
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("LEARNING CONTEXT", { exact: true })).toBeVisible();
      await expect(page.locator("main")).toContainText(/证据|系统|架构|验证|知识|风险/);
    }
  });
});
