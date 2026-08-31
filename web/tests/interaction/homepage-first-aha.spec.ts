import { expect, test } from "@playwright/test";

test("English homepage gives one clear course-first entry and retains First Aha below the fold", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.getByRole("heading", { level: 1, name: "Understand AI by seeing it work." })).toBeVisible();
  const start = page.getByRole("link", { name: /^Start Learning/ });
  await expect(start).toHaveAttribute("href", "/en/courses/");
  await expect(page.getByRole("link", { name: "Courses", exact: true }).first()).toBeVisible();
  await expect(page.getByText("What do you want to learn?", { exact: true })).toBeVisible();
  await expect(page.getByText("Featured Courses", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start Lab/i })).toHaveCount(0);

  // The differentiating First Aha remains available, but no longer owns the first screen.
  await expect(page.getByText("The refund succeeded. Your agent just never knew.")).toBeVisible();
  await page.locator('[data-choice="idempotency"]').click();
  await expect(page.getByText("Duplicate blocked")).toBeVisible();
  const investigate = page.getByRole("link", { name: /Investigate the incident/i }).first();
  await expect(investigate).toHaveAttribute("href", "/en/labs/agent-reliability/");
});

test("Chinese homepage preserves the same simplified information hierarchy", async ({ page }) => {
  await page.goto("/zh-cn/");

  await expect(page.getByRole("heading", { level: 1, name: "看见 AI 如何工作，才能真正理解它。" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^开始学习/ })).toHaveAttribute("href", "/zh-cn/courses/");
  await expect(page.getByRole("link", { name: "课程", exact: true }).first()).toBeVisible();
  await expect(page.getByText("你想学什么？", { exact: true })).toBeVisible();
  await expect(page.getByText("精选课程", { exact: true })).toBeVisible();
  await expect(page.getByText("第一次退款其实成功了，只是 Agent 不知道。")).toBeVisible();

  await page.locator('[data-choice="idempotency"]').click();
  await expect(page.getByText("重复操作被阻断")).toBeVisible();
});
