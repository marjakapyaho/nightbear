export const NOISE_LEVEL_LIMIT = 4;
export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;

// Conversion from mg/dL to mmol/L (rounds to 1 decimal)
export function changeBloodGlucoseUnitToMmoll(glucoseInMgdl: number): number {
  return Math.round((glucoseInMgdl / 18) * 10) / 10;
}

// Conversion from mmol/L to mg/dL
export function changeBloodGlucoseUnitToMgdl(glucoseInMmoll: number): number {
  const numeric = Math.floor(10 * glucoseInMmoll) / 10;
  return Math.round(18 * numeric);
}

// Calculates actual blood glucose in mmol/L
export function calculateRaw(
  unfiltered: number,
  slope: number,
  intercept: number,
  scale = 1,
): number | null {
  if (unfiltered !== 0 && slope !== 0 && scale !== 0) {
    const raw = scale * (unfiltered - intercept) / slope;
    return changeBloodGlucoseUnitToMmoll(raw);
  }

  return null;
}

// Is Dexcom entry valid
export function isDexcomEntryValid(noise: number, sgv: number): boolean {
  return noise < NOISE_LEVEL_LIMIT && sgv > 40;
}
