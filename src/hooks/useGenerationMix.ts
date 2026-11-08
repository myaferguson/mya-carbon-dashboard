import type { GenerationMix, GenerationSource } from "../types/generationMix";
import { useApiData, type ApiDataResult } from "./useApiData";
import { useLocationContext } from "../context/locationContext";

export type UseGenerationMixResult = ApiDataResult<GenerationMix>;

type GenerationMixResponse = {
  data: {
    from: string;
    to: string;
    generationmix: GenerationSource[];
  };
};

function toGenerationMix(json: GenerationMixResponse): GenerationMix {
  return {
    from: json.data.from,
    to: json.data.to,
    sources: json.data.generationmix,
  };
}

/** Current fuel mix for the chosen region, or GB if no postcode is set. */
export function useGenerationMix(): UseGenerationMixResult {
  const { outcode, region, regionLoading, regionError, regionRefetch } =
    useLocationContext();
  const national = useApiData(
    outcode ? null : "https://api.carbonintensity.org.uk/generation",
    toGenerationMix,
    "Could not load generation mix data.",
  );

  if (!outcode) return national;
  return {
    data: region?.mix ?? null,
    loading: regionLoading,
    error: regionError,
    refetch: regionRefetch,
  };
}
