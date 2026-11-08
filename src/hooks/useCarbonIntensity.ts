import type {
  CarbonIntensity,
  IntensityIndex,
} from "../types/carbonIntensity";
import { useApiData, type ApiDataResult } from "./useApiData";

export type UseCarbonIntensityResult = ApiDataResult<CarbonIntensity>;

type CarbonIntensityResponse = {
  data: {
    from: string;
    to: string;
    intensity: {
      forecast: number;
      actual: number | null;
      index: IntensityIndex;
    };
  }[];
};

function toCarbonIntensity(json: CarbonIntensityResponse): CarbonIntensity {
  const period = json.data[0];
  return {
    from: period.from,
    to: period.to,
    forecast: period.intensity.forecast,
    actual: period.intensity.actual,
    index: period.intensity.index,
  };
}

export function useCarbonIntensity(): UseCarbonIntensityResult {
  return useApiData(
    "https://api.carbonintensity.org.uk/intensity",
    toCarbonIntensity,
    "Could not load current intensity data.",
  );
}
