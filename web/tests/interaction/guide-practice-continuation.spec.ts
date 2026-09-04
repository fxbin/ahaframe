import { expect, test } from "@playwright/test";

test("direct Guide to Lab preserves Guide identity and returns without inventing a Course", async ({ page }) => {
  await page.goto("/en/guides/context-management/");
  const practice = page.locator('[data-guide-practice-link="context-management"]');
  await expect(practice).toHaveAttribute(
    "href",
    "/en/labs/context-compression/?guide=context-management",
  );

  await practice.click();
  const bar = page.locator('[data-guide-practice-return="context-management"]');
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute("data-guide-practice-path", "direct");
  await expect(bar.locator("[data-guide-practice-back]")).toHaveAttribute(
    "href",
    "/en/guides/context-management/",
  );
  await expect(bar.locator("[data-guide-practice-next]")).toHaveCount(0);
});

test("Course-context Guide to Mission preserves Path and can continue to the next Guide", async ({ page }) => {
  await page.goto("/en/guides/least-privilege/?path=agent-engineering");
  const practice = page.locator('[data-guide-practice-link="least-privilege"]');
  await expect(practice).toHaveAttribute(
    "href",
    "/en/labs/mcp-capability-boundary-mission/?guide=least-privilege&path=agent-engineering",
  );

  await practice.click();
  const bar = page.locator('[data-guide-practice-return="least-privilege"]');
  await expect(bar).toHaveAttribute("data-guide-practice-path", "agent-engineering");
  await expect(bar).toContainText("Current course: Agent Engineering");
  await expect(bar.locator("[data-guide-practice-back]")).toHaveAttribute(
    "href",
    "/en/guides/least-privilege/?path=agent-engineering",
  );
  const next = bar.locator('[data-guide-practice-next="concept-reversible-actions"]');
  await expect(next).toHaveAttribute(
    "href",
    "/en/guides/reversible-actions/?path=agent-engineering",
  );
  await next.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reversible actions");
  await expect(page.locator('[data-guide-active-path="agent-engineering"]')).toBeVisible();
});

test("invalid Guide or Path continuation context is safely ignored or downgraded", async ({ page }) => {
  await page.goto("/en/labs/mcp-capability-boundary-mission/?guide=least-privilege&path=ai-foundations");
  const downgraded = page.locator('[data-guide-practice-return="least-privilege"]');
  await expect(downgraded).toHaveAttribute("data-guide-practice-path", "direct");
  await expect(downgraded.locator("[data-guide-practice-back]")).toHaveAttribute(
    "href",
    "/en/guides/least-privilege/",
  );
  await expect(downgraded.locator("[data-guide-practice-next]")).toHaveCount(0);

  await page.goto("/en/labs/mcp-capability-boundary-mission/?guide=https%3A%2F%2Fevil.example&path=agent-engineering");
  await expect(page.locator("[data-guide-practice-return]")).toHaveCount(0);
});

test("zh-CN Practice continuation keeps localized Guide and Course context", async ({ page }) => {
  await page.goto("/zh-cn/guides/least-privilege/?path=agent-engineering");
  await page.locator('[data-guide-practice-link="least-privilege"]').click();
  const bar = page.locator('[data-guide-practice-return="least-privilege"]');
  await expect(bar).toContainText("当前课程: Agent Engineering");
  await expect(bar.getByRole("link", { name: /返回 Guide/ })).toHaveAttribute(
    "href",
    "/zh-cn/guides/least-privilege/?path=agent-engineering",
  );
});
