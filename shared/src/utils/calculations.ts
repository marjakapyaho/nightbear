import { fill, groupBy, reduce } from 'lodash';
import {
  BloodGlucoseEntry,
  CarbEntry,
  InsulinEntry,
  MeterEntry,
  SensorEntry,
} from '../types';
import { timeInRangeHighLimit, timeInRangeLowLimit } from './config';
import {
  getDateWithoutTime,
  getDateWithoutTimeMs,
  getTimeMinusTimeMs,
  hourToMs,
  isTimeSmaller,
} from './time';
import { isValidNumber, roundNumberToFixedDecimals } from './helpers';

export const SEC_IN_MS = 1000;
export const MIN_IN_MS = 60 * SEC_IN_MS;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const TIME_LIMIT_FOR_SLOPE = 15 * MIN_IN_MS;
export const NOISE_LEVEL_LIMIT = 4;

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
export const calculateRaw = (
  unfiltered: number,
  slope: number,
  intercept: number,
  scale = 1,
): number | null => {
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

export const calculateHba1c = (entries: BloodGlucoseEntry[]) => {
  const sumOfEntries = reduce(
    entries,
    (sum, entry) => {
      return sum + changeBloodGlucoseUnitToMgdl(entry.bloodGlucose);
    },
    0,
  );

  const avgGlucose = sumOfEntries / entries.length;

  // Base formula (avgGlucose + 46.7) / 28.7) from research, -0.6 from Nightscout
  return (avgGlucose + 46.7) / 28.7 - 0.6;
};

export const calculateTimeInRange = (sensorEntries: BloodGlucoseEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry =>
      entry.bloodGlucose &&
      entry.bloodGlucose >= timeInRangeLowLimit &&
      entry.bloodGlucose <= timeInRangeHighLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

export const calculateTimeLow = (sensorEntries: BloodGlucoseEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry => entry.bloodGlucose && entry.bloodGlucose < timeInRangeLowLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

export const calculateTimeHigh = (sensorEntries: BloodGlucoseEntry[]) => {
  const totalCount = sensorEntries.length;
  const goodCount = sensorEntries.filter(
    entry => entry.bloodGlucose && entry.bloodGlucose > timeInRangeHighLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
};

// Note: if there is e.g. 10 entries over limit in a row, it's categorized as one single occurrence of situation
export const countSituations = (
  sensorEntries: BloodGlucoseEntry[],
  limit: number,
  low: boolean,
) => {
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

export const getBgAverage = (sensorEntries: BloodGlucoseEntry[]) => {
  const entriesWithBgs = sensorEntries.filter(entry => entry.bloodGlucose);
  return setOneDecimal(
    entriesWithBgs.reduce((sum, entry) => sum + (entry.bloodGlucose || 0), 0) /
      entriesWithBgs.length,
  );
};

const getTotal = (dailyAmounts: (InsulinEntry | CarbEntry)[]) =>
  dailyAmounts.reduce((prev, current) => prev + current.amount, 0);

const getDailyAverage = (dailySensorEntries: BloodGlucoseEntry[]) =>
  dailySensorEntries.length
    ? dailySensorEntries.reduce((prev, current) => prev + current.bloodGlucose, 0) /
      dailySensorEntries.length
    : 0;

export const calculateDailyAmounts = (
  entries: (InsulinEntry | CarbEntry)[],
  days: number,
  now = Date.now(),
) => {
  const dayArray = fill(Array(days), null).map((_val, i) => ({
    timestamp: getDateWithoutTimeMs(now - DAY_IN_MS * i),
    total: null,
  }));
  const groupedEntries = groupBy(entries, entry => getDateWithoutTime(entry.timestamp));
  return dayArray
    .map(day => ({
      timestamp: day.timestamp,
      total:
        day.timestamp && groupedEntries[day.timestamp]
          ? getTotal(groupedEntries[day.timestamp])
          : null,
    }))
    .reverse();
};

export const calculateDailyAverageBgs = (
  entries: BloodGlucoseEntry[],
  days: number,
  now = Date.now(),
) => {
  const dayArray = fill(Array(days), null).map((_val, i) => ({
    timestamp: getDateWithoutTimeMs(now - DAY_IN_MS * i),
    average: null,
  }));
  const groupedEntries = groupBy(entries, entry => getDateWithoutTime(entry.timestamp));
  return dayArray
    .map(day => ({
      timestamp: day.timestamp,
      average:
        day.timestamp && groupedEntries[day.timestamp]
          ? getDailyAverage(groupedEntries[day.timestamp])
          : null,
    }))
    .reverse();
};

export const calculateAverageBg = (entries: (SensorEntry | MeterEntry)[]) => {
  const sumOfBgs = entries.map(entry => entry.bloodGlucose).reduce((prev, cur) => prev + cur, 0);
  return roundNumberToFixedDecimals(sumOfBgs / entries.length, 1);
};

// Adjusted from: https://github.com/LoopKit/LoopKit/blob/dev/LoopKit/InsulinKit/ExponentialInsulinModel.swift (MIT license)
const calculatePercentageRemaining = (
  actionDuration: number,
  peakActivityTime: number,
  minutesSince: number,
) => {
  const pi =
    (peakActivityTime * (1 - peakActivityTime / actionDuration)) /
    (1 - (2 * peakActivityTime) / actionDuration);
  const a = (2 * pi) / actionDuration;
  const S = 1 / (1 - a + (1 + a) * Math.exp(-actionDuration / pi));

  if (minutesSince <= 0) {
    return 1;
  } else if (minutesSince >= actionDuration) {
    return 0;
  }

  return (
    1 -
    S *
      (1 - a) *
      ((Math.pow(minutesSince, 2) / (pi * actionDuration * (1 - a)) - minutesSince / pi - 1) *
        Math.exp(-minutesSince / pi) +
        1)
  );
};

// Adjusted from: https://github.com/LoopKit/LoopKit/blob/dev/LoopKit/InsulinKit/ExponentialInsulinModel.swift (MIT license)
export const getPercentOfInsulinRemaining = (
  injectionTimestamp: string,
  currentTimestamp: string,
) => {
  const actionDuration = 360; // Minutes (Fiasp)
  const peakActivityTime = 55; // Minutes (Fiasp)
  const minutesSinceInjection =
    getTimeMinusTimeMs(currentTimestamp, injectionTimestamp) / MIN_IN_MS;

  return calculatePercentageRemaining(actionDuration, peakActivityTime, minutesSinceInjection);
};

export const getInsulinOnBoard = (currentTimestamp: string, insulinEntries: InsulinEntry[]) =>
  insulinEntries
    .filter(entry => entry.type === 'FAST')
    .map(entry => {
      const insulinRemainingPercentage = getPercentOfInsulinRemaining(
        entry.timestamp,
        currentTimestamp,
      );
      return insulinRemainingPercentage * entry.amount;
    })
    .reduce((prev, cur) => prev + cur, 0);

// Adjusted from the insulin graph above
export const getPercentOfCarbsRemaining = (
  digestionTimestamp: string,
  currentTimestamp: string,
  durationFactor: number,
) => {
  const actionDuration = 60 * durationFactor; // Minutes (default is for sugar)
  const peakActivityTime = 20 * durationFactor; // Minutes (default is for sugar)
  const minutesSinceDigestion =
    getTimeMinusTimeMs(currentTimestamp, digestionTimestamp) / MIN_IN_MS;

  return calculatePercentageRemaining(actionDuration, peakActivityTime, minutesSinceDigestion);
};

export const getCarbsOnBoard = (currentTimestamp: string, carbEntries: CarbEntry[]) =>
  carbEntries
    .map(entry => {
      const carbsRemainingPercentage = getPercentOfCarbsRemaining(
        entry.timestamp,
        currentTimestamp,
        entry.durationFactor,
      );
      return carbsRemainingPercentage * entry.amount;
    })
    .reduce((prev, cur) => prev + cur, 0);

export const calculateCurrentCarbsToInsulinRatio = (
  carbsOnBoard: number,
  insulinOnBoard: number,
) => {
  const ratio = carbsOnBoard / insulinOnBoard;
  return isValidNumber(ratio) ? ratio : null;
};

export const calculateRequiredCarbsToInsulinRatio = (
  currentTimestamp: string,
  carbEntries: CarbEntry[],
  insulinEntries: InsulinEntry[],
) => {
  // Ignore last 2 hours as we might be having an issue with missing insulin or carbs, so it's not a good example
  const timeWindowEnd = getTimeMinusTimeMs(currentTimestamp, hourToMs(2));
  const relevantCarbEntries = carbEntries.filter(entry => isTimeSmaller(entry.timestamp, timeWindowEnd));
  const relevantInsulinEntries = insulinEntries.filter(entry => isTimeSmaller(entry.timestamp, timeWindowEnd));

  const sumOfCarbs = relevantCarbEntries
    .map(entry => entry.amount)
    .reduce((prev, cur) => prev + cur, 0);

  const sumOfInsulins = relevantInsulinEntries
    .map(entry => entry.amount)
    .reduce((prev, cur) => prev + cur, 0);

  const ratio = sumOfCarbs / sumOfInsulins;

  return isValidNumber(ratio) ? ratio : null;
};
