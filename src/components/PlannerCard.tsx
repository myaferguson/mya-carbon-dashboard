import { useId } from "react";
import type { CarbonIntensity } from "../types/carbonIntensity";
import type { PlannerState } from "../hooks/usePlannerState";
import {
  EV_CHARGER_KW,
  EV_HOURS,
  FINISH_BY_OPTIONS,
  formatCo2,
} from "../utils/appliances";
import { formatClock, formatClockWithDay } from "../utils/formatTime";
import { co2PerCup, representativeIndex, type BestWindow } from "../utils/planner";
import { AppliancePicker } from "./AppliancePicker";
import { Card } from "./Card";
import { IndexBadge } from "./IndexBadge";

/** Grams of CO₂ to fully charge a typical smartphone, for comparison. */
const GRAMS_PER_PHONE_CHARGE = 8.22;

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--switch-track-checked)]";

type PlannerCardProps = {
  planner: PlannerState;
  best: BestWindow | null;
  startNow: BestWindow | null;
  current: CarbonIntensity | null;
  /** False while the forecast is loading or failed. */
  ready: boolean;
  areaName: string;
  now: Date;
  className?: string;
};

export function PlannerCard({
  planner,
  best,
  startNow,
  current,
  ready,
  areaName,
  now,
  className = "",
}: PlannerCardProps) {
  const ids = { hours: useId(), kwh: useId(), by: useId() };
  const { appliance, resolved, update } = planner;

  const isNow: boolean = best !== null && new Date(best.start).getTime() <= now.getTime();
  const co2Best: number | null = best ? resolved.kwh * best.avgIntensity : null;
  const co2Now: number | null = startNow ? resolved.kwh * startNow.avgIntensity : null;
  const percentLess: number | null =
    co2Best !== null && co2Now !== null && co2Now > 0
      ? Math.round(((co2Now - co2Best) / co2Now) * 100)
      : null;
  const cupNow: number | null = current ? co2PerCup(current.actual ?? current.forecast) : null;

  return (
    <Card id="planner" title="Best time to run…" className={className}>
      <div className="space-y-3">
        <AppliancePicker
          value={appliance}
          onChange={(id) => update({ appliance: id, hours: null, kwh: null })}
        />

        {appliance === "ev" && (
          <div>
            <label htmlFor={ids.hours} className="mb-1 block text-xs">
              Charge for <strong>{resolved.slots / 2} hours</strong>{" "}
              <span className="text-[var(--muted)]">
                (≈{resolved.kwh} kWh at {EV_CHARGER_KW} kW)
              </span>
            </label>
            <input
              id={ids.hours}
              type="range"
              min={EV_HOURS.min}
              max={EV_HOURS.max}
              step={1}
              value={resolved.slots / 2}
              onChange={(e) => update({ hours: e.target.value })}
              className="w-full accent-[var(--switch-track-checked)]"
            />
          </div>
        )}

        {appliance === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={ids.kwh} className="mb-1 block text-xs">
                Energy (kWh)
              </label>
              <input
                id={ids.kwh}
                type="number"
                inputMode="decimal"
                min={0.01}
                step={0.1}
                value={planner.kwhInput}
                onChange={(e) => update({ kwh: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={ids.hours} className="mb-1 block text-xs">
                Run time (hours)
              </label>
              <input
                id={ids.hours}
                type="number"
                inputMode="decimal"
                min={0.5}
                max={24}
                step={0.5}
                value={planner.hoursInput}
                onChange={(e) => update({ hours: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor={ids.by} className="shrink-0 text-xs">
            Needs to finish by
          </label>
          <select
            id={ids.by}
            value={planner.finishBy}
            onChange={(e) => update({ by: e.target.value === "any" ? null : e.target.value })}
            className={inputClass}
          >
            {FINISH_BY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "any" ? "Any time in the next 24h" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-4 border-t border-[var(--border)] pt-4"
        data-testid="planner-result"
      >
        <h3 className="sr-only" id="planner-result-heading">
          Best time for: {resolved.label}
        </h3>
        {!ready ? (
          <p className="text-sm text-[var(--muted)]">Waiting for the forecast…</p>
        ) : !best ? (
          <p className="text-sm" data-testid="planner-no-window">
            {planner.finishByLabel
              ? `There isn't a ${resolved.slots / 2}-hour slot that finishes by ${planner.finishByLabel}. Try a later finish time.`
              : "There isn't enough forecast data for a run this long. Try a shorter one."}
          </p>
        ) : (
          <>
            <p className="text-3xl font-semibold" data-testid="planner-start">
              {isNow ? "Start now" : `Start at ${formatClock(best.start)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isNow ? "" : `${formatClockWithDay(best.start, now)}, `}done by{" "}
              {formatClockWithDay(best.end, now)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <IndexBadge index={representativeIndex(best)} />
              <span className="text-[var(--muted)]">
                averaging {Math.round(best.avgIntensity)} gCO₂/kWh in {areaName}
              </span>
            </div>

            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">At that time</dt>
                <dd className="font-medium" style={{ color: "var(--good)" }}>
                  ≈{formatCo2(co2Best ?? 0)} CO₂
                </dd>
              </div>
              {!isNow && co2Now !== null && (
                <div className="flex justify-between">
                  <dt className="text-[var(--muted)]">If you start now</dt>
                  <dd className="font-medium">≈{formatCo2(co2Now)} CO₂</dd>
                </div>
              )}
            </dl>
            {!isNow && percentLess !== null && percentLess > 0 && (
              <p className="mt-2 text-sm" data-testid="planner-saving">
                Waiting cuts the emissions by {percentLess}%.
              </p>
            )}
            {isNow && <p className="mt-2 text-sm">Now is the cleanest time in the forecast.</p>}
          </>
        )}

        {appliance === "kettle" && cupNow !== null && (
          <p className="mt-3 text-xs text-[var(--muted)]" data-testid="kettle-note">
            A cup right now is about {cupNow.toFixed(1)} g CO₂, roughly{" "}
            {(cupNow / GRAMS_PER_PHONE_CHARGE).toFixed(1)} phone charges.
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--muted)]">
          ≈{Number(resolved.kwh.toFixed(3))} kWh over {resolved.slots / 2} hour
          {resolved.slots === 2 ? "" : "s"}. Typical estimates; check your appliance's label.
        </p>
      </div>
    </Card>
  );
}
