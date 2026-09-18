const DAY_MS = 86_400_000;
const MIN_INTERVALS = 5;
const PRIOR_STRENGTH = 6;
const MIN_DISPLAY_PROBABILITY = 0.03;
const MAX_DISPLAY_PROBABILITY = 0.85;

export type ResetForecastLevel =
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "very-high"
  | "insufficient";

export type ResetForecastConfidence = "very-low" | "low" | "medium" | "high";

export interface ResetForecast {
  probability: number | null;
  level: ResetForecastLevel;
  confidence: ResetForecastConfidence;
  sampleSize: number;
  intervalCount: number;
  daysSinceLastReset: number | null;
  typicalIntervalDays: number | null;
  historicalPercentile: number | null;
  model: {
    empiricalHazard: number | null;
    empiricalEvents: number;
    empiricalSurvivors: number;
    weibullHazard: number | null;
    weibullShape: number | null;
    weibullScaleDays: number | null;
  };
}

interface WeibullFit {
  shape: number;
  scale: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function fitWeibullMle(values: number[]): WeibullFit | null {
  if (values.length < 2 || values.some((value) => !Number.isFinite(value) || value <= 0)) {
    return null;
  }

  const logs = values.map(Math.log);
  const meanLog = logs.reduce((sum, value) => sum + value, 0) / logs.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;

  // A stable empirical starting point for the Weibull shape. Extremely regular
  // reset histories naturally push shape upward, but we cap it to keep the fit
  // numerically stable and avoid implying deterministic schedules.
  let shape = coefficientOfVariation > 1e-6
    ? clamp(coefficientOfVariation ** -1.086, 0.25, 8)
    : 8;

  for (let iteration = 0; iteration < 40; iteration += 1) {
    const weighted = values.map((value, index) => {
      const xk = Math.exp(shape * logs[index]);
      return {
        xk,
        xkLog: xk * logs[index],
        xkLog2: xk * logs[index] * logs[index],
      };
    });

    const sumXk = weighted.reduce((sum, value) => sum + value.xk, 0);
    const sumXkLog = weighted.reduce((sum, value) => sum + value.xkLog, 0);
    const sumXkLog2 = weighted.reduce((sum, value) => sum + value.xkLog2, 0);
    if (!Number.isFinite(sumXk) || sumXk <= 0) return null;

    const ratio = sumXkLog / sumXk;
    const f = (1 / shape) + meanLog - ratio;
    const derivative = (-1 / (shape * shape))
      - ((sumXkLog2 * sumXk - sumXkLog * sumXkLog) / (sumXk * sumXk));

    if (!Number.isFinite(f) || !Number.isFinite(derivative) || Math.abs(derivative) < 1e-10) {
      break;
    }

    const next = clamp(shape - (f / derivative), 0.25, 8);
    if (Math.abs(next - shape) < 1e-7) {
      shape = next;
      break;
    }
    shape = next;
  }

  const meanPower = values.reduce((sum, value) => sum + (value ** shape), 0) / values.length;
  const scale = meanPower ** (1 / shape);
  if (!Number.isFinite(scale) || scale <= 0) return null;

  return { shape, scale };
}

function weibullConditionalProbability(ageDays: number, horizonDays: number, fit: WeibullFit) {
  const start = (Math.max(0, ageDays) / fit.scale) ** fit.shape;
  const end = ((Math.max(0, ageDays) + horizonDays) / fit.scale) ** fit.shape;
  return clamp(1 - Math.exp(-(end - start)), 0, 1);
}

function confidenceFor(intervalCount: number, survivors: number): ResetForecastConfidence {
  if (intervalCount < MIN_INTERVALS) return "very-low";

  let rank = intervalCount >= 30 ? 3 : intervalCount >= 12 ? 2 : intervalCount >= 7 ? 1 : 0;
  if (survivors < 3) rank = Math.min(rank, 0);
  else if (survivors < 5) rank = Math.min(rank, 1);

  return (["very-low", "low", "medium", "high"] as const)[rank];
}

function levelFor(probability: number | null): ResetForecastLevel {
  if (probability === null) return "insufficient";
  if (probability < 0.2) return "very-low";
  if (probability < 0.4) return "low";
  if (probability < 0.6) return "medium";
  if (probability < 0.8) return "high";
  return "very-high";
}

export function buildCodexResetForecast(
  resetTimes: string[],
  now = new Date(),
  horizonDays = 1,
): ResetForecast {
  const nowMs = now.getTime();
  const timestamps = [...new Set(
    resetTimes
      .map((value) => Date.parse(value))
      .filter((value) => Number.isFinite(value) && value <= nowMs),
  )].sort((a, b) => a - b);

  const intervals = timestamps.slice(1)
    .map((timestamp, index) => (timestamp - timestamps[index]) / DAY_MS)
    .filter((value) => Number.isFinite(value) && value > 0);

  const latest = timestamps.at(-1) ?? null;
  const daysSinceLastReset = latest === null ? null : Math.max(0, (nowMs - latest) / DAY_MS);
  const typicalIntervalDays = median(intervals);

  const baseModel = {
    empiricalHazard: null as number | null,
    empiricalEvents: 0,
    empiricalSurvivors: 0,
    weibullHazard: null as number | null,
    weibullShape: null as number | null,
    weibullScaleDays: null as number | null,
  };

  if (daysSinceLastReset === null || intervals.length < MIN_INTERVALS) {
    return {
      probability: null,
      level: "insufficient",
      confidence: "very-low",
      sampleSize: timestamps.length,
      intervalCount: intervals.length,
      daysSinceLastReset,
      typicalIntervalDays,
      historicalPercentile: daysSinceLastReset === null || !intervals.length
        ? null
        : intervals.filter((value) => value <= daysSinceLastReset).length / intervals.length,
      model: baseModel,
    };
  }

  const fit = fitWeibullMle(intervals);
  if (!fit) {
    return {
      probability: null,
      level: "insufficient",
      confidence: "very-low",
      sampleSize: timestamps.length,
      intervalCount: intervals.length,
      daysSinceLastReset,
      typicalIntervalDays,
      historicalPercentile: intervals.filter((value) => value <= daysSinceLastReset).length / intervals.length,
      model: baseModel,
    };
  }

  const weibullHazard = weibullConditionalProbability(daysSinceLastReset, horizonDays, fit);
  const empiricalSurvivors = intervals.filter((value) => value >= daysSinceLastReset).length;
  const empiricalEvents = intervals.filter(
    (value) => value >= daysSinceLastReset && value < daysSinceLastReset + horizonDays,
  ).length;
  const empiricalHazard = empiricalSurvivors > 0 ? empiricalEvents / empiricalSurvivors : null;

  const smoothed = empiricalSurvivors > 0
    ? (empiricalEvents + PRIOR_STRENGTH * weibullHazard) / (empiricalSurvivors + PRIOR_STRENGTH)
    : weibullHazard;
  const probability = clamp(smoothed, MIN_DISPLAY_PROBABILITY, MAX_DISPLAY_PROBABILITY);
  const historicalPercentile = intervals.filter((value) => value <= daysSinceLastReset).length / intervals.length;

  return {
    probability,
    level: levelFor(probability),
    confidence: confidenceFor(intervals.length, empiricalSurvivors),
    sampleSize: timestamps.length,
    intervalCount: intervals.length,
    daysSinceLastReset,
    typicalIntervalDays,
    historicalPercentile,
    model: {
      empiricalHazard,
      empiricalEvents,
      empiricalSurvivors,
      weibullHazard,
      weibullShape: fit.shape,
      weibullScaleDays: fit.scale,
    },
  };
}
