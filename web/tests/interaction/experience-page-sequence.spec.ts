import { expect, test, type Page } from "@playwright/test";

const STAGES = ["experience", "reflection", "learn-more", "next"] as const;

async function expectUnifiedSequence(page: Page, path: string) {
  await page.goto(path);
  const sequence = page.getByTestId("experience-sequence");
  await expect(sequence).toBeVisible();

  const stages = page.locator("[data-experience-stage]");
  await expect(stages).toHaveCount(4);

  for (const [index, stage] of STAGES.entries()) {
    await expect(stages.nth(index)).toHaveAttribute("data-experience-stage", stage);
    await expect(sequence.locator(`a[href="#${stage}"]`)).toBeVisible();
  }
}

test.describe("Unified Experience page grammar", () => {
  test("Foundation Lesson follows Experience → Reflection → Learn More → Next", async ({ page }) => {
    await expectUnifiedSequence(page, "/en/lessons/token-playground/");
    await expect(page.locator('[data-experience-stage="experience"]')).toContainText("Live lab console");
    await expect(page.locator('[data-experience-stage="reflection"]')).toContainText("Key takeaways");
    await expect(page.locator('[data-experience-stage="learn-more"] [data-learning-context="embedded"]')).toBeVisible();
  });

  test("Specialist Lab keeps its lightweight runtime inside the same four-stage shell", async ({ page }) => {
    await expectUnifiedSequence(page, "/en/labs/context-compression/");
    await expect(page.locator('[data-experience-stage="experience"]')).toContainText("Question");
    await expect(page.locator('[data-experience-stage="learn-more"] [data-learning-context="embedded"]')).toBeVisible();
  });

  test("Mission Lab groups debrief into Reflection and context into Learn More", async ({ page }) => {
    await expectUnifiedSequence(page, "/en/labs/rag-failure/");
    await expect(page.locator('[data-experience-stage="experience"]')).toContainText("Start incident");
    await expect(page.locator('[data-experience-stage="reflection"]')).toContainText(/debrief|rule|takeaway/i);
    await expect(page.locator('[data-experience-stage="learn-more"] [data-learning-context="embedded"]')).toBeVisible();
  });

  test("Build pages inherit the same four-stage Mission shell", async ({ page }) => {
    await expectUnifiedSequence(page, "/en/build/reliable-support-agent/");
    await expect(page.locator('[data-experience-stage="experience"]')).toContainText("Take ownership");
    await expect(page.locator('[data-experience-stage="next"] a').first()).toBeVisible();
  });

  test("zh-CN preserves the same stage order and localized labels", async ({ page }) => {
    await expectUnifiedSequence(page, "/zh-cn/labs/context-compression/");
    const sequence = page.getByTestId("experience-sequence");
    await expect(sequence.locator('a[href="#experience"]')).toContainText("体验");
    await expect(sequence.locator('a[href="#reflection"]')).toContainText("反思");
    await expect(sequence.locator('a[href="#learn-more"]')).toContainText("深入理解");
    await expect(sequence.locator('a[href="#next"]')).toContainText("下一步");
  });
});
