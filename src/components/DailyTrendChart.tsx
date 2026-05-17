import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import React from "react";
import { toPng } from "html-to-image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

type DailyTrendChartProps = {
  periods: HalfHourPeriod[];
};

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

type ChartDataPoint = {
  time: string;
  actual: number | null;
  forecast: number;
};

export function DailyTrendChart({ periods }: DailyTrendChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const data: ChartDataPoint[] = periods.map(
    (period: HalfHourPeriod): ChartDataPoint => ({
      time: formatTime(period.from),
      actual: period.actual,
      forecast: period.forecast,
    }),
  );

  async function downloadPng(): Promise<void> {
    if (!chartRef.current) return;
    try {
      const dataUrl: string = await toPng(chartRef.current, {
        backgroundColor: "#0f172a",
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
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
            24-hour trend
          </p>
          <p className="text-[var(--muted)] text-xs mt-1">
            Actual vs forecast intensity today
          </p>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block w-4 h-0.5 bg-[var(--text)] rounded" />
            Actual
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block w-4 h-0.5 border-t border-dashed border-[var(--muted)]" />
            Forecast
          </span>
          <Menu as="div" className="relative">
            <MenuButton className="text-[var(--muted)] hover:text-[var(--text)] transition-colors text-sm px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--muted)]">
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

      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <XAxis
              dataKey="time"
              stroke="var(--muted)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              interval={5}
            />
            <YAxis
              stroke="var(--muted)"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
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
              formatter={(
                value: ValueType | undefined,
                name: NameType | undefined,
              ): [string, string] => [
                value !== null ? `${value} gCO₂/kWh` : "No data",
                name === "actual" ? "Actual" : "Forecast",
              ]}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="var(--muted)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--text)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
