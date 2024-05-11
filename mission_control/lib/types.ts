export const DATA_KEYS = [
  "temperature",
  "pressure",
  "altitude",
  "relativeAltitude",
  "latitude",
  "longitude",
  "accelX",
  "accelY",
  "accelZ",
  "gyroX",
  "gyroY",
  "gyroZ",
] as const;

export type Data = Record<(typeof DATA_KEYS)[number], number>;

export const GRAPH_KEYS = [
  "temperature",
  "pressure",
  "altitude",
  "relativeAltitude",
  "acceleration",
] as const;

export type Orientation = {
  gyroX: number;
  gyroY: number;
  gyroZ: number;
};
