import { reduce } from 'lodash';
import { hasBloodGlucose } from 'backend/utils/data';
import { timeInRangeHighLimit, timeInRangeLowLimit } from 'frontend/utils/config';
import { setOneDecimal } from 'frontend/utils/helpers';
import { BloodGlucoseEntry } from 'shared/mocks/timelineEntries';

export const SEC_IN_MS = 1000;
export const MIN_IN_MS = 60 * SEC_IN_MS;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const TIME_LIMIT_FOR_SLOPE = 15 * MIN_IN_MS;
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
export function calculateRaw(unfiltered: number, slope: number, intercept: number, scale = 1): number | null {
  if (unfiltered !== 0 && slope !== 0 && scale !== 0) {
    const raw = (scale * (unfiltered - intercept)) / slope;
    return changeBloodGlucoseUnitToMmoll(raw);
  }

  return null;
}

// Is Dexcom entry valid
export function isDexcomEntryValid(noise: number, sgv: number): boolean {
  return noise < NOISE_LEVEL_LIMIT && sgv > 40;
}

// Rounds a number to 0 decimals
export function roundTo0Decimals(num: number) {
  return Math.round(num);
}

// Rounds a number to 1 decimal; for contexts where more precision is a nuisance when debugging
export function roundTo1Decimals(num: number) {
  return Math.round(num * 10) / 10;
}

export function roundTo2Decimals(num: number) {
  return Math.round(num * 100) / 100;
}

export function timestampIsUnderMaxAge(
  currentTimestamp: number,
  timestampToCheck: number,
  maxAgeInMinutes: number,
): boolean {
  const maxAgeInMs = maxAgeInMinutes * MIN_IN_MS;
  return timestampToCheck > currentTimestamp - maxAgeInMs;
}

export function calculateHba1c(entries: BloodGlucoseEntry[]) {
  const numericEntries = entries.filter(hasBloodGlucose);
  const sumOfEntries = reduce(
    numericEntries,
    (sum, entry) => {
      return sum + changeBloodGlucoseUnitToMgdl(entry.bloodGlucose);
    },
    0,
  );

  const avgGlucose = sumOfEntries / numericEntries.length;

  // Base formula (avgGlucose + 46.7) / 28.7) from research, -0.6 from Nightscout
  return (avgGlucose + 46.7) / 28.7 - 0.6;
}

export function calculateTimeInRange(bgModels: BloodGlucoseEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(
    model =>
      model.bloodGlucose && model.bloodGlucose >= timeInRangeLowLimit && model.bloodGlucose <= timeInRangeHighLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
}

export function calculateTimeLow(bgModels: BloodGlucoseEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(model => model.bloodGlucose && model.bloodGlucose < timeInRangeLowLimit).length;

  return Math.round((goodCount / totalCount) * 100);
}

export function calculateTimeHigh(bgModels: BloodGlucoseEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(model => model.bloodGlucose && model.bloodGlucose > timeInRangeHighLimit).length;

  return Math.round((goodCount / totalCount) * 100);
}

// Note: if there is e.g. 10 entries over limit in a row, it's categorized as one single occurrence of situation
export function countSituations(bgModels: BloodGlucoseEntry[], limit: number, low: boolean) {
  let counter = 0;
  let incidentBeingRecorded: boolean;

  bgModels.forEach(model => {
    if (model.bloodGlucose && (low ? model.bloodGlucose < limit : model.bloodGlucose > limit)) {
      if (!incidentBeingRecorded) {
        counter++;
        incidentBeingRecorded = true;
      }
    } else {
      incidentBeingRecorded = false;
    }
  });

  return counter;
}

export function getBgAverage(bgModels: BloodGlucoseEntry[]) {
  const modelsWithBgs = bgModels.filter(model => model.bloodGlucose);
  return setOneDecimal(modelsWithBgs.reduce((sum, model) => sum + (model.bloodGlucose || 0), 0) / modelsWithBgs.length);
}
