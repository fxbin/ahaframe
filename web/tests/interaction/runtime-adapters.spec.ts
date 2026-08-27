import { expect, test, type Page } from "@playwright/test";

async function switchLocale(page: Page, locale: "en" | "zh-CN") {
  const selector = page.getByTestId("locale-switch");
  await selector.locator("summary").click();
  await selector.locator(`a[hreflang="${locale}"]`).click();
}

test.describe("AhaFrame deterministic interaction adapters", () => {
  test("Foundation Lab dispatches, resets, and remounts cleanly across locale navigation", async ({ page }) => {
    await page.goto("/en/lessons/token-playground/");
    await expect(page.getByRole("heading", { name: "Live lab console" })).toBeVisible();

    const temperature = page.locator('input[type="range"]').first();
    await expect(temperature).toHaveValue("0.7");
    await temperature.fill("1.2");
    await expect(temperature).toHaveValue("1.2");
    await expect(page.getByText("Temperature · 1.2")).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(temperature).toHaveValue("0.7");

    await temperature.fill("1.4");
    await switchLocale(page, "zh-CN");
    await expect(page).toHaveURL(/\/zh-cn\/lessons\/token-playground\/?$/);
    await expect(page.getByRole("heading", { name: "实时实验控制台" })).toBeVisible();
    await expect(page.locator('input[type="range"]').first()).toHaveValue("0.7");

    await switchLocale(page, "en");
    await expect(page).toHaveURL(/\/en\/lessons\/token-playground\/?$/);
    await expect(page.locator('input[type="range"]').first()).toHaveValue("0.7");
  });

  test("Specialist Lab updates canonical state and derived output", async ({ page }) => {
    await page.goto("/en/labs/context-compression/");
    await expect(page.getByRole("heading", { name: "Compression policy console" })).toBeVisible();

    const compression = page.locator('input[type="range"]').first();
    await expect(compression).toHaveValue("72");
    await compression.fill("50");
    await expect(compression).toHaveValue("50");
    await expect(page.getByText(/1 recorded action/)).toBeVisible();

    await page.getByRole("button", { name: "Balanced preset" }).click();
    await expect(page.getByText(/2 recorded actions/)).toBeVisible();
    await page.getByRole("button", { name: "Reset baseline" }).click();
    await expect(compression).toHaveValue("72");
  });

  test("Campaign Mission completes attempt to release decision through Mission Engine", async ({ page }) => {
    await page.goto("/en/labs/rag-failure/");
    await expect(page.getByRole("heading", { level: 2, name: "Retrieval policy" })).toBeVisible();

    await page.getByRole("button", { name: "Start incident" }).click();
    await expect(page.getByText("INVESTIGATE", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Incident report" }).click();
    await page.getByRole("button", { name: "Hybrid" }).click();
    await expect(page.getByText("INTERVENE", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Run pipeline" }).click();
    await expect(page.getByText("REVIEW", { exact: true })).toBeVisible();
    await expect(page.getByText("#1", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Proceed to release decision" }).click();
    await expect(page.getByText("DECIDE", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "BLOCK", exact: true }).click();
    await expect(page.getByText("DEBRIEF", { exact: true })).toBeVisible();
    await expect(page.getByText("BLOCK", { exact: true })).toBeVisible();
  });

  test("Final Boss requires rationale before release decision", async ({ page }) => {
    await page.goto("/en/build/reliable-support-agent/");
    await expect(page.getByRole("button", { name: "Take ownership" })).toBeVisible();

    await page.getByRole("button", { name: "Take ownership" }).click();
    await page.getByRole("button", { name: "Replay candidate" }).click();
    await expect(page.getByText("REVIEW", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Proceed to release decision" }).click();
    await expect(page.getByText("DECIDE", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "BLOCK", exact: true }).click();
    await expect(page.getByText("Write a short rationale before submitting the release decision.", { exact: true })).toBeVisible();
    await expect(page.getByText("DECIDE", { exact: true })).toBeVisible();

    await page.getByPlaceholder("What evidence makes this decision defensible?").fill("Critical safety and execution blockers remain unresolved in the current candidate.");
    await page.getByRole("button", { name: "BLOCK", exact: true }).click();
    await expect(page.getByText("DEBRIEF", { exact: true })).toBeVisible();
    await expect(page.getByText("BLOCK", { exact: true })).toBeVisible();
  });
});
