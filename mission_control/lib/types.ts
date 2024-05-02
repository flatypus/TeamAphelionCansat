export const DATA_KEYS = [
  "temperature",
  "pressure",
  "altitude",
  "relativeAltitude",
  "latitude",
  "longitude",
] as const;

export type Data = Record<(typeof DATA_KEYS)[number], number>;
