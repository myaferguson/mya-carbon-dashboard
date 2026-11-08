import { describe, expect, it } from "vitest";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";
import { co2PerCup, findCleanestUpcomingPeriod } from "../src/utils/tea";

function period(
  from: string,
  to: string,
  forecast: number,
  actual: number | null = null,
): HalfHourPeriod {
  return { from, to, forecast, actual, index: "moderate" };
}

const early = period("2026-05-16T04:00Z", "2026-05-16T04:30Z", 50, 40);
const current = period("2026-05-16T12:00Z", "2026-05-16T12:30Z", 150, 140);
const later = period("2026-05-16T15:00Z", "2026-05-16T15:30Z", 120);
const evening = period("2026-05-16T19:00Z", "2026-05-16T19:30Z", 180);

const NOW = new Date("2026-05-16T12:10Z");

describe("findCleanestUpcomingPeriod", () => {
  it("ignores cleaner periods that have already finished", () => {
    expect(
      findCleanestUpcomingPeriod([early, current, later, evening], NOW),
    ).toBe(later);
  });

  it("includes the current period", () => {
    const cleanCurrent = period("2026-05-16T12:00Z", "2026-05-16T12:30Z", 90);
    expect(
      findCleanestUpcomingPeriod([early, cleanCurrent, later], NOW),
    ).toBe(cleanCurrent);
  });

  it("prefers the actual value over the forecast", () => {
    // Forecast says 200 but actual was 100, so it beats `later` (120).
    const actualBetter = period("2026-05-16T12:00Z", "2026-05-16T12:30Z", 200, 100);
    expect(findCleanestUpcomingPeriod([actualBetter, later], NOW)).toBe(
      actualBetter,
    );
  });

  it("returns null when every period has finished", () => {
    expect(
      findCleanestUpcomingPeriod([early, current], new Date("2026-05-16T23:00Z")),
    ).toBeNull();
  });
});

describe("co2PerCup", () => {
  it("multiplies intensity by 0.075 kWh per cup", () => {
    expect(co2PerCup(200)).toBeCloseTo(15);
    expect(co2PerCup(0)).toBe(0);
  });
});
