import { reduce, slice, sum } from 'lodash';
import { AnalyserEntry, SensorEntry } from '../model';

export const MIN_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MIN_IN_MS;
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
