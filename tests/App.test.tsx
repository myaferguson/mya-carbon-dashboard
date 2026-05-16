import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "../src/App";

// Mock app hooks so the component renders without performing network requests.
vi.mock("../src/hooks/useCarbonIntensity", () => {
  return {
    useCarbonIntensity: () => ({
      loading: false,
      error: null,
      data: {
        from: "2026-05-16T12:00:00Z",
        to: "2026-05-16T12:30:00Z",
        actual: 100,
        forecast: 110,
        index: "low",
      },
    }),
  };
});

vi.mock("../src/hooks/useGenerationMix", () => {
  return {
    useGenerationMix: () => ({
      loading: false,
      error: null,
      data: { sources: [] },
    }),
  };
});

describe("App", () => {
  it("renders the app header", () => {
    render(<App />);
    expect(screen.getByText("UK Carbon Intensity")).toBeInTheDocument();
  });
});
