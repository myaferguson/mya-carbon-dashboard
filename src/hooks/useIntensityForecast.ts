import { useState } from "react";
import type {
  DailyIntensityResponse,
  HalfHourPeriod,
} from "../types/dailyIntensity";
import { useApiData, type ApiDataResult } from "./useApiData";

export type UseIntensityForecastResult = ApiDataResult<HalfHourPeriod[]>;

const HOUR_MS = 60 * 60 * 1000;

/** The API wants minute-precision UTC timestamps, e.g. 2026-11-08T22:30Z. */
function toApiTime(date: Date): string {
  return `${date.toISOString().slice(0, 16)}Z`;
}

/** Builds the URL for the last 24h (with actuals) and next 24h (forecast). */
export function forecastUrl(now: Date): string {
  const from = new Date(now.getTime() - 24 * HOUR_MS);
  const to = new Date(now.getTime() + 24 * HOUR_MS);
  return `https://api.carbonintensity.org.uk/intensity/${toApiTime(from)}/${toApiTime(to)}`;
}

export function toHalfHourPeriods(json: {
  data: DailyIntensityResponse[];
}): HalfHourPeriod[] {
  return json.data.map((period) => ({
    from: period.from,
    to: period.to,
    actual: period.intensity.actual,
    forecast: period.intensity.forecast,
    index: period.intensity.index,
  }));
}

/** Half-hour intensity from 24 hours ago to 24 hours ahead. */
export function useIntensityForecast(): UseIntensityForecastResult {
  // Fixed for the life of the component so the request isn't repeated.
  const [url] = useState<string>(() => forecastUrl(new Date()));

  return useApiData(
    url,
    toHalfHourPeriods,
    "Could not load the intensity forecast.",
  );
}
