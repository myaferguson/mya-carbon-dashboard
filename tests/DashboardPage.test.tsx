import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "../src/pages/DashboardPage";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";

// 22:00 local tonight, then 24h of half hours. Cleanest stretch: 02:00-04:00.
const START = new Date(2026, 4, 16, 22, 0).getTime();
const HALF_HOUR = 30 * 60 * 1000;
const periods: HalfHourPeriod[] = Array.from({ length: 48 }, (_, i) => {
  const forecast = i >= 8 && i < 12 ? 100 : 300;
  return {
    from: new Date(START + i * HALF_HOUR).toISOString(),
    to: new Date(START + (i + 1) * HALF_HOUR).toISOString(),
    forecast,
    actual: null,
    index: forecast === 100 ? "low" : "high",
  };
});

const forecastResult = vi.hoisted(() => ({
  value: { loading: false, error: null as string | null, data: null as unknown },
}));

vi.mock("../src/hooks/useIntensityForecast", () => ({
  useIntensityForecast: () => forecastResult.value,
}));
vi.mock("../src/hooks/useCarbonIntensity", () => ({
  useCarbonIntensity: () => ({
    loading: false,
    error: null,
    data: {
      from: new Date(START).toISOString(),
      to: new Date(START + HALF_HOUR).toISOString(),
      forecast: 300,
      actual: 300,
      index: "high",
    },
  }),
}));
vi.mock("../src/hooks/useGenerationMix", () => ({
  useGenerationMix: () => ({ loading: false, error: null, data: { sources: [] } }),
}));
vi.mock("../src/hooks/useRegions", () => ({
  useRegions: () => ({ loading: false, error: null, data: null }),
}));
// The chart is lazy-loaded Recharts; it has its own tests.
vi.mock("../src/components/IntensityTrendChart", () => ({
  IntensityTrendChart: ({ highlight }: { highlight: { start: string } | null }) => (
    <p data-testid="chart-highlight">{highlight?.start ?? "none"}</p>
  ),
}));

function Search() {
  return <p data-testid="search">{useLocation().search}</p>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <DashboardPage />
      <Search />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 4, 16, 22, 10));
    forecastResult.value = { loading: false, error: null, data: periods };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults the planner to a kettle and shows the per-cup figure", () => {
    renderAt("/");
    expect(screen.getByRole("radio", { name: /Kettle/ })).toBeChecked();
    expect(screen.getByTestId("planner-start")).toHaveTextContent("Start at 02:00");
    // 300 g/kWh × 0.075 kWh = 22.5 g.
    expect(screen.getByTestId("kettle-note")).toHaveTextContent("22.5 g CO₂");
  });

  it("recommends the cleanest 2-hour slot for a washing machine", async () => {
    renderAt("/?appliance=washing-machine");

    expect(screen.getByTestId("planner-start")).toHaveTextContent("Start at 02:00");
    expect(screen.getByText(/done by 04:00 tomorrow/)).toBeInTheDocument();
    // 1 kWh: 100 g at the best time vs 300 g now.
    expect(screen.getByText("≈100 g CO₂")).toBeInTheDocument();
    expect(screen.getByText("≈300 g CO₂")).toBeInTheDocument();
    expect(screen.getByTestId("planner-saving")).toHaveTextContent("67%");
    // The same window is outlined on the chart.
    expect(await screen.findByTestId("chart-highlight")).toHaveTextContent(
      new Date(START + 8 * HALF_HOUR).toISOString(),
    );
  });

  it("reads the plan from the URL and keeps changes in it", async () => {
    const user = userEvent.setup();
    renderAt("/?appliance=ev&hours=2");

    expect(screen.getByRole("heading", { name: "Best time for: EV charge (2h)" })).toBeInTheDocument();
    expect(screen.getByTestId("planner-start")).toHaveTextContent("Start at 02:00");

    await user.click(screen.getByRole("radio", { name: /Dishwasher/ }));
    expect(screen.getByTestId("search")).toHaveTextContent("?appliance=dishwasher");
  });

  it("explains when nothing fits before the finish time", () => {
    // At 23:40 an 8-hour charge can't finish by 07:00.
    vi.setSystemTime(new Date(2026, 4, 16, 23, 40));
    renderAt("/?appliance=ev&hours=8&by=07:00");

    expect(screen.getByTestId("planner-no-window")).toHaveTextContent(
      "There isn't a 8-hour slot that finishes by 07:00 tomorrow",
    );
  });

  it("shows an error with Retry when the forecast fails", () => {
    forecastResult.value = {
      loading: false,
      error: "Could not load the intensity forecast.",
      data: null,
    };
    renderAt("/");

    expect(screen.getByText("Could not load the intensity forecast.")).toBeInTheDocument();
    expect(screen.getByText("Waiting for the forecast…")).toBeInTheDocument();
  });
});
