import type {
  CarbonIntensity,
  IntensityIndex,
} from "../types/carbonIntensity";
import { useApiData, type ApiDataResult } from "./useApiData";
import { useLocationContext } from "../context/locationContext";

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

/** Current intensity for the chosen region, or GB if no postcode is set. */
export function useCarbonIntensity(): UseCarbonIntensityResult {
  const { outcode, region, regionLoading, regionError, regionRefetch } =
    useLocationContext();
  const national = useApiData(
    outcode ? null : "https://api.carbonintensity.org.uk/intensity",
    toCarbonIntensity,
    "Could not load current intensity data.",
  );

  if (!outcode) return national;
  return {
    data: region?.intensity ?? null,
    loading: regionLoading,
    error: regionError,
    refetch: regionRefetch,
  };
}
