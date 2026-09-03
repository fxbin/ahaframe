import { expect, test } from "@playwright/test";

test("English Core Guide renders the full reading contract and localized practice link", async ({ page }) => {
  await page.goto("/en/guides/context-management/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Context management");
  await expect(page.getByText("Mental model", { exact: true })).toBeVisible();
  await expect(page.getByText("Why it matters", { exact: true })).toBeVisible();
  await expect(page.getByText("Common failure modes", { exact: true })).toBeVisible();
  await expect(page.getByText("Engineering heuristics", { exact: true })).toBeVisible();
  await expect(page.getByText("Takeaways", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Stress-test context retention/ })).toHaveAttribute("href", "/en/labs/context-compression/?guide=context-management");
});

test("Chinese Core Guide preserves the same content structure and localizes navigation", async ({ page }) => {
  await page.goto("/zh-cn/guides/context-management/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Context Management");
  await expect(page.getByText("核心心智模型", { exact: true })).toBeVisible();
  await expect(page.getByText("为什么重要", { exact: true })).toBeVisible();
  await expect(page.getByText("常见失败模式", { exact: true })).toBeVisible();
  await expect(page.getByText("工程启发", { exact: true })).toBeVisible();
  await expect(page.getByText("关键结论", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /压力测试信息保留/ })).toHaveAttribute("href", "/zh-cn/labs/context-compression/?guide=context-management");
});

test("Core-40 publishes the new evaluation Guide in both locales", async ({ page }) => {
  await page.goto("/en/guides/evaluation-evidence/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Evaluation environments and verifier design");
  await expect(page.getByRole("link", { name: /Design evidence and vetoes/ })).toHaveAttribute("href", "/en/labs/evaluation-failure/?guide=evaluation-evidence");

  await page.goto("/zh-cn/guides/evaluation-evidence/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Evaluation Environment 与 Verifier Design");
  await expect(page.getByRole("link", { name: /设计 Evidence 与 Veto/ })).toHaveAttribute("href", "/zh-cn/labs/evaluation-failure/?guide=evaluation-evidence");
});

test("Core-60 publishes a newly added Guide in both locales", async ({ page }) => {
  await page.goto("/en/guides/traceability/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Traceability from input to outcome");
  await expect(page.getByRole("link", { name: /Diagnose evidence paths/ })).toHaveAttribute("href", "/en/labs/evaluation-failure/?guide=traceability");

  await page.goto("/zh-cn/guides/traceability/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("从 Input 到 Outcome 的 Traceability");
  await expect(page.getByRole("link", { name: /诊断 Evidence Path/ })).toHaveAttribute("href", "/zh-cn/labs/evaluation-failure/?guide=traceability");
});

test("direct Guide visits show canonical Path memberships without inventing a linear sequence", async ({ page }) => {
  await page.goto("/en/guides/model-capability-envelope/");

  await expect(page.locator('[data-guide-path-membership="ai-foundations"]')).toBeVisible();
  await expect(page.locator('[data-guide-path-membership="llm-application-engineering"]')).toBeVisible();
  await expect(page.locator("[data-guide-active-path]")).toHaveCount(0);
  await expect(page.locator("[data-guide-sequence]")).toHaveCount(0);
});

test("one reused Guide resolves different previous and next neighbors in different Course contexts", async ({ page }) => {
  await page.goto("/en/guides/model-capability-envelope/?path=ai-foundations");
  await expect(page.locator('[data-guide-active-path="ai-foundations"]')).toBeVisible();
  await expect(page.locator('[data-guide-previous="concept-context-window"]')).toHaveAttribute(
    "href",
    "/en/guides/context-window/?path=ai-foundations",
  );
  await expect(page.locator('[data-guide-next="concept-latency-throughput-basics"]')).toHaveAttribute(
    "href",
    "/en/guides/latency-throughput-basics/?path=ai-foundations",
  );

  await page.goto("/en/guides/model-capability-envelope/?path=llm-application-engineering");
  await expect(page.locator('[data-guide-active-path="llm-application-engineering"]')).toBeVisible();
  await expect(page.locator('[data-guide-previous="concept-probabilistic-behavior"]')).toHaveAttribute(
    "href",
    "/en/guides/probabilistic-model-behavior/?path=llm-application-engineering",
  );
  await expect(page.locator('[data-guide-next="concept-finite-context-budget"]')).toHaveAttribute(
    "href",
    "/en/guides/finite-context-budget/?path=llm-application-engineering",
  );
});

test("invalid Path context is ignored and Chinese Path context localizes correctly", async ({ page }) => {
  await page.goto("/en/guides/model-capability-envelope/?path=agent-engineering");
  await expect(page.locator("[data-guide-active-path]")).toHaveCount(0);
  await expect(page.locator("[data-guide-sequence]")).toHaveCount(0);

  await page.goto("/zh-cn/guides/model-capability-envelope/?path=ai-foundations");
  const context = page.locator('[data-guide-active-path="ai-foundations"]');
  await expect(context).toContainText("AI 基础");
  await expect(context).toContainText("模型、Token 与 Context");
  await expect(page.getByText("用于这些学习路径", { exact: true })).toBeVisible();
  await expect(page.getByText("继续学习", { exact: true })).toBeVisible();
});

test("Knowledge Map links only Concepts with published Guides", async ({ page }) => {
  await page.goto("/en/learning/");

  const build = page.getByTestId("knowledge-domain-build-ai");
  await build.locator(":scope > summary").click();

  const aiNative = build.locator('details[data-branch-id="branch-ai-native-software"]');
  await aiNative.locator(":scope > summary").click();

  const context = aiNative.locator('details[data-branch-id="branch-context-engineering"]');
  await context.locator(":scope > summary").click();

  const published = context.locator('[data-guide-concept-id="concept-context-management"]');
  await expect(published).toBeVisible();
  await expect(published).toHaveAttribute("href", "/en/guides/context-management/");

  await expect(context.getByText("Prompt caching and stable prefixes", { exact: true })).toBeVisible();
  await expect(context.locator('[data-guide-concept-id="concept-prompt-caching"]')).toHaveCount(0);
});

test("Knowledge Map projects a newly published core-40 Concept to its Guide", async ({ page }) => {
  await page.goto("/en/learning/");

  const build = page.getByTestId("knowledge-domain-build-ai");
  await build.locator(":scope > summary").click();

  const production = build.locator('details[data-branch-id="branch-production-ai"]');
  await production.locator(":scope > summary").click();

  const evaluation = production.locator('details[data-branch-id="branch-eval-reliability"]');
  await evaluation.locator(":scope > summary").click();

  const published = evaluation.locator('[data-guide-concept-id="concept-evaluation-evidence"]');
  await expect(published).toBeVisible();
  await expect(published).toHaveAttribute("href", "/en/guides/evaluation-evidence/");
});

test("Knowledge Map projects a newly published core-60 Concept to its Guide", async ({ page }) => {
  await page.goto("/en/learning/");

  const build = page.getByTestId("knowledge-domain-build-ai");
  await build.locator(":scope > summary").click();

  const production = build.locator('details[data-branch-id="branch-production-ai"]');
  await production.locator(":scope > summary").click();

  const evaluation = production.locator('details[data-branch-id="branch-eval-reliability"]');
  await evaluation.locator(":scope > summary").click();

  const published = evaluation.locator('[data-guide-concept-id="concept-traceability"]');
  await expect(published).toBeVisible();
  await expect(published).toHaveAttribute("href", "/en/guides/traceability/");
});
