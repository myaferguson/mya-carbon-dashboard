export type Fuel =
  | "biomass"
  | "coal"
  | "imports"
  | "gas"
  | "nuclear"
  | "other"
  | "hydro"
  | "solar"
  | "wind";

export type GenerationSource = {
  fuel: Fuel;
  perc: number;
};

export type GenerationMix = {
  from: string;
  to: string;
  sources: GenerationSource[];
};
