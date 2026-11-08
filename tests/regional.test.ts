import { describe, expect, it } from "vitest";
import {
  regionalForecastUrl,
  toAllRegions,
  toRegionCurrent,
  toRegionalPeriods,
} from "../src/utils/regional";

const mix = [
  { fuel: "gas" as const, perc: 76.9 },
  { fuel: "wind" as const, perc: 23.1 },
];
const period = {
  from: "2026-11-08T22:00Z",
  to: "2026-11-08T22:30Z",
  intensity: { forecast: 313, index: "very high" as const },
  generationmix: mix,
};
const london = {
  regionid: 13,
  dnoregion: "UKPN London",
  shortname: "London",
  postcode: "SW1A",
};

describe("regionalForecastUrl", () => {
  it("builds the 48h postcode forecast url", () => {
    expect(regionalForecastUrl("SW1A", new Date("2026-11-08T22:32:10Z"))).toBe(
      "https://api.carbonintensity.org.uk/regional/intensity/2026-11-08T22:32Z/fw48h/postcode/SW1A",
    );
  });
});

describe("toRegionCurrent", () => {
  it("maps the postcode response to intensity and mix with no actual value", () => {
    expect(toRegionCurrent({ data: [{ ...london, data: [period] }] })).toEqual({
      id: 13,
      name: "London",
      intensity: {
        from: period.from,
        to: period.to,
        forecast: 313,
        actual: null,
        index: "very high",
      },
      mix: { from: period.from, to: period.to, sources: mix },
    });
  });
});

describe("toRegionalPeriods", () => {
  it("maps forecast periods with actual set to null", () => {
    expect(
      toRegionalPeriods({ data: { ...london, data: [period, period] } }),
    ).toEqual([
      { from: period.from, to: period.to, forecast: 313, actual: null, index: "very high" },
      { from: period.from, to: period.to, forecast: 313, actual: null, index: "very high" },
    ]);
  });
});

describe("toAllRegions", () => {
  const region = (regionid: number, shortname: string, forecast: number) => ({
    regionid,
    dnoregion: shortname,
    shortname,
    intensity: { forecast, index: "moderate" as const },
    generationmix: mix,
  });

  it("sorts local regions cleanest first and pulls out the GB figure", () => {
    const result = toAllRegions({
      data: [
        {
          from: period.from,
          to: period.to,
          regions: [
            region(7, "South Wales", 390),
            region(1, "North Scotland", 0),
            region(13, "London", 313),
            region(15, "England", 279),
            region(18, "GB", 279),
          ],
        },
      ],
    });

    expect(result.local.map((r) => r.name)).toEqual([
      "North Scotland",
      "London",
      "South Wales",
    ]);
    expect(result.gb).toEqual({ id: 18, name: "GB", forecast: 279, index: "moderate" });
  });
});

describe("unknown postcodes", () => {
  it("throw a clear error instead of a TypeError", () => {
    expect(() => toRegionalPeriods({ data: null })).toThrow(
      "No regional forecast for this postcode",
    );
    expect(() => toRegionCurrent({ data: [] })).toThrow(
      "No regional data for this postcode",
    );
  });
});

describe("empty responses", () => {
  it("toAllRegions returns no regions instead of crashing", () => {
    expect(toAllRegions({ data: [] })).toEqual({ local: [], gb: null });
  });
});
