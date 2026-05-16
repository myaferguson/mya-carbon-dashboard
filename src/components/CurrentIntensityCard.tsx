import type { ReactElement } from "react";
import type { CarbonIntensity } from "../types/carbonIntensity";
import { formatTimeRange } from "../utils/formatTime";

type CurrentIntensityCardProps = {
  data: CarbonIntensity;
};

export function CurrentIntensityCard({
  data,
}: CurrentIntensityCardProps): ReactElement {
  const value = data.actual ?? data.forecast;
  const isActual = data.actual !== null;

  return (
    <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
      <p className="text-zinc-400 text-sm uppercase tracking-wide">
        Current intensity
      </p>
      <p className="text-zinc-500 text-xs">
        {formatTimeRange(data.from, data.to)}
      </p>
      <p className="mt-2">
        <span className="text-5xl sm:text-6xl font-semibold">{value}</span>
        <span className="ml-2 text-zinc-400 text-lg">gCO₂/kWh</span>
      </p>

      <div className="mt-6 flex items-center gap-3">
        <IndexBadge index={data.index} />
        <span className="text-zinc-500 text-sm">
          {isActual ? "Actual" : "Forecast only"}
        </span>
      </div>
    </div>
  );
}

function IndexBadge({ index }: { index: CarbonIntensity["index"] }) {
  const colors: Record<CarbonIntensity["index"], string> = {
    "very low": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    low: "bg-lime-500/15 text-lime-300 border-lime-500/30",
    moderate: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    "very high": "bg-red-500/15 text-red-300 border-red-500/30",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${colors[index]}`}
    >
      {index}
    </span>
  );
}
