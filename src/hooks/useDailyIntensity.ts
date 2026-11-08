import type {
  DailyIntensityResponse,
  HalfHourPeriod,
} from "../types/dailyIntensity";
import { useApiData, type ApiDataResult } from "./useApiData";

export type UseDailyIntensityResult = ApiDataResult<HalfHourPeriod[]>;

function toHalfHourPeriods(json: {
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

export function useDailyIntensity(): UseDailyIntensityResult {
  return useApiData(
    "https://api.carbonintensity.org.uk/intensity/date",
    toHalfHourPeriods,
    "Could not load daily intensity data.",
  );
}
