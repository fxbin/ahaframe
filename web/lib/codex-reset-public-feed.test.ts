import { describe, expect, it } from "vitest";
import { __test__ } from "@/lib/codex-reset-public-feed";

describe("AIHOT Codex reset normalization", () => {
  it("maps confirmed direct resets and keeps the original Tibo post", () => {
    const signals = __test__.normalizeAihotPayload({
      checkedAt: "2026-09-12T21:16:00+08:00",
      events: [
        {
          id: "reset-2026-09-12",
          type: "direct_reset",
          status: "confirmed",
          confirmedAt: "2026-09-12T16:09:00+08:00",
          occurredOn: "2026-09-12",
          posts: [
            { url: "https://x.com/thsottiaux/status/2098685367058612394" },
          ],
        },
      ],
    });

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      externalId: "2098685367058612394",
      kind: "full",
      status: "confirmed",
      provider: "aihot",
      sourceUrl: "https://x.com/thsottiaux/status/2098685367058612394",
    });
    expect(signals[0].occurredAt).toBe("2026-09-12T08:09:00.000Z");
  });

  it("keeps announced reset credits out of the confirmed full-reset timeline", () => {
    const signals = __test__.normalizeAihotPayload({
      checkedAt: "2026-09-05T12:00:00+08:00",
      events: [
        {
          id: "credit-2026-09-05",
          type: "reset_credit",
          status: "announced",
          announcedAt: "2026-09-05T11:00:00+08:00",
          posts: [{ url: "https://x.com/thsottiaux/status/2097000000000000000" }],
        },
      ],
    });

    expect(signals[0]).toMatchObject({
      kind: "banked",
      status: "detected",
      provider: "aihot",
    });
  });
});
