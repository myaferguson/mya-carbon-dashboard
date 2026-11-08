import type { IntensityIndex } from "../types/carbonIntensity";
import {
  useCarbonIntensity,
  type UseCarbonIntensityResult,
} from "../hooks/useCarbonIntensity";
import { TeaCupCard } from "../components/TeaCupCard";
import {
  useIntensityForecast,
  type UseIntensityForecastResult,
} from "../hooks/useIntensityForecast";
import { OptimalBrewCard } from "../components/OptimalBrewCard";
import { CardSkeleton } from "../components/CardSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import React from "react";
import { Link } from "react-router-dom";

type HeroConfig = {
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  border: string;
  text: string;
};

const HERO_CONFIG: Record<IntensityIndex, HeroConfig> = {
  "very low": {
    emoji: "✅",
    title: "Yes — perfect time to brew!",
    subtitle: "The grid is very clean right now. Kettle on.",
    bg: "var(--index-very-low-bg)",
    border: "var(--index-very-low-border)",
    text: "var(--index-very-low-text)",
  },
  low: {
    emoji: "👍",
    title: "Yes — great time to brew!",
    subtitle: "The grid is clean right now. Go for it.",
    bg: "var(--index-low-bg)",
    border: "var(--index-low-border)",
    text: "var(--index-low-text)",
  },
  moderate: {
    emoji: "🤷",
    title: "It's okay — not the best, not the worst",
    subtitle:
      "The grid is moderate right now. If you can wait, it'll get cleaner.",
    bg: "var(--index-moderate-bg)",
    border: "var(--index-moderate-border)",
    text: "var(--index-moderate-text)",
  },
  high: {
    emoji: "⏳",
    title: "Maybe wait a bit",
    subtitle:
      "The grid is fairly dirty right now. A cleaner window is probably coming.",
    bg: "var(--index-high-bg)",
    border: "var(--index-high-border)",
    text: "var(--index-high-text)",
  },
  "very high": {
    emoji: "🛑",
    title: "Not right now",
    subtitle: "The grid is very dirty. Wait for a cleaner window if you can.",
    bg: "var(--index-very-high-bg)",
    border: "var(--index-very-high-border)",
    text: "var(--index-very-high-text)",
  },
};

export function TeaPage() {
  const { data, loading, error, refetch }: UseCarbonIntensityResult =
    useCarbonIntensity();
  const forecast: UseIntensityForecastResult = useIntensityForecast();

  return (
    <>
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Tea optimiser
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          Should you boil the kettle right now?
        </p>
      </header>

      <main className="space-y-6">
        {loading && <CardSkeleton label="Checking the grid" bodyHeight="h-32" />}
        {error && <ErrorCard message={error} onRetry={refetch} />}
        {data && (
          <React.Fragment>
            <HeroCard index={data.index} />
            <TeaCupCard data={data} />

            {forecast.loading && (
              <CardSkeleton
                label="Finding the best time to brew"
                bodyHeight="h-24"
              />
            )}
            {forecast.error && (
              <ErrorCard message={forecast.error} onRetry={forecast.refetch} />
            )}
            {forecast.data && (
              <OptimalBrewCard
                periods={forecast.data}
                currentIntensity={data.actual ?? data.forecast}
              />
            )}
            <p className="text-sm text-[var(--muted)]">
              Planning a bigger load?{" "}
              <Link
                to="/planner"
                className="text-[var(--text)] underline underline-offset-2"
              >
                Try the appliance planner →
              </Link>
            </p>
          </React.Fragment>
        )}
      </main>
    </>
  );
}

function HeroCard({ index }: { index: IntensityIndex }) {
  const cardConfig: HeroConfig = HERO_CONFIG[index];

  return (
    <div
      className="rounded-2xl p-8 sm:p-10 text-center transition-colors duration-300"
      style={{
        background: cardConfig.bg,
        border: `1px solid ${cardConfig.border}`,
      }}
    >
      <span className="text-5xl block mb-4">{cardConfig.emoji}</span>
      <h2
        className="text-2xl sm:text-3xl font-semibold mb-2"
        style={{ color: cardConfig.text }}
      >
        {cardConfig.title}
      </h2>
      <p style={{ color: cardConfig.text, opacity: 0.8 }}>
        {cardConfig.subtitle}
      </p>
    </div>
  );
}
