import { expect, test } from "@playwright/test";

test("approved search geometry: centered wide glass dialog, grouped real content, mobile confinement", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/zh-cn/");
  await page.screenshot({ path: "test-results/design-parity/home-desktop.png", animations: "disabled" });
  await page.locator("[data-global-search-trigger]").click();
  const dialog = page.getByRole("dialog", { name: "搜索 AhaFrame" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".search-group")).toHaveCount(4);
  await page.screenshot({ path: "test-results/design-parity/search-desktop.png", animations: "disabled" });
  const desktop = await dialog.boundingBox();
  expect(desktop).not.toBeNull();
  expect(desktop!.width).toBeGreaterThanOrEqual(790);
  expect(desktop!.width).toBeLessThanOrEqual(850);
  expect(Math.abs(desktop!.x + desktop!.width / 2 - 720)).toBeLessThan(14);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 640 });
  await page.locator("[data-global-search-trigger]").click();
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: "test-results/design-parity/search-mobile.png", animations: "disabled" });
  const mobile = await dialog.boundingBox();
  expect(mobile).not.toBeNull();
  expect(mobile!.x).toBeGreaterThanOrEqual(-1);
  expect(mobile!.x + mobile!.width).toBeLessThanOrEqual(391);
});

test("search recent content reflects actual clicked destinations, never fabricated history", async ({ page }) => {
  await page.goto("/en/");
  await page.evaluate(() => window.localStorage.removeItem("ahaframe:search-recent:en"));
  await page.locator("[data-global-search-trigger]").click();
  await expect(page.locator(".search-group", { hasText: "Recently visited" })).toHaveCount(0);
  const first = page.locator("[data-search-suggestions] .search-group a").first();
  const href = await first.getAttribute("href");
  expect(href).toBeTruthy();
  await first.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await page.locator("[data-global-search-trigger]").click();
  const recent = page.locator(".search-group", { hasText: "Recently visited" });
  await expect(recent).toBeVisible();
  await expect(recent.locator("a[href]").first()).toHaveAttribute("href", href!);
});

test("Guide screenshot layout uses real course context and published incident in three panels", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/en/guides/timeout-ambiguity/?path=agent-engineering");
  const workspace = page.locator(".guide-workspace");
  await expect(workspace).toBeVisible();
  const left = workspace.locator(".guide-workspace__outline");
  const reading = workspace.locator(".guide-workspace__reading");
  const right = workspace.locator(".guide-workspace__practice");
  for (const element of [left, reading, right]) await expect(element).toBeVisible();
  await page.screenshot({ path: "test-results/design-parity/guide-desktop.png", animations: "disabled" });

  const boxes = await Promise.all([left, reading, right].map((item) => item.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  expect(boxes[0]!.x + boxes[0]!.width).toBeLessThan(boxes[1]!.x);
  expect(boxes[1]!.x + boxes[1]!.width).toBeLessThan(boxes[2]!.x);
  expect(boxes[1]!.width).toBeGreaterThan(500);

  await expect(right.locator(".guide-workspace__log li").first()).toBeVisible();
  await right.locator('input[value="idempotency"]').check();
  await right.getByRole("button", { name: /Submit decision/ }).click();
  await expect(right.locator("[data-guide-practice-feedback]")).toBeVisible();
  await expect(right.locator("[data-guide-workspace-practice]")).toHaveAttribute("href", /agent-reliability/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/design-parity/guide-mobile.png", animations: "disabled" });
  const mobile = await workspace.evaluate((node) => {
    const children = [node.querySelector(".guide-workspace__outline"), node.querySelector(".guide-workspace__reading"), node.querySelector(".guide-workspace__practice")];
    return {
      x: children.map((el) => el!.getBoundingClientRect().left),
      top: children.map((el) => el!.getBoundingClientRect().top),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(mobile.top[0]).toBeLessThan(mobile.top[1]);
  expect(mobile.top[1]).toBeLessThan(mobile.top[2]);
  expect(mobile.documentWidth).toBeLessThanOrEqual(mobile.viewportWidth + 1);
});

test("Radar uses actual month navigation and keeps full-reset and credit marker legends distinct", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/en/tools/codex-reset/");
  await expect(page.locator(".liquid-radar-status")).toBeVisible();
  await expect(page.locator(".liquid-radar-metrics > div")).toHaveCount(2);
  await page.screenshot({ path: "test-results/design-parity/radar-desktop.png", animations: "disabled" });
  const month = page.locator("[data-radar-month]");
  if (await month.count()) {
    const initial = await month.getAttribute("data-radar-month");
    await page.getByRole("button", { name: "Previous month" }).click();
    expect(await month.getAttribute("data-radar-month")).not.toBe(initial);
    await page.getByRole("button", { name: "Today" }).click();
    await expect(month).toHaveAttribute("data-radar-month", initial!);
    await expect(month.locator(".radar-month__legend")).toContainText("Full reset");
    await expect(month.locator(".radar-month__legend")).toContainText("Credit granted");
    await expect(month.locator(".radar-month__legend")).toContainText("Announced");
  }
});
