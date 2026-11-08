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

/**
 * Finds the cleanest half-hour period that hasn't finished yet
 * (the current period or any later one).
 * @returns The cleanest upcoming period, or null if every period has ended.
 */
export function findCleanestUpcomingPeriod(
  periods: HalfHourPeriod[],
  now: Date = new Date(),
): HalfHourPeriod | null {
  const upcoming: HalfHourPeriod[] = periods.filter(
    (period) => new Date(period.to).getTime() > now.getTime(),
  );
  if (upcoming.length === 0) return null;

  return upcoming.reduce((best, current) =>
    periodIntensity(current) < periodIntensity(best) ? current : best,
  );
}
