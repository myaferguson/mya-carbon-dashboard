import { useEffect, useState } from "react";
import type { CarbonIntensity } from "../types/carbonIntensity";

export type UseCarbonIntensityResult = {
  data: CarbonIntensity | null;
  loading: boolean;
  error: string | null;
}

export function useCarbonIntensity(): UseCarbonIntensityResult {
  const [data, setData] = useState<CarbonIntensity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(
          "https://api.carbonintensity.org.uk/intensity",
        );
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`,
          );
        }
        const json = await response.json();
        const period = json.data[0];

        if (cancelled) return;

        setData({
          from: period.from,
          to: period.to,
          forecast: period.intensity.forecast,
          actual: period.intensity.actual,
          index: period.intensity.index,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch carbon intensity:", err);
        setError((err as Error).message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
