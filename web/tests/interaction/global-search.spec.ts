import { expect, test } from "@playwright/test";

test("global search opens with Ctrl+K, indexes canonical surfaces, and ranks exact Guide matches deterministically", async ({ page }) => {
  await page.goto("/en/guides/");
  await page.keyboard.press("Control+K");

  const dialog = page.getByRole("dialog", { name: "Search AhaFrame" });
  await expect(dialog).toBeVisible();
  const input = page.getByRole("textbox", { name: "Search AhaFrame" });
  await expect(input).toBeFocused();
  await expect(page.locator("[data-global-search-results]")).toHaveAttribute("data-search-document-count", "277");

  await input.fill("Timeout ambiguity");
  const guide = page.locator('[data-search-result="guide:timeout-ambiguity"]');
  const concept = page.locator('[data-search-result="concept:concept-timeout-ambiguity"]');
  await expect(guide).toBeVisible();
  await expect(concept).toBeVisible();
  await expect(guide).toHaveAttribute("data-search-reason", "exact");
  await expect(guide).toHaveAttribute("href", "/en/guides/timeout-ambiguity/");
  expect(Number(await guide.getAttribute("data-search-score"))).toBeGreaterThan(Number(await concept.getAttribute("data-search-score")));
});

test("Guide full text is searchable beyond title and summary", async ({ page }) => {
  await page.goto("/en/courses/");
  await page.getByRole("button", { name: "Search" }).click();
  const input = page.getByRole("textbox", { name: "Search AhaFrame" });
  await input.fill("reconciling by the original operation ID");

  const result = page.locator('[data-search-result="guide:timeout-ambiguity"]');
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("data-search-reason", "body");
});

test("exact Course and Practice destinations participate without fabricated Course context", async ({ page }) => {
  await page.goto("/en/learning/");
  await page.keyboard.press("Control+K");
  const input = page.getByRole("textbox", { name: "Search AhaFrame" });

  await input.fill("Production AI Reliability");
  const course = page.locator('[data-search-result="course:path-production-ai-reliability"]');
  await expect(course).toBeVisible();
  await expect(course).toHaveAttribute("data-search-reason", "exact");
  await expect(course).toHaveAttribute("href", "/en/courses/production-ai-reliability/");

  await input.fill("$47,000 Retry");
  const practice = page.locator('[data-search-result="practice:agent-reliability"]');
  await expect(practice).toBeVisible();
  await expect(practice).toHaveAttribute("data-search-reason", "prefix");
  await expect(practice).toHaveAttribute("href", "/en/labs/agent-reliability/");
  expect((await practice.getAttribute("href")) ?? "").not.toContain("path=");
});

test("keyboard navigation selects a localized result and Escape restores focus", async ({ page }) => {
  await page.goto("/en/");
  const trigger = page.locator("[data-global-search-trigger]");
  await trigger.focus();
  await page.keyboard.press("Control+K");
  const input = page.getByRole("textbox", { name: "Search AhaFrame" });
  await input.fill("Timeout ambiguity");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-global-search-dialog]")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Control+K");
  await page.getByRole("textbox", { name: "Search AhaFrame" }).fill("Timeout ambiguity");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/guides\/timeout-ambiguity\/$/);
});

test("zh-CN search uses localized documents and mobile has a visible click trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh-cn/guides/");
  const trigger = page.getByRole("button", { name: "搜索" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const input = page.getByRole("textbox", { name: "搜索 AhaFrame" });
  await input.fill("Timeout 歧义");
  const result = page.locator('[data-search-result="guide:timeout-ambiguity"]');
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute("href", "/zh-cn/guides/timeout-ambiguity/");
  await expect(result).toHaveAttribute("data-search-reason", "exact");
});
