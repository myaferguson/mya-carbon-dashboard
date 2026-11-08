/** Formats an ISO date as a 24-hour en-GB clock time, e.g. "09:30". */
export function formatClock(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 1000 / 60);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return date.toLocaleString("en-GB");
}

export function formatTimeRange(fromIso: string, toIso: string): string {
  return `${formatClock(fromIso)}-${formatClock(toIso)}`;
}

/**
 * How a date relates to today: "" (today), "tomorrow", "yesterday",
 * or a short weekday such as "Wed".
 */
export function dayLabel(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const startOfDay = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round(
    (startOfDay(date) - startOfDay(now)) / (24 * 60 * 60 * 1000),
  );

  if (dayDiff === 0) return "";
  if (dayDiff === 1) return "tomorrow";
  if (dayDiff === -1) return "yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

/**
 * Clock time with a day hint when it isn't today, e.g. "03:30",
 * "03:30 tomorrow" or "03:30 Wed".
 */
export function formatClockWithDay(
  isoDate: string,
  now: Date = new Date(),
): string {
  const day = dayLabel(isoDate, now);
  return day ? `${formatClock(isoDate)} ${day}` : formatClock(isoDate);
}
