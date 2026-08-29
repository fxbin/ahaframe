import { expect, test } from "@playwright/test";

async function startAndInspect(page: import("@playwright/test").Page, start: string, evidence: string) {
  await page.getByRole("button", { name: start }).click();
  await expect(page.getByText("INVESTIGATE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: evidence }).click();
}

test.describe("Content Wave 1 first-value experiences", () => {
  test("AI Code Review turns green CI into an evidence-backed merge decision", async ({ page }) => {
    await page.goto("/en/labs/ai-code-review-mission/");
    await expect(page.getByRole("heading", { level: 1, name: "Would You Merge This AI-Generated PR?" })).toBeVisible();
    await startAndInspect(page, "Start review", "PR brief");

    await page.getByRole("button", { name: "Review the diff", exact: true }).click();
    await page.getByRole("button", { name: "Add targeted tests", exact: true }).click();
    await page.getByRole("button", { name: "Lock to written change contract", exact: true }).click();
    await page.getByRole("button", { name: "Check provenance + fit", exact: true }).click();
    await page.getByRole("button", { name: "Evaluate PR", exact: true }).click();

    await expect(page.getByText("MERGE_READY", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Proceed to release decision" }).click();
    await page.getByRole("button", { name: "MERGE", exact: true }).click();
    await expect(page.getByText("DEBRIEF", { exact: true })).toBeVisible();
  });

  test("Research Evidence makes claims traceable, independent and fresh", async ({ page }) => {
    await page.goto("/en/labs/research-evidence-mission/");
    await expect(page.getByRole("heading", { level: 1, name: "Research Evidence Mission" })).toBeVisible();
    await startAndInspect(page, "Start investigation", "Research brief");

    await page.getByRole("button", { name: "Primary + independent secondary", exact: true }).click();
    await page.getByRole("button", { name: "Two independent sources", exact: true }).click();
    await page.getByRole("button", { name: "Claim → evidence matrix", exact: true }).click();
    await page.getByRole("button", { name: "Publication + event-date check", exact: true }).click();
    await page.getByRole("button", { name: "Evaluate evidence", exact: true }).click();

    await expect(page.getByText("EVIDENCE_READY", { exact: true })).toBeVisible();
  });

  test("Data Analysis Verification independently checks extraction, arithmetic and uncertainty", async ({ page }) => {
    await page.goto("/en/labs/data-analysis-verification-lab/");
    await expect(page.getByRole("heading", { level: 1, name: "Data Analysis Verification Lab" })).toBeVisible();
    await startAndInspect(page, "Start verification", "Model conclusion");

    await page.getByRole("button", { name: "Schema-validated extraction", exact: true }).click();
    await page.getByRole("button", { name: "Recompute all derived values", exact: true }).click();
    await page.getByRole("button", { name: "Investigate before aggregation", exact: true }).click();
    await page.getByRole("button", { name: "Evidence-linked uncertainty", exact: true }).click();
    await page.getByRole("button", { name: "Verify analysis", exact: true }).click();

    await expect(page.getByText("ANALYSIS_VERIFIED", { exact: true })).toBeVisible();
  });

  test("Wave 1 has equivalent zh-CN learning surfaces", async ({ page }) => {
    const routes = [
      ["ai-code-review-mission", "这份 AI 生成的 PR，你会合并吗？"],
      ["research-evidence-mission", "Research Evidence Mission"],
      ["data-analysis-verification-lab", "Data Analysis Verification Lab"],
    ] as const;
    for (const [slug, heading] of routes) {
      await page.goto(`/zh-cn/labs/${slug}/`);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.getByText(/验证|证据|审查|分析/).first()).toBeVisible();
    }
  });
});
