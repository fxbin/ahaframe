import { expect, test } from "@playwright/test";

test("English learning route projects the v1 Knowledge Map with progressive disclosure", async ({ page }) => {
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

  const paths = page.getByTestId("knowledge-paths-v1");
  await expect(paths.locator("details[data-path-id]")).toHaveCount(15);
  await expect(paths.getByText("Vibe Coding & Agentic Software Engineering", { exact: true })).toBeVisible();
  await expect(paths.getByText("Write a Book with AI", { exact: true })).toBeVisible();
  await expect(paths.getByText("Run a Solo Business with AI", { exact: true })).toBeVisible();

  // The current Experience progression remains compatible while the map projection changes.
  await expect(page.getByTestId("guided-path-v09-compat").getByText("STAGE 00", { exact: true })).toBeVisible();
  const recommendation = page.locator("aside").filter({ hasText: "Recommended next" });
  await expect(recommendation).toContainText("Token Playground");
});

test("Chinese v1 Knowledge Map keeps the same domain/path semantics", async ({ page }) => {
  await page.goto("/zh-cn/learning/");

  const map = page.getByTestId("knowledge-map-v1");
  await expect(map).toContainText("理解 AI");
  await expect(map).toContainText("构建 AI");
  await expect(map).toContainText("使用 AI");

  const use = page.getByTestId("knowledge-domain-use-ai");
  await use.locator("summary").first().click();
  await expect(use.getByText("用 AI 创作", { exact: true })).toBeVisible();
  await expect(use.getByText("知识工作", { exact: true })).toBeVisible();

  const paths = page.getByTestId("knowledge-paths-v1");
  await expect(paths.locator("details[data-path-id]")).toHaveCount(15);
  await expect(paths.getByText("用 AI 写一本书", { exact: true })).toBeVisible();
  await expect(paths.getByText("构建 AI 知识库", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mastered|已掌握/i)).toHaveCount(0);
});
