import React from "react";
import type {
  DailyIntensityResponse,
  HalfHourPeriod,
} from "../types/dailyIntensity";

export type UseDailyIntensityResult = {
  data: HalfHourPeriod[] | null;
  loading: boolean;
  error: string | null;
};

export function useDailyIntensity(): UseDailyIntensityResult {
  const [data, setData] = React.useState<HalfHourPeriod[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled: boolean = false;

    async function fetchData() {
      try {
        const response = await fetch(
          "https://api.carbonintensity.org.uk/intensity/date",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json: {
          data: DailyIntensityResponse[];
        } = (await response.json()) as {
          data: DailyIntensityResponse[];
        };

        if (cancelled) return;

        const periods: HalfHourPeriod[] = json.data.map(
          (period: DailyIntensityResponse) => ({
            from: period.from,
            to: period.to,
            actual: period.intensity.actual,
            forecast: period.intensity.forecast,
            index: period.intensity.index,
          }),
        );

        setData(periods);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.log("Error fetching daily intensity data:", err);
        setError("Could not load daily intensity data.");
        setLoading(false);
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
