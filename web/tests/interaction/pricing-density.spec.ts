import { expect, test } from "@playwright/test";

test("English pricing shows only current free access and future membership", async ({ page }) => {
  await page.goto("/en/pricing/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("worth paying for");
  await expect(page.getByText("Billing status", { exact: true })).toBeVisible();
  await expect(page.getByText(/Not open yet\. We will only turn on paid access/)).toBeVisible();

  await expect(page.getByRole("heading", { name: "Free now", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Membership later", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tell me when membership opens/i })).toHaveAttribute("href", "/en/early-access/?intent=membership");

  await expect(page.getByText("$39", { exact: true })).toHaveCount(0);
  await expect(page.getByText("$12", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText("Development sequence", { exact: true })).toHaveCount(0);
});

test("Chinese pricing mirrors the simplified readiness-gated surface", async ({ page }) => {
  await page.goto("/zh-cn/pricing/");

  await expect(page.getByText("收费状态", { exact: true })).toBeVisible();
  await expect(page.getByText(/尚未开放。只有在内容就绪 Gate 通过后/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "现在免费", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "会员制（稍后）", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /会员开放时通知我/ })).toHaveAttribute("href", "/zh-cn/early-access/?intent=membership");
  await expect(page.getByText("$39", { exact: true })).toHaveCount(0);
  await expect(page.getByText("$12", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
});
