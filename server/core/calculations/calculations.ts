import { SensorEntry } from '../../models/model';
import { reduce } from 'lodash';
import { hasBloodGlucose } from '../../utils/data';

export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const MONTH_IN_MS = 31 * DAY_IN_MS;
export const TIME_LIMIT_FOR_SLOPE = 25 * MIN_IN_MS;
export const NOISE_LEVEL_LIMIT = 4;

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

export function roundTo2Decimals(num: number) {
  return Math.round(num * 100) / 100;
}

export function timestampIsUnderMaxAge(
  currentTimestamp: number,
  timestampToCheck: number,
  maxAgeInMinutes: number): boolean
{
  const maxAgeInMs = maxAgeInMinutes * MIN_IN_MS;
  return timestampToCheck > (currentTimestamp - maxAgeInMs);
}

export function calculateHba1c(entries: SensorEntry[]) {
  const numericEntries = entries.filter(hasBloodGlucose);
  const sumOfEntries = reduce(numericEntries, (sum, entry) => {
    return sum + changeBloodGlucoseUnitToMgdl(entry.bloodGlucose);
  }, 0);

  const avgGlucose = sumOfEntries / numericEntries.length;

  // Base formula (avgGlucose + 46.7) / 28.7) from research, -0.6 from Nightscout
  return ((avgGlucose + 46.7) / 28.7) - 0.6;
}
