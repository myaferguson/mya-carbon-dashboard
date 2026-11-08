import type { CarbonIntensity } from "../types/carbonIntensity";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import {
  dayLabel,
  formatClock,
  formatClockWithDay,
  formatTimeRange,
} from "../utils/formatTime";
import {
  findBestWindow,
  summariseForecast,
  type BestWindow,
  type ForecastSummary,
} from "../utils/planner";
import { IndexBadge } from "./IndexBadge";
import { LevelsExplainer, UnitExplainer } from "./IntensityExplainers";

const DAY_MS = 24 * 60 * 60 * 1000;
const tile = "rounded-xl border p-4";
const plainTile = `${tile} border-[var(--border)] bg-[var(--surface)]`;
const label = "text-xs font-medium uppercase tracking-wide text-[var(--muted)]";

const valueOf = (c: CarbonIntensity): number => c.actual ?? c.forecast;
const indexVar = (c: CarbonIntensity): string => c.index.replace(" ", "-");

function advice(summary: ForecastSummary, now: Date): string {
  switch (summary.kind) {
    case "best-now":
      return "This is the cleanest it'll be for the next 24 hours, so it's a good time to use electricity.";
    case "flat":
      return "It'll stay about the same for the next 24 hours, so there's no need to wait.";
    case "cleaner-later":
      return `It'll be ${summary.percentCleaner}% cleaner at ${formatClockWithDay(summary.start, now)}. If you can wait, that's the best time to use electricity in the next 24 hours.`;
  }
}

type StatusTileProps = {
  current: CarbonIntensity;
  periods: HalfHourPeriod[] | null;
  areaName: string | null;
  now: Date;
  className?: string;
};

/** The headline: how clean it is right now, and whether to wait. */
export function StatusTile({ current, periods, areaName, now, className = "" }: StatusTileProps) {
  const v: string = indexVar(current);
  return (
    <section
      aria-label="Summary"
      className={`${tile} ${className}`}
      style={{
        background: `var(--index-${v}-bg)`,
        borderColor: `var(--index-${v}-border)`,
      }}
    >
      <p
        className="text-lg font-semibold first-letter:uppercase"
        style={{ color: `var(--index-${v}-text)` }}
      >
        {current.index} right now{areaName ? ` in ${areaName}` : ""}
      </p>
      <p className="mt-1 text-sm text-[var(--text)]">
        {periods
          ? advice(summariseForecast(valueOf(current), periods, now), now)
          : "Checking the forecast…"}
      </p>
    </section>
  );
}

/** The current reading, with explanations of the unit and levels. */
export function NowTile({ current, className = "" }: { current: CarbonIntensity; className?: string }) {
  return (
    <section aria-labelledby="now-heading" className={`${plainTile} ${className}`}>
      <h2 id="now-heading" className={label}>
        Now · {formatTimeRange(current.from, current.to)}
      </h2>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular-nums">{valueOf(current)}</span>
        <span className="text-sm text-[var(--muted)]">gCO₂/kWh</span>
        <UnitExplainer />
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <IndexBadge index={current.index} />
        <LevelsExplainer />
        <span className="text-[var(--muted)]">
          {current.actual !== null ? "Actual" : "Forecast only"}
        </span>
      </div>
    </section>
  );
}

type CleanestTileProps = {
  current: CarbonIntensity;
  periods: HalfHourPeriod[] | null;
  now: Date;
  className?: string;
};

/** The cleanest half hour in the next 24 hours. */
export function CleanestTile({ current, periods, now, className = "" }: CleanestTileProps) {
  const best: BestWindow | null = periods
    ? findBestWindow(periods, 1, { now, deadline: new Date(now.getTime() + DAY_MS) })
    : null;
  const isNow: boolean = best !== null && new Date(best.start).getTime() <= now.getTime();
  const nowValue: number = valueOf(current);
  const percent: number =
    best && nowValue > 0 ? Math.round(((nowValue - best.avgIntensity) / nowValue) * 100) : 0;

  return (
    <section aria-labelledby="cleanest-heading" className={`${plainTile} ${className}`}>
      <h2 id="cleanest-heading" className={label}>
        Cleanest in the next 24h
      </h2>
      {!best ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          {periods ? "No forecast available." : "Loading…"}
        </p>
      ) : (
        <>
          <p className="mt-1 text-4xl font-semibold tabular-nums">
            {isNow ? "Now" : formatClock(best.start)}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {isNow ? "" : `${dayLabel(best.start, now) || "today"} · `}
            {Math.round(best.avgIntensity)} g
            {percent > 0 && (
              <span className="font-medium" style={{ color: "var(--good)" }}>
                {" "}
                · {percent}% cleaner
              </span>
            )}
          </p>
        </>
      )}
    </section>
  );
}
