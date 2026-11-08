import { describe, expect, it } from "vitest";
import {
  forecastUrl,
  startOfHalfHour,
  toHalfHourPeriods,
} from "../src/hooks/useIntensityForecast";

describe("forecastUrl", () => {
  it("requests 24 hours either side of now in the API's time format", () => {
    expect(forecastUrl(new Date("2026-11-08T22:32:45Z"))).toBe(
      "https://api.carbonintensity.org.uk/intensity/2026-11-07T22:32Z/2026-11-09T22:32Z",
    );
  });
});

describe("toHalfHourPeriods", () => {
  it("flattens the nested intensity object", () => {
    expect(
      toHalfHourPeriods({
        data: [
          {
            from: "2026-11-08T22:00Z",
            to: "2026-11-08T22:30Z",
            intensity: { forecast: 276, actual: null, index: "very high" },
          },
        ],
      }),
    ).toEqual([
      {
        from: "2026-11-08T22:00Z",
        to: "2026-11-08T22:30Z",
        forecast: 276,
        actual: null,
        index: "very high",
      },
    ]);
  });
});

describe("startOfHalfHour", () => {
  it("rounds down to :00 or :30", () => {
    expect(startOfHalfHour(new Date("2026-11-08T22:32:45Z")).toISOString()).toBe(
      "2026-11-08T22:30:00.000Z",
    );
    expect(startOfHalfHour(new Date("2026-11-08T22:29:59Z")).toISOString()).toBe(
      "2026-11-08T22:00:00.000Z",
    );
  });
});
