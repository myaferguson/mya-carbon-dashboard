import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { IntensityTrendChart } from "../src/components/IntensityTrendChart";
import type { HalfHourPeriod } from "../src/types/dailyIntensity";

const periods: HalfHourPeriod[] = [
  { from: "2026-05-16T12:00Z", to: "2026-05-16T12:30Z", forecast: 200, actual: 190, index: "moderate" },
  { from: "2026-05-16T12:30Z", to: "2026-05-16T13:00Z", forecast: 120, actual: null, index: "low" },
];

describe("IntensityTrendChart", () => {
  it("describes the chart for screen readers", () => {
    render(<IntensityTrendChart periods={periods} />);
    expect(
      screen.getByRole("img", { name: /Lowest 120 gCO₂\/kWh .*highest 190 gCO₂\/kWh/ }),
    ).toBeInTheDocument();
  });

  it("shows the data as a table on request", async () => {
    render(<IntensityTrendChart periods={periods} />);
    const toggle = screen.getByRole("button", { name: "View as table" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 periods
    expect(rows[1]).toHaveTextContent("190");
    expect(rows[2]).toHaveTextContent("–");
    expect(screen.getByRole("button", { name: "Hide table" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
