import type { CarbonIntensity } from "../types/carbonIntensity";

export function IndexBadge({
  index,
}: {
  index: CarbonIntensity["index"];
}): React.ReactElement {
  const colors: Record<CarbonIntensity["index"], string> = {
    "very low":
      "bg-[var(--index-very-low-bg)] text-[var(--index-very-low-text)] border-[var(--index-very-low-border)]",
    low: "bg-[var(--index-low-bg)] text-[var(--index-low-text)] border-[var(--index-low-border)]",
    moderate:
      "bg-[var(--index-moderate-bg)] text-[var(--index-moderate-text)] border-[var(--index-moderate-border)]",
    high: "bg-[var(--index-high-bg)] text-[var(--index-high-text)] border-[var(--index-high-border)]",
    "very high":
      "bg-[var(--index-very-high-bg)] text-[var(--index-very-high-text)] border-[var(--index-very-high-border)]",
  };

  return (
    <span
      className={`index-badge ${index.replace(" ", "-")} shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${colors[index]}`}
    >
      {index}
    </span>
  );
}
