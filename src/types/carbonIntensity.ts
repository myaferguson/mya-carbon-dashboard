export type IntensityIndex =
  | "very low"
  | "low"
  | "moderate"
  | "high"
  | "very high";

export interface CarbonIntensity {
  from: string;
  to: string;
  forecast: number;
  actual: number | null;
  index: IntensityIndex;
}
