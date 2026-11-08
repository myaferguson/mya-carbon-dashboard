import { InfoTip } from "./InfoTip";
import { IndexBadge } from "./IndexBadge";
import type { IntensityIndex } from "../types/carbonIntensity";

const LEVELS: { index: IntensityIndex; meaning: string }[] = [
  { index: "very low", meaning: "Mostly wind, solar, nuclear or hydro. A great time to use power." },
  { index: "low", meaning: "Cleaner than usual. A good time." },
  { index: "moderate", meaning: "About average for the GB grid." },
  { index: "high", meaning: "More gas on the grid. Wait if you can." },
  { index: "very high", meaning: "Lots of fossil fuel. Avoid big loads if possible." },
];

/** Explains the gCO₂/kWh unit in everyday terms. */
export function UnitExplainer() {
  return (
    <InfoTip label="What does gCO₂/kWh mean?">
      <p>
        <strong>Grams of CO₂ per kilowatt-hour</strong>: how much carbon
        dioxide is released to make each unit of electricity you use. Lower is
        cleaner.
      </p>
      <p className="mt-2 text-[var(--muted)]">
        For example, boiling a kettle for one cup uses about 0.075 kWh. At 200
        gCO₂/kWh that's about 15 g of CO₂.
      </p>
    </InfoTip>
  );
}

/** Explains the five intensity levels. */
export function LevelsExplainer() {
  return (
    <InfoTip label="What do the intensity levels mean?">
      <p>
        National Grid ESO groups carbon intensity into five levels. They
        depend on how the electricity is being made right now.
      </p>
      <ul className="mt-3 space-y-2">
        {LEVELS.map(({ index, meaning }) => (
          <li key={index} className="flex items-start gap-2">
            <IndexBadge index={index} />
            <span className="text-[var(--muted)]">{meaning}</span>
          </li>
        ))}
      </ul>
    </InfoTip>
  );
}
