import { createContext, useContext } from "react";
import type { RegionCurrent } from "../utils/regional";

export type LocationContextValue = {
  /** Outward postcode, e.g. "SW1A", or null for national (GB) data. */
  outcode: string | null;
  setOutcode: (outcode: string | null) => void;
  /** Current conditions in the chosen region, once loaded. */
  region: RegionCurrent | null;
  regionLoading: boolean;
  regionError: string | null;
};

const national: LocationContextValue = {
  outcode: null,
  setOutcode: () => {},
  region: null,
  regionLoading: false,
  regionError: null,
};

export const LocationContext = createContext<LocationContextValue>(national);

export function useLocationContext(): LocationContextValue {
  return useContext(LocationContext);
}

export const POSTCODE_STORAGE_KEY = "postcode";
export const POSTCODE_PARAM = "postcode";
