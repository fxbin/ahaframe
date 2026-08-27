import { expect, test } from "@playwright/test";

test("English homepage exposes a deterministic First Aha path", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.getByRole("heading", { level: 1, name: "Your agent didn't fail. Your system did." })).toBeVisible();
  await expect(page.getByText("The refund succeeded. Your agent just never knew.")).toBeVisible();
  await expect(page.getByText("Customer refunded twice.")).toBeVisible();

  await page.locator('[data-choice="retry"]').click();
  await expect(page.getByText("Recovery ↑ · Duplicate risk ↑")).toBeVisible();
  await expect(page.getByText("Availability can improve, but repeated irreversible side effects become more likely.")).toBeVisible();

  await page.locator('[data-choice="idempotency"]').click();
  await expect(page.getByText("Duplicate blocked")).toBeVisible();
  await expect(page.getByText("The retry can proceed without creating a second refund for the same operation.")).toBeVisible();

  const investigate = page.getByRole("link", { name: /Investigate the incident/i }).first();
  await expect(investigate).toHaveAttribute("href", "/en/labs/agent-reliability/");
});

test("Chinese homepage preserves the same First Aha causal insight", async ({ page }) => {
  await page.goto("/zh-cn/");

  await expect(page.getByRole("heading", { level: 1, name: "不是 Agent 失效了，是系统失效了。" })).toBeVisible();
  await expect(page.getByText("第一次退款其实成功了，只是 Agent 不知道。")).toBeVisible();
  await expect(page.getByText("同一个客户被退款两次。")).toBeVisible();

  await page.locator('[data-choice="idempotency"]').click();
  await expect(page.getByText("重复操作被阻断")).toBeVisible();
  await expect(page.getByText("Retry 仍然可以执行，但同一笔退款不会再被创建第二次。")).toBeVisible();

  const investigate = page.getByRole("link", { name: /调查这起事故/ }).first();
  await expect(investigate).toHaveAttribute("href", "/zh-cn/labs/agent-reliability/");
});
