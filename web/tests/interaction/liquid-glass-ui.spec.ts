import { expect, test } from "@playwright/test";

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("liquid homepage keeps a single CTA and interactive process preview across viewports", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/en/");
    const hero = page.locator(".liquid-home .editorial-hero");
    await expect(hero).toBeVisible();
    await expect(hero.locator(".editorial-primary-action")).toHaveCount(1);
    await expect(page.locator(".agent-preview__node")).toHaveCount(5);

    const verify = page.locator('[data-agent-step="3"]');
    await verify.click();
    await expect(verify).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".agent-preview__detail")).toContainText("Check whether the observed result");

    const overflow = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(overflow.page, `viewport ${viewport.width}px overflow`).toBeLessThanOrEqual(overflow.viewport + 1);
  }
});

test("glass theme is bilingual and keeps semantic tool statuses distinct", async ({ page }) => {
  await page.goto("/zh-cn/");
  await expect(page.getByRole("heading", { name: /看见 AI 如何工作/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /验证/ })).toHaveCount(1);
  await page.getByRole("button", { name: /验证/ }).click();
  await expect(page.locator(".agent-preview__detail")).toContainText("核对");
  await expect(page.getByRole("link", { name: /体验一个示例/ })).toHaveAttribute("href", "#home-interactive-demo");

  await page.goto("/en/courses/");
  await expect(page.locator(".liquid-course-page")).toBeVisible();
  await expect(page.locator(".course-row").first()).toBeVisible();
});

test("search palette uses body portal and keeps a readable surface when open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 690 });
  await page.goto("/en/");
  await page.keyboard.press("Control+K");
  const dialog = page.locator("body > .glass-search-overlay .glass-search-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("background-color", "rgba(255, 252, 248, 0.94)");
  const clipped = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.left < 0 || rect.right > window.innerWidth + 1;
  });
  expect(clipped).toBe(false);
});
