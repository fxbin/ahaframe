import { expect, test } from "@playwright/test";

test("English Learning Path exposes 10 legacy stages on demand and keeps graph-driven next action", async ({ page }) => {
  await page.goto("/en/learning/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("complete AI Engineering path");

  const advanced = page.getByTestId("advanced-learning-tools");
  await expect(advanced).not.toHaveAttribute("open", "");
  await expect(page.getByText("STAGE 00", { exact: true })).not.toBeVisible();
  await advanced.locator("summary").first().click();

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

test("Incident-first learner can inspect models, backfill, return and attempt transfer", async ({ page }) => {
  await page.goto("/en/labs/agent-reliability/");

  const context = page.locator("section").filter({ hasText: "LEARNING CONTEXT" }).last();
  await expect(context).toContainText("Timeout ambiguity");
  await expect(context).toContainText("Idempotency boundary");
  const backfill = context.getByRole("link", { name: /Agent Loop Simulator/ });
  await expect(backfill).toHaveAttribute("href", /\/en\/lessons\/agent-loop\/\?returnTo=agent-reliability/);
  await expect(context).toContainText("order-creation API times out");

  await backfill.click();
  await expect(page.getByText(/You are backfilling a prerequisite/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Return to incident/ })).toHaveAttribute("href", "/en/labs/agent-reliability/");
  await page.getByRole("link", { name: /Return to incident/ }).click();

  const returned = page.locator("section").filter({ hasText: "LEARNING CONTEXT" }).last();
  await returned.getByRole("button", { name: "I worked through this changed case" }).click();
  await expect(returned).toContainText("Transferred");
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("ahaframe_learning_progress_v1") || "{}"));
  expect(state["agent-reliability"].state).toBe("TRANSFERRED");
});

test("Chinese Learning Path preserves legacy structure on demand without fake mastery", async ({ page }) => {
  await page.goto("/zh-cn/learning/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("完整的 AI Engineering 路径");

  const advanced = page.getByTestId("advanced-learning-tools");
  await expect(advanced).not.toHaveAttribute("open", "");
  await expect(page.getByText("STAGE 00", { exact: true })).not.toBeVisible();
  await advanced.locator("summary").first().click();

  await expect(page.getByText("STAGE 00", { exact: true })).toBeVisible();
  await expect(page.getByText("STAGE 09", { exact: true })).toBeVisible();

  const stageZero = advanced.locator("details").filter({ hasText: "AI 系统心智模型" }).first();
  await stageZero.locator("summary").click();
  await expect(stageZero.getByText("概率性模型行为 vs 应用系统保证", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mastered|已掌握/i)).toHaveCount(0);
});

test("Language selector uses a neutral current-locale control and preserves route context", async ({ page }) => {
  await page.goto("/en/learning/?cohort=preview&source=nav");

  const selector = page.getByTestId("locale-switch");
  await expect(selector.locator("summary")).toContainText("EN");
  await expect(selector.locator("summary")).not.toContainText("简体中文");

  await selector.locator("summary").click();
  await expect(selector.getByText("English", { exact: true })).toBeVisible();
  const chinese = selector.getByRole("link", { name: /简体中文/ });
  await expect(chinese).toHaveAttribute("href", "/zh-cn/learning/?cohort=preview&source=nav");

  await chinese.click();
  await expect(page).toHaveURL(/\/zh-cn\/learning\/\?cohort=preview&source=nav$/);
  await expect(page.getByTestId("locale-switch").locator("summary")).toContainText("ZH-CN");
});
