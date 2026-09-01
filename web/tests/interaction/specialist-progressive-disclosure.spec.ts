import { expect, test } from "@playwright/test";

test("Context Compression follows Question → Change → Observe → Explain", async ({ page }) => {
  await page.goto("/en/labs/context-compression/");

  const lab = page.locator('[data-specialist-lab="context-compression"]');
  await expect(lab).toHaveAttribute("data-specialist-state", "baseline");
  await expect(lab.locator('[data-lab-section="question"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="change"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]')).toHaveCount(0);
  await expect(lab.locator('[data-lab-section="explain"]')).toHaveCount(0);
  await expect(lab.locator('[data-lab-section="full-metrics"]')).toHaveCount(0);

  // The page shell no longer previews the same controls before the real runtime.
  await expect(page.getByText("Compression ratio", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Canonical Lab Engine", { exact: true })).toHaveCount(0);

  const compression = lab.locator('input[type="range"]').first();
  await expect(compression).toHaveValue("72");
  await compression.fill("50");

  await expect(lab).toHaveAttribute("data-specialist-state", "changed");
  await expect(lab.locator('[data-lab-section="observe"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="explain"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="full-metrics"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]').getByText("Task quality", { exact: true }).first()).toBeVisible();
  await expect(lab.getByText(/1 recorded action/).first()).toBeVisible();

  const fullMetrics = lab.locator('[data-lab-section="full-metrics"]');
  await fullMetrics.locator("summary").click();
  await expect(fullMetrics.getByText("Hallucination risk", { exact: true })).toBeVisible();
  await expect(fullMetrics.getByText("Evidence coverage", { exact: true })).toBeVisible();

  await lab.getByRole("button", { name: "Reset baseline", exact: true }).click();
  await expect(lab).toHaveAttribute("data-specialist-state", "baseline");
  await expect(compression).toHaveValue("72");
  await expect(lab.locator('[data-lab-section="observe"]')).toHaveCount(0);
  await expect(lab.locator('[data-lab-section="explain"]')).toHaveCount(0);
});

test("Workflow Graph uses the same lightweight interaction grammar", async ({ page }) => {
  await page.goto("/en/labs/agent-workflow-graph/");

  const lab = page.locator('[data-specialist-lab="agent-workflow-graph"]');
  await expect(lab).toHaveAttribute("data-specialist-state", "baseline");
  await expect(lab.locator('[data-lab-section="observe"]')).toHaveCount(0);

  await lab.getByRole("button", { name: "Balanced graph", exact: true }).click();
  await expect(lab).toHaveAttribute("data-specialist-state", "changed");
  await expect(lab.locator('[data-lab-section="observe"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="explain"]')).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]').getByText("Reliability", { exact: true }).first()).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]').getByText("Failure propagation", { exact: true }).first()).toBeVisible();
});

test("zh-CN Evaluation Failure preserves the same baseline/change boundary", async ({ page }) => {
  await page.goto("/zh-cn/labs/evaluation-failure/");

  const lab = page.locator('[data-specialist-lab="evaluation-failure"]');
  await expect(lab).toHaveAttribute("data-specialist-state", "baseline");
  await expect(lab.getByText("问题", { exact: true })).toBeVisible();
  await expect(lab.getByText("改变", { exact: true })).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]')).toHaveCount(0);
  await expect(lab.locator('[data-lab-section="explain"]')).toHaveCount(0);

  await lab.getByRole("button", { name: "生产评估预设", exact: true }).click();
  await expect(lab).toHaveAttribute("data-specialist-state", "changed");
  await expect(lab.getByText("观察", { exact: true })).toBeVisible();
  await expect(lab.getByText("解释", { exact: true })).toBeVisible();
  await expect(lab.locator('[data-lab-section="observe"]').getByText("安全切片", { exact: true }).first()).toBeVisible();
  await expect(lab.getByText("查看全部指标", { exact: true })).toBeVisible();
});
