import { expect, test, type Page } from "@playwright/test";

const GUIDE_PROGRESS_KEY = "ahaframe_guide_product_progress_v1";

async function clearProgress(page: Page) {
  await page.goto("/en/");
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
    window.localStorage.removeItem("ahaframe_learning_progress_v1");
  }, GUIDE_PROGRESS_KEY);
}

async function productProgress(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, GUIDE_PROGRESS_KEY);
}

test("opening a Guide records Seen but never silently marks Read", async ({ page }) => {
  await clearProgress(page);
  await page.goto("/en/guides/timeout-ambiguity/?path=production-ai-reliability");

  const progress = page.locator('[data-guide-progress="concept-timeout-ambiguity"]');
  await expect(progress).toHaveAttribute("data-guide-progress-state", "SEEN");
  await expect(page.locator('[data-guide-mark-read="concept-timeout-ambiguity"]')).toBeEnabled();
  await expect(page.locator('[data-guide-practice-progress="agent-reliability"]')).toHaveAttribute("data-guide-practice-state", "NOT_PRACTICED");

  const stored = await productProgress(page);
  expect(stored.version).toBe(1);
  expect(stored.guides["concept-timeout-ambiguity"].seenAt).toBeTruthy();
  expect(stored.guides["concept-timeout-ambiguity"].readAt).toBeUndefined();
  expect(stored.practices["agent-reliability"]).toBeUndefined();
});

test("explicit Read evidence persists across reload and locale switching", async ({ page }) => {
  await clearProgress(page);
  await page.goto("/en/guides/timeout-ambiguity/");

  await page.locator('[data-guide-mark-read="concept-timeout-ambiguity"]').click();
  await expect(page.locator('[data-guide-progress="concept-timeout-ambiguity"]')).toHaveAttribute("data-guide-progress-state", "READ");
  await expect(page.locator('[data-guide-mark-read="concept-timeout-ambiguity"]')).toBeDisabled();

  await page.reload();
  await expect(page.locator('[data-guide-progress="concept-timeout-ambiguity"]')).toHaveAttribute("data-guide-progress-state", "READ");

  const locale = page.getByTestId("locale-switch");
  await locale.locator("summary").click();
  await locale.locator('a[hreflang="zh-CN"]').click();
  await expect(page).toHaveURL(/\/zh-cn\/guides\/timeout-ambiguity\/?$/);
  await expect(page.locator('[data-guide-progress="concept-timeout-ambiguity"]')).toHaveAttribute("data-guide-progress-state", "READ");
  await expect(page.getByRole("button", { name: "已读" })).toBeDisabled();
});

test("Course progress counts only explicit Read evidence and continues to the first unread published Guide", async ({ page }) => {
  await clearProgress(page);
  await page.goto("/en/courses/production-ai-reliability/");

  const panel = page.locator('[data-course-progress="path-production-ai-reliability"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator("[data-course-guides-read]")).toContainText(/^0 \/ [1-9]/);
  await expect(panel.locator('[data-course-continue="guide"]')).toHaveAttribute(
    "href",
    "/en/guides/timeout-ambiguity/?path=production-ai-reliability",
  );

  await panel.locator('[data-course-continue="guide"]').click();
  await page.locator('[data-guide-mark-read="concept-timeout-ambiguity"]').click();
  await page.goto("/en/courses/production-ai-reliability/");

  await expect(panel.locator("[data-course-guides-read]")).toContainText(/^1 \/ [1-9]/);
  await expect(panel.locator('[data-course-continue="guide"]')).toHaveAttribute(
    "href",
    "/en/guides/retry-amplification/?path=production-ai-reliability",
  );
});

test("opening or debriefing Practice is not Practiced; deterministic Mission completion is", async ({ page }) => {
  await clearProgress(page);
  await page.goto("/en/labs/rag-failure/");

  let stored = await productProgress(page);
  expect(stored?.practices?.["rag-failure"]).toBeUndefined();

  await page.getByRole("button", { name: "Start incident" }).click();
  await page.getByRole("button", { name: "Incident report" }).click();
  await page.getByRole("button", { name: "Hybrid" }).click();
  await page.getByRole("button", { name: "Run pipeline" }).click();
  await page.getByRole("button", { name: "Proceed to release decision" }).click();
  await page.getByRole("button", { name: "BLOCK", exact: true }).click();
  await expect(page.getByText("DEBRIEF", { exact: true })).toBeVisible();

  stored = await productProgress(page);
  expect(stored?.practices?.["rag-failure"]).toBeUndefined();

  await page.getByRole("button", { name: "Complete mission" }).click();
  await expect(page.locator('[data-mission-phase="COMPLETE"]')).toBeVisible();
  stored = await productProgress(page);
  expect(stored.version).toBe(1);
  expect(stored.practices["rag-failure"].practicedAt).toBeTruthy();

  await page.goto("/en/courses/rag-knowledge-systems/");
  await expect(page.locator('[data-course-progress="path-rag-knowledge-systems"] [data-course-practices-completed]')).toHaveText("1 / 1");
});

test("corrupt or cleared local Guide evidence safely resets without blocking learning", async ({ page }) => {
  await clearProgress(page);
  await page.evaluate((key) => window.localStorage.setItem(key, "not-json"), GUIDE_PROGRESS_KEY);
  await page.goto("/en/courses/production-ai-reliability/");
  await expect(page.locator('[data-course-progress="path-production-ai-reliability"] [data-course-guides-read]')).toContainText(/^0 \/ [1-9]/);

  await page.goto("/en/guides/timeout-ambiguity/");
  await page.locator('[data-guide-mark-read="concept-timeout-ambiguity"]').click();
  await expect(page.locator('[data-guide-progress="concept-timeout-ambiguity"]')).toHaveAttribute("data-guide-progress-state", "READ");

  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/en/courses/production-ai-reliability/");
  await expect(page.locator('[data-course-progress="path-production-ai-reliability"] [data-course-guides-read]')).toContainText(/^0 \/ [1-9]/);
});
