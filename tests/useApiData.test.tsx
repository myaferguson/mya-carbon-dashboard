import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "./support/queryWrapper";
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

    const { result } = renderHook(() => useApiData(URL, double, ERROR_MESSAGE), {
      wrapper: createQueryWrapper(),
    });

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

    const { result } = renderHook(() => useApiData(URL, double, ERROR_MESSAGE), {
      wrapper: createQueryWrapper(),
    });

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

    const { result } = renderHook(() => useApiData(URL, double, ERROR_MESSAGE), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(ERROR_MESSAGE);
  });

  it("does nothing when the url is null", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useApiData(null, double, ERROR_MESSAGE), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current).toEqual({ data: null, loading: false, error: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("drops old data and refetches when the url changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: url.endsWith("a") ? 1 : 2 }),
        }),
      ),
    );

    const { result, rerender } = renderHook(
      ({ url }) => useApiData(url, double, ERROR_MESSAGE),
      {
        initialProps: { url: "https://example.test/a" },
        wrapper: createQueryWrapper(),
      },
    );
    await waitFor(() => expect(result.current.data).toBe(2));

    rerender({ url: "https://example.test/b" });
    expect(result.current).toMatchObject({ data: null, loading: true, error: null });
    await waitFor(() => expect(result.current.data).toBe(4));
  });

  it("keeps showing old data while the next half hour's data loads", async () => {
    let resolveSecond: (v: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ value: 1 }) })
        .mockReturnValueOnce(new Promise((r) => (resolveSecond = r))),
    );

    const { result, rerender } = renderHook(
      ({ url }) => useApiData(url, double, ERROR_MESSAGE),
      {
        initialProps: { url: "https://example.test/x/2026-05-16T12:00Z" },
        wrapper: createQueryWrapper(),
      },
    );
    await waitFor(() => expect(result.current.data).toBe(2));

    rerender({ url: "https://example.test/x/2026-05-16T12:30Z" });
    expect(result.current).toMatchObject({ data: 2, loading: false });

    resolveSecond({ ok: true, json: () => Promise.resolve({ value: 5 }) });
    await waitFor(() => expect(result.current.data).toBe(10));
  });
});
