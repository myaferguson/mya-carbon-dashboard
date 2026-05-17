import type { IntensityIndex } from "./carbonIntensity";

export type DailyIntensityResponse = {
  from: string;
  to: string;
  intensity: {
    forecast: number;
    actual: number | null;
    index: IntensityIndex;
  };
};

export type HalfHourPeriod = {
  from: string;
  to: string;
  // null for period that haven't started yet, or where data is unavailable
  actual: number | null;
  forecast: number;
  index: IntensityIndex;
};
