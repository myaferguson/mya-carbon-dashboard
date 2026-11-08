import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";
import { toOutcode } from "../utils/postcode";
import { regionalCurrentUrl, toRegionCurrent } from "../utils/regional";
import {
  LocationContext,
  POSTCODE_PARAM,
  POSTCODE_STORAGE_KEY,
  type LocationContextValue,
} from "./locationContext";

/**
 * Holds the visitor's chosen postcode. It starts from ?postcode= in the URL,
 * then localStorage, then national. Changes are written back to both so the
 * URL can be shared.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [outcode, setOutcodeState] = useState<string | null>(() => {
    const fromUrl = toOutcode(searchParams.get(POSTCODE_PARAM) ?? "");
    if (fromUrl) return fromUrl;
    return toOutcode(localStorage.getItem(POSTCODE_STORAGE_KEY) ?? "");
  });

  const setOutcode = useCallback(
    (next: string | null): void => {
      setOutcodeState(next);
      if (next) localStorage.setItem(POSTCODE_STORAGE_KEY, next);
      else localStorage.removeItem(POSTCODE_STORAGE_KEY);
      setSearchParams(
        (params) => {
          if (next) params.set(POSTCODE_PARAM, next);
          else params.delete(POSTCODE_PARAM);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Navigating between pages drops the query string; put the postcode back
  // so the address bar is always shareable.
  const urlOutcode: string | null = searchParams.get(POSTCODE_PARAM);
  useEffect(() => {
    if (outcode && urlOutcode !== outcode) {
      setSearchParams(
        (params) => {
          params.set(POSTCODE_PARAM, outcode);
          return params;
        },
        { replace: true },
      );
    }
  }, [outcode, urlOutcode, setSearchParams]);

  const current = useApiData(
    outcode ? regionalCurrentUrl(outcode) : null,
    toRegionCurrent,
    `Couldn't find data for ${outcode ?? "that postcode"}.`,
  );

  const value: LocationContextValue = useMemo(
    () => ({
      outcode,
      setOutcode,
      region: current.data,
      regionLoading: current.loading,
      regionError: current.error,
      regionRefetch: current.refetch,
    }),
    [outcode, setOutcode, current.data, current.loading, current.error, current.refetch],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}
