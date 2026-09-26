import { expect, test } from "@playwright/test";

const large = { width: 1448, height: 1086 };
const compact = { width: 390, height: 844 };

test("reference parity: search palette has actual content groups and no obscured controls", async ({ page }) => {
  await page.setViewportSize(large);
  await page.goto("/zh-cn/");
  const trigger = page.locator("[data-global-search-trigger]");
  await expect(trigger).toHaveAttribute("data-search-ready", "true");
  await trigger.click();
  const dialog = page.locator("body > [data-global-search-overlay] [data-global-search-dialog]");
  await expect(dialog).toBeVisible();
  const groups = dialog.locator("[data-search-suggestions] .search-parity-section");
  expect(await groups.count()).toBeGreaterThanOrEqual(3);
  await expect(dialog.locator(".search-parity-row").first()).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds).toBeTruthy();
  expect(bounds!.width).toBeGreaterThanOrEqual(700);
  expect(bounds!.width).toBeLessThanOrEqual(850);
  expect(bounds!.x).toBeGreaterThan(200);
  await page.screenshot({ path: "test-results/design-parity/search-desktop-zh.png", fullPage: false });

  await page.setViewportSize(compact);
  const viewport = await dialog.boundingBox();
  expect(viewport).toBeTruthy();
  expect(viewport!.x).toBeGreaterThanOrEqual(0);
  expect(viewport!.x + viewport!.width).toBeLessThanOrEqual(compact.width + 1);
  await page.screenshot({ path: "test-results/design-parity/search-mobile-zh.png", fullPage: false });
});

test("reference parity: guided lesson uses real three-column workspace", async ({ page }) => {
  await page.setViewportSize(large);
  await page.goto("/zh-cn/guides/timeout-ambiguity/?path=production-ai-reliability");
  await expect(page.locator(".guide-workspace-body")).toBeVisible();
  await expect(page.locator(".guide-workspace-sidebar")).toBeVisible();
  await expect(page.locator(".guide-workspace-practice")).toBeVisible();
  const placement = await page.evaluate(() => {
    const selectors = [".guide-workspace-sidebar", ".guide-workspace-body", ".guide-workspace-practice"];
    return selectors.map(selector => document.querySelector(selector)?.getBoundingClientRect().left ?? -1);
  });
  expect(placement[0]).toBeLessThan(placement[1]);
  expect(placement[1]).toBeLessThan(placement[2]);
  await page.screenshot({ path: "test-results/design-parity/course-desktop-zh.png", fullPage: false });

  await page.setViewportSize(compact);
  await expect(page.locator(".guide-workspace-practice")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/design-parity/course-mobile-zh.png", fullPage: false });
});

test("reference parity: radar is status-led and calendars remain evidence-backed", async ({ page }) => {
  await page.setViewportSize(large);
  await page.goto("/zh-cn/tools/codex-reset/");
  await expect(page.locator(".liquid-radar-status")).toBeVisible();
  await expect(page.locator(".liquid-radar-metrics")).toBeVisible();
  const calendar = page.locator("[data-radar-month-calendar]");
  if (await calendar.count()) {
    await expect(calendar).toBeVisible();
    await expect(calendar.locator("[data-day]")).toHaveCount(new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth()+1,0)).getUTCDate());
    await expect(page.locator(".radar-archive")).toBeVisible();
  }
  await page.screenshot({ path: "test-results/design-parity/radar-desktop-zh.png", fullPage: false });
  await page.setViewportSize(compact);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/design-parity/radar-mobile-zh.png", fullPage: false });
});
