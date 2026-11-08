import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationProvider } from "../src/context/LocationProvider";
import { useLocationContext } from "../src/context/locationContext";
import { createQueryWrapper } from "./support/queryWrapper";

function Probe() {
  const { outcode, setOutcode, regionLoading } = useLocationContext();
  const location = useLocation();
  return (
    <>
      <p data-testid="outcode">{outcode ?? "none"}</p>
      <p data-testid="search">{location.search}</p>
      <p data-testid="loading">{String(regionLoading)}</p>
      <button onClick={() => setOutcode("EH1")}>set EH1</button>
      <button onClick={() => setOutcode(null)}>clear</button>
    </>
  );
}

function renderAt(url: string) {
  const QueryWrapper = createQueryWrapper();
  return render(
    <QueryWrapper>
      <MemoryRouter initialEntries={[url]}>
        <LocationProvider>
          <Probe />
        </LocationProvider>
      </MemoryRouter>
    </QueryWrapper>,
  );
}

describe("LocationProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    // Regional requests are not under test here; never resolve them.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts national with no URL param or saved postcode", () => {
    renderAt("/");
    expect(screen.getByTestId("outcode")).toHaveTextContent("none");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses a saved postcode and adds it to the URL", () => {
    localStorage.setItem("postcode", "M1");
    renderAt("/");
    expect(screen.getByTestId("outcode")).toHaveTextContent("M1");
    expect(screen.getByTestId("search")).toHaveTextContent("?postcode=M1");
  });

  it("prefers the URL over the saved postcode, and tidies it", () => {
    localStorage.setItem("postcode", "M1");
    renderAt("/?postcode=sw1a%201aa");
    expect(screen.getByTestId("outcode")).toHaveTextContent("SW1A");
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.carbonintensity.org.uk/regional/postcode/SW1A",
    );
  });

  it("writes changes to localStorage and the URL, and clears both", async () => {
    renderAt("/tea");

    await userEvent.click(screen.getByRole("button", { name: "set EH1" }));
    expect(localStorage.getItem("postcode")).toBe("EH1");
    expect(screen.getByTestId("search")).toHaveTextContent("?postcode=EH1");

    await userEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(localStorage.getItem("postcode")).toBeNull();
    expect(screen.getByTestId("search")).toBeEmptyDOMElement();
  });
});
