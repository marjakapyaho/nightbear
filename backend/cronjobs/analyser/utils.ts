import {
  MIN_IN_MS,
  roundTo2Decimals,
  TIME_LIMIT_FOR_SLOPE,
} from '@nightbear/shared';
import { reduce, slice, sum, chain, find } from 'lodash';
import {
  CarbEntry,
  InsulinEntry,
  MeterEntry,
  SensorEntry,
  SensorEntryType,
} from '@nightbear/shared';
import { AnalyserEntry, Situation } from '@nightbear/shared';
import {
  getTimeMinusTimeMs,
  getTimePlusTime,
  getTimeMinusTime,
  isTimeLargerOrEqual,
  isTimeLarger,
  minToMs,
} from '@nightbear/shared';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { Profile } from '@nightbear/shared';
import { Alarm } from '@nightbear/shared';
import { detectSituation } from './analyser';
import { onlyActive } from '@nightbear/shared';
import { getMergedBgEntries } from '@nightbear/shared';

// Critical settings
export const LOW_LEVEL_BAD = 3.0;

// Minutes
export const PERSISTENT_HIGH_TIME_WINDOW = 60;
export const COMPRESSION_LOW_TIME_WINDOW = 25;
export const LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW = 4;
export const BAD_HIGH_QUARANTINE_WINDOW = 60;
export const BAD_LOW_QUARANTINE_WINDOW = 15;
export const TIME_SINCE_BG_CRITICAL = 15;
export const LOW_CORRECTION_SUPPRESSION_WINDOW = 20;

// Other units
export const HIGH_CLEARING_THRESHOLD = 1;
export const LOW_CLEARING_THRESHOLD = 0.5;
export const RELEVANT_IOB_LIMIT_FOR_LOW = 0.5;
export const RELEVANT_IOB_LIMIT_FOR_HIGH = 1;
export const CARBS_TO_INSULIN_MULTIPLIER = 1.5;

export const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
  MEGA_FAST: 2,
};

export type AnalyserData = {
  currentTimestamp: string;
  activeProfile: Profile;
  sensorEntries: SensorEntry[];
  meterEntries: MeterEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  alarms: Alarm[];
};

const PREDICTION_TIME_MINUTES = 20;
const DATA_USED_FOR_PREDICTION_MINUTES = 20;

const changeSum = (numbers: number[]): number => {
  return sum(numbers);
};

const window = (_number: number, index: number, numbers: number[]): number[] => {
  const start = Math.max(0, index - 1);
  const end = Math.min(numbers.length, index + 1 + 1);
  return slice(numbers, start, end);
};

const detectNoise = (entries: AnalyserEntry[]): number[] => {
  const directionChanges = entries.map((entry, i) => {
    const previousEntry = entries[i - 1];
    let changedDirection = 0;
    if (previousEntry && previousEntry.slope && entry.slope) {
      changedDirection =
        (previousEntry.slope > 0 && entry.slope < 0) || (previousEntry.slope < 0 && entry.slope > 0)
          ? 1
          : 0;
    }

    return changedDirection;
  });

  return directionChanges.map(window).map(changeSum);
};

const sumOfSlopes = (entries: AnalyserEntry[]) => {
  return reduce(entries, (slopeSum, entry) => slopeSum + (entry.slope || 0), 0);
};

const average = ({
  entries,
  currentEntry,
}: {
  entries: AnalyserEntry[];
  currentEntry: AnalyserEntry;
}) => {
  const newSlope = sumOfSlopes(entries)
    ? sumOfSlopes(entries) / (entries.length || 1)
    : currentEntry.rawSlope;
  const roundedNewSlope = newSlope ? roundTo2Decimals(newSlope) : newSlope;
  return {
    bloodGlucose: currentEntry.bloodGlucose,
    timestamp: currentEntry.timestamp,
    slope: roundedNewSlope,
    rawSlope: currentEntry.rawSlope,
  };
};

const makeWindow = (noiseArray: number[]) => {
  return (currentEntry: AnalyserEntry, index: number, entries: AnalyserEntry[]) => {
    const noise = noiseArray[index];
    const start = Math.max(0, index - noise);
    const end = Math.min(entries.length, index + noise + 1);
    return { entries: slice(entries, start, end), currentEntry };
  };
};

const smoothSlopesWithNoise = (entries: AnalyserEntry[], noiseArray: number[]) => {
  return entries.map(makeWindow(noiseArray)).map(average);
};

export const mapSensorAndMeterEntriesToAnalyserEntries = (
  sensorEntries: SensorEntry[],
  meterEntries?: MeterEntry[],
): AnalyserEntry[] => {
  const allEntries = getMergedBgEntries(sensorEntries, meterEntries);

  const entriesWithSlopes = allEntries.map((entry, i) => {
    const currentBg = entry.bloodGlucose;
    const currentTimestamp = entry.timestamp;
    const previousEntry = allEntries[i - 1];
    let currentSlope;

    if (previousEntry) {
      const previousBg = previousEntry.bloodGlucose;
      const previousTimestamp = previousEntry.timestamp;
      const timeBetweenEntries = getTimeMinusTimeMs(currentTimestamp, previousTimestamp);

      if (timeBetweenEntries < TIME_LIMIT_FOR_SLOPE && timeBetweenEntries > 0) {
        currentSlope = roundTo2Decimals(
          ((currentBg - previousBg) / timeBetweenEntries) * MIN_IN_MS * 5,
        );
      }
    }
    return {
      bloodGlucose: currentBg,
      timestamp: currentTimestamp,
      slope: currentSlope,
      rawSlope: currentSlope,
    };
  });

  const noiseArray = detectNoise(entriesWithSlopes);

  return smoothSlopesWithNoise(entriesWithSlopes, noiseArray);
};

export const getLatestAnalyserEntry = (entries: AnalyserEntry[]) => chain(entries).last().value();

export const getPredictedAnalyserEntries = (
  analyserEntries: AnalyserEntry[],
  predictionMinutes: number,
) => {
  if (analyserEntries.length < 2) {
    return [];
  }

  const latestEntryTimestamp = getLatestAnalyserEntry(analyserEntries)?.timestamp;
  const predictionRangeEnd = getTimeMinusTime(
    latestEntryTimestamp,
    DATA_USED_FOR_PREDICTION_MINUTES * MIN_IN_MS,
  );
  const entries = analyserEntries.filter(entry => entry.timestamp > predictionRangeEnd);
  const entriesCount = entries.length;
  const latestEntry = getLatestAnalyserEntry(entries);

  const x = Array.from(Array(entriesCount).keys());
  const y = entries.map(entry => entry.bloodGlucose);

  const regression = new SimpleLinearRegression(x, y);

  const predictionCount = predictionMinutes / 5; // e.g. 30 minutes would predict 6 values
  const predictionArray = Array.from(Array(predictionCount).keys()).map(num => entriesCount + num);

  const predictedSensorEntries = regression.predict(predictionArray).map((val, i) => ({
    bloodGlucose: val,
    timestamp: getTimePlusTime(latestEntry?.timestamp, (i + 1) * 5 * MIN_IN_MS),
    type: 'DEXCOM_G6_SHARE' as SensorEntryType,
  }));

  return mapSensorAndMeterEntriesToAnalyserEntries(predictedSensorEntries);
};

export const getPredictedSituation = (
  activeProfile: Profile,
  analyserEntries: AnalyserEntry[],
  insulinEntries: InsulinEntry[],
  carbEntries: CarbEntry[],
  alarms: Alarm[],
  requiredCarbsToInsulin: number | null,
) => {
  const predictedEntries = getPredictedAnalyserEntries(analyserEntries, PREDICTION_TIME_MINUTES);

  return detectSituation(
    getLatestAnalyserEntry(predictedEntries)?.timestamp,
    activeProfile,
    predictedEntries,
    insulinEntries,
    carbEntries,
    alarms,
    requiredCarbsToInsulin,
  );
};

export const isSituationCritical = (situation?: Situation | 'NO_SITUATION') =>
  situation === 'LOW' ||
  situation === 'BAD_LOW' ||
  situation === 'FALLING' ||
  situation === 'BAD_HIGH';

const hasEnoughData = (relevantEntries: AnalyserEntry[], dataNeededMinutes: number) => {
  // E.g. we want 30 min of data which could have 30/5 = 6 entries but depending
  // on start time and delay could only have 5 entries, and then we'll leave
  // one entry slack for the check (= -2)
  const entriesNeeded = dataNeededMinutes / 5 - 1;
  return relevantEntries.length >= entriesNeeded;
};

const getEntriesWithinTimeRange = (
  currentTimestamp: string,
  entries: AnalyserEntry[],
  dataNeededMinutes: number,
) => {
  const dataNeededMs = dataNeededMinutes * MIN_IN_MS;
  const timeWindowStart = getTimeMinusTimeMs(currentTimestamp, dataNeededMs);
  return entries.filter(entry => isTimeLargerOrEqual(entry.timestamp, timeWindowStart));
};

export const getRelevantEntries = (
  currentTimestamp: string,
  entries: AnalyserEntry[],
  dataNeededMinutes: number,
) => {
  const relevantEntries = getEntriesWithinTimeRange(currentTimestamp, entries, dataNeededMinutes);
  return {
    relevantEntries,
    hasEnoughData: hasEnoughData(relevantEntries, dataNeededMinutes),
  };
};

export const slopeIsNegative = (entry: AnalyserEntry) => entry.slope && entry.slope < 0;
export const slopeIsPositive = (entry: AnalyserEntry) => entry.slope && entry.slope > 0;

export const isSlopeFalling = (entry: AnalyserEntry) =>
  entry.slope && entry.slope < -slopeLimits.MEDIUM;

export const isSlopeRising = (entry: AnalyserEntry) =>
  entry.slope && entry.slope > slopeLimits.MEDIUM;

export const isThereTooMuchInsulin = (
  requiredCarbsToInsulin: number | null,
  currentCarbsToInsulin: number | null,
) =>
  currentCarbsToInsulin !== null &&
  requiredCarbsToInsulin !== null &&
  currentCarbsToInsulin < requiredCarbsToInsulin * CARBS_TO_INSULIN_MULTIPLIER;

export const isThereTooLittleInsulin = (
  requiredCarbsToInsulin: number | null,
  currentCarbsToInsulin: number | null,
) =>
  currentCarbsToInsulin !== null &&
  requiredCarbsToInsulin !== null &&
  currentCarbsToInsulin > requiredCarbsToInsulin * CARBS_TO_INSULIN_MULTIPLIER;

export const isBloodGlucoseRelativeLow = (latestEntry: AnalyserEntry, activeProfile: Profile) =>
  latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelRel &&
  latestEntry.bloodGlucose >= activeProfile.analyserSettings.lowLevelAbs;

export const isBloodGlucoseRelativeHigh = (latestEntry: AnalyserEntry, activeProfile: Profile) =>
  latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
  latestEntry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs;

// If predictedSituation is not defined, we're doing the "predictedSituation" detection
// for analyser and can just ignore predicted situation param
export const isPredictedSituationAnyLowOrMissing = (
  predictedSituation?: Situation | 'NO_SITUATION',
) => !predictedSituation || predictedSituation === 'LOW' || predictedSituation === 'BAD_LOW';

export const isPredictedSituationAnyHighOrMissing = (
  predictedSituation?: Situation | 'NO_SITUATION',
) => !predictedSituation || predictedSituation === 'HIGH' || predictedSituation === 'BAD_HIGH';

export const areThereSpecificSituationsInGivenWindow = (
  currentTimestamp: string,
  alarms: Alarm[],
  situation: Situation,
  windowMinutes: number,
) =>
  !alarms.find(alarm => {
    const alarmDeactivatedInsideGivenWindow =
      alarm.deactivatedAt &&
      isTimeLarger(
        alarm.deactivatedAt,
        getTimeMinusTimeMs(currentTimestamp, minToMs(windowMinutes)),
      );

    return alarm.situation === situation && (alarm.isActive || alarmDeactivatedInsideGivenWindow);
  });

export const getHighLimitWithPossibleAddition = (alarms: Alarm[], activeProfile: Profile) => {
  const thresholdAdditionIfAlreadyHigh = find(onlyActive(alarms), { situation: 'HIGH' })
    ? HIGH_CLEARING_THRESHOLD
    : 0;
  return activeProfile.analyserSettings.highLevelAbs - thresholdAdditionIfAlreadyHigh;
};

export const getLowLimitWithPossibleAddition = (alarms: Alarm[], activeProfile: Profile) => {
  const thresholdAdditionIfAlreadyLow = find(onlyActive(alarms), { situation: 'LOW' })
    ? LOW_CLEARING_THRESHOLD
    : 0;

  return activeProfile.analyserSettings.lowLevelAbs + thresholdAdditionIfAlreadyLow;
};
