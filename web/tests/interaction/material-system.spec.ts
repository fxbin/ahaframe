import { expect, test } from "@playwright/test";

const sizes = [
  { width: 1448, height: 1024 },
  { width: 390, height: 844 },
];

test("all major surfaces use the same warm material tokens without sacrificing reading contrast", async ({ page }) => {
  const roles = [
    { route: "/zh-cn/", selector: ".agent-preview", role: "instrument" },
    { route: "/zh-cn/tools/codex-reset/", selector: ".liquid-radar-metric", role: "instrument" },
    { route: "/zh-cn/guides/timeout-ambiguity/?path=production-ai-reliability", selector: ".guide-workspace-practice", role: "support" },
  ] as const;

  for (const viewport of sizes) {
    await page.setViewportSize(viewport);
    for (const role of roles) {
      await page.goto(role.route);
      const element = page.locator(role.selector).first();
      await expect(element).toBeVisible();
      const material = await element.evaluate((node) => {
        const style = getComputedStyle(node);
        const tokens = getComputedStyle(document.documentElement);
        return {
          background: style.backgroundColor,
          radius: style.borderRadius,
          chromeBlur: tokens.getPropertyValue("--af-blur-chrome").trim(),
          roleBlur: style.backdropFilter,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      expect(material.chromeBlur).toBe(viewport.width <= 640 ? "13px" : "22px");
      expect(material.radius).toBe("22px");
      expect(material.pageOverflow).toBeLessThanOrEqual(1);
      expect(material.background).not.toBe("rgba(0, 0, 0, 0)");
    }
  }

  await page.setViewportSize(sizes[0]);
  await page.goto("/zh-cn/guides/timeout-ambiguity/?path=production-ai-reliability");
  await expect(page.locator(".guide-workspace-body")).toHaveCSS("background-color", "rgb(255, 254, 253)");
  await expect(page.locator(".guide-workspace-body")).toHaveCSS("backdrop-filter", "none");
});

test("search uses strong chrome while higher-contrast preferences switch glass off", async ({ page }) => {
  await page.setViewportSize(sizes[0]);
  await page.goto("/en/");
  await page.locator("[data-global-search-trigger]").click();
  const modal = page.locator("[data-global-search-dialog]");
  await expect(modal).toHaveCSS("background-color", "rgba(255, 252, 248, 0.96)");
  await expect(modal).toHaveCSS("border-radius", "28px");
  await page.screenshot({ path: "test-results/design-parity/material-search-desktop.png", fullPage: false });
  await page.emulateMedia({ contrast: "more", reducedMotion: "reduce" });
  await expect(modal).toHaveCSS("background-color", "rgb(255, 253, 250)");
  await expect(modal).toHaveCSS("backdrop-filter", "none");
  await expect(page.locator("[data-global-search-overlay]")).toHaveCSS("backdrop-filter", "none");
});

test("glass uses distinct semantic states on the live-data radar without manufactured status", async ({ page }) => {
  await page.setViewportSize(sizes[0]);
  await page.goto("/zh-cn/tools/codex-reset/");
  const state = page.locator(".liquid-radar-status");
  await expect(state).toBeVisible();
  await expect(state).toHaveAttribute("data-state", /^(confirmed|watching|unknown)$/);
  await page.screenshot({ path: "test-results/design-parity/material-radar-desktop.png", fullPage: false });
  await page.emulateMedia({ contrast: "more" });
  await expect(state).toHaveCSS("backdrop-filter", "none");
  const rendered = await state.getAttribute("data-state");
  if (rendered === "confirmed") await expect(state).toHaveCSS("background-color", "rgb(237, 248, 240)");
  if (rendered === "watching") await expect(state).toHaveCSS("background-color", "rgb(255, 248, 233)");
});
