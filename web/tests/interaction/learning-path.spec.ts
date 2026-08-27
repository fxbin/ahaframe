import { expect, test } from "@playwright/test";

test("English Learning Path exposes 10 stages and graph-driven next action", async ({ page }) => {
  await page.goto("/en/learning/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("complete AI Engineering path");
  await expect(page.getByText("STAGE 00", { exact: true })).toBeVisible();
  await expect(page.getByText("STAGE 09", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Systems Mental Model" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Production Architecture & Capstones" }).first()).toBeVisible();

  const recommendation = page.locator("aside").filter({ hasText: "Recommended next" });
  await expect(recommendation).toContainText("Token Playground");
  await expect(recommendation.getByRole("link", { name: /Continue/ })).toHaveAttribute("href", "/en/lessons/token-playground/");
});

test("Learning Path recommendation continues from real anonymous state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ahaframe_learning_progress_v1", JSON.stringify({
      "token-playground": { state: "SEEN", updatedAt: "2026-08-27T01:00:00.000Z" },
    }));
  });
  await page.goto("/en/learning/");

  const recommendation = page.locator("aside").filter({ hasText: "Recommended next" });
  await expect(recommendation).toContainText("Context Window Lab");
  await expect(recommendation.getByRole("link", { name: /Continue/ })).toHaveAttribute("href", "/en/lessons/context-window/");
});

test("Incident-first learner can inspect models, backfill and attempt transfer", async ({ page }) => {
  await page.goto("/en/labs/agent-reliability/");

  const context = page.locator("section").filter({ hasText: "LEARNING CONTEXT" }).last();
  await expect(context).toContainText("Timeout ambiguity");
  await expect(context).toContainText("Idempotency boundary");
  await expect(context.getByRole("link", { name: /Agent Loop Simulator/ })).toHaveAttribute("href", /\/en\/lessons\/agent-loop\/\?returnTo=agent-reliability/);
  await expect(context).toContainText("order-creation API times out");

  await context.getByRole("button", { name: "I worked through this changed case" }).click();
  await expect(context).toContainText("Transferred");
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("ahaframe_learning_progress_v1") || "{}"));
  expect(state["agent-reliability"].state).toBe("TRANSFERRED");
});

test("Chinese Learning Path preserves the same structure without fake mastery", async ({ page }) => {
  await page.goto("/zh-cn/learning/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("完整的 AI Engineering 路径");
  await expect(page.getByText("STAGE 00", { exact: true })).toBeVisible();
  await expect(page.getByText("STAGE 09", { exact: true })).toBeVisible();
  await expect(page.getByText("模型行为与应用层保证", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mastered|已掌握/i)).toHaveCount(0);
});
