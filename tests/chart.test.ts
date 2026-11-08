import { describe, expect, it } from "vitest";
import { describeTrend, toIndexBands } from "../src/utils/chart";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";
import type { IntensityIndex } from "../src/types/carbonIntensity";

const p = (from: string, to: string, index: IntensityIndex): HalfHourPeriod => ({
  from,
  to,
  index,
  forecast: 100,
  actual: null,
});

describe("toIndexBands", () => {
  it("merges back-to-back periods with the same index", () => {
    const bands = toIndexBands([
      p("2026-05-16T00:00Z", "2026-05-16T00:30Z", "low"),
      p("2026-05-16T00:30Z", "2026-05-16T01:00Z", "low"),
      p("2026-05-16T01:00Z", "2026-05-16T01:30Z", "high"),
    ]);

    expect(bands).toEqual([
      { index: "low", from: Date.parse("2026-05-16T00:00Z"), to: Date.parse("2026-05-16T01:00Z") },
      { index: "high", from: Date.parse("2026-05-16T01:00Z"), to: Date.parse("2026-05-16T01:30Z") },
    ]);
  });
});

describe("describeTrend", () => {
  it("summarises the range, lowest and highest points", () => {
    const now = new Date(2026, 4, 16, 9, 0);
    const iso = (h: number) => new Date(2026, 4, 16, h, 0).toISOString();
    const text = describeTrend(
      [
        { from: iso(10), to: iso(11), forecast: 200, actual: null, index: "moderate" },
        { from: iso(11), to: iso(12), forecast: 90, actual: null, index: "low" },
        { from: iso(12), to: iso(13), forecast: 300, actual: 310, index: "high" },
      ],
      now,
    );
    expect(text).toBe(
      "Line chart of carbon intensity from 10:00 to 13:00. Lowest 90 gCO₂/kWh at 11:00; highest 310 gCO₂/kWh at 12:00.",
    );
  });
});
