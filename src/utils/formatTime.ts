export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 1000 / 60);

  if (diffMs < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return date.toLocaleString("en-GB");
}

export function formatTimeRange(fromIso: string, toIso: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const from: string = new Date(fromIso).toLocaleTimeString("en-GB", opts);
  const to: string = new Date(toIso).toLocaleTimeString("en-GB", opts);
  return `${from}-${to}`;
}
