import { expect, test } from "@playwright/test";

test("English Knowledge Map keeps domain exploration primary and advanced tools collapsed", async ({ page }) => {
  await page.goto("/en/learning/");

  const map = page.getByTestId("knowledge-map-v1");
  await expect(map).toBeVisible();
  await expect(map.getByRole("heading", { name: /connected knowledge map/i })).toBeVisible();

  const understand = page.getByTestId("knowledge-domain-understand-ai");
  const build = page.getByTestId("knowledge-domain-build-ai");
  const use = page.getByTestId("knowledge-domain-use-ai");
  await expect(understand).toContainText("Understand AI");
  await expect(build).toContainText("Build AI");
  await expect(use).toContainText("Use AI");

  await build.locator("summary").first().click();
  await expect(build.getByText("AI-Native Software", { exact: true })).toBeVisible();
  await expect(build.getByText("Agent Engineering", { exact: true })).toBeVisible();

  const coursesBridge = page.getByTestId("knowledge-map-courses-bridge");
  await expect(coursesBridge).toContainText("Use Courses for goal-oriented learning.");
  await expect(coursesBridge.getByRole("link", { name: /browse all courses/i })).toHaveAttribute("href", "/en/courses/");
  await expect(page.getByTestId("knowledge-paths-v1")).toHaveCount(0);

  const advanced = page.getByTestId("advanced-learning-tools");
  await expect(advanced).not.toHaveAttribute("open", "");
  await expect(page.getByTestId("guided-path-v09-compat")).not.toBeVisible();
  await advanced.locator("summary").first().click();
  await expect(page.getByTestId("guided-path-v09-compat").getByText("STAGE 00", { exact: true })).toBeVisible();

  const recommendation = page.locator("aside").filter({ hasText: "Recommended next" });
  await expect(recommendation).toContainText("Token Playground");
});

test("a non-Guide Concept has a complete English concise surface while a Guide Concept adds enrichment", async ({ page }) => {
  await page.goto("/en/learning/");
  const understand = page.getByTestId("knowledge-domain-understand-ai");
  await understand.locator("summary").first().click();
  await page.locator('[data-branch-id="branch-ai-foundations"] > summary').click();
  await page.locator('[data-branch-id="branch-context-representation"] > summary').click();

  const sequence = page.locator('[data-concept-id="concept-sequence-ordering"]');
  await sequence.locator("summary").click();
  const explanation = sequence.locator('[data-concept-explanation="concept-sequence-ordering"]');
  await expect(explanation).toContainText("The order of information inside context can change");
  await expect(explanation).toContainText("Mental model");
  await expect(explanation).toContainText("Why it matters");
  await expect(explanation.getByRole("link", { name: "AI Foundations", exact: true })).toHaveAttribute("href", "/en/courses/ai-foundations/");
  await expect(sequence.locator('[data-guide-concept-id="concept-sequence-ordering"]')).toHaveCount(0);

  await page.locator('[data-branch-id="branch-models-tokens"] > summary').click();
  const probabilistic = page.locator('[data-concept-id="concept-probabilistic-behavior"]');
  await probabilistic.locator("summary").click();
  await expect(probabilistic.locator('[data-concept-explanation="concept-probabilistic-behavior"]')).toContainText("reasoning lens");
  await expect(probabilistic.locator('[data-guide-concept-id="concept-probabilistic-behavior"]')).toHaveAttribute("href", "/en/guides/probabilistic-model-behavior/");
});

test("Chinese Knowledge Map keeps the same simplified information architecture", async ({ page }) => {
  await page.goto("/zh-cn/learning/");

  const map = page.getByTestId("knowledge-map-v1");
  await expect(map).toContainText("理解 AI");
  await expect(map).toContainText("构建 AI");
  await expect(map).toContainText("使用 AI");

  const use = page.getByTestId("knowledge-domain-use-ai");
  await use.locator("summary").first().click();
  await expect(use.getByText("用 AI 创作", { exact: true })).toBeVisible();
  await expect(use.getByText("知识工作", { exact: true })).toBeVisible();

  const coursesBridge = page.getByTestId("knowledge-map-courses-bridge");
  await expect(coursesBridge).toContainText("用课程页选择目标导向的学习路径。");
  await expect(coursesBridge.getByRole("link", { name: /查看全部课程/i })).toHaveAttribute("href", "/zh-cn/courses/");

  const advanced = page.getByTestId("advanced-learning-tools");
  await expect(advanced).not.toHaveAttribute("open", "");
  await advanced.locator("summary").first().click();
  await expect(page.getByTestId("guided-path-v09-compat").getByText("STAGE 00", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mastered|已掌握/i)).toHaveCount(0);
});

test("Chinese non-Guide Concept explanation preserves authored parity", async ({ page }) => {
  await page.goto("/zh-cn/learning/");
  const understand = page.getByTestId("knowledge-domain-understand-ai");
  await understand.locator("summary").first().click();
  await page.locator('[data-branch-id="branch-ai-foundations"] > summary').click();
  await page.locator('[data-branch-id="branch-context-representation"] > summary').click();

  const sequence = page.locator('[data-concept-id="concept-sequence-ordering"]');
  await sequence.locator("summary").click();
  const explanation = sequence.locator('[data-concept-explanation="concept-sequence-ordering"]');
  await expect(explanation).toContainText("Context 中的信息顺序会改变模型关注哪些事实和指令");
  await expect(explanation).toContainText("心智模型");
  await expect(explanation).toContainText("为什么重要");
  await expect(sequence.locator('[data-guide-concept-id="concept-sequence-ordering"]')).toHaveCount(0);
});
