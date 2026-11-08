import type { HalfHourPeriod } from "../types/dailyIntensity";
import type { ResolvedAppliance } from "../utils/appliances";
import { formatCo2 } from "../utils/appliances";
import { formatClock, formatClockWithDay } from "../utils/formatTime";
import {
  representativeIndex,
  type BestWindow,
} from "../utils/planner";
import { IndexBadge } from "./IndexBadge";
import { TimelineStrip } from "./TimelineStrip";

type PlannerResultProps = {
  appliance: ResolvedAppliance;
  best: BestWindow | null;
  startNow: BestWindow | null;
  upcoming: HalfHourPeriod[];
  deadline?: Date;
  finishByLabel: string | null;
  areaName: string;
  now: Date;
};

export function PlannerResult({
  appliance,
  best,
  startNow,
  upcoming,
  deadline,
  finishByLabel,
  areaName,
  now,
}: PlannerResultProps) {
  const isNow: boolean =
    best !== null && new Date(best.start).getTime() <= now.getTime();
  const co2Best: number | null = best ? appliance.kwh * best.avgIntensity : null;
  const co2Now: number | null = startNow
    ? appliance.kwh * startNow.avgIntensity
    : null;
  const percentLess: number | null =
    co2Best !== null && co2Now && co2Now > 0
      ? Math.round(((co2Now - co2Best) / co2Now) * 100)
      : null;

  return (
    <section
      aria-labelledby="planner-result-heading"
      aria-live="polite"
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8"
    >
      <h2
        id="planner-result-heading"
        className="text-[var(--muted)] text-sm uppercase tracking-wide"
      >
        Best time for: {appliance.label}
      </h2>

      {!best ? (
        <p className="mt-3 text-[var(--text)]" data-testid="planner-no-window">
          {finishByLabel
            ? `There isn't a ${appliance.slots / 2}-hour slot that finishes by ${finishByLabel}. Try a later finish time.`
            : "There isn't enough forecast data for a run this long. Try a shorter one."}
        </p>
      ) : (
        <>
          <p className="mt-3" data-testid="planner-start">
            <span className="text-4xl sm:text-5xl font-semibold">
              {isNow ? "Start now" : `Start at ${formatClock(best.start)}`}
            </span>
          </p>
          <p className="mt-2 text-[var(--muted)]">
            {isNow ? "" : `${formatClockWithDay(best.start, now)}, `}done by{" "}
            {formatClockWithDay(best.end, now)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <IndexBadge index={representativeIndex(best)} />
            <span className="text-[var(--muted)]">
              averaging {Math.round(best.avgIntensity)} gCO₂/kWh in {areaName}
            </span>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">
                At the recommended time
              </span>
              <span className="font-medium" style={{ color: "var(--good)" }}>
                ≈{formatCo2(co2Best ?? 0)} CO₂
              </span>
            </div>
            {!isNow && co2Now !== null && (
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">If you start now</span>
                <span className="font-medium">≈{formatCo2(co2Now)} CO₂</span>
              </div>
            )}
            {!isNow && percentLess !== null && percentLess > 0 && (
              <p className="pt-2 border-t border-[var(--border)] text-[var(--text)]" data-testid="planner-saving">
                Waiting cuts the emissions by {percentLess}%.
              </p>
            )}
            {isNow && (
              <p className="text-[var(--text)]">
                Now is the cleanest time in the forecast.
              </p>
            )}
          </div>
        </>
      )}

      <TimelineStrip
        periods={upcoming}
        window={best}
        deadline={deadline}
        now={now}
      />
      <p className="mt-4 text-xs text-[var(--muted)]">
        ≈{Number(appliance.kwh.toFixed(3))} kWh over{" "}
        {appliance.slots / 2} hour{appliance.slots === 2 ? "" : "s"}. Energy figures are typical
        estimates; check your appliance's label for exact numbers.
      </p>
    </section>
  );
}
