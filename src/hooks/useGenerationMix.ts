import { useEffect, useState } from "react";
import type { GenerationMix, GenerationSource } from "../types/generationMix";

export type UseGenerationMixResult = {
    data: GenerationMix | null;
    loading: boolean;
    error: string | null;
}

export function useGenerationMix(): UseGenerationMixResult {
    const [data, setData] = useState<GenerationMix | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                const response = await fetch(
                    "https://api.carbonintensity.org.uk/generation",
                );
                if (!response.ok) {
                    throw new Error(
                        `API returned ${response.status}: ${response.statusText}`,
                    );
                }
                const json = await response.json();

                if (cancelled) return;

                const sources: GenerationSource[] = json.data.generationmix
                setData({
                    from: json.data.from,
                    to: json.data.to,
                    sources,
                });
                setLoading(false);
            }
            catch (err) {
                if (cancelled) return;
                console.error("Failed to fetch generation mix:", err);
                setError("Could not load generation mix data");
                setLoading(false);
            } }

            fetchData();
            return () => {
                cancelled = true;
            }
        }, []);

        return {data, loading, error};

    }



                
                