import { expect, test } from "@playwright/test";

test("free-choice claiming stays dormant until Content Readiness activates it", async ({ request }) => {
  const response = await request.post("/api/entitlements", {
    data: { contentId: "rag-failure" },
  });

  expect(response.status()).toBe(409);
  expect(await response.json()).toMatchObject({
    ok: false,
    error: "FREE_CHOICE_CLAIMS_PAUSED",
    freeChoiceActivation: false,
    billingActive: false,
  });
});

test("entitlement claim endpoint rejects malformed requests before any privileged work", async ({ request }) => {
  const missing = await request.post("/api/entitlements", { data: {} });
  expect(missing.status()).toBe(400);
  expect(await missing.json()).toMatchObject({ ok: false, error: "CONTENT_ID_REQUIRED" });

  const invalid = await request.post("/api/entitlements", {
    headers: { "content-type": "application/json" },
    data: "{not-json",
  });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toMatchObject({ ok: false, error: "INVALID_JSON" });
});
