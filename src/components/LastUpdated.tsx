import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useNow } from "../hooks/useNow";
import { formatRelativeTime } from "../utils/formatTime";

/** "Updated 5 min ago · Refresh", based on the newest data on the page. */
export function LastUpdated() {
  const queryClient = useQueryClient();
  const fetching: number = useIsFetching();
  // Re-render every minute so the relative time stays current.
  useNow();

  const newest: number = Math.max(
    0,
    ...queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.state.dataUpdatedAt),
  );

  return (
    <span className="ml-auto flex items-center gap-2 text-xs text-[var(--muted)]">
      <span aria-live="polite" data-testid="last-updated">
        {fetching > 0
          ? "Updating…"
          : newest > 0
            ? `Updated ${formatRelativeTime(new Date(newest).toISOString())}`
            : null}
      </span>
      <button
        type="button"
        onClick={() => void queryClient.invalidateQueries()}
        disabled={fetching > 0}
        className="rounded px-1.5 py-0.5 underline underline-offset-2 hover:text-[var(--text)] disabled:opacity-50"
      >
        Refresh
      </button>
    </span>
  );
}
