import { describe, expect, it } from "vitest";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";
import {
  co2PerCup,
  findBestWindow,
  summariseForecast,
} from "../src/utils/planner";

const HALF_HOUR = 30 * 60 * 1000;
const BASE = Date.parse("2026-05-16T00:00Z");

/** Builds back-to-back half hours from 00:00Z with the given forecasts. */
function day(forecasts: number[]): HalfHourPeriod[] {
  return forecasts.map((forecast, i) => ({
    from: new Date(BASE + i * HALF_HOUR).toISOString(),
    to: new Date(BASE + (i + 1) * HALF_HOUR).toISOString(),
    forecast,
    actual: null,
    index: "moderate",
  }));
}

const at = (hhmm: string): Date => new Date(`2026-05-16T${hhmm}Z`);

describe("findBestWindow", () => {
  //               00:00 00:30 01:00 01:30 02:00 02:30 03:00 03:30
  const periods = day([50, 300, 200, 100, 120, 90, 400, 60]);

  it("finds the cleanest single half hour that hasn't finished", () => {
    // 00:00 (50) has already finished at 00:40.
    const best = findBestWindow(periods, 1, { now: at("00:40") });
    expect(best?.start).toBe("2026-05-16T03:30:00.000Z");
    expect(best?.avgIntensity).toBe(60);
  });

  it("includes the current half hour", () => {
    const best = findBestWindow(periods, 1, { now: at("00:10") });
    expect(best?.start).toBe("2026-05-16T00:00:00.000Z");
  });

  it("finds the cleanest run of consecutive half hours", () => {
    // 01:30-03:00 averages (100 + 120 + 90) / 3 = 103.3, the lowest run of 3.
    const best = findBestWindow(periods, 3, { now: at("00:40") });
    expect(best?.start).toBe("2026-05-16T01:30:00.000Z");
    expect(best?.end).toBe("2026-05-16T03:00:00.000Z");
    expect(best?.avgIntensity).toBeCloseTo(103.33, 1);
    expect(best?.periods).toHaveLength(3);
  });

  it("only uses windows that finish by the deadline", () => {
    const best = findBestWindow(periods, 1, {
      now: at("00:40"),
      deadline: at("02:30"),
    });
    expect(best?.start).toBe("2026-05-16T01:30:00.000Z");
  });

  it("does not join periods across a gap in the data", () => {
    const gappy = [...day([100, 100]), ...day([0, 0, 0, 0]).slice(3)];
    // Second chunk starts at 01:30 but the first ends at 01:00.
    expect(findBestWindow(gappy, 3, { now: at("00:00") })).toBeNull();
  });

  it("returns null when nothing fits", () => {
    expect(findBestWindow(periods, 1, { now: at("05:00") })).toBeNull();
    expect(findBestWindow(periods, 20, { now: at("00:00") })).toBeNull();
    expect(findBestWindow(periods, 0, { now: at("00:00") })).toBeNull();
  });

  it("prefers the actual value over the forecast", () => {
    const withActual = day([200, 120]);
    withActual[0].actual = 100;
    const best = findBestWindow(withActual, 1, { now: at("00:00") });
    expect(best?.start).toBe(withActual[0].from);
    expect(best?.avgIntensity).toBe(100);
  });
});

describe("summariseForecast", () => {
  it("says to wait when a later time is meaningfully cleaner", () => {
    const summary = summariseForecast(200, day([200, 200, 100]), at("00:10"));
    expect(summary).toEqual({
      kind: "cleaner-later",
      start: "2026-05-16T01:00:00.000Z",
      percentCleaner: 50,
    });
  });

  it("says now is best when the current half hour is cleanest", () => {
    expect(summariseForecast(80, day([80, 200, 300]), at("00:10"))).toEqual({
      kind: "best-now",
    });
  });

  it("says it stays the same when the improvement is under 5%", () => {
    expect(summariseForecast(200, day([200, 196]), at("00:10"))).toEqual({
      kind: "flat",
    });
  });
});

describe("co2PerCup", () => {
  it("multiplies intensity by 0.075 kWh per cup", () => {
    expect(co2PerCup(200)).toBeCloseTo(15);
    expect(co2PerCup(0)).toBe(0);
  });
});
