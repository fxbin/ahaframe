import { expect, test } from "@playwright/test";

const RED = "rgb(214, 59, 50)";
const LEGACY_GREEN = "#1f6654";

async function cssColor(locator: ReturnType<Parameters<typeof test>[0] extends never ? never : never>) {
  return locator;
}

test.describe("editorial visual consistency", () => {
  test("Pricing and global search use the editorial red accent", async ({ page }) => {
    await page.goto("/en/pricing/");

    const headlineAccent = page.locator("main.editorial-marketing-page h1 span").first();
    await expect(headlineAccent).toBeVisible();
    await expect.poll(() => headlineAccent.evaluate((node) => getComputedStyle(node).color)).toBe(RED);

    const search = page.locator("[data-global-search-trigger]");
    await search.focus();
    await expect.poll(() => search.evaluate((node) => getComputedStyle(node).outlineColor)).toBe(RED);
  });

  test("Experience pages remap legacy runtime primary without changing semantic success", async ({ page }) => {
    await page.goto("/en/labs/context-compression/");
    const root = page.locator("main.editorial-experience-page");
    await expect(root).toBeVisible();

    await expect.poll(() => root.evaluate((node) => getComputedStyle(node).getPropertyValue("--primary").trim().toLowerCase())).toBe("#d63b32");
    await expect.poll(() => root.evaluate((node) => getComputedStyle(node).getPropertyValue("--success").trim().toLowerCase())).toBe("#2f7658");
  });

  test("Guide practice return bar is neutral paper with a red editorial rule", async ({ page }) => {
    await page.goto("/en/labs/context-compression/?guide=context-management");
    const bar = page.locator("[data-guide-practice-return='context-management']");
    await expect(bar).toBeVisible();

    const inner = bar.locator(".shell");
    await expect.poll(() => bar.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgb(232, 240, 236)");
    await expect.poll(() => inner.evaluate((node) => getComputedStyle(node).borderLeftColor)).toBe(RED);
  });

  test("Learning progress keeps semantic green instead of inheriting the brand accent", async ({ page }) => {
    await page.goto("/en/learning/");
    const root = page.locator(".editorial-learning-page").first();
    await expect(root).toBeVisible();

    await expect.poll(() => root.evaluate((node) => getComputedStyle(node).getPropertyValue("--primary").trim().toLowerCase())).toBe(LEGACY_GREEN);
    await expect.poll(() => root.evaluate((node) => getComputedStyle(node).getPropertyValue("--brand-accent").trim().toLowerCase())).toBe("#d63b32");
  });
});
