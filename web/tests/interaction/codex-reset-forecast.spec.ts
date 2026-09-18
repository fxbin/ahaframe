import { expect, test } from "@playwright/test";
import { buildCodexResetForecast } from "../../lib/codex-reset-forecast";

function iso(day: number) {
  return new Date(Date.UTC(2026, 0, day)).toISOString();
}

test("forecast stays hidden until enough confirmed intervals exist", () => {
  const forecast = buildCodexResetForecast(
    [iso(1), iso(4), iso(8), iso(12), iso(17)],
    new Date(Date.UTC(2026, 0, 20)),
  );

  expect(forecast.intervalCount).toBe(4);
  expect(forecast.probability).toBeNull();
  expect(forecast.level).toBe("insufficient");
  expect(forecast.confidence).toBe("very-low");
});

test("forecast produces a bounded deterministic 24-hour probability", () => {
  const forecast = buildCodexResetForecast(
    [iso(1), iso(4), iso(8), iso(13), iso(17), iso(23), iso(28), iso(34)],
    new Date(Date.UTC(2026, 1, 8, 12)),
  );

  expect(forecast.intervalCount).toBe(7);
  expect(forecast.probability).not.toBeNull();
  expect(forecast.probability!).toBeGreaterThanOrEqual(0.03);
  expect(forecast.probability!).toBeLessThanOrEqual(0.85);
  expect(forecast.model.weibullShape).toBeGreaterThan(0);
  expect(forecast.model.weibullScaleDays).toBeGreaterThan(0);
  expect(forecast.historicalPercentile).toBeGreaterThanOrEqual(0);
  expect(forecast.historicalPercentile).toBeLessThanOrEqual(1);
});

test("duplicate and future timestamps do not inflate the sample", () => {
  const now = new Date(Date.UTC(2026, 0, 30));
  const forecast = buildCodexResetForecast(
    [iso(1), iso(1), iso(5), iso(10), iso(15), iso(20), iso(25), iso(35)],
    now,
  );

  expect(forecast.sampleSize).toBe(6);
  expect(forecast.intervalCount).toBe(5);
  expect(forecast.daysSinceLastReset).toBeCloseTo(5, 8);
});
