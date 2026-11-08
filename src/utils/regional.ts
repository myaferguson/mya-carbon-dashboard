import type { CarbonIntensity } from "../types/carbonIntensity";
import type { HalfHourPeriod } from "../types/dailyIntensity";
import type { GenerationMix } from "../types/generationMix";
import type {
  AllRegionsResponse,
  RegionalForecastResponse,
  RegionalPostcodeResponse,
  RegionSnapshot,
} from "../types/regional";

const API = "https://api.carbonintensity.org.uk";

/** The API wants minute-precision UTC timestamps, e.g. 2026-11-08T22:30Z. */
export function toApiTime(date: Date): string {
  return `${date.toISOString().slice(0, 16)}Z`;
}

export const regionalCurrentUrl = (outcode: string): string =>
  `${API}/regional/postcode/${encodeURIComponent(outcode)}`;

export const regionalForecastUrl = (outcode: string, now: Date): string =>
  `${API}/regional/intensity/${toApiTime(now)}/fw48h/postcode/${encodeURIComponent(outcode)}`;

export const ALL_REGIONS_URL = `${API}/regional`;

/** Current conditions in one region. */
export type RegionCurrent = {
  id: number;
  name: string;
  intensity: CarbonIntensity;
  mix: GenerationMix;
};

export function toRegionCurrent(json: RegionalPostcodeResponse): RegionCurrent {
  const region = json.data?.[0];
  const period = region?.data?.[0];
  if (!region || !period) throw new Error("No regional data for this postcode");
  return {
    id: region.regionid,
    name: region.shortname,
    intensity: {
      from: period.from,
      to: period.to,
      forecast: period.intensity.forecast,
      actual: null,
      index: period.intensity.index,
    },
    mix: {
      from: period.from,
      to: period.to,
      sources: period.generationmix,
    },
  };
}

export function toRegionalPeriods(
  json: RegionalForecastResponse,
): HalfHourPeriod[] {
  // Unknown postcodes come back as 200 with `data: null`.
  if (!json.data?.data) throw new Error("No regional forecast for this postcode");
  return json.data.data.map((period) => ({
    from: period.from,
    to: period.to,
    forecast: period.intensity.forecast,
    actual: null,
    index: period.intensity.index,
  }));
}

/** The 14 local regions; ids 15-18 are England, Scotland, Wales and GB totals. */
const LOCAL_REGION_MAX_ID = 14;
export const GB_REGION_ID = 18;

export type AllRegions = {
  local: RegionSnapshot[];
  gb: RegionSnapshot | null;
};

export function toAllRegions(json: AllRegionsResponse): AllRegions {
  const snapshots: RegionSnapshot[] = json.data[0].regions.map((r) => ({
    id: r.regionid,
    name: r.shortname,
    forecast: r.intensity.forecast,
    index: r.intensity.index,
  }));
  return {
    local: snapshots
      .filter((r) => r.id <= LOCAL_REGION_MAX_ID)
      .sort((a, b) => a.forecast - b.forecast),
    gb: snapshots.find((r) => r.id === GB_REGION_ID) ?? null,
  };
}
