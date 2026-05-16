import { useCarbonIntensity } from "./hooks/useCarbonIntensity";

function App() {
  const { data, loading, error } = useCarbonIntensity();

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
        {loading && <p className="text-zinc-400">Loading…</p>}
        {error && <p className="text-red-400">{error.message}</p>}
        {data && (
          <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-8">
            <p className="text-zinc-400 text-sm uppercase tracking-wide">
              Current intensity
            </p>
            <p className="mt-2">
              <span className="text-6xl font-semibold">
                {data.actual ?? data.forecast}
              </span>
              <span className="ml-2 text-zinc-400 text-lg">gCO₂/kWh</span>
            </p>
            <p className="mt-4 text-zinc-300 capitalize">{data.index}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
