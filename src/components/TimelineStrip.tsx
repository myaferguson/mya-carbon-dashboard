import type { HalfHourPeriod } from "../types/dailyIntensity";
import type { BestWindow } from "../utils/planner";
import { formatClock, formatClockWithDay } from "../utils/formatTime";

type TimelineStripProps = {
  /** Upcoming half hours, starting with the current one. */
  periods: HalfHourPeriod[];
  window: BestWindow | null;
  deadline?: Date;
  now: Date;
};

const SLOT_WIDTH = 10;
const HEIGHT = 32;

/**
 * A strip of half-hour blocks coloured by intensity level, with the
 * recommended window outlined. Hand-built SVG, no chart library.
 */
export function TimelineStrip({ periods, window, deadline, now }: TimelineStripProps) {
  if (periods.length === 0) return null;

  const width = periods.length * SLOT_WIDTH;
  const startIndex = window
    ? periods.findIndex((p) => p.from === window.start)
    : -1;
  const pastDeadline = (p: HalfHourPeriod): boolean =>
    deadline !== undefined && new Date(p.to).getTime() > deadline.getTime();

  // A label every 6 hours, for the periods that exist.
  const labels: { index: number; from: string }[] = [0, 12, 24, 36].flatMap(
    (index) => {
      const period: HalfHourPeriod | undefined = periods[index];
      return period ? [{ index, from: period.from }] : [];
    },
  );
  const description = window
    ? `Next ${periods.length / 2} hours, coloured by intensity. Recommended window: ${formatClockWithDay(window.start, now)} to ${formatClockWithDay(window.end, now)}.`
    : `Next ${periods.length / 2} hours, coloured by intensity.`;

  return (
    <figure className="mt-6">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-10 w-full overflow-visible"
        role="img"
        aria-label={description}
      >
        {periods.map((p, i) => (
          <rect
            key={p.from}
            x={i * SLOT_WIDTH}
            y={4}
            width={SLOT_WIDTH - 1}
            height={HEIGHT - 8}
            rx={2}
            fill={`var(--index-${p.index.replace(" ", "-")}-text)`}
            opacity={pastDeadline(p) ? 0.15 : 0.7}
          >
            <title>
              {formatClockWithDay(p.from, now)}: {p.actual ?? p.forecast} gCO₂/kWh ({p.index})
            </title>
          </rect>
        ))}
        {window && startIndex >= 0 && (
          <rect
            data-testid="timeline-window"
            x={startIndex * SLOT_WIDTH - 1.5}
            y={1}
            width={window.periods.length * SLOT_WIDTH + 2}
            height={HEIGHT - 2}
            rx={4}
            fill="none"
            stroke="var(--text)"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="relative mt-1 h-4 text-xs text-[var(--muted)]" aria-hidden="true">
        {labels.map(({ index, from }) => (
          <span
            key={index}
            className="absolute -translate-x-0 whitespace-nowrap"
            style={{ left: `${(index / periods.length) * 100}%` }}
          >
            {index === 0 ? "Now" : formatClock(from)}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-[var(--muted)]">
        Each block is half an hour, coloured by intensity level.
        {window && " The outlined block is the recommended time."}
        {deadline && " Faded blocks are after your finish time."}
      </figcaption>
    </figure>
  );
}
