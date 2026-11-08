export type ApplianceId =
  | "kettle"
  | "washing-machine"
  | "dishwasher"
  | "tumble-dryer"
  | "ev"
  | "custom";

export type AppliancePreset = {
  id: ApplianceId;
  label: string;
  /** Fits on a compact chip. */
  shortLabel: string;
  icon: string;
  /** Rough energy use for one run, in kWh (ignored for ev/custom). */
  kwh: number;
  /** Run time in half-hour slots (ignored for ev/custom). */
  slots: number;
  description: string;
};

/** Typical figures for a UK household. They're estimates, and the UI says so. */
export const APPLIANCES: AppliancePreset[] = [
  { id: "kettle", label: "Kettle", shortLabel: "Kettle", icon: "☕", kwh: 0.075, slots: 1, description: "One cup" },
  { id: "washing-machine", label: "Washing machine", shortLabel: "Washer", icon: "🧺", kwh: 1.0, slots: 4, description: "≈1 kWh over 2h" },
  { id: "dishwasher", label: "Dishwasher", shortLabel: "Dishes", icon: "🍽️", kwh: 1.2, slots: 4, description: "≈1.2 kWh over 2h" },
  { id: "tumble-dryer", label: "Tumble dryer", shortLabel: "Dryer", icon: "🌀", kwh: 2.5, slots: 3, description: "≈2.5 kWh over 1.5h" },
  { id: "ev", label: "EV charge", shortLabel: "EV", icon: "🚗", kwh: 0, slots: 0, description: "7 kW home charger" },
  { id: "custom", label: "Something else", shortLabel: "Other", icon: "🔌", kwh: 0, slots: 0, description: "Enter your own" },
];

export const EV_CHARGER_KW = 7;
export const EV_HOURS = { min: 1, max: 8, default: 4 } as const;
export const CUSTOM_DEFAULTS = { kwh: 2, hours: 2 } as const;

export function isApplianceId(value: string | null): value is ApplianceId {
  return APPLIANCES.some((a) => a.id === value);
}

export type ResolvedAppliance = {
  id: ApplianceId;
  label: string;
  kwh: number;
  slots: number;
};

/** Half hours needed to cover `hours`, at least one. */
const hoursToSlots = (hours: number): number =>
  Math.max(1, Math.ceil(hours * 2));

/** Works out energy and run time, including the EV and custom options. */
export function resolveAppliance(
  id: ApplianceId,
  options: { hours?: number; kwh?: number } = {},
): ResolvedAppliance {

  if (id === "ev") {
    const hours = clamp(options.hours ?? EV_HOURS.default, EV_HOURS.min, EV_HOURS.max);
    return { id, label: `EV charge (${hours}h)`, kwh: EV_CHARGER_KW * hours, slots: hoursToSlots(hours) };
  }
  if (id === "custom") {
    const hours = clamp(options.hours ?? CUSTOM_DEFAULTS.hours, 0.5, 24);
    const kwh = clamp(options.kwh ?? CUSTOM_DEFAULTS.kwh, 0.01, 200);
    return { id, label: "Your appliance", kwh, slots: hoursToSlots(hours) };
  }
  const preset: AppliancePreset | undefined = APPLIANCES.find((a) => a.id === id);
  if (!preset) throw new Error(`Unknown appliance: ${id}`);
  return { id, label: preset.label, kwh: preset.kwh, slots: preset.slots };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const FINISH_BY_OPTIONS = ["any", "07:00", "09:00", "18:00"] as const;
export type FinishBy = (typeof FINISH_BY_OPTIONS)[number];

export function isFinishBy(value: string | null): value is FinishBy {
  return FINISH_BY_OPTIONS.some((o) => o === value);
}

/** The next time the clock reads `hhmm` (local time), strictly after `now`. */
export function nextOccurrence(hhmm: string, now: Date): Date {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next;
}

/** Formats grams of CO₂, switching to kg from 1,000 g. */
export function formatCo2(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  if (grams >= 10) return `${Math.round(grams)} g`;
  return `${grams.toFixed(1)} g`;
}
