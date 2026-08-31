import { expect, test } from "@playwright/test";

test("course catalog turns the knowledge graph into a simple learner-facing list", async ({ page }) => {
  await page.goto("/en/courses/");

  await expect(page.getByRole("heading", { level: 1, name: "Choose a goal. Follow a clear path." })).toBeVisible();
  await expect(page.getByText("Understand AI", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Build AI", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Use AI", { exact: true }).first()).toBeVisible();

  const agentCourse = page.getByRole("link", { name: /Agent Engineering/ }).first();
  await expect(agentCourse).toHaveAttribute("href", "/en/courses/agent-engineering/");
  await agentCourse.click();

  await expect(page.getByRole("heading", { level: 1, name: "Agent Engineering" })).toBeVisible();
  await expect(page.getByText("Course structure", { exact: true })).toBeVisible();
  await expect(page.getByText("Practice", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /MCP Capability Boundary Mission/ })).toBeVisible();
});

test("zh-CN course catalog and detail keep equivalent structure", async ({ page }) => {
  await page.goto("/zh-cn/courses/");

  await expect(page.getByRole("heading", { level: 1, name: "选一个目标，然后沿着清晰路径学习。" })).toBeVisible();
  const agentCourse = page.getByRole("link", { name: /Agent Engineering/ }).first();
  await expect(agentCourse).toHaveAttribute("href", "/zh-cn/courses/agent-engineering/");
  await agentCourse.click();

  await expect(page.getByRole("heading", { level: 1, name: "Agent Engineering" })).toBeVisible();
  await expect(page.getByText("课程结构", { exact: true })).toBeVisible();
  await expect(page.getByText("Practice", { exact: true })).toBeVisible();
});
