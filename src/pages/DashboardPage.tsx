import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCarbonIntensity } from "../hooks/useCarbonIntensity";
import { useGenerationMix } from "../hooks/useGenerationMix";
import { useIntensityForecast } from "../hooks/useIntensityForecast";
import { useRegions } from "../hooks/useRegions";
import { useNow } from "../hooks/useNow";
import { usePlannerState } from "../hooks/usePlannerState";
import { useLocationContext } from "../context/locationContext";
import { findBestWindow, windowStartingNow, type BestWindow } from "../utils/planner";
import { CardSkeleton } from "../components/CardSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import { CleanestTile, NowTile, StatusTile } from "../components/SummaryTiles";
import { PlannerCard } from "../components/PlannerCard";
import { FuelMixCard } from "../components/FuelMixCard";
import { RegionComparisonCard } from "../components/RegionComparisonCard";

// The chart pulls in Recharts, the biggest dependency. Loading it
// separately lets the headline figures and planner appear first.
const IntensityTrendChart = lazy(() =>
  import("../components/IntensityTrendChart").then((m) => ({
    default: m.IntensityTrendChart,
  })),
);

/**
 * The whole app on one page. Desktop: a row of summary tiles; the 48h
 * chart beside the planner; fuel mix beside the regions. Mobile stacks
 * them, with the planner before the chart.
 */
export function DashboardPage() {
  const now: Date = useNow();
  const intensity = useCarbonIntensity();
  const generation = useGenerationMix();
  const forecast = useIntensityForecast();
  const regions = useRegions();
  const planner = usePlannerState(now);
  const { outcode, setOutcode, region, regionError } = useLocationContext();
  const { hash } = useLocation();

  // An unknown postcode makes every regional request fail; say so once.
  const areaNotFound: boolean = Boolean(outcode && regionError);
  const areaName: string = region?.name ?? "Great Britain";

  const periods = forecast.data;
  const best: BestWindow | null = periods
    ? findBestWindow(periods, planner.resolved.slots, { now, deadline: planner.deadline })
    : null;
  const startNow: BestWindow | null = periods
    ? windowStartingNow(periods, planner.resolved.slots, now)
    : null;

  // Old /planner and /tea links land here with #planner.
  useEffect(() => {
    if (hash === "#planner") {
      document.getElementById("planner")?.scrollIntoView({ block: "start" });
    }
  }, [hash]);

  return (
    <div className="space-y-4">
      {areaNotFound && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--index-very-high-border)] bg-[var(--index-very-high-bg)] px-4 py-3"
        >
          <p className="font-semibold">We couldn't find data for {outcode}.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Check the postcode using "Change" above, or{" "}
            <button
              type="button"
              onClick={() => setOutcode(null)}
              className="underline underline-offset-2 hover:text-[var(--text)]"
            >
              use national (GB) figures
            </button>
            .
          </p>
        </div>
      )}

      {/* Row 1: headline tiles */}
      {intensity.loading && <CardSkeleton label="Loading current intensity" bodyHeight="h-14" />}
      {intensity.error && !areaNotFound && (
        <ErrorCard message={intensity.error} onRetry={intensity.refetch} />
      )}
      {intensity.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusTile
            current={intensity.data}
            periods={periods}
            areaName={region?.name ?? null}
            now={now}
            className="sm:col-span-2"
          />
          <NowTile current={intensity.data} />
          <CleanestTile current={intensity.data} periods={periods} now={now} />
        </div>
      )}

      {/* Row 2: chart beside the planner. The planner comes first in the
          page (and on mobile); on desktop the grid places it on the right. */}
      <div className="grid gap-4 lg:grid-cols-12">
        <PlannerCard
          className="scroll-mt-4 lg:col-span-5 lg:col-start-8 lg:row-start-1"
          planner={planner}
          best={best}
          startNow={startNow}
          current={intensity.data}
          ready={periods !== null}
          areaName={areaName}
          now={now}
        />
        <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-1">
          {forecast.loading && <CardSkeleton label="Loading the forecast" bodyHeight="h-60" />}
          {forecast.error && !areaNotFound && (
            <ErrorCard message={forecast.error} onRetry={forecast.refetch} />
          )}
          {periods && (
            <Suspense fallback={<CardSkeleton label="Loading the chart" bodyHeight="h-60" />}>
              <IntensityTrendChart
                periods={periods}
                className="h-full"
                highlight={
                  best ? { start: best.start, end: best.end, label: "Best time" } : null
                }
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Row 3: fuel mix beside the regions */}
      <div className="grid items-start gap-4 lg:grid-cols-5">
        {generation.loading && <CardSkeleton label="Loading the fuel mix" bodyHeight="h-40" />}
        {generation.error && !areaNotFound && (
          <ErrorCard message={generation.error} onRetry={generation.refetch} />
        )}
        {generation.data && (
          <FuelMixCard
            sources={generation.data.sources}
            areaName={region?.name}
            className="lg:col-span-2"
          />
        )}
        {regions.loading && <CardSkeleton label="Loading regions" bodyHeight="h-60" />}
        {regions.error && <ErrorCard message={regions.error} onRetry={regions.refetch} />}
        {regions.data && (
          <RegionComparisonCard regions={regions.data} className="lg:col-span-3" />
        )}
      </div>
    </div>
  );
}
