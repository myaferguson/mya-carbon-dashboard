import type { ReactNode } from "react";

type CardProps = {
  /** Small uppercase heading. Also labels the section for screen readers. */
  title?: ReactNode;
  /** Controls shown at the right of the heading row, e.g. a menu. */
  actions?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** The standard compact panel every part of the dashboard sits in. */
export function Card({ title, actions, id, className = "", children }: CardProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title && (
            <h2
              id={headingId}
              className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]"
            >
              {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
