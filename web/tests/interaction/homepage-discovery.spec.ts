import { expect, test } from "@playwright/test";

test("English homepage presents the six-step learning method and problem-first incidents", async ({ page }) => {
  await page.goto("/en/");

  for (const label of ["See it fail", "Inspect", "Hypothesize", "Change", "Run again", "Understand"]) {
    await expect(page.getByRole("heading", { level: 3, name: label })).toBeVisible();
  }

  const campaign = page.locator("#campaign");
  const rag = campaign.locator('a[href="/en/labs/rag-failure/"]').filter({ hasText: "The Broken RAG Pipeline" });
  await expect(rag).toContainText("The correct document was retrieved. Why did the agent still answer from the wrong one?");
  await expect(rag).toContainText("Investigate");

  const injection = campaign.locator('a[href="/en/labs/instruction-conflict/"]').filter({ hasText: "The Prompt Injection Attack" });
  await expect(injection).toContainText("The model followed the instruction perfectly. Why was that the vulnerability?");
});

test("Chinese homepage keeps the same learning method and curiosity hooks", async ({ page }) => {
  await page.goto("/zh-cn/");

  for (const label of ["先看它失败", "检查证据", "提出假设", "只改一件事", "重新运行", "形成理解"]) {
    await expect(page.getByRole("heading", { level: 3, name: label })).toBeVisible();
  }

  const campaign = page.locator("#campaign");
  const rag = campaign.locator('a[href="/zh-cn/labs/rag-failure/"]').filter({ hasText: "失效的 RAG 管道" });
  await expect(rag).toContainText("正确文档明明已经被检索出来，Agent 为什么还是从错误证据里给出了答案？");

  const injection = campaign.locator('a[href="/zh-cn/labs/instruction-conflict/"]').filter({ hasText: "Prompt Injection 攻击" });
  await expect(injection).toContainText("模型非常准确地执行了那条指令。为什么“执行正确”反而正是漏洞？");
});
