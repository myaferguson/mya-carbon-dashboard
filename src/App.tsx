import { useCarbonIntensity } from "./hooks/useCarbonIntensity";
import { useGenerationMix } from "./hooks/useGenerationMix";
import { CurrentIntensityCard } from "./components/CurrentIntensityCard";
import { GenerationMixChart } from "./components/GenerationMixChart";

function App() {
  const intensity = useCarbonIntensity();
  const generation = useGenerationMix();

  return (
    <div className="bg-zinc-900 text-zinc-100 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            UK Carbon Intensity
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time carbon emissions from the British electricity grid
          </p>
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

        <footer className="mt-12 text-zinc-500 text-sm">
          Data from{" "}
          <a
            href="https://carbonintensity.org.uk"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-zinc-300"
          >
            National Grid ESO Carbon Intensity API
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
