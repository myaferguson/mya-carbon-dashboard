import type { CarbonIntensity } from "../types/carbonIntensity";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import { formatClockWithDay } from "../utils/formatTime";
import { summariseForecast, type ForecastSummary } from "../utils/planner";
import { useNow } from "../hooks/useNow";

type ForecastSummaryCardProps = {
  current: CarbonIntensity;
  periods: HalfHourPeriod[];
};

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

export function ForecastSummaryCard({
  current,
  periods,
}: ForecastSummaryCardProps) {
  const now: Date = useNow();
  const value: number = current.actual ?? current.forecast;
  const summary: ForecastSummary = summariseForecast(value, periods, now);
  const indexVar: string = current.index.replace(" ", "-");

  return (
    <section
      aria-label="Summary"
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        background: `var(--index-${indexVar}-bg)`,
        borderColor: `var(--index-${indexVar}-border)`,
      }}
    >
      <p
        className="font-semibold first-letter:uppercase"
        style={{ color: `var(--index-${indexVar}-text)` }}
      >
        {current.index} right now · {value} gCO₂/kWh
      </p>
      <p className="mt-1 text-[var(--text)]">{advice(summary, now)}</p>
    </section>
  );
}
