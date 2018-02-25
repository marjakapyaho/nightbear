import {AnalyserEntry, SensorEntry} from './model';

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
      slope: currentSlope,
    };
  });

  const noiseArray = detectNoise(entriesWithSlopes);

  return smoothSlopesWithNoise(entriesWithSlopes, noiseArray);
}

function detectNoise(entries: AnalyserEntry[]) {
  console.log(entries); // tslint:disable-line:no-console
  return [];
}

function smoothSlopesWithNoise(entries: AnalyserEntry[], noiseArray: number[]) {
  console.log(noiseArray); // tslint:disable-line:no-console
  return entries;
}
