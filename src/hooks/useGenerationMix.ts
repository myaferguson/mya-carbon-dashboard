import type { GenerationMix, GenerationSource } from "../types/generationMix";
import { useApiData, type ApiDataResult } from "./useApiData";

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

export function useGenerationMix(): UseGenerationMixResult {
  return useApiData(
    "https://api.carbonintensity.org.uk/generation",
    toGenerationMix,
    "Could not load generation mix data.",
  );
}
