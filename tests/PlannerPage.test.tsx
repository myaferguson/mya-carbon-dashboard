import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlannerPage } from "../src/pages/PlannerPage";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";

// 22:00 local tonight, then 24h of half hours. Cleanest stretch: 02:00-04:00.
const START = new Date(2026, 4, 16, 22, 0).getTime();
const HALF_HOUR = 30 * 60 * 1000;
const forecastValues = Array.from({ length: 48 }, (_, i) =>
  i >= 8 && i < 12 ? 100 : 300,
);
const periods: HalfHourPeriod[] = forecastValues.map((forecast, i) => ({
  from: new Date(START + i * HALF_HOUR).toISOString(),
  to: new Date(START + (i + 1) * HALF_HOUR).toISOString(),
  forecast,
  actual: null,
  index: forecast === 100 ? "low" : "high",
}));

vi.mock("../src/hooks/useIntensityForecast", () => ({
  useIntensityForecast: () => ({ loading: false, error: null, data: periods }),
}));

function Search() {
  return <p data-testid="search">{useLocation().search}</p>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PlannerPage />
      <Search />
    </MemoryRouter>,
  );
}

describe("PlannerPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 4, 16, 22, 10));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("recommends the cleanest 2-hour slot for a washing machine by default", () => {
    renderAt("/planner");

    expect(screen.getByTestId("planner-start")).toHaveTextContent("Start at 02:00");
    expect(screen.getByText(/done by 04:00 tomorrow/)).toBeInTheDocument();
    // 1 kWh: 100 g at the best time vs 300 g now.
    expect(screen.getByText("≈100 g CO₂")).toBeInTheDocument();
    expect(screen.getByText("≈300 g CO₂")).toBeInTheDocument();
    expect(screen.getByTestId("planner-saving")).toHaveTextContent("67%");
    expect(screen.getByTestId("timeline-window")).toBeInTheDocument();
  });

  it("reads the plan from the URL and keeps changes in it", async () => {
    const user = userEvent.setup();
    renderAt("/planner?appliance=ev&hours=2");

    expect(
      screen.getByRole("heading", { name: "Best time for: EV charge (2h)" }),
    ).toBeInTheDocument();
    // Exactly the 02:00-04:00 low stretch.
    expect(screen.getByTestId("planner-start")).toHaveTextContent("Start at 02:00");

    await user.click(screen.getByRole("radio", { name: /Dishwasher/ }));
    expect(screen.getByTestId("search")).toHaveTextContent("?appliance=dishwasher");
  });

  it("explains when nothing fits before the finish time", () => {
    // At 23:40 an 8-hour charge can't finish by 07:00.
    vi.setSystemTime(new Date(2026, 4, 16, 23, 40));
    renderAt("/planner?appliance=ev&hours=8&by=07:00");

    expect(screen.getByTestId("planner-no-window")).toHaveTextContent(
      "There isn't a 8-hour slot that finishes by 07:00 tomorrow",
    );
  });
});
