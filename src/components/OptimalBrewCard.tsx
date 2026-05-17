import type { HalfHourPeriod } from "../types/dailyIntensity";

type OptimalBrewCardProps = {
  periods: HalfHourPeriod[];
  currentIntensity: number;
};

const KWH_PER_CUP: number = 0.075;

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Finds the half-hour period with the lowest carbon intensity.
 * Prefers actual values over forecasts when available.
 * @param periods - Array of half-hour periods to search
 * @returns The period with the cleanest (lowest) carbon intensity
 */
function findCleanestPeriod(periods: HalfHourPeriod[]): HalfHourPeriod {
  return periods.reduce(
    (best: HalfHourPeriod, current: HalfHourPeriod): HalfHourPeriod => {
      const bestValue = best.actual ?? best.forecast;
      const currentValue = current.actual ?? current.forecast;
      return currentValue < bestValue ? current : best;
    },
  );
}

export function OptimalBrewCard({ periods, currentIntensity }: OptimalBrewCardProps) {
  const cleanestPeriod: HalfHourPeriod = findCleanestPeriod(periods);
  const cleanestIntensity: number = cleanestPeriod.actual ?? cleanestPeriod.forecast;
  const co2Now: number = currentIntensity * KWH_PER_CUP;
  const co2Optimal: number = cleanestIntensity * KWH_PER_CUP;
  const saving: number = co2Now - co2Optimal;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
        Best time to brew today
      </p>

      <p className="mt-3">
        <span className="text-4xl sm:text-5xl font-semibold">
          {formatTime(cleanestPeriod.from)}
        </span>
        <span className="ml-2 text-[var(--muted)] text-lg">
          - {formatTime(cleanestPeriod.to)}
        </span>
      </p>

      <p className="text-[var(--muted)] text-sm mt-2">
        {cleanestIntensity} gCO₂/kWh · {cleanestPeriod.index}
      </p>

      <div className="border-t border-[var(--border)] mt-6 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">A cup right now</span>
          <span className="text-[var(--text)] font-medium">
            {co2Now.toFixed(1)}g CO₂
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">
            A cup at {formatTime(cleanestPeriod.from)}
          </span>
          <span className="font-medium" style={{ color: "#4ade80" }}>
            {co2Optimal.toFixed(1)}g CO₂
          </span>
        </div>
        {saving > 0 && (
          <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--muted)]">You'd save</span>
            <span className="font-medium" style={{ color: "#86efac" }}>
              {saving.toFixed(1)}g per cup
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
