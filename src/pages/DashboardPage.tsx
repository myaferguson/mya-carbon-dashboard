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
  useDailyIntensity,
  type UseDailyIntensityResult,
} from "../hooks/useDailyIntensity";
import { DailyTrendChart } from "../components/DailyTrendChart";

export function DashboardPage() {
  const intensity: UseCarbonIntensityResult = useCarbonIntensity();
  const generation: UseGenerationMixResult = useGenerationMix();
  const dailyIntensity: UseDailyIntensityResult = useDailyIntensity();

  return (
    <React.Fragment>
      <header className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            UK Carbon Intensity
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Real-time carbon emissions from the British electricity grid
          </p>
        </div>
      </header>

      <main className="space-y-6">
        {intensity.loading && (
          <p className="text-zinc-400">Loading current intensity…</p>
        )}
        {intensity.error && (
          <p className="text-red-400">{intensity.error.message}</p>
        )}
        {intensity.data && <CurrentIntensityCard data={intensity.data} />}

        {dailyIntensity.loading && (
          <p className="text-[var(--muted)]">Loading trend data…</p>
        )}
        {dailyIntensity.error && (
          <p className="text-red-400">{dailyIntensity.error}</p>
        )}
        {dailyIntensity.data && (
          <DailyTrendChart periods={dailyIntensity.data} />
        )}

        {generation.loading && (
          <p className="text-zinc-400">Loading generation mix…</p>
        )}
        {generation.error && <p className="text-red-400">{generation.error}</p>}
        {generation.data && (
          <GenerationMixChart sources={generation.data.sources} />
        )}
      </main>
    </React.Fragment>
  );
}
