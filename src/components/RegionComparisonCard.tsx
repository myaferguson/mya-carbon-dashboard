import type { RegionSnapshot } from "../types/regional";
import type { AllRegions } from "../utils/regional";
import { useLocationContext } from "../context/locationContext";
import { PostcodeForm } from "./PostcodeForm";
import { Card } from "./Card";

type RegionComparisonCardProps = {
  regions: AllRegions;
  className?: string;
};

const indexVar = (r: RegionSnapshot, part: "text" | "bg"): string =>
  `var(--index-${r.index.replace(" ", "-")}-${part})`;

function compareWithGb(value: number, gb: number): string {
  if (gb === 0) return "";
  const diff = Math.round(((value - gb) / gb) * 100);
  if (Math.abs(diff) < 5) return "about the same as the GB average";
  return diff < 0
    ? `${Math.abs(diff)}% cleaner than the GB average`
    : `${diff}% dirtier than the GB average`;
}

export function RegionComparisonCard({ regions, className = "" }: RegionComparisonCardProps) {
  const { outcode, setOutcode, region, regionError } = useLocationContext();
  const { local, gb } = regions;
  // The list is sorted cleanest first.
  const cleanest: RegionSnapshot | undefined = local[0];
  const dirtiest: RegionSnapshot | undefined = local.at(-1);
  if (!cleanest || !dirtiest) return null;

  const max = Math.max(dirtiest.forecast, 1);
  const yours = region ? local.find((r) => r.id === region.id) : undefined;

  return (
    <Card id="regions" title="Across the UK right now" className={className}>
      {yours && gb ? (
        <p className="text-sm">
          <span className="font-semibold">{yours.name}</span> is at{" "}
          <span className="font-semibold">{yours.forecast} gCO₂/kWh</span>,{" "}
          {compareWithGb(yours.forecast, gb.forecast)} ({gb.forecast}).
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            {outcode && regionError
              ? `We couldn't find ${outcode}. Try another postcode.`
              : outcode
                ? "Loading your area…"
                : "Add your postcode to see your area."}{" "}
            Grids vary a lot: right now {cleanest.name} is at{" "}
            {cleanest.forecast} g and {dirtiest.name} at {dirtiest.forecast} g.
          </p>
          {(!outcode || regionError) && (
            <div className="max-w-sm">
              <PostcodeForm onSubmit={setOutcode} />
            </div>
          )}
        </div>
      )}

      {/* Two columns on wide screens, read top to bottom. */}
      <ol
        className="mt-3 space-y-0.5 lg:grid lg:grid-flow-col lg:grid-rows-7 lg:gap-x-6 lg:space-y-0"
        aria-label="Regions, cleanest first"
      >
        {local.map((r) => {
          const isYours = r.id === yours?.id;
          return (
            <li
              key={r.id}
              aria-current={isYours ? "true" : undefined}
              className={`grid grid-cols-[8.5rem_1fr_2.25rem] items-center gap-2 rounded-md px-2 py-0.5 text-sm ${
                isYours ? "ring-1 ring-[var(--text)] font-semibold" : ""
              }`}
            >
              <span className="truncate">
                {r.name}
                {isYours && (
                  <span className="ml-1.5 text-xs text-[var(--muted)]">
                    (you)
                  </span>
                )}
              </span>
              <span className="h-2.5 rounded-full bg-[var(--border)]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.max((r.forecast / max) * 100, 1)}%`,
                    background: indexVar(r, "text"),
                  }}
                />
              </span>
              <span className="text-right tabular-nums text-[var(--muted)]">
                {r.forecast}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-[var(--muted)]">
        gCO₂/kWh forecast for this half hour. Colours show the intensity level.
      </p>
    </Card>
  );
}
