import { MIN_IN_MS, roundTo2Decimals, TIME_LIMIT_FOR_SLOPE } from 'shared/utils/calculations';
import { reduce, slice, sum, find, chain, sortBy } from 'lodash';
import {
  CarbEntry,
  InsulinEntry,
  SensorEntry,
  SensorEntryType,
} from 'shared/types/timelineEntries';
import { AnalyserEntry, Situation, State } from 'shared/types/analyser';
import {
  getTimeAddedWith,
  getTimeAsISOStr,
  getTimeSubtractedFrom,
  isTimeAfter,
} from 'shared/utils/time';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';

export type AnalyserData = {
  currentTimestamp: string;
  activeProfile: Profile;
  sensorEntries: SensorEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  alarms: Alarm[];
};

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

export const mapSensorEntriesToAnalyserEntries = (entries: SensorEntry[]): AnalyserEntry[] => {
  const analyserEntries: AnalyserEntry[] = sortBy(entries, 'timestamp')
    .filter(entry => entry.bloodGlucose)
    .map(entry => ({
      bloodGlucose: entry.bloodGlucose,
      timestamp: entry.timestamp,
      slope: null,
      rawSlope: null,
    }));

  const entriesWithSlopes = analyserEntries.map((entry, i) => {
    const currentBg = entry.bloodGlucose;
    const currentTimestamp = entry.timestamp;
    const previousEntry = analyserEntries[i - 1];
    let currentSlope = null;

    if (previousEntry && previousEntry.bloodGlucose && previousEntry.timestamp) {
      const previousBg = previousEntry.bloodGlucose;
      const previousTimestamp = previousEntry.timestamp;
      const timeBetweenEntries = getTimeSubtractedFrom(currentTimestamp, previousTimestamp);

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

export const checkThatThereIsNoCorrectionInsulin = (
  insulins: InsulinEntry[],
  currentTimestamp: string,
  highCorrectionSuppressionWindow: number,
) => {
  return !find(insulins, insulin =>
    isTimeAfter(
      insulin.timestamp,
      getTimeSubtractedFrom(currentTimestamp, highCorrectionSuppressionWindow * MIN_IN_MS),
    ),
  );
};

export const getLatestAnalyserEntry = (entries: AnalyserEntry[]) =>
  chain(entries).sortBy('timestamp').last().value();

export const getPredictedAnalyserEntries = (
  analyserEntries: AnalyserEntry[],
  predictionMinutes: number,
) => {
  if (analyserEntries.length < 2) {
    return [];
  }

  const PREDICTION_DATA_MINUTES = 30;
  const entries = analyserEntries.slice(-(PREDICTION_DATA_MINUTES / 5 + 1)); // use only last 30 minutes of data
  const entriesCount = entries.length;
  const latestEntry = getLatestAnalyserEntry(entries);

  const x = Array.from(Array(entriesCount).keys());
  const y = entries.map(entry => entry.bloodGlucose);

  const regression = new SimpleLinearRegression(x, y);

  const predictionCount = predictionMinutes / 5; // e.g. 30 minutes would predict 6 values
  const predictionArray = Array.from(Array(predictionCount).keys()).map(num => entriesCount + num);

  const predictedSensorEntries = regression.predict(predictionArray).map((val, i) => ({
    bloodGlucose: val,
    timestamp: getTimeAsISOStr(getTimeAddedWith(latestEntry?.timestamp, (i + 1) * 5 * MIN_IN_MS)),
    type: 'DEXCOM_G6_SHARE' as SensorEntryType,
  }));

  return mapSensorEntriesToAnalyserEntries(predictedSensorEntries);
};

export const isStateCritical = (state?: State) => state?.LOW || state?.BAD_LOW || state?.BAD_HIGH;
