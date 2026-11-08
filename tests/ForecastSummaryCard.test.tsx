import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForecastSummaryCard } from "../src/components/ForecastSummaryCard";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";

const local = (h: number, m: number): string =>
  new Date(2026, 4, 16, h, m).toISOString();

function period(from: string, to: string, forecast: number): HalfHourPeriod {
  return { from, to, forecast, actual: null, index: "moderate" };
}

const current = {
  from: local(22, 0),
  to: local(22, 30),
  forecast: 200,
  actual: 200,
  index: "high" as const,
};

describe("ForecastSummaryCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 4, 16, 22, 10));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("states the current level and when it will be cleaner", () => {
    const tomorrow = (h: number, m: number) =>
      new Date(2026, 4, 17, h, m).toISOString();
    render(
      <ForecastSummaryCard
        current={current}
        periods={[
          period(local(22, 0), local(22, 30), 200),
          period(tomorrow(3, 30), tomorrow(4, 0), 120),
        ]}
      />,
    );

    expect(screen.getByText("high right now · 200 gCO₂/kWh")).toBeInTheDocument();
    expect(
      screen.getByText(/It'll be 40% cleaner at 03:30 tomorrow/),
    ).toBeInTheDocument();
  });

  it("says now is the best time when nothing later is cleaner", () => {
    render(
      <ForecastSummaryCard
        current={current}
        periods={[
          period(local(22, 0), local(22, 30), 200),
          period(local(22, 30), local(23, 0), 260),
        ]}
      />,
    );

    expect(
      screen.getByText(/cleanest it'll be for the next 24 hours/),
    ).toBeInTheDocument();
  });
});
