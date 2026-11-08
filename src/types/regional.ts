import type { IntensityIndex } from "./carbonIntensity";
import type { GenerationSource } from "./generationMix";

/** One half hour of regional data. Regional data is forecast-only. */
export type RegionalPeriodResponse = {
  from: string;
  to: string;
  intensity: { forecast: number; index: IntensityIndex };
  generationmix: GenerationSource[];
};

export type RegionResponse = {
  regionid: number;
  dnoregion: string;
  shortname: string;
  postcode?: string;
};

/** Response from /regional/postcode/{outcode}. */
export type RegionalPostcodeResponse = {
  data: (RegionResponse & { data: RegionalPeriodResponse[] })[];
};

/** Response from /regional/intensity/{from}/fw48h/postcode/{outcode}. */
export type RegionalForecastResponse = {
  data: RegionResponse & { data: RegionalPeriodResponse[] };
};

/** Response from /regional: every region for the current half hour. */
export type AllRegionsResponse = {
  data: {
    from: string;
    to: string;
    regions: (RegionResponse & Omit<RegionalPeriodResponse, "from" | "to">)[];
  }[];
};

/** A region's current intensity, flattened for display. */
export type RegionSnapshot = {
  id: number;
  name: string;
  forecast: number;
  index: IntensityIndex;
};
