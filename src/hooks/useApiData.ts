import { useEffect, useState } from "react";

export type ApiDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type Settled<T> = {
  url: string;
  data: T | null;
  error: string | null;
};

/**
 * Fetches JSON from `url` and maps it with `transform`. Pass `null` as the
 * url to skip fetching. When the url changes, the old data is dropped and
 * the new url is fetched.
 *
 * `transform` must be stable between renders (define it at module level),
 * otherwise the request will repeat on every render.
 *
 * On failure the real error is logged and `errorMessage` is exposed as `error`.
 */
export function useApiData<TJson, TData>(
  url: string | null,
  transform: (json: TJson) => TData,
  errorMessage: string,
): ApiDataResult<TData> {
  // Results are tagged with the url they belong to, so a url change shows
  // as loading straight away without resetting state inside the effect.
  const [settled, setSettled] = useState<Settled<TData> | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    async function fetchData(fetchUrl: string): Promise<void> {
      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }
        const json = (await response.json()) as TJson;

        if (cancelled) return;
        setSettled({ url: fetchUrl, data: transform(json), error: null });
      } catch (err) {
        if (cancelled) return;
        console.error(`Failed to fetch ${fetchUrl}:`, err);
        setSettled({ url: fetchUrl, data: null, error: errorMessage });
      }
    }

    fetchData(url);
    return () => {
      cancelled = true;
    };
  }, [url, transform, errorMessage]);

  if (!url) return { data: null, loading: false, error: null };
  if (settled?.url !== url) return { data: null, loading: true, error: null };
  return { data: settled.data, loading: false, error: settled.error };
}
