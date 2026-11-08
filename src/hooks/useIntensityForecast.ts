import { useNow } from "./useNow";
import type {
  DailyIntensityResponse,
  HalfHourPeriod,
} from "../types/dailyIntensity";
import { useApiData, type ApiDataResult } from "./useApiData";
import { useLocationContext } from "../context/locationContext";
import {
  regionalForecastUrl,
  toApiTime,
  toRegionalPeriods,
} from "../utils/regional";

export type UseIntensityForecastResult = ApiDataResult<HalfHourPeriod[]>;

const HOUR_MS = 60 * 60 * 1000;

/** Builds the URL for the last 24h (with actuals) and next 24h (forecast). */
/** Rounds down to the start of the half hour, so urls are shared and cacheable. */
export function startOfHalfHour(date: Date): Date {
  const d = new Date(date);
  d.setUTCMinutes(d.getUTCMinutes() < 30 ? 0 : 30, 0, 0);
  return d;
}

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

/**
 * Half-hour intensity periods. Nationally: 24 hours ago to 24 hours ahead,
 * with actual values for the past. For a postcode: the next 48 hours,
 * forecast only (the regional API has no actual values).
 */
export function useIntensityForecast(): UseIntensityForecastResult {
  const { outcode } = useLocationContext();
  // Rounded to the half hour: every component in the same half hour shares
  // one request, and a new one is made when the next half hour starts.
  const halfHour: Date = startOfHalfHour(useNow());

  const national = useApiData(
    outcode ? null : forecastUrl(halfHour),
    toHalfHourPeriods,
    "Could not load the intensity forecast.",
  );
  const regional = useApiData(
    outcode ? regionalForecastUrl(outcode, halfHour) : null,
    toRegionalPeriods,
    "Could not load the forecast for your area.",
  );

  return outcode ? regional : national;
}
