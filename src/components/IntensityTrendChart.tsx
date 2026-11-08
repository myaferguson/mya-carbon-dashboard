import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import React from "react";
import { toPng } from "html-to-image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { formatClockWithDay } from "../utils/formatTime";
import {
  describeTrend,
  formatTick,
  sixHourTicks,
  toIndexBands,
  type IndexBand,
} from "../utils/chart";
import { useNow } from "../hooks/useNow";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type IntensityTrendChartProps = {
  periods: HalfHourPeriod[];
};

const time = (iso: string): number => new Date(iso).getTime();

type ChartDataPoint = {
  ts: number;
  actual: number | null;
  forecast: number;
};

function downloadCsv(periods: HalfHourPeriod[]): void {
  const header: string = "From,To,Actual (gCO₂/kWh),Forecast (gCO₂/kWh),Index";
  const rows: string[] = periods.map(
    (p) => `${p.from},${p.to},${p.actual ?? ""},${p.forecast},${p.index}`,
  );
  const csv: string = [header, ...rows].join("\n");
  const blob: Blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url: string = URL.createObjectURL(blob);
  const link: HTMLAnchorElement = document.createElement("a");
  link.href = url;
  link.download = `carbon-intensity-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function IntensityTrendChart({ periods }: IntensityTrendChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const nowDate: Date = useNow();
  const now: number = nowDate.getTime();
  const reducedMotion: boolean = usePrefersReducedMotion();
  const [showTable, setShowTable] = React.useState<boolean>(false);
  const tableId: string = React.useId();

  const data: ChartDataPoint[] = periods.map(
    (period: HalfHourPeriod): ChartDataPoint => ({
      ts: time(period.from),
      actual: period.actual,
      forecast: period.forecast,
    }),
  );
  const firstPeriod: HalfHourPeriod | undefined = periods[0];
  const lastPeriod: HalfHourPeriod | undefined = periods.at(-1);
  const start: number = firstPeriod ? time(firstPeriod.from) : now;
  const end: number = lastPeriod ? time(lastPeriod.to) : now;
  const bands: IndexBand[] = toIndexBands(periods);
  // Regional data is forecast-only, so there's no "last 24h" to show.
  const hasActuals: boolean = periods.some((p) => p.actual !== null);

  async function downloadPng(): Promise<void> {
    if (!chartRef.current) return;
    try {
      const background: string =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bg")
          .trim() || "#0f172a";
      const dataUrl: string = await toPng(chartRef.current, {
        backgroundColor: background,
        pixelRatio: 2,
      });
      const link: HTMLAnchorElement = document.createElement("a");
      link.href = dataUrl;
      link.download = `carbon-intensity-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between mb-6">
        <div>
          <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
            {hasActuals ? "Last 24h & next 24h" : "Next 48h"}
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            {hasActuals
              ? "Actual intensity so far, forecast from now on."
              : "Forecast for your area (regional data is forecast only)."}{" "}
            Shading shows the intensity level.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hasActuals && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="inline-block w-4 h-0.5 bg-[var(--text)] rounded" />
              Actual
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block w-4 h-0.5 border-t border-dashed border-[var(--muted)]" />
            Forecast
          </span>
          <Menu as="div" className="relative">
            <MenuButton className="whitespace-nowrap text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--muted)]">
              Export ↓
            </MenuButton>
            <MenuItems className="absolute right-0 mt-1 w-40 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-10 overflow-hidden">
              <MenuItem>
                <button
                  onClick={downloadPng}
                  className="block w-full text-left px-3 py-2 text-sm text-[var(--muted)] data-[active]:bg-[var(--border)] data-[active]:text-[var(--text)]"
                >
                  Download PNG
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={() => downloadCsv(periods)}
                  className="block w-full text-left px-3 py-2 text-sm text-[var(--muted)] data-[active]:bg-[var(--border)] data-[active]:text-[var(--text)]"
                >
                  Download CSV
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div ref={chartRef} role="img" aria-label={describeTrend(periods, nowDate)}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 16, right: 8, bottom: 4, left: 0 }}
          >
            {bands.map((band) => (
              <ReferenceArea
                key={band.from}
                x1={band.from}
                x2={band.to}
                fill={`var(--index-${band.index.replace(" ", "-")}-bg)`}
                fillOpacity={1}
                stroke="none"
                ifOverflow="hidden"
              />
            ))}
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={[start, end]}
              ticks={sixHourTicks(start, end)}
              tickFormatter={formatTick}
              stroke="var(--muted)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
              }}
              labelStyle={{ color: "var(--muted)", marginBottom: 4 }}
              labelFormatter={(ts) =>
                formatClockWithDay(new Date(Number(ts)).toISOString())
              }
              formatter={(
                value: ValueType | undefined,
                name: NameType | undefined,
              ): [string, string] => [
                value !== null && value !== undefined
                  ? `${value} gCO₂/kWh`
                  : "No data",
                name === "actual" ? "Actual" : "Forecast",
              ]}
            />
            <ReferenceLine
              x={now}
              stroke="var(--text)"
              strokeDasharray="2 3"
              label={{
                value: "Now",
                position: "top",
                fill: "var(--text)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="var(--muted)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={true}
              isAnimationActive={!reducedMotion}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--text)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={!reducedMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        type="button"
        aria-expanded={showTable}
        aria-controls={tableId}
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--text)]"
      >
        {showTable ? "Hide table" : "View as table"}
      </button>
      {showTable && (
        <div
          id={tableId}
          className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-[var(--border)]"
        >
          <table className="w-full text-sm">
            <caption className="sr-only">
              Half-hourly carbon intensity in gCO₂/kWh
            </caption>
            <thead className="sticky top-0 bg-[var(--bg)] text-left text-[var(--muted)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Time</th>
                <th scope="col" className="px-3 py-2 font-medium text-right">Actual</th>
                <th scope="col" className="px-3 py-2 font-medium text-right">Forecast</th>
                <th scope="col" className="px-3 py-2 font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.from} className="border-t border-[var(--border)]">
                  <th scope="row" className="px-3 py-1.5 text-left font-normal">
                    {formatClockWithDay(p.from, nowDate)}
                  </th>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {p.actual ?? "–"}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {p.forecast}
                  </td>
                  <td className="px-3 py-1.5 capitalize">{p.index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
