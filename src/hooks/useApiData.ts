import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type ApiDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Fetch again now, e.g. from a Retry button. */
  refetch?: () => void;
  /** When the data was last fetched (ms since epoch), or 0 if never. */
  updatedAt?: number;
};

/**
 * True when two urls differ only by their timestamps, i.e. the same data
 * for a later time. A different postcode or endpoint doesn't count.
 */
function sameEndpoint(previous: unknown, next: string | null): boolean {
  if (typeof previous !== "string" || next === null) return false;
  const strip = (u: string) => u.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z/g, "");
  return strip(previous) === strip(next);
}

/** The API publishes new figures every half hour. */
export const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Fetches JSON from `url` and maps it with `transform`, using TanStack
 * Query so the same url is fetched once and shared between components and
 * pages. Data refreshes every 30 minutes and when the tab regains focus.
 * Pass `null` as the url to skip fetching.
 *
 * Each url must always be used with the same `transform`, because the
 * cache is keyed by url.
 *
 * On failure the real error is logged and `errorMessage` is exposed as `error`.
 */
export function useApiData<TJson, TData>(
  url: string | null,
  transform: (json: TJson) => TData,
  errorMessage: string,
): ApiDataResult<TData> {
  const query = useQuery({
    queryKey: ["api", url],
    enabled: url !== null,
    queryFn: async (): Promise<TData> => {
      try {
        const response = await fetch(url as string);
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }
        return transform((await response.json()) as TJson);
      } catch (err) {
        console.error(`Failed to fetch ${url}:`, err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    // When the url moves on (e.g. the next half hour), keep showing the old
    // data until the new data arrives instead of flashing a loading state.
    placeholderData: (previous, previousQuery) =>
      sameEndpoint(previousQuery?.queryKey[1], url)
        ? keepPreviousData(previous)
        : undefined,
  });

  if (url === null) return { data: null, loading: false, error: null };
  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.isError ? errorMessage : null,
    refetch: () => void query.refetch(),
    updatedAt: query.dataUpdatedAt,
  };
}
