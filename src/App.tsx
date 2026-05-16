import { CurrentIntensityCard } from "./components/CurrentIntensityCard";
import { GenerationMixChart } from "./components/GenerationMixChart";
import { useCarbonIntensity } from "./hooks/useCarbonIntensity";
import { useGenerationMix } from "./hooks/useGenerationMix";

function App() {
  const intensity = useCarbonIntensity();
  const generation = useGenerationMix();

  return (
    <div className="bg-zinc-900 text-zinc-100 min-h-screen p-8">
      <header className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          UK Carbon Intensity
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Real-time carbon emissions from the British electricity grid
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        {intensity.loading && <p className="text-zinc-400">Loading current intensity…</p>}
        {intensity.error && <p className="text-red-400">{intensity.error.message}</p>}
        {intensity.data && <CurrentIntensityCard data={intensity.data} />}
        {generation.loading && <p className="text-zinc-400 mt-8">Loading generation mix…</p>}
        {generation.error && <p className="text-red-400 mt-8">{generation.error}</p>}
        {generation.data && <GenerationMixChart sources={generation.data.sources} />}
      </main>
    </div>
  );
}

export default App;
