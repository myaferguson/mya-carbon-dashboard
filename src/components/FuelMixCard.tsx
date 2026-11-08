import type { Fuel, GenerationSource } from "../types/generationMix";
import { Card } from "./Card";

const FUELS: Record<Fuel, { label: string; color: string; low: boolean }> = {
  wind: { label: "Wind", color: "#60a5fa", low: true },
  solar: { label: "Solar", color: "#fbbf24", low: true },
  hydro: { label: "Hydro", color: "#22d3ee", low: true },
  nuclear: { label: "Nuclear", color: "#a78bfa", low: true },
  biomass: { label: "Biomass", color: "#84cc16", low: false },
  gas: { label: "Gas", color: "#f97316", low: false },
  coal: { label: "Coal", color: "#52525b", low: false },
  imports: { label: "Imports", color: "#94a3b8", low: false },
  other: { label: "Other", color: "#71717a", low: false },
};

type FuelMixCardProps = {
  sources: GenerationSource[];
  /** Where the mix is for, e.g. "London". Defaults to the whole UK. */
  areaName?: string;
  className?: string;
};

/** The current fuel mix as a compact ranked list of bars. */
export function FuelMixCard({ sources, areaName, className = "" }: FuelMixCardProps) {
  const sorted: GenerationSource[] = [...sources].sort((a, b) => b.perc - a.perc);
  const used = sorted.filter((s) => s.perc > 0);
  const unused = sorted.filter((s) => s.perc === 0);
  const lowCarbon: number = sources
    .filter((s) => FUELS[s.fuel].low)
    .reduce((sum, s) => sum + s.perc, 0);

  return (
    <Card
      id="fuel-mix"
      title={areaName ? `Fuel mix in ${areaName}` : "Fuel mix now"}
      className={className}
    >
      <p className="mb-3 text-sm">
        <span className="font-semibold">{Math.round(lowCarbon)}%</span>{" "}
        <span className="text-[var(--muted)]">
          from low-carbon sources (wind, solar, hydro, nuclear)
        </span>
      </p>
      <ul className="space-y-1.5" aria-label="Share of electricity by fuel">
        {used.map((s) => (
          <li
            key={s.fuel}
            className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm"
          >
            <span>{FUELS[s.fuel].label}</span>
            <span className="h-2.5 rounded-full bg-[var(--border)]" aria-hidden="true">
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.max(s.perc, 1)}%`, background: FUELS[s.fuel].color }}
              />
            </span>
            <span className="text-right tabular-nums text-[var(--muted)]">
              {s.perc.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
      {unused.length > 0 && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          None from {unused.map((s) => FUELS[s.fuel].label.toLowerCase()).join(", ")} right now.
        </p>
      )}
    </Card>
  );
}
