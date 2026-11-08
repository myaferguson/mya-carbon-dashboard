import type { HalfHourPeriod } from "../types/dailyIntensity";
import { formatClock } from "../utils/formatTime";
import {
  co2PerCup,
  findCleanestUpcomingPeriod,
  periodIntensity,
} from "../utils/tea";

type OptimalBrewCardProps = {
  periods: HalfHourPeriod[];
  currentIntensity: number;
};

export function OptimalBrewCard({
  periods,
  currentIntensity,
}: OptimalBrewCardProps) {
  const now: Date = new Date();
  const cleanestPeriod: HalfHourPeriod | null = findCleanestUpcomingPeriod(
    periods,
    now,
  );

  // Nothing left of today to compare against.
  if (!cleanestPeriod) return null;

  const isNow: boolean = new Date(cleanestPeriod.from) <= now;
  const cleanestIntensity: number = periodIntensity(cleanestPeriod);
  const co2Now: number = co2PerCup(currentIntensity);
  const co2Optimal: number = co2PerCup(cleanestIntensity);
  const saving: number = co2Now - co2Optimal;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
        Best time to brew (rest of today)
      </p>

      <p className="mt-3">
        <span className="text-4xl sm:text-5xl font-semibold">
          {isNow ? "Right now" : formatClock(cleanestPeriod.from)}
        </span>
        <span className="ml-2 text-[var(--muted)] text-lg">
          {isNow ? "until" : "-"} {formatClock(cleanestPeriod.to)}
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
        {!isNow && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">
              A cup at {formatClock(cleanestPeriod.from)}
            </span>
            <span className="font-medium" style={{ color: "#4ade80" }}>
              {co2Optimal.toFixed(1)}g CO₂
            </span>
          </div>
        )}
        {!isNow && saving > 0 && (
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
