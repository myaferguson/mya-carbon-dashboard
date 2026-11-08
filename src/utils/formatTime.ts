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
