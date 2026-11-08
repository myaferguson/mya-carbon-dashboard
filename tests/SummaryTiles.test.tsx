import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CleanestTile, NowTile, StatusTile } from "../src/components/SummaryTiles";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";

const local = (d: number, h: number, m: number): string =>
  new Date(2026, 4, d, h, m).toISOString();
const NOW = new Date(2026, 4, 16, 22, 10);

function period(from: string, to: string, forecast: number): HalfHourPeriod {
  return { from, to, forecast, actual: null, index: "moderate" };
}

const current = {
  from: local(16, 22, 0),
  to: local(16, 22, 30),
  forecast: 200,
  actual: 200,
  index: "high" as const,
};
const cleanerTomorrow = [
  period(local(16, 22, 0), local(16, 22, 30), 200),
  period(local(17, 3, 30), local(17, 4, 0), 120),
];

describe("StatusTile", () => {
  it("states the level, the area and when it will be cleaner", () => {
    render(<StatusTile current={current} periods={cleanerTomorrow} areaName="London" now={NOW} />);
    expect(screen.getByText("high right now in London")).toBeInTheDocument();
    expect(screen.getByText(/It'll be 40% cleaner at 03:30 tomorrow/)).toBeInTheDocument();
  });

  it("says now is the best time when nothing later is cleaner", () => {
    render(
      <StatusTile
        current={current}
        periods={[
          period(local(16, 22, 0), local(16, 22, 30), 200),
          period(local(16, 22, 30), local(16, 23, 0), 260),
        ]}
        areaName={null}
        now={NOW}
      />,
    );
    expect(screen.getByText("high right now")).toBeInTheDocument();
    expect(screen.getByText(/cleanest it'll be for the next 24 hours/)).toBeInTheDocument();
  });
});

describe("NowTile", () => {
  it("shows the reading and whether it's actual or forecast", () => {
    render(<NowTile current={{ ...current, actual: null }} />);
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("Forecast only")).toBeInTheDocument();
  });
});

describe("CleanestTile", () => {
  it("shows the cleanest time ahead and how much cleaner it is", () => {
    render(<CleanestTile current={current} periods={cleanerTomorrow} now={NOW} />);
    expect(screen.getByText("03:30")).toBeInTheDocument();
    expect(screen.getByText(/tomorrow · 120 g/)).toBeInTheDocument();
    expect(screen.getByText(/40% cleaner/)).toBeInTheDocument();
  });
});
