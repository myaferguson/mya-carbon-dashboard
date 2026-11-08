import { useSearchParams } from "react-router-dom";
import {
  CUSTOM_DEFAULTS,
  EV_HOURS,
  isApplianceId,
  isFinishBy,
  nextOccurrence,
  resolveAppliance,
  type ApplianceId,
  type FinishBy,
  type ResolvedAppliance,
} from "../utils/appliances";
import { dayLabel } from "../utils/formatTime";

const DAY_MS = 24 * 60 * 60 * 1000;

export type PlannerState = {
  appliance: ApplianceId;
  resolved: ResolvedAppliance;
  finishBy: FinishBy;
  /** Raw inputs, kept as strings so a half-typed number isn't rewritten. */
  hoursInput: string;
  kwhInput: string;
  /** The run must end by this time (24h ahead when "any time"). */
  deadline: Date;
  /** e.g. "07:00 tomorrow", or null for "any time". */
  finishByLabel: string | null;
  update: (changes: Record<string, string | null>) => void;
};

/**
 * The planner's choices, stored in the URL (?appliance=ev&hours=4&by=07:00)
 * so a plan can be shared. Defaults to a kettle.
 */
export function usePlannerState(now: Date): PlannerState {
  const [params, setParams] = useSearchParams();

  const applianceParam: string | null = params.get("appliance");
  const appliance: ApplianceId = isApplianceId(applianceParam)
    ? applianceParam
    : "kettle";
  const byParam: string | null = params.get("by");
  const finishBy: FinishBy = isFinishBy(byParam) ? byParam : "any";
  const hoursInput: string =
    params.get("hours") ??
    String(appliance === "ev" ? EV_HOURS.default : CUSTOM_DEFAULTS.hours);
  const kwhInput: string = params.get("kwh") ?? String(CUSTOM_DEFAULTS.kwh);

  const deadline: Date =
    finishBy === "any"
      ? new Date(now.getTime() + DAY_MS)
      : nextOccurrence(finishBy, now);
  const day: string = dayLabel(deadline.toISOString(), now);
  const finishByLabel: string | null =
    finishBy === "any" ? null : day ? `${finishBy} ${day}` : finishBy;

  function update(changes: Record<string, string | null>): void {
    // Functional update, so it doesn't clobber ?postcode= set elsewhere.
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

  return {
    appliance,
    resolved: resolveAppliance(appliance, {
      hours: Number(hoursInput),
      kwh: Number(kwhInput),
    }),
    finishBy,
    hoursInput,
    kwhInput,
    deadline,
    finishByLabel,
    update,
  };
}
