import type { IntensityIndex } from "../types/carbonIntensity";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import { formatClock, formatClockWithDay } from "./formatTime";

export type IndexBand = {
  index: IntensityIndex;
  from: number;
  to: number;
};

const HOUR_MS = 60 * 60 * 1000;
const time = (iso: string): number => new Date(iso).getTime();

/** Groups back-to-back periods with the same index into one background band. */
export function toIndexBands(periods: HalfHourPeriod[]): IndexBand[] {
  const bands: IndexBand[] = [];
  for (const p of periods) {
    const last = bands[bands.length - 1];
    if (last && last.index === p.index && last.to === time(p.from)) {
      last.to = time(p.to);
    } else {
      bands.push({ index: p.index, from: time(p.from), to: time(p.to) });
    }
  }
  return bands;
}

/** Tick every 6 hours on local midnight, 06:00, 12:00 and 18:00. */
export function sixHourTicks(start: number, end: number): number[] {
  const first = new Date(start);
  first.setMinutes(0, 0, 0);
  first.setHours(Math.ceil(first.getHours() / 6) * 6);
  if (first.getTime() < start) first.setHours(first.getHours() + 6);

  const ticks: number[] = [];
  for (let t = first.getTime(); t <= end; t += 6 * HOUR_MS) ticks.push(t);
  return ticks;
}

export function formatTick(ts: number): string {
  const date = new Date(ts);
  return date.getHours() === 0
    ? date.toLocaleDateString("en-GB", { weekday: "short" })
    : formatClock(date.toISOString());
}

/** A one-sentence description of the trend, for screen readers. */
export function describeTrend(periods: HalfHourPeriod[], now: Date): string {
  const first: HalfHourPeriod | undefined = periods[0];
  const last: HalfHourPeriod | undefined = periods.at(-1);
  if (!first || !last) return "No intensity data available.";
  const value = (p: HalfHourPeriod): number => p.actual ?? p.forecast;
  const min = periods.reduce((a, b) => (value(b) < value(a) ? b : a));
  const max = periods.reduce((a, b) => (value(b) > value(a) ? b : a));
  const at = (p: HalfHourPeriod): string => formatClockWithDay(p.from, now);
  return (
    `Line chart of carbon intensity from ${at(first)} to ` +
    `${formatClockWithDay(last.to, now)}. ` +
    `Lowest ${value(min)} gCO₂/kWh at ${at(min)}; ` +
    `highest ${value(max)} gCO₂/kWh at ${at(max)}.`
  );
}
