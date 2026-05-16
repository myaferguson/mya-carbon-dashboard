import {
  useCarbonIntensity,
  type UseCarbonIntensityResult,
} from "./hooks/useCarbonIntensity";
import {
  useGenerationMix,
  type UseGenerationMixResult,
} from "./hooks/useGenerationMix";
import { CurrentIntensityCard } from "./components/CurrentIntensityCard";
import { GenerationMixChart } from "./components/GenerationMixChart";
import { useEffect, useState } from "react";
import type { Theme } from "./types/types";

function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const intensity: UseCarbonIntensityResult = useCarbonIntensity();
  const generation: UseGenerationMixResult = useGenerationMix();

  useEffect(() => {
    // check if user has local storage preference for theme
    const storedTheme: Theme = localStorage.getItem("theme") as Theme;

    if (storedTheme) {
      setTheme(storedTheme);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <header className="mb-8 sm:mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              UK Carbon Intensity
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1">
              Real-time carbon emissions from the British electricity grid
            </p>
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:text-[var(--link-hover)] transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "Dark" : "Light"} mode
          </button>
        </header>

        <main className="space-y-6">
          {intensity.loading && (
            <p className="text-zinc-400">Loading current intensity…</p>
          )}
          {intensity.error && (
            <p className="text-red-400">{intensity.error.message}</p>
          )}
          {intensity.data && <CurrentIntensityCard data={intensity.data} />}

          {generation.loading && (
            <p className="text-zinc-400">Loading generation mix…</p>
          )}
          {generation.error && (
            <p className="text-red-400">{generation.error}</p>
          )}
          {generation.data && (
            <GenerationMixChart sources={generation.data.sources} />
          )}
        </main>

        <footer className="mt-12 text-[var(--muted)] text-sm">
          Data from{" "}
          <a
            href="https://carbonintensity.org.uk"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[var(--link-hover)]"
          >
            National Grid ESO Carbon Intensity API
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
