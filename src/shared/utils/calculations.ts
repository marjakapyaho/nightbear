import { fill, groupBy, reduce } from 'lodash';
import { DateTime } from 'luxon';
import { CarbEntry, InsulinEntry, SensorEntry } from 'shared/types/timelineEntries';
import { timeInRangeHighLimit, timeInRangeLowLimit } from 'shared/utils/config';
import { getTimeAsISOStr } from 'shared/utils/time';

export const SEC_IN_MS = 1000;
export const MIN_IN_MS = 60 * SEC_IN_MS;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const TIME_LIMIT_FOR_SLOPE = 15 * MIN_IN_MS;
export const NOISE_LEVEL_LIMIT = 4;

export type SensorEntryWithBg = SensorEntry & { bloodGlucose: number };

export const hasBloodGlucose = (e: SensorEntry): e is SensorEntryWithBg => !!e.bloodGlucose;

// Conversion from mg/dL to mmol/L (rounds to 1 decimal)
export const changeBloodGlucoseUnitToMmoll = (glucoseInMgdl: number): number => {
  return Math.round((glucoseInMgdl / 18) * 10) / 10;
};

// Conversion from mmol/L to mg/dL
export const changeBloodGlucoseUnitToMgdl = (glucoseInMmoll: number): number => {
  const numeric = Math.floor(10 * glucoseInMmoll) / 10;
  return Math.round(18 * numeric);
};

// Calculates actual blood glucose in mmol/L
export const calculateRaw = (unfiltered: number, slope: number, intercept: number, scale = 1): number | null => {
  if (unfiltered !== 0 && slope !== 0 && scale !== 0) {
    const raw = (scale * (unfiltered - intercept)) / slope;
    return changeBloodGlucoseUnitToMmoll(raw);
  }

  return null;
};

// Is Dexcom entry valid
export const isDexcomEntryValid = (noise: number, sgv: number): boolean => {
  return noise < NOISE_LEVEL_LIMIT && sgv > 40;
};

export function setOneDecimal(num: number | null): string {
  return num ? (Math.round(num * 10) / 10).toFixed(1) : '';
}

export function setDecimals(num: number | null, decimals: number): string {
  return num ? num.toFixed(decimals) : '';
}

// Rounds a number to 0 decimals
export const roundTo0Decimals = (num: number) => {
  return Math.round(num);
};

// Rounds a number to 1 decimal; for contexts where more precision is a nuisance when debugging
export const roundTo1Decimals = (num: number) => {
  return Math.round(num * 10) / 10;
};

export const roundTo2Decimals = (num: number) => {
  return Math.round(num * 100) / 100;
};

export const timestampIsUnderMaxAge = (
  currentTimestamp: number,
  timestampToCheck: number,
  maxAgeInMinutes: number,
): boolean => {
  const maxAgeInMs = maxAgeInMinutes * MIN_IN_MS;
  return timestampToCheck > currentTimestamp - maxAgeInMs;
};

export const calculateHba1c = (entries: SensorEntry[]) => {
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
};

export const calculateTimeInRange = (sensorEntries: SensorEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry =>
      entry.bloodGlucose && entry.bloodGlucose >= timeInRangeLowLimit && entry.bloodGlucose <= timeInRangeHighLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

export const calculateTimeLow = (sensorEntries: SensorEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry => entry.bloodGlucose && entry.bloodGlucose < timeInRangeLowLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

export const calculateTimeHigh = (sensorEntries: SensorEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry => entry.bloodGlucose && entry.bloodGlucose > timeInRangeHighLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

// Note: if there is e.g. 10 entries over limit in a row, it's categorized as one single occurrence of situation
export const countSituations = (sensorEntries: SensorEntry[], limit: number, low: boolean) => {
  let counter = 0;
  let incidentBeingRecorded: boolean;

  sensorEntries.forEach(entry => {
    if (entry.bloodGlucose && (low ? entry.bloodGlucose < limit : entry.bloodGlucose > limit)) {
      if (!incidentBeingRecorded) {
        counter++;
        incidentBeingRecorded = true;
      }
    } else {
      incidentBeingRecorded = false;
    }
  });

  return counter;
};

export const getBgAverage = (sensorEntries: SensorEntry[]) => {
  const entriesWithBgs = sensorEntries.filter(entry => entry.bloodGlucose);
  return setOneDecimal(
    entriesWithBgs.reduce((sum, entry) => sum + (entry.bloodGlucose || 0), 0) / entriesWithBgs.length,
  );
};

const getDateInIsoFormat = (timestamp: number) => DateTime.fromMillis(timestamp).toISODate();

const getTotal = (dailyAmounts: (InsulinEntry | CarbEntry)[]) =>
  dailyAmounts.reduce((prev, current) => prev + current.amount, 0);

const getDailyAverage = (dailySensorEntries: SensorEntry[]) =>
  dailySensorEntries.length
    ? dailySensorEntries.reduce((prev, current) => prev + current.bloodGlucose, 0) / dailySensorEntries.length
    : 0;

export const calculateDailyAmounts = (entries: (InsulinEntry | CarbEntry)[], days: number, now = Date.now()) => {
  const dayArray = fill(Array(days), null).map((_val, i) => ({
    timestamp: getTimeAsISOStr(now - DAY_IN_MS * i),
    total: null,
  }));
  const groupedEntries = groupBy(entries, entry => entry.timestamp);
  return dayArray.map(day => ({
    timestamp: day.timestamp,
    total: day.timestamp && groupedEntries[day.timestamp] ? getTotal(groupedEntries[day.timestamp]) : null,
  }));
};

export const calculateDailyAverageBgs = (entries: SensorEntry[], days: number, now = Date.now()) => {
  const dayArray = fill(Array(days), null).map((_val, i) => ({
    timestamp: getTimeAsISOStr(now - DAY_IN_MS * i),
    average: null,
  }));
  const groupedEntries = groupBy(entries, entry => entry.timestamp);
  return dayArray.map(day => ({
    timestamp: day.timestamp,
    average: day.timestamp && groupedEntries[day.timestamp] ? getDailyAverage(groupedEntries[day.timestamp]) : null,
  }));
};
