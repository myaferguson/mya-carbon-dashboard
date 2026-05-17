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

type DailyTrendChartProps = {
  periods: HalfHourPeriod[];
};

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ChartDataPoint = {
  time: string;
  actual: number | null;
  forecast: number;
};

export function DailyTrendChart({ periods }: DailyTrendChartProps) {
  const data: ChartDataPoint[] = periods.map(
    (period: HalfHourPeriod): ChartDataPoint => ({
      time: formatTime(period.from),
      actual: period.actual,
      forecast: period.forecast,
    }),
  );

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
        </div>
      </div>

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
  );
}
