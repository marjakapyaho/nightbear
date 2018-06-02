import { AnalyserEntry, SensorEntry } from 'server/models/model';
import { MIN_IN_MS, roundTo2Decimals, TIME_LIMIT_FOR_SLOPE } from '../calculations/calculations';
import { slice, sum, reduce } from 'lodash';

export function parseAnalyserEntries(entries: SensorEntry[]): AnalyserEntry[] {

  const analyserEntries: AnalyserEntry[] = entries
    .filter(entry => entry.bloodGlucose)
    .map((entry) => ({
      bloodGlucose: entry.bloodGlucose || 0, // TODO
      timestamp: entry.timestamp,
      slope: null,
      rawSlope: null,
    }));

  const entriesWithSlopes = analyserEntries.map((entry, i) => {
    const currentBg = entry.bloodGlucose;
    const currentTimestamp = entry.timestamp;
    const previousEntry = entries[i - 1];
    let currentSlope = null;

    if (previousEntry && previousEntry.bloodGlucose && previousEntry.timestamp) {
      const previousBg = previousEntry.bloodGlucose;
      const previousTimestamp = previousEntry.timestamp;
      const timeBetweenEntries = currentTimestamp - previousTimestamp;

      if (timeBetweenEntries < TIME_LIMIT_FOR_SLOPE) {
        currentSlope = roundTo2Decimals((currentBg - previousBg) / timeBetweenEntries * MIN_IN_MS * 5);
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
}

function detectNoise(entries: AnalyserEntry[]): number[] {
  const directionChanges = entries.map((entry, i) => {
    const previousEntry = entries[i - 1];
    let changedDirection = 0;
    if (previousEntry && previousEntry.slope && entry.slope) {
      changedDirection = previousEntry.slope > 0 && entry.slope < 0 || previousEntry.slope < 0 && entry.slope > 0 ? 1 : 0;
    }

    return changedDirection;
  });

  return directionChanges
    .map(window)
    .map(changeSum);
}

function window(_number: number, index: number, numbers: number[]): number[] {
  const start = Math.max(0, index - 1);
  const end   = Math.min(numbers.length, index + 1 + 1);
  return slice(numbers, start, end);
}

function changeSum(numbers: number[]): number {
  return sum(numbers);
}

function smoothSlopesWithNoise(entries: AnalyserEntry[], noiseArray: number[]) {
  return entries
    .map(makeWindow(noiseArray))
    .map(average);
}

function sumOfSlopes(entries: AnalyserEntry[]) {
  return reduce(entries, (slopeSum, entry) => slopeSum + (entry.slope || 0), 0);
}

function average(entries: AnalyserEntry[]) {
  const middleIndex = Math.floor(entries.length / 2);
  const currentEntry = entries[middleIndex];
  const newSlope = sumOfSlopes(entries) ? sumOfSlopes(entries) / (entries.length || 1) : currentEntry.rawSlope;
  const roundedNewSlope = newSlope ? roundTo2Decimals(newSlope) : newSlope;
  return {
    bloodGlucose: currentEntry.bloodGlucose,
    timestamp: currentEntry.timestamp,
    slope: roundedNewSlope,
    rawSlope: currentEntry.rawSlope,
  };
}

function makeWindow(noiseArray: number[]) {
  return (_number: AnalyserEntry, index: number, entries: AnalyserEntry[]): AnalyserEntry[] => {
    const noise = noiseArray[index];
    const start = Math.max(0, index - noise);
    const end   = Math.min(entries.length, index + noise + 1);
    return slice(entries, start, end);
  };
}
