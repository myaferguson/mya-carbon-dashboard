type ErrorCardProps = {
  message: string;
  onRetry?: () => void;
};

/** An error in place of a card, with a way to try again. */
export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--index-very-high-border)] bg-[var(--index-very-high-bg)] px-5 py-4"
    >
      <p className="text-[var(--text)]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--muted)]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
