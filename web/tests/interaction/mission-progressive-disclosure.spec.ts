import { expect, test } from "@playwright/test";

const section = (workspace: ReturnType<Parameters<typeof test>[1]> extends never ? never : never) => workspace;

test("Mission reveals evidence, review and release controls only when each phase needs them", async ({ page }) => {
  await page.goto("/en/labs/mcp-capability-boundary-mission/");

  const workspace = page.locator("[data-mission-phase]");
  await expect(workspace).toHaveAttribute("data-mission-phase", "BRIEF");
  await expect(workspace.locator('[data-mission-section="start"]')).toBeVisible();
  for (const name of ["evidence", "interventions", "outcome", "constraints", "attempts", "release"]) {
    await expect(workspace.locator(`[data-mission-section="${name}"]`)).toHaveCount(0);
  }

  await workspace.getByRole("button", { name: "Inspect capability surface", exact: true }).click();
  await expect(workspace).toHaveAttribute("data-mission-phase", "INVESTIGATE");
  await expect(workspace.locator('[data-mission-section="start"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="evidence"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="interventions"]')).toBeVisible();
  for (const name of ["outcome", "constraints", "attempts", "release"]) {
    await expect(workspace.locator(`[data-mission-section="${name}"]`)).toHaveCount(0);
  }

  for (const action of ["Server discovery + policy filter", "Least privilege identity", "Dry run + approval", "Tasks extension boundary"]) {
    await workspace.getByRole("button", { name: action, exact: true }).click();
  }
  await workspace.getByRole("button", { name: "Evaluate boundary", exact: true }).click();

  await expect(workspace).toHaveAttribute("data-mission-phase", "REVIEW");
  await expect(workspace.locator('[data-mission-section="outcome"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="constraints"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="attempts"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="release"]')).toBeVisible();
  await expect(workspace.getByText("CAPABILITY_BOUNDARY_READY", { exact: true }).first()).toBeVisible();

  await workspace.getByRole("button", { name: "Proceed to release decision", exact: true }).click();
  await expect(workspace).toHaveAttribute("data-mission-phase", "DECIDE");
  await expect(workspace.locator('[data-mission-section="evidence"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="interventions"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="release"]')).toBeVisible();
  await expect(workspace.getByRole("button", { name: "SHIP", exact: true })).toBeVisible();

  await workspace.getByRole("button", { name: /Reset/i }).click();
  await expect(workspace).toHaveAttribute("data-mission-phase", "BRIEF");
  await expect(workspace.locator('[data-mission-section="start"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="outcome"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="release"]')).toHaveCount(0);
});

test("Build experiences use the same progressive Mission surface", async ({ page }) => {
  await page.goto("/en/build/write-book-with-ai-build/");

  const workspace = page.locator("[data-mission-phase]");
  await expect(workspace).toHaveAttribute("data-mission-phase", "BRIEF");
  await expect(workspace.locator('[data-mission-section="evidence"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="interventions"]')).toHaveCount(0);

  await workspace.getByRole("button", { name: "Inspect draft system", exact: true }).click();
  await expect(workspace).toHaveAttribute("data-mission-phase", "INVESTIGATE");
  await expect(workspace.locator('[data-mission-section="evidence"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="interventions"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="outcome"]')).toHaveCount(0);
});

test("zh-CN Mission keeps the same phase-based disclosure", async ({ page }) => {
  await page.goto("/zh-cn/labs/mcp-capability-boundary-mission/");

  const workspace = page.locator("[data-mission-phase]");
  await expect(workspace).toHaveAttribute("data-mission-phase", "BRIEF");
  await expect(workspace.locator('[data-mission-section="evidence"]')).toHaveCount(0);
  await expect(workspace.locator('[data-mission-section="interventions"]')).toHaveCount(0);

  await workspace.locator("button.action-primary").click();
  await expect(workspace).toHaveAttribute("data-mission-phase", "INVESTIGATE");
  await expect(workspace.locator('[data-mission-section="evidence"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="interventions"]')).toBeVisible();
  await expect(workspace.locator('[data-mission-section="outcome"]')).toHaveCount(0);
});
