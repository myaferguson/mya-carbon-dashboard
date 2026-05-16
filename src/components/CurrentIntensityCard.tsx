import type { CarbonIntensity } from "../types/carbonIntensity";
import { formatTimeRange } from "../utils/formatTime";

type CurrentIntensityCardProps = {
  data: CarbonIntensity;
};

export function CurrentIntensityCard({
  data,
}: CurrentIntensityCardProps): React.ReactElement {
  const value: number = data.actual ?? data.forecast;
  const isActual: boolean = data.actual !== null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
        Current intensity
      </p>
      <p className="text-[var(--muted)] text-xs">
        {formatTimeRange(data.from, data.to)}
      </p>
      <p className="mt-2">
        <span className="text-5xl sm:text-6xl font-semibold">{value}</span>
        <span className="ml-2 text-[var(--muted)] text-lg">gCO₂/kWh</span>
      </p>

      <div className="mt-6 flex items-center gap-3">
        <IndexBadge index={data.index} />
        <span className="text-[var(--muted)] text-sm">
          {isActual ? "Actual" : "Forecast only"}
        </span>
      </div>
    </div>
  );
}

function IndexBadge({
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
      className={`index-badge ${index.replace(" ", "-")} px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${colors[index]}`}
    >
      {index}
    </span>
  );
}
