import type { HalfHourPeriod } from "../types/dailyIntensity";

/** A ~3kW kettle boiling one cup for ~1.5 minutes. */
export const KWH_PER_CUP: number = 0.075;

/** Grams of CO₂ for one cup of tea at the given intensity (gCO₂/kWh). */
export function co2PerCup(intensity: number): number {
  return intensity * KWH_PER_CUP;
}

/** The best available intensity value for a period: actual if known, otherwise forecast. */
export function periodIntensity(period: HalfHourPeriod): number {
  return period.actual ?? period.forecast;
}

export type BestWindow = {
  /** ISO start of the first half hour in the window. */
  start: string;
  /** ISO end of the last half hour in the window. */
  end: string;
  /** Mean intensity across the window, in gCO₂/kWh. */
  avgIntensity: number;
  periods: HalfHourPeriod[];
};

type FindBestWindowOptions = {
  now?: Date;
  /** The window must finish at or before this time. */
  deadline?: Date;
};

const time = (iso: string): number => new Date(iso).getTime();

/**
 * Finds the run of `slots` consecutive half-hour periods with the lowest
 * average intensity, considering only periods that haven't finished yet
 * (the current one and later). Periods must be back-to-back: a gap in the
 * data breaks a window. Ties go to the earliest window.
 *
 * @returns The best window, or null if no run of that length fits.
 */
export function findBestWindow(
  periods: HalfHourPeriod[],
  slots: number,
  { now = new Date(), deadline }: FindBestWindowOptions = {},
): BestWindow | null {
  if (slots < 1) return null;

  const upcoming: HalfHourPeriod[] = periods
    .filter((p) => time(p.to) > now.getTime())
    .filter((p) => !deadline || time(p.to) <= deadline.getTime())
    .sort((a, b) => time(a.from) - time(b.from));

  let best: BestWindow | null = null;

  for (let i = 0; i + slots <= upcoming.length; i++) {
    const window: HalfHourPeriod[] = upcoming.slice(i, i + slots);

    const contiguous: boolean = window.every(
      (p, j) => j === 0 || time(p.from) === time(window[j - 1].to),
    );
    if (!contiguous) continue;

    const avgIntensity: number =
      window.reduce((sum, p) => sum + periodIntensity(p), 0) / slots;

    if (!best || avgIntensity < best.avgIntensity) {
      best = {
        start: window[0].from,
        end: window[slots - 1].to,
        avgIntensity,
        periods: window,
      };
    }
  }

  return best;
}

/**
 * The window you'd get by starting right now: the current half hour and
 * the ones straight after it. Null if the data doesn't cover it.
 */
export function windowStartingNow(
  periods: HalfHourPeriod[],
  slots: number,
  now: Date = new Date(),
): BestWindow | null {
  const upcoming = periods
    .filter((p) => time(p.to) > now.getTime())
    .sort((a, b) => time(a.from) - time(b.from));
  // Only the first window is a candidate, so search just that slice.
  return findBestWindow(upcoming.slice(0, slots), slots, { now });
}

/**
 * The intensity index that best represents a window: the index of the
 * period whose value is closest to the window's average.
 */
export function representativeIndex(window: BestWindow): HalfHourPeriod["index"] {
  return [...window.periods].sort(
    (a, b) =>
      Math.abs(periodIntensity(a) - window.avgIntensity) -
      Math.abs(periodIntensity(b) - window.avgIntensity),
  )[0].index;
}

export type ForecastSummary =
  | { kind: "best-now" }
  | { kind: "flat" }
  | { kind: "cleaner-later"; start: string; percentCleaner: number };

/** Below this improvement, waiting isn't worth suggesting. */
const MIN_PERCENT_WORTH_WAITING = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Compares the current intensity with the cleanest half hour in the next
 * 24 hours and says whether it's worth waiting.
 */
export function summariseForecast(
  currentIntensity: number,
  periods: HalfHourPeriod[],
  now: Date = new Date(),
): ForecastSummary {
  const best = findBestWindow(periods, 1, {
    now,
    deadline: new Date(now.getTime() + DAY_MS),
  });
  if (!best || new Date(best.start).getTime() <= now.getTime()) {
    return { kind: "best-now" };
  }

  const percentCleaner: number =
    currentIntensity > 0
      ? Math.round(
          ((currentIntensity - best.avgIntensity) / currentIntensity) * 100,
        )
      : 0;

  if (percentCleaner < MIN_PERCENT_WORTH_WAITING) return { kind: "flat" };
  return { kind: "cleaner-later", start: best.start, percentCleaner };
}
