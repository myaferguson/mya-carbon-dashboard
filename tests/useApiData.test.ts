import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useApiData } from "../src/hooks/useApiData";

const URL = "https://example.test/data";
const ERROR_MESSAGE = "Could not load test data.";
const double = (json: { value: number }): number => json.value * 2;

describe("useApiData", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches the url and applies the transform", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: 21 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useApiData(URL, double, ERROR_MESSAGE),
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(URL);
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it("shows the friendly message and logs the real error on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    );

    const { result } = renderHook(() =>
      useApiData(URL, double, ERROR_MESSAGE),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(ERROR_MESSAGE);
    expect(consoleError).toHaveBeenCalledWith(
      `Failed to fetch ${URL}:`,
      new Error("API returned 500: Internal Server Error"),
    );
  });

  it("shows the friendly message when the request is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { result } = renderHook(() =>
      useApiData(URL, double, ERROR_MESSAGE),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(ERROR_MESSAGE);
  });
});
