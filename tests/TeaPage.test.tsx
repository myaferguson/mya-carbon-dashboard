import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TeaPage } from "../src/pages/TeaPage";

vi.mock("../src/hooks/useCarbonIntensity", () => ({
  useCarbonIntensity: () => ({
    loading: false,
    error: null,
    data: {
      from: "2026-05-16T12:00Z",
      to: "2026-05-16T12:30Z",
      actual: 100,
      forecast: 110,
      index: "low",
    },
  }),
}));

vi.mock("../src/hooks/useIntensityForecast", () => ({
  useIntensityForecast: () => ({
    loading: false,
    error: "Could not load the intensity forecast.",
    data: null,
  }),
}));

describe("TeaPage", () => {
  it("shows an error when the forecast fails to load", () => {
    render(
      <MemoryRouter>
        <TeaPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Could not load the intensity forecast."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Best time to brew/)).not.toBeInTheDocument();
  });
});
