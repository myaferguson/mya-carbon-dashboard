import { useEffect, useState } from "react";

export type ApiDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetches JSON from `url` once on mount and maps it with `transform`.
 *
 * `transform` must be stable between renders (define it at module level),
 * otherwise the request will repeat on every render.
 *
 * On failure the real error is logged and `errorMessage` is exposed as `error`.
 */
export function useApiData<TJson, TData>(
  url: string,
  transform: (json: TJson) => TData,
  errorMessage: string,
): ApiDataResult<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData(): Promise<void> {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }
        const json = (await response.json()) as TJson;

        if (cancelled) return;

        setData(transform(json));
      } catch (err) {
        if (cancelled) return;
        console.error(`Failed to fetch ${url}:`, err);
        setError(errorMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [url, transform, errorMessage]);

  return { data, loading, error };
}
