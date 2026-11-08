import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  LevelsExplainer,
  UnitExplainer,
} from "../src/components/IntensityExplainers";

describe("explainers", () => {
  it("explains the unit when the info button is pressed", async () => {
    render(<UnitExplainer />);
    await userEvent.click(
      screen.getByRole("button", { name: "What does gCO₂/kWh mean?" }),
    );
    expect(screen.getByText(/Grams of CO₂ per kilowatt-hour/)).toBeInTheDocument();
  });

  it("lists all five levels", async () => {
    render(<LevelsExplainer />);
    await userEvent.click(
      screen.getByRole("button", { name: "What do the intensity levels mean?" }),
    );
    for (const level of ["very low", "low", "moderate", "high", "very high"]) {
      expect(screen.getByText(level, { exact: true })).toBeInTheDocument();
    }
  });
});
