import { expect, test } from "@playwright/test";

const EXPECTED_PROBLEMS = [
  {
    id: "problem-rag-wrong-source",
    practice: "/en/labs/rag-failure/",
    course: "/en/courses/rag-knowledge-systems/",
  },
  {
    id: "problem-retry-after-timeout",
    practice: "/en/labs/agent-reliability/",
    course: "/en/courses/production-ai-reliability/",
  },
  {
    id: "problem-agent-too-much-permission",
    practice: "/en/labs/mcp-capability-boundary-mission/",
    course: "/en/courses/agent-engineering/",
  },
  {
    id: "problem-model-upgrade-regression",
    practice: "/en/labs/evaluation-failure/",
    course: "/en/courses/production-ai-reliability/",
  },
  {
    id: "problem-long-running-agent-state",
    practice: "/en/labs/long-running-agent-recovery-mission/",
    course: "/en/courses/agent-engineering/",
  },
  {
    id: "problem-multi-agent-complexity",
    practice: "/en/labs/multi-agent-coordination-incident/",
    course: "/en/courses/multi-agent-orchestration/",
  },
] as const;

test("English problem discovery maps six symptoms only to published Guides, public Practice and canonical Courses", async ({ page }) => {
  await page.goto("/en/guides/");

  const discovery = page.locator("[data-guide-problem-discovery]");
  await expect(discovery).toBeVisible();
  await expect(discovery.getByRole("heading", { level: 2 })).toContainText("You do not need the vocabulary");
  await expect(page.locator("[data-guide-problem]")).toHaveCount(6);

  for (const expected of EXPECTED_PROBLEMS) {
    const bundle = page.locator(`[data-guide-problem="${expected.id}"]`);
    await bundle.locator("summary").click();
    const guides = bundle.locator("[data-guide-problem-guide]");
    await expect(guides).toHaveCount(3);
    for (const guide of await guides.all()) {
      await expect(guide).toHaveAttribute("href", /^\/en\/guides\/[a-z0-9-]+\/$/);
      expect(await guide.getAttribute("href")).not.toContain("?path=");
    }
    await expect(bundle.locator("[data-guide-problem-practice]")).toHaveAttribute("href", expected.practice);
    await expect(bundle.locator("[data-guide-problem-course]")).toHaveAttribute("href", expected.course);
  }
});

test("a learner can reveal a symptom bundle in one interaction and reach mental models before Practice", async ({ page }) => {
  await page.goto("/en/guides/");

  const bundle = page.locator('[data-guide-problem="problem-retry-after-timeout"]');
  await expect(bundle.locator('[data-guide-problem-guide="concept-timeout-ambiguity"]')).not.toBeVisible();
  await bundle.locator("summary").click();
  await expect(bundle.locator('[data-guide-problem-guide="concept-timeout-ambiguity"]')).toBeVisible();
  await expect(bundle.locator('[data-guide-problem-guide="concept-idempotency-boundary"]')).toBeVisible();
  await expect(bundle.locator('[data-guide-problem-guide="concept-verification-loop"]')).toBeVisible();
  await expect(bundle.locator('[data-guide-problem-practice="agent-reliability"]')).toBeVisible();
  await expect(bundle.locator('[data-guide-problem-course="path-production-ai-reliability"]')).toBeVisible();
});

test("Chinese problem discovery preserves bundle identity and localized destinations", async ({ page }) => {
  await page.goto("/zh-cn/guides/");

  await expect(page.locator("[data-guide-problem]")).toHaveCount(6);
  const bundle = page.locator('[data-guide-problem="problem-rag-wrong-source"]');
  await expect(bundle.locator("summary")).toContainText("我的 RAG 总是检索到错误文档");
  await bundle.locator("summary").click();
  await expect(bundle.locator("[data-guide-problem-guide]")).toHaveCount(3);
  const guideHrefs = await bundle.locator("[data-guide-problem-guide]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  expect(guideHrefs.every((href) => href?.startsWith("/zh-cn/guides/") && !href.includes("?path="))).toBe(true);
  await expect(bundle.locator('[data-guide-problem-practice="rag-failure"]')).toHaveAttribute("href", "/zh-cn/labs/rag-failure/");
  await expect(bundle.locator('[data-guide-problem-course="path-rag-knowledge-systems"]')).toHaveAttribute("href", "/zh-cn/courses/rag-knowledge-systems/");
});
