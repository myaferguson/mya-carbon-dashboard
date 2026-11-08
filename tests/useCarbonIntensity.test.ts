import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCarbonIntensity } from "../src/hooks/useCarbonIntensity";

const apiResponse = {
  data: [
    {
      from: "2026-05-16T12:00Z",
      to: "2026-05-16T12:30Z",
      intensity: { forecast: 120, actual: 115, index: "moderate" },
    },
  ],
};

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useCarbonIntensity", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts in a loading state", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    const { result } = renderHook(() => useCarbonIntensity());

    expect(result.current).toEqual({ data: null, loading: true, error: null });
  });

  it("fetches and maps the current intensity period", async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const { result } = renderHook(() => useCarbonIntensity());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.carbonintensity.org.uk/intensity",
    );
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({
      from: "2026-05-16T12:00Z",
      to: "2026-05-16T12:30Z",
      forecast: 120,
      actual: 115,
      index: "moderate",
    });
  });

  it("keeps a null actual value when only a forecast is available", async () => {
    mockFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              ...apiResponse.data[0],
              intensity: { forecast: 90, actual: null, index: "low" },
            },
          ],
        }),
    });

    const { result } = renderHook(() => useCarbonIntensity());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.actual).toBeNull();
    expect(result.current.data?.forecast).toBe(90);
  });

  it("reports an error when the API returns a non-OK status", async () => {
    mockFetch({ ok: false, status: 503, statusText: "Service Unavailable" });

    const { result } = renderHook(() => useCarbonIntensity());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Could not load current intensity data.");
  });

  it("reports an error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));

    const { result } = renderHook(() => useCarbonIntensity());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Could not load current intensity data.");
  });
});
