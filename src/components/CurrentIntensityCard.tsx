import type { CarbonIntensity } from "../types/carbonIntensity";
import { formatTimeRange } from "../utils/formatTime";
import { IndexBadge } from "./IndexBadge";

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
