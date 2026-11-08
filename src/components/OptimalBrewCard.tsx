import type { HalfHourPeriod } from "../types/dailyIntensity";
import {
  dayLabel,
  formatClock,
  formatClockWithDay,
} from "../utils/formatTime";
import {
  co2PerCup,
  findBestWindow,
  type BestWindow,
} from "../utils/planner";

import { useNow } from "../hooks/useNow";

const DAY_MS = 24 * 60 * 60 * 1000;

type OptimalBrewCardProps = {
  periods: HalfHourPeriod[];
  currentIntensity: number;
};

export function OptimalBrewCard({
  periods,
  currentIntensity,
}: OptimalBrewCardProps) {
  const now: Date = useNow();
  const best: BestWindow | null = findBestWindow(periods, 1, {
    now,
    deadline: new Date(now.getTime() + DAY_MS),
  });

  // No forecast data ahead to compare against.
  if (!best) return null;

  const cleanestPeriod: HalfHourPeriod = best.periods[0];
  const isNow: boolean = new Date(cleanestPeriod.from) <= now;
  const cleanestIntensity: number = best.avgIntensity;
  const co2Now: number = co2PerCup(currentIntensity);
  const co2Optimal: number = co2PerCup(cleanestIntensity);
  const saving: number = co2Now - co2Optimal;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
        Best time to brew (next 24h)
      </p>

      <p className="mt-3">
        <span className="text-4xl sm:text-5xl font-semibold">
          {isNow ? "Right now" : formatClock(cleanestPeriod.from)}
        </span>
        <span className="ml-2 text-[var(--muted)] text-lg">
          {isNow ? "until" : "-"} {formatClock(cleanestPeriod.to)}
          {!isNow && dayLabel(cleanestPeriod.from, now) && (
            <> {dayLabel(cleanestPeriod.from, now)}</>
          )}
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
              A cup at {formatClockWithDay(cleanestPeriod.from, now)}
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
