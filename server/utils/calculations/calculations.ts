import { chain, reduce, slice } from 'lodash';
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
        currentSlope = (currentBg - previousBg) / timeBetweenEntries * MIN_IN_MS * 5;
      }
    }
    return {
      bloodGlucose: currentBg,
      timestamp: currentTimestamp,
      slope: currentSlope ? roundTo2Decimals(currentSlope) : null,
    };
  });

  const noiseArray = detectNoise(entriesWithSlopes);

  return smoothSlopesWithNoise(entriesWithSlopes, noiseArray);
}

function detectNoise(entries: AnalyserEntry[]) {
  return entries.map(() => 0);
}

function smoothSlopesWithNoise(entries: AnalyserEntry[], noiseArray: number[]) {
  return chain(entries)
    .map(makeWindow(noiseArray))
    .map(average)
    .value() as any; // TODO
}

function sum(entries: AnalyserEntry[]) {
  return reduce(entries, (sumOfSlopes, entry) => sumOfSlopes + (entry.slope || 0), 0);
}

function average(entries: AnalyserEntry[]) {
  const newSlope = sum(entries) / (entries.length || 1);
  const middleIndex = Math.floor(entries.length / 2);
  const currentEntry = entries[middleIndex];

  return {
    bloodGlucose: currentEntry.bloodGlucose,
    timestamp: currentEntry.timestamp,
    slope: roundTo2Decimals(newSlope),
  };
}

function makeWindow(noiseArray: number[]) {
  return (_number: number, index: number, entries: AnalyserEntry[]) => {
    const noise = noiseArray[index];
    const start = Math.max(0, index - noise);
    const end   = Math.min(entries.length, index + noise + 1);
    return slice(entries, start, end);
  };
}
