import { expect, test } from "@playwright/test";

test("desktop header groups routes beside the brand; mobile menu retains all destinations", async ({ page }) => {
  await page.setViewportSize({ width: 1448, height: 900 });
  await page.goto("/zh-cn/");
  const brand = page.locator(".glass-header__identity .brand");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  const search = page.locator("[data-global-search-trigger]");
  const a = await brand.boundingBox();
  const b = await nav.boundingBox();
  const c = await search.boundingBox();
  expect(a && b && c).toBeTruthy();
  expect(a!.x).toBeLessThan(b!.x);
  expect(b!.x).toBeLessThan(c!.x);
  expect(b!.x - (a!.x + a!.width)).toBeLessThan(85);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(nav).toBeHidden();
  const mobile = page.locator(".glass-mobile-menu");
  await expect(mobile.locator("summary")).toBeVisible();
  await mobile.locator("summary").click();
  const destinations = mobile.getByRole("navigation", { name: "移动端导航" });
  await expect(destinations.getByRole("link")).toHaveCount(5);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/design-parity/header-mobile-v3.png", fullPage: false });
  const mobileFirst = destinations.getByRole("link").first();
  const destination = await mobileFirst.getAttribute("href");
  await mobileFirst.click();
  await expect(page).toHaveURL(new URL(destination!, page.url()).toString());
  await expect(mobile).not.toHaveAttribute("open", "");

});

test("course-linked Guide shows actual published outline and offers an interactive knowledge check", async ({ page }) => {
  await page.setViewportSize({ width: 1448, height: 1086 });
  await page.goto("/zh-cn/guides/timeout-ambiguity/?path=production-ai-reliability");
  const outline = page.locator(".guide-workspace-sidebar");
  await expect(outline).toBeVisible();
  expect(await outline.locator(".guide-outline-chapter").count()).toBeGreaterThanOrEqual(2);
  await expect(outline.locator("[aria-current=page]")).toHaveCount(1);
  await expect(outline.locator(".guide-outline-chapter[open]")).toHaveCount(1);
  const anotherChapter = outline.locator(".guide-outline-chapter").nth(1);
  await anotherChapter.locator("summary").click();
  await expect(anotherChapter).toHaveAttribute("open", "");

  await expect(outline.locator("[data-guide-position]")).toContainText("第 1 /");

  const check = page.locator("[data-guide-quick-check]");
  await expect(check).toBeVisible();
  const submit = check.getByRole("button", { name: /检查判断/ });
  await expect(submit).toBeDisabled();
  await check.getByRole("radio", { name: /先查询远端退款状态/ }).check();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(check).toContainText("判断合理");
  await check.getByRole("button", { name: /再试一次/ }).click();
  await expect(submit).toBeDisabled();
  await page.screenshot({ path: "test-results/design-parity/course-interaction-v3.png", fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(outline).toBeHidden();
  const compact = page.locator(".guide-mobile-outline");
  await expect(compact.locator("summary")).toBeVisible();
  await compact.locator("summary").click();
  await expect(compact.locator(".guide-outline-chapter").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/design-parity/course-outline-mobile-v3.png", fullPage: false });
});

test("global search recent visits are real and persist across navigation", async ({ page }) => {
  await page.goto("/en/");
  const trigger = page.locator("[data-global-search-trigger]");
  await expect(trigger).toHaveAttribute("data-search-ready", "true");
  await trigger.click();
  const suggestion = page.locator("[data-search-suggestions] .search-parity-row").first();
  const title = (await suggestion.locator(".search-parity-copy strong").innerText()).trim();
  await suggestion.click();
  await expect(page.locator("[data-global-search-overlay]")).toHaveCount(0);
  await trigger.click();
  await expect(page.locator("[data-search-suggestions] .search-parity-section").first()).toContainText("Recently opened");
  await expect(page.locator("[data-search-suggestions] .search-parity-section").first()).toContainText(title);
});


test("untyped search supports keyboard selection rather than implying inactive shortcuts", async ({ page }) => {
  await page.goto("/en/");
  const trigger = page.locator("[data-global-search-trigger]");
  await expect(trigger).toHaveAttribute("data-search-ready", "true");
  await trigger.click();
  const suggestions = page.locator("[data-search-suggestions] .search-parity-row");
  await expect(suggestions.first()).toHaveAttribute("aria-current", "true");
  const next = suggestions.nth(1);
  const destination = await next.getAttribute("href");
  expect(destination).toBeTruthy();
  await page.keyboard.press("ArrowDown");
  await expect(next).toHaveAttribute("aria-current", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new URL(destination!, page.url()).toString());
});
