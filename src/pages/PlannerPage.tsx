import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { AppliancePicker } from "../components/AppliancePicker";
import { PlannerResult } from "../components/PlannerResult";
import { CardSkeleton } from "../components/CardSkeleton";
import { ErrorCard } from "../components/ErrorCard";
import { useLocationContext } from "../context/locationContext";
import { useIntensityForecast } from "../hooks/useIntensityForecast";
import { useNow } from "../hooks/useNow";
import {
  CUSTOM_DEFAULTS,
  EV_CHARGER_KW,
  EV_HOURS,
  FINISH_BY_OPTIONS,
  isApplianceId,
  isFinishBy,
  nextOccurrence,
  resolveAppliance,
  type ApplianceId,
  type FinishBy,
} from "../utils/appliances";
import { dayLabel } from "../utils/formatTime";
import { findBestWindow, windowStartingNow } from "../utils/planner";

const DAY_MS = 24 * 60 * 60 * 1000;
const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--switch-track-checked)]";

export function PlannerPage() {
  const [params, setParams] = useSearchParams();
  const now: Date = useNow();
  const forecast = useIntensityForecast();
  const { region } = useLocationContext();
  const ids = { hours: useId(), kwh: useId(), by: useId() };

  // All planner state lives in the URL, so a plan can be shared as a link.
  const applianceParam = params.get("appliance");
  const appliance: ApplianceId = isApplianceId(applianceParam)
    ? applianceParam
    : "washing-machine";
  const byParam = params.get("by");
  const finishBy: FinishBy = isFinishBy(byParam) ? byParam : "any";
  const hoursParam: string =
    params.get("hours") ??
    String(appliance === "ev" ? EV_HOURS.default : CUSTOM_DEFAULTS.hours);
  const kwhParam: string = params.get("kwh") ?? String(CUSTOM_DEFAULTS.kwh);

  function update(changes: Record<string, string | null>): void {
    setParams(
      (prev) => {
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) prev.delete(key);
          else prev.set(key, value);
        }
        return prev;
      },
      { replace: true },
    );
  }

  const resolved = resolveAppliance(appliance, {
    hours: Number(hoursParam),
    kwh: Number(kwhParam),
  });
  const deadline: Date =
    finishBy === "any"
      ? new Date(now.getTime() + DAY_MS)
      : nextOccurrence(finishBy, now);
  const finishByLabel: string | null =
    finishBy === "any"
      ? null
      : `${finishBy}${dayLabel(deadline.toISOString(), now) ? ` ${dayLabel(deadline.toISOString(), now)}` : ""}`;

  const periods = forecast.data ?? [];
  const upcoming = periods
    .filter((p) => new Date(p.to).getTime() > now.getTime())
    .slice(0, 48);
  const best = findBestWindow(periods, resolved.slots, { now, deadline });
  const startNow = windowStartingNow(periods, resolved.slots, now);

  return (
    <>
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Appliance planner
        </h1>
        <p className="text-[var(--muted)] text-sm mt-1">
          When's the cleanest time to run it in the next 24 hours?
        </p>
      </header>

      <main className="space-y-6">
        <section
          aria-labelledby="planner-inputs-heading"
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <h2
            id="planner-inputs-heading"
            className="text-[var(--muted)] text-sm uppercase tracking-wide"
          >
            What are you running?
          </h2>
          <AppliancePicker
            value={appliance}
            onChange={(id) => update({ appliance: id, hours: null, kwh: null })}
          />

          {appliance === "ev" && (
            <div>
              <label htmlFor={ids.hours} className="block text-sm mb-2">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={ids.kwh} className="block text-sm mb-1.5">
                  Energy (kWh)
                </label>
                <input
                  id={ids.kwh}
                  type="number"
                  inputMode="decimal"
                  min={0.01}
                  step={0.1}
                  value={kwhParam}
                  onChange={(e) => update({ kwh: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={ids.hours} className="block text-sm mb-1.5">
                  Run time (hours)
                </label>
                <input
                  id={ids.hours}
                  type="number"
                  inputMode="decimal"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={hoursParam}
                  onChange={(e) => update({ hours: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div className="max-w-xs">
            <label htmlFor={ids.by} className="block text-sm mb-1.5">
              Needs to finish by
            </label>
            <select
              id={ids.by}
              value={finishBy}
              onChange={(e) =>
                update({ by: e.target.value === "any" ? null : e.target.value })
              }
              className={`${inputClass} bg-[var(--bg)]`}
            >
              {FINISH_BY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "any" ? "Any time in the next 24h" : option}
                </option>
              ))}
            </select>
          </div>
        </section>

        {forecast.loading && (
          <CardSkeleton label="Loading the forecast" bodyHeight="h-48" />
        )}
        {forecast.error && (
          <ErrorCard message={forecast.error} onRetry={forecast.refetch} />
        )}
        {forecast.data && (
          <PlannerResult
            appliance={resolved}
            best={best}
            startNow={startNow}
            upcoming={upcoming}
            deadline={finishBy === "any" ? undefined : deadline}
            finishByLabel={finishByLabel}
            areaName={region?.name ?? "Great Britain"}
            now={now}
          />
        )}
      </main>
    </>
  );
}
