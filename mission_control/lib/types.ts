export const DATA_KEYS = [
  "temperature",
  "pressure",
  "altitude",
  "relativeAltitude",
  "yaw",
  "pitch",
  "roll",
  "latitude",
  "longitude",
] as const;

export type Data = Record<(typeof DATA_KEYS)[number], number>;

export const GRAPH_KEYS = [
  "temperature",
  "pressure",
  "altitude",
  "relativeAltitude",
] as const;

export type Orientation = {
  yaw: number;
  pitch: number;
  roll: number;
};
