import type { CarbonIntensity } from "../types/carbonIntensity";

interface Props {
  data: CarbonIntensity;
}

const KWH_PER_CUP: number = 0.075;

export function TeaCupCard({ data }: Props) {
  const intensity: number = data.actual ?? data.forecast;
  const co2PerCup: number = intensity * KWH_PER_CUP;
  const phoneCharges: number = co2PerCup / 8.22;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
      <p className="text-[var(--muted)] text-sm uppercase tracking-wide">
        Your cup right now
      </p>

      <p className="mt-3">
        <span className="text-4xl sm:text-5xl font-semibold">
          {co2PerCup.toFixed(1)}
        </span>
        <span className="ml-2 text-[var(--muted)] text-lg">g CO₂</span>
      </p>

      <p className="text-[var(--muted)] text-sm mt-4">
        A standard kettle uses ~3kW and takes ~1.5 min to boil one cup. That's{" "}
        {KWH_PER_CUP} kWh x {intensity} gCO₂/kWh = {co2PerCup.toFixed(1)}g.
      </p>

      <p className="text-[var(--muted)] text-xs mt-3">
        Roughly equivalent to charging your phone {phoneCharges.toFixed(1)}{" "}
        times
      </p>
    </div>
  );
}
