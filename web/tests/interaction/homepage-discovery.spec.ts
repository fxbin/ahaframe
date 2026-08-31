import { expect, test } from "@playwright/test";

test("English homepage gives a simple course-first path while keeping deeper practice reachable", async ({ page }) => {
  await page.goto("/en/");

  await expect(page.getByRole("heading", { level: 1, name: "Understand AI by seeing it work." })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Start Learning/ })).toHaveAttribute("href", "/en/courses/");

  for (const goal of ["Understand AI", "Build AI", "Use AI"]) {
    await expect(page.getByRole("link", { name: new RegExp(goal) }).first()).toBeVisible();
  }

  await expect(page.getByText("Featured Courses", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Agent Engineering/ }).first()).toHaveAttribute(
    "href",
    "/en/courses/agent-engineering/",
  );
  await expect(page.getByRole("link", { name: /RAG & Knowledge Systems/ }).first()).toHaveAttribute(
    "href",
    "/en/courses/rag-knowledge-systems/",
  );

  // Product depth remains available without making a first-time learner parse the graph.
  await expect(page.getByText("The refund succeeded. Your agent just never knew.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open the full incident/i })).toHaveAttribute(
    "href",
    "/en/labs/agent-reliability/",
  );
  await expect(page.getByRole("link", { name: /Explore the Knowledge Map/i })).toHaveAttribute(
    "href",
    "/en/learning/",
  );

  // The old campaign-first information architecture must not creep back onto the homepage.
  await expect(page.locator("#campaign")).toHaveCount(0);
  await expect(page.locator("#roadmap")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "See it fail" })).toHaveCount(0);
});

test("Chinese homepage preserves the same simple entry and deeper practice route", async ({ page }) => {
  await page.goto("/zh-cn/");

  await expect(page.getByRole("heading", { level: 1, name: "看见 AI 如何工作，才能真正理解它。" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^开始学习/ })).toHaveAttribute("href", "/zh-cn/courses/");

  for (const goal of ["理解 AI", "构建 AI", "使用 AI"]) {
    await expect(page.getByRole("link", { name: new RegExp(goal) }).first()).toBeVisible();
  }

  await expect(page.getByText("精选课程", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Agent Engineering/ }).first()).toHaveAttribute(
    "href",
    "/zh-cn/courses/agent-engineering/",
  );
  await expect(page.getByText("第一次退款其实成功了，只是 Agent 不知道。", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /打开完整 Incident/i })).toHaveAttribute(
    "href",
    "/zh-cn/labs/agent-reliability/",
  );
  await expect(page.getByRole("link", { name: /自由探索知识地图/i })).toHaveAttribute(
    "href",
    "/zh-cn/learning/",
  );

  await expect(page.locator("#campaign")).toHaveCount(0);
  await expect(page.locator("#roadmap")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "先看它失败" })).toHaveCount(0);
});
