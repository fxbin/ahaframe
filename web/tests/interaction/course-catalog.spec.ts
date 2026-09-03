import { expect, test } from "@playwright/test";

test("course catalog turns the knowledge graph into a simple learner-facing list", async ({ page }) => {
  await page.goto("/en/courses/");

  await expect(page.getByRole("heading", { level: 1, name: "Choose a goal. Follow a clear path." })).toBeVisible();
  await expect(page.getByText("Understand AI", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Build AI", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Use AI", { exact: true }).first()).toBeVisible();

  const agentCourse = page.getByRole("link", { name: /Agent Engineering/ }).first();
  await expect(agentCourse).toHaveAttribute("href", "/en/courses/agent-engineering/");
  await agentCourse.click();

  await expect(page.getByRole("heading", { level: 1, name: "Agent Engineering" })).toBeVisible();
  await expect(page.getByText("Course structure", { exact: true })).toBeVisible();
  await expect(page.locator('[data-course-concept-id="concept-agent-loop"]')).toBeVisible();
  await expect(page.locator('[data-course-guide-concept-id="concept-agent-loop"]')).toHaveAttribute(
    "href",
    "/en/guides/agent-loop/?path=agent-engineering",
  );
  await expect(page.getByText("Practice", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /MCP Capability Boundary Mission/ })).toBeVisible();
});

test("the same high-reuse Guide is projected from two canonical Courses with distinct Path context", async ({ page }) => {
  await page.goto("/en/courses/ai-foundations/");
  const foundationsGuide = page.locator('[data-course-guide-concept-id="concept-model-capability-envelope"]');
  await expect(foundationsGuide).toBeVisible();
  await expect(foundationsGuide).toHaveAttribute(
    "href",
    "/en/guides/model-capability-envelope/?path=ai-foundations",
  );

  await page.goto("/en/courses/llm-application-engineering/");
  const llmGuide = page.locator('[data-course-guide-concept-id="concept-model-capability-envelope"]');
  await expect(llmGuide).toBeVisible();
  await expect(llmGuide).toHaveAttribute(
    "href",
    "/en/guides/model-capability-envelope/?path=llm-application-engineering",
  );
});

test("unpublished canonical Concepts remain visible without fake Guide links", async ({ page }) => {
  await page.goto("/en/courses/ai-foundations/");

  const nextToken = page.locator('[data-course-concept-id="concept-next-token-generation"]');
  await expect(nextToken).toBeVisible();
  await expect(nextToken).toContainText("Next-token generation");
  await expect(page.locator('[data-course-guide-concept-id="concept-next-token-generation"]')).toHaveCount(0);
});

test("zh-CN course catalog and detail keep equivalent Guide-aware structure", async ({ page }) => {
  await page.goto("/zh-cn/courses/");

  await expect(page.getByRole("heading", { level: 1, name: "选一个目标，然后沿着清晰路径学习。" })).toBeVisible();
  const agentCourse = page.getByRole("link", { name: /Agent Engineering/ }).first();
  await expect(agentCourse).toHaveAttribute("href", "/zh-cn/courses/agent-engineering/");
  await agentCourse.click();

  await expect(page.getByRole("heading", { level: 1, name: "Agent Engineering" })).toBeVisible();
  await expect(page.getByText("课程结构", { exact: true })).toBeVisible();
  await expect(page.locator('[data-course-guide-concept-id="concept-agent-loop"]')).toHaveAttribute(
    "href",
    "/zh-cn/guides/agent-loop/?path=agent-engineering",
  );
  await expect(page.getByText("Practice", { exact: true })).toBeVisible();
});
