import { expect, test } from "@playwright/test";

test("English Core Guide renders the full reading contract and localized practice link", async ({ page }) => {
  await page.goto("/en/guides/context-management/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Context management");
  await expect(page.getByText("Mental model", { exact: true })).toBeVisible();
  await expect(page.getByText("Why it matters", { exact: true })).toBeVisible();
  await expect(page.getByText("Common failure modes", { exact: true })).toBeVisible();
  await expect(page.getByText("Engineering heuristics", { exact: true })).toBeVisible();
  await expect(page.getByText("Takeaways", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Stress-test context retention/ })).toHaveAttribute("href", "/en/labs/context-compression/");
});

test("Chinese Core Guide preserves the same content structure and localizes navigation", async ({ page }) => {
  await page.goto("/zh-cn/guides/context-management/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Context Management");
  await expect(page.getByText("核心心智模型", { exact: true })).toBeVisible();
  await expect(page.getByText("为什么重要", { exact: true })).toBeVisible();
  await expect(page.getByText("常见失败模式", { exact: true })).toBeVisible();
  await expect(page.getByText("工程启发", { exact: true })).toBeVisible();
  await expect(page.getByText("关键结论", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /压力测试信息保留/ })).toHaveAttribute("href", "/zh-cn/labs/context-compression/");
});

test("Knowledge Map links only Concepts with published Guides", async ({ page }) => {
  await page.goto("/en/learning/");

  const build = page.getByTestId("knowledge-domain-build-ai");
  await build.locator(":scope > summary").click();

  const aiNative = build.locator('details[data-branch-id="branch-ai-native-software"]');
  await aiNative.locator(":scope > summary").click();

  const context = aiNative.locator('details[data-branch-id="branch-context-engineering"]');
  await context.locator(":scope > summary").click();

  const published = context.locator('[data-guide-concept-id="concept-context-management"]');
  await expect(published).toBeVisible();
  await expect(published).toHaveAttribute("href", "/en/guides/context-management/");

  await expect(context.getByText("Prompt caching and stable prefixes", { exact: true })).toBeVisible();
  await expect(context.locator('[data-guide-concept-id="concept-prompt-caching"]')).toHaveCount(0);
});
