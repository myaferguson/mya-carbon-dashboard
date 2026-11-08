import {
  useCarbonIntensity,
  type UseCarbonIntensityResult,
} from "../hooks/useCarbonIntensity";
import {
  useGenerationMix,
  type UseGenerationMixResult,
} from "../hooks/useGenerationMix";
import { CurrentIntensityCard } from "../components/CurrentIntensityCard";
import { GenerationMixChart } from "../components/GenerationMixChart";
import React from "react";
import {
  useIntensityForecast,
  type UseIntensityForecastResult,
} from "../hooks/useIntensityForecast";
import { IntensityTrendChart } from "../components/IntensityTrendChart";
import { ForecastSummaryCard } from "../components/ForecastSummaryCard";
import { RegionComparisonCard } from "../components/RegionComparisonCard";
import { useRegions } from "../hooks/useRegions";
import { useLocationContext } from "../context/locationContext";
import { CardSkeleton } from "../components/CardSkeleton";
import { ErrorCard } from "../components/ErrorCard";

export function DashboardPage() {
  const intensity: UseCarbonIntensityResult = useCarbonIntensity();
  const generation: UseGenerationMixResult = useGenerationMix();
  const forecast: UseIntensityForecastResult = useIntensityForecast();
  const regions = useRegions();
  const { outcode, setOutcode, region, regionError } = useLocationContext();
  // An unknown postcode makes every regional request fail; say so once.
  const areaNotFound: boolean = Boolean(outcode && regionError);

  return (
    <React.Fragment>
      <header className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            UK Carbon Intensity
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {region
              ? `How clean the electricity is in ${region.name} right now`
              : "Real-time carbon emissions from the British electricity grid"}
          </p>
        </div>
      </header>

      <main className="space-y-6">
        {areaNotFound && (
          <div
            role="alert"
            className="rounded-2xl border border-[var(--index-very-high-border)] bg-[var(--index-very-high-bg)] p-5"
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
        {intensity.loading && (
          <CardSkeleton label="Loading current intensity" bodyHeight="h-20" />
        )}
        {intensity.error && !areaNotFound && (
          <ErrorCard message={intensity.error} onRetry={intensity.refetch} />
        )}
        {intensity.data && forecast.data && (
          <ForecastSummaryCard
            current={intensity.data}
            periods={forecast.data}
          />
        )}
        {intensity.data && <CurrentIntensityCard data={intensity.data} />}

        {forecast.loading && (
          <CardSkeleton label="Loading the forecast" bodyHeight="h-64" />
        )}
        {forecast.error && !areaNotFound && (
          <ErrorCard message={forecast.error} onRetry={forecast.refetch} />
        )}
        {forecast.data && <IntensityTrendChart periods={forecast.data} />}

        {regions.loading && (
          <CardSkeleton label="Loading regions" bodyHeight="h-72" />
        )}
        {regions.error && (
          <ErrorCard message={regions.error} onRetry={regions.refetch} />
        )}
        {regions.data && <RegionComparisonCard regions={regions.data} />}

        {generation.loading && (
          <CardSkeleton label="Loading the fuel mix" bodyHeight="h-72" />
        )}
        {generation.error && !areaNotFound && (
          <ErrorCard message={generation.error} onRetry={generation.refetch} />
        )}
        {generation.data && (
          <GenerationMixChart
            sources={generation.data.sources}
            areaName={region?.name}
          />
        )}
      </main>
    </React.Fragment>
  );
}
