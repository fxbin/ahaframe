import { expect, test } from "@playwright/test";
import { normalizeAihotPayload } from "../../lib/codex-reset-public-feed";

const SAME_POST = "https://x.com/thsottiaux/status/2099999999999999999";

test("AIHOT preserves both full reset and credit grant when they cite the same post", () => {
  const payload = {
    checkedAt: "2026-09-25T12:00:00+08:00",
    events: [
      {
        id: "full-1", type: "direct_reset", status: "confirmed",
        confirmedAt: "2026-09-20T12:00:00+08:00",
        posts: [{ url: SAME_POST }],
      },
      {
        id: "credit-1", type: "reset_credit", status: "confirmed",
        confirmedAt: "2026-09-20T12:00:00+08:00",
        posts: [{ url: SAME_POST }],
      },
    ],
  };
  const signals = normalizeAihotPayload(payload);
  expect(signals).toHaveLength(2);
  expect(signals.map((signal) => signal.kind).sort()).toEqual(["banked", "full"]);
  expect(signals[0].externalId).toBe("full-1");
  expect(signals[1].externalId).toBe("credit-1");
  expect(signals.every((signal) => signal.status === "confirmed")).toBeTruthy();
});

test("a credit announcement stays pending until confirmation", () => {
  const signals = normalizeAihotPayload({
    checkedAt: "2026-09-25T12:00:00+08:00",
    events: [{
      id: "credit-pending",
      type: "reset_credit",
      status: "announced",
      createdAt: "2026-09-24T15:00:00+08:00",
      confirmedAt: null,
      posts: [{ url: SAME_POST }],
    }],
  });
  expect(signals).toHaveLength(1);
  expect(signals[0]).toMatchObject({
    kind: "banked", status: "detected",
    externalId: "credit-pending", sourceUrl: SAME_POST,
    occurredAt: "2026-09-24T07:00:00.000Z",
  });
});

test("withdrawn or unknown-status events cannot become confirmed credits", () => {
  const signals = normalizeAihotPayload({
    events: [{
      id: "not-confirmed", type: "reset_credit", status: "withdrawn",
      createdAt: "2026-09-24T15:00:00+08:00",
      posts: [{ url: SAME_POST }],
    }],
  });
  expect(signals).toHaveLength(0);
});
