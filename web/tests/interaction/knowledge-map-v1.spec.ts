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
