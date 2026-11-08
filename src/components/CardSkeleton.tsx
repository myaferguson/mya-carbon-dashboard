type CardSkeletonProps = {
  /** Read out by screen readers, e.g. "Loading current intensity". */
  label: string;
  /** Height of the main block, roughly matching the card it stands in for. */
  bodyHeight?: string;
};

/** A placeholder shaped like a card, shown while its data loads. */
export function CardSkeleton({ label, bodyHeight = "h-16" }: CardSkeletonProps) {
  return (
    <div
      role="status"
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8"
    >
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse space-y-4">
        <div className="h-3 w-32 rounded bg-[var(--border)]" />
        <div className={`${bodyHeight} w-full rounded-lg bg-[var(--border)]`} />
        <div className="h-3 w-48 rounded bg-[var(--border)]" />
      </div>
    </div>
  );
}
