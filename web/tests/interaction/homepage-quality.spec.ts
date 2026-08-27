import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

for (const locale of ["en", "zh-cn"] as const) {
  test(`${locale} homepage keeps editorial hierarchy without responsive overflow`, async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/`);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("#first-aha-title")).toBeVisible();
      await expect(page.locator("#campaign")).toBeVisible();
      await expect(page.locator("#roadmap")).toBeVisible();

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        heroTop: document.querySelector(".hero-section")?.getBoundingClientRect().top ?? -1,
        campaignTop: document.querySelector("#campaign")?.getBoundingClientRect().top ?? -1,
        roadmapTop: document.querySelector("#roadmap")?.getBoundingClientRect().top ?? -1,
      }));

      expect(layout.scrollWidth, `${locale}/${viewport.name} introduced horizontal overflow`).toBeLessThanOrEqual(layout.clientWidth + 1);
      expect(layout.heroTop).toBeLessThan(layout.campaignTop);
      expect(layout.campaignTop).toBeLessThan(layout.roadmapTop);
    }
  });
}

test("First-Aha and language selector remain keyboard operable", async ({ page }) => {
  await page.goto("/en/");

  const intervention = page.getByRole("button", { name: /Add idempotency/i });
  await intervention.focus();
  await page.keyboard.press("Enter");
  await expect(intervention).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-event="first_aha_consequence_observed"]')).toBeVisible();

  const choiceBox = await intervention.boundingBox();
  expect(choiceBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  const selector = page.getByTestId("locale-switch");
  const summary = selector.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(selector.getByRole("link", { name: /简体中文/ })).toBeVisible();
});

test("bilingual homepage metadata preserves canonical and hreflang contract", async ({ page }) => {
  for (const entry of [
    { path: "/en/", lang: "en", canonical: "/en/", alternate: "/zh-cn/" },
    { path: "/zh-cn/", lang: "zh-CN", canonical: "/zh-cn/", alternate: "/en/" },
  ]) {
    await page.goto(entry.path);
    await expect(page.locator("html")).toHaveAttribute("lang", entry.lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${entry.canonical.replace(/\//g, "\\/")}$`));

    const alternateLang = entry.lang === "en" ? "zh-CN" : "en";
    await expect(page.locator(`link[rel="alternate"][hreflang="${alternateLang}"]`)).toHaveAttribute(
      "href",
      new RegExp(`${entry.alternate.replace(/\//g, "\\/")}$`),
    );
  }
});

test("homepage keeps the First-Aha lightweight and avoids fabricated trust or mastery claims", async ({ page }) => {
  await page.goto("/en/");

  const hero = page.locator(".hero-section");
  await expect(hero.locator("img, video, iframe")).toHaveCount(0);
  await expect(hero.getByText("The refund succeeded. Your agent just never knew.", { exact: true })).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/10,000\+ users|trusted by \d+|★★★★★|mastered|completed course/i);

  await expect(page.locator('[data-event="first_aha_incident_viewed"]')).toHaveCount(1);
  await expect(page.locator('[data-event="first_aha_intervention_selected"]')).toHaveCount(3);
  await expect(page.locator('[data-event="first_aha_cta_clicked"]')).toHaveCount(2);
});
