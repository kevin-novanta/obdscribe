// src/data/vehicleOptions.ts

import rawData from "./vehicle-makes-models.json";

// --- Types & Raw Shape ---

// Shape of the JSON file:
// {
//   "brands": {
//     "Toyota": ["Corolla", "Camry", ...],
//     "Honda": ["Civic", "Accord", ...],
//     ...
//   }
// }
type VehicleBrandsJson = {
  brands: Record<string, string[]>;
};

const data = rawData as VehicleBrandsJson;

export type VehicleMakeModels = {
  make: string;
  models: string[];
};

// Flattened list of makes + models (if you ever need it)
export const VEHICLE_DATA: VehicleMakeModels[] = Object.entries(data.brands).map(
  ([make, models]) => ({
    make,
    models,
  })
);

// --- Years ---

export const MIN_YEAR = 1940;
export const MAX_YEAR = 2026;

export const YEARS: number[] = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i
);

// --- Makes + Make -> Models map ---

// Sorted list of makes for the first dropdown
export const MAKES: string[] = Object.keys(data.brands).sort();

// Direct map from make -> models for fast lookup
export const VEHICLE_MAKE_MODELS: Record<string, string[]> = data.brands;