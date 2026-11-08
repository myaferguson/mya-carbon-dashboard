import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RegionComparisonCard } from "../src/components/RegionComparisonCard";
import {
  LocationContext,
  type LocationContextValue,
} from "../src/context/locationContext";
import type { AllRegions } from "../src/utils/regional";

const regions: AllRegions = {
  local: [
    { id: 1, name: "North Scotland", forecast: 0, index: "very low" },
    { id: 13, name: "London", forecast: 313, index: "very high" },
    { id: 7, name: "South Wales", forecast: 390, index: "very high" },
  ],
  gb: { id: 18, name: "GB", forecast: 279, index: "very high" },
};

function renderWith(value: Partial<LocationContextValue>) {
  const ctx: LocationContextValue = {
    outcode: null,
    setOutcode: () => {},
    region: null,
    regionLoading: false,
    regionError: null,
    ...value,
  };
  return render(
    <LocationContext.Provider value={ctx}>
      <RegionComparisonCard regions={regions} />
    </LocationContext.Provider>,
  );
}

describe("RegionComparisonCard", () => {
  it("invites a postcode and shows the range when none is set", () => {
    renderWith({});
    expect(
      screen.getByText(/North Scotland is at 0 g and South Wales at 390 g/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your postcode")).toBeInTheDocument();
  });

  it("highlights your region and compares it with GB", () => {
    renderWith({
      outcode: "SW1A",
      region: {
        id: 13,
        name: "London",
        intensity: {
          from: "",
          to: "",
          forecast: 313,
          actual: null,
          index: "very high",
        },
        mix: { from: "", to: "", sources: [] },
      },
    });

    expect(
      screen.getByText(/12% dirtier than the GB average/),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Regions, cleanest first" });
    const current = within(list)
      .getAllByRole("listitem")
      .find((li) => li.getAttribute("aria-current") === "true");
    expect(current).toHaveTextContent("London");
    expect(screen.queryByLabelText("Your postcode")).not.toBeInTheDocument();
  });
});
