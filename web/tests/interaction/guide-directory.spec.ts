import { expect, test } from "@playwright/test";

test("English Guides directory exposes exactly 60 published Guides from canonical domains", async ({ page }) => {
  await page.goto("/en/guides/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("60 reusable mental models for AI.");
  const items = page.locator("[data-guide-directory-item]");
  await expect(items).toHaveCount(60);
  await expect(page.locator('[data-guide-directory-domain="domain-understand-ai"]')).toBeVisible();
  await expect(page.locator('[data-guide-directory-domain="domain-build-ai"]')).toBeVisible();
  await expect(page.locator('[data-guide-directory-domain="domain-use-ai"]')).toBeVisible();

  const slugs = await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-guide-directory-item")));
  expect(new Set(slugs).size).toBe(60);
  for (const item of await items.all()) {
    await expect(item).toHaveAttribute("href", /^\/en\/guides\/[a-z0-9-]+\/$/);
  }
});

test("directory filters stay deterministic and reset without crawlable filter URLs", async ({ page }) => {
  await page.goto("/en/guides/");

  await page.getByLabel("Filter Guides").fill("Timeout ambiguity");
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(1);
  await expect(page.locator('[data-guide-directory-item="timeout-ambiguity"]')).toBeVisible();
  await expect(page).toHaveURL(/\/en\/guides\/$/);

  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(60);

  await page.getByLabel("All courses").selectOption({ label: "AI Customer Support" });
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(10);
  await expect(page.locator('[data-guide-directory-item="customer-support-copilot"]')).toBeVisible();

  await page.getByLabel("Only Guides with Practice").check();
  const practiceCount = await page.locator("[data-guide-directory-item]").count();
  expect(practiceCount).toBeGreaterThan(0);
  expect(practiceCount).toBeLessThanOrEqual(10);
});

test("directory has an explicit zero-result state and can recover to all Guides", async ({ page }) => {
  await page.goto("/en/guides/");
  await page.getByLabel("Filter Guides").fill("this-guide-does-not-exist-xyz");
  await expect(page.locator("[data-guide-directory-empty]")).toBeVisible();
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters and view all 60" }).click();
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(60);
});

test("Chinese Guides directory preserves 60-guide parity and localized navigation", async ({ page }) => {
  await page.goto("/zh-cn/guides/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("60 个可复用的 AI 心智模型。");
  await expect(page.locator("[data-guide-directory-item]")).toHaveCount(60);
  await expect(page.getByRole("link", { name: "Guides", exact: true }).first()).toHaveAttribute("href", "/zh-cn/guides/");

  await page.getByLabel("筛选 Guide").fill("Timeout");
  const filtered = page.locator("[data-guide-directory-item]");
  expect(await filtered.count()).toBeGreaterThan(0);
  const firstHref = await filtered.first().getAttribute("href");
  expect(firstHref).toMatch(/^\/zh-cn\/guides\//);
});
