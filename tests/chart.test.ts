import { describe, expect, it } from "vitest";
import { toIndexBands } from "../src/utils/chart";
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
