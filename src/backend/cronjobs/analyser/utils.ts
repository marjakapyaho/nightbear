import {
  calculateAverageBg,
  MIN_IN_MS,
  roundTo2Decimals,
  TIME_LIMIT_FOR_SLOPE,
} from 'shared/utils/calculations';
import { reduce, slice, sum, chain } from 'lodash';
import {
  CarbEntry,
  InsulinEntry,
  MeterEntry,
  SensorEntry,
  SensorEntryType,
} from 'shared/types/timelineEntries';
import { AnalyserEntry, Situation } from 'shared/types/analyser';
import {
  getTimeMinusTimeMs,
  getTimePlusTime,
  getTimeMinusTime,
  isTimeLargerOrEqual,
} from 'shared/utils/time';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { detectSituation } from 'backend/cronjobs/analyser/analyser';
import { DateTime } from 'luxon';

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

const average = (entries: AnalyserEntry[]) => {
  const middleIndex = Math.floor(entries.length / 2);
  const currentEntry = entries[middleIndex];
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
  return (_number: AnalyserEntry, index: number, entries: AnalyserEntry[]): AnalyserEntry[] => {
    const noise = noiseArray[index];
    const start = Math.max(0, index - noise);
    const end = Math.min(entries.length, index + noise + 1);
    return slice(entries, start, end);
  };
};

const smoothSlopesWithNoise = (entries: AnalyserEntry[], noiseArray: number[]) => {
  return entries.map(makeWindow(noiseArray)).map(average);
};

export const getTimestampFlooredToEveryFiveMinutes = (timestamp: string) => {
  const dateTime = DateTime.fromISO(timestamp);
  const minuteSlot = Math.floor(dateTime.get('minute') / 5);
  return dateTime
    .set({ minute: minuteSlot * 5, second: 0, millisecond: 0 })
    .toUTC()
    .toISO();
};

export const getMergedBgEntries = (
  sensorEntries: SensorEntry[],
  meterEntries?: MeterEntry[],
): (SensorEntry | MeterEntry)[] =>
  chain(meterEntries ? [...sensorEntries, ...meterEntries] : sensorEntries)
    .sortBy('timestamp')
    .groupBy(entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp))
    .flatMap((entries, groupTimestamp) => ({
      bloodGlucose: calculateAverageBg(entries),
      timestamp: groupTimestamp,
    }))
    .value();

export const mapSensorAndMeterEntriesToAnalyserEntries = (
  sensorEntries: SensorEntry[],
  meterEntries?: MeterEntry[],
): AnalyserEntry[] => {
  const allEntries = getMergedBgEntries(sensorEntries, meterEntries);
  const analyserEntries: AnalyserEntry[] = chain(allEntries)
    .sortBy('timestamp')
    .map(entry => ({
      bloodGlucose: entry.bloodGlucose,
      timestamp: entry.timestamp,
      slope: null,
      rawSlope: null,
    }))
    .value();

  const entriesWithSlopes = analyserEntries.map((entry, i) => {
    const currentBg = entry.bloodGlucose;
    const currentTimestamp = entry.timestamp;
    const previousEntry = analyserEntries[i - 1];
    let currentSlope = null;

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
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  carbsOnBoard: number,
  insulinToCarbsRatio: number | null,
  alarms: Alarm[],
) => {
  const predictedEntries = getPredictedAnalyserEntries(entries, PREDICTION_TIME_MINUTES);

  return detectSituation(
    getLatestAnalyserEntry(predictedEntries)?.timestamp,
    activeProfile, // TODO: this might change during prediction
    predictedEntries,
    insulinOnBoard,
    carbsOnBoard,
    insulinToCarbsRatio,
    alarms,
    null,
  );
};

export const isSituationCritical = (situation?: Situation | null) =>
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

export const getRelevantEntries = (
  currentTimestamp: string,
  entries: AnalyserEntry[],
  dataNeededMinutes: number,
) => {
  const dataNeededMs = dataNeededMinutes * MIN_IN_MS;
  const timeWindowStart = getTimeMinusTimeMs(currentTimestamp, dataNeededMs);
  const relevantEntries = entries.filter(entry =>
    isTimeLargerOrEqual(entry.timestamp, timeWindowStart),
  );

  return {
    relevantEntries,
    hasEnoughData: hasEnoughData(relevantEntries, dataNeededMinutes),
  };
};

export const slopeIsDown = (entry: AnalyserEntry) => entry.slope !== null && entry.slope < 0;
