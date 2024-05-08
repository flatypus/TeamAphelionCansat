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
