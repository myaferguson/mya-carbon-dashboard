import { useApiData, type ApiDataResult } from "./useApiData";
import { ALL_REGIONS_URL, toAllRegions, type AllRegions } from "../utils/regional";

/** Current intensity in every region, cleanest first, plus the GB figure. */
export function useRegions(): ApiDataResult<AllRegions> {
  return useApiData(ALL_REGIONS_URL, toAllRegions, "Could not load regional data.");
}
