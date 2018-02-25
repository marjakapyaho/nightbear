import { chain, find, filter, some } from 'lodash';
import { Alarm, AnalyserEntry, Carbs, DeviceStatus, Insulin, Profile, SensorEntry } from './model';
import { calculateSlopesForEntries, HOUR_IN_MS, MIN_IN_MS } from './calculations';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_PERSISTENT_HIGH = 'persistent_high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_BATTERY = 'battery';

export const state = {
  [STATUS_OUTDATED]: false,
  [STATUS_HIGH]: false,
  [STATUS_PERSISTENT_HIGH]: false,
  [STATUS_LOW]: false,
  [STATUS_RISING]: false,
  [STATUS_FALLING]: false,
  [STATUS_BATTERY]: false,
};

const ANALYSIS_TIME_WINDOW_MS = 2.5 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 2;
const LOW_CLEARING_THRESHOLD = 2;

export function runAnalysis(
  currentTimestamp: number,
  activeProfile: Profile,
  sensorEntries: SensorEntry[],
  insulin: Insulin[],
  carbs: Carbs[],
  deviceStatus: DeviceStatus,
  latestAlarms: Alarm[]) {

  const settings = activeProfile.analyserSettings;
  const entries: AnalyserEntry[] = calculateSlopesForEntries(sensorEntries);
  const latestEntry = chain(entries).sortBy('timestamp').last().value();

  state[STATUS_BATTERY] = deviceStatus.batteryLevel < settings.BATTERY_LIMIT;

  if (!latestEntry) {
    state[STATUS_OUTDATED] = true;
    return state;
  }

  state[STATUS_OUTDATED] = currentTimestamp - latestEntry.timestamp > settings.TIME_SINCE_SGV_LIMIT;

  const latestBG = latestEntry.bloodGlucose;

  if (!latestBG) {
    return state;
  }

  if (checkForNoiseOrCompression(insulin, carbs)) {
    return state;
  }

  state[STATUS_LOW] = detectLow(latestBG, settings.LOW_LEVEL_ABS, latestAlarms);

  state[STATUS_FALLING] = detectFalling(latestBG, settings.LOW_LEVEL_REL);

  state[STATUS_HIGH] = detectStatusHigh(latestBG, settings.HIGH_LEVEL_ABS, latestAlarms);

  state[STATUS_PERSISTENT_HIGH] = detectPersistentHigh(entries, currentTimestamp, latestEntry, settings.HIGH_LEVEL_ABS, settings.HIGH_LEVEL_REL);

  state[STATUS_RISING] = detectRising(latestBG, settings.HIGH_LEVEL_REL);
}

function detectStatusHigh(latestBG: number, highLevel: number, latestAlarms: Alarm[]) {
  const correctionIfAlreadyHigh = find(latestAlarms, { situationType: STATUS_HIGH }) ? HIGH_CLEARING_THRESHOLD : 0;
  return latestBG > (highLevel - correctionIfAlreadyHigh);
}

function detectPersistentHigh(entries: AnalyserEntry[], currentTimestamp: number, latestEntry: AnalyserEntry, highLevelAbs: number, highLevelRel: number) {
  const relevantTimeWindow = filter(entries, entry => entry.timestamp >= (currentTimestamp - ANALYSIS_TIME_WINDOW_MS));
  const timeWindowLength = latestEntry.timestamp - relevantTimeWindow[0].timestamp;

  // We need 2.5 hours of data (with 10 min tolerance)
  const haveWideEnoughWindow = timeWindowLength > (ANALYSIS_TIME_WINDOW_MS - MIN_IN_MS * 10);

  // Allow a few entries to be missing (2.5 hours would be 30 entries at 5 min intervals)
  const haveEnoughDataPoints = relevantTimeWindow.length > 25;

  // Reject the entire time period if even a single entry is above HIGH, below RELATIVE HIGH, or showing active change
  const hasCounterConditions = some(relevantTimeWindow, entry => {
    const isAboveHigh = entry.bloodGlucose > highLevelAbs;
    const isBelowRelativeHigh = entry.bloodGlucose < highLevelRel;
    const isChanging = false; // TODO: check that slopes are not going down or up too fast
    return isAboveHigh || isBelowRelativeHigh || isChanging;
  });

  return haveWideEnoughWindow && haveEnoughDataPoints && !hasCounterConditions;
}

function detectLow(latestBG: number, lowLevel: number, latestAlarms: Alarm[]) {
  return latestBG < lowLevel + (find(latestAlarms, { type: STATUS_LOW }) ? LOW_CLEARING_THRESHOLD : 0);
}

function detectRising(latestBG: number, highLevelRel: number) {
  return !state[STATUS_HIGH] && latestBG > highLevelRel; // TODO: slope is up
}

function detectFalling(latestBG: number, lowLevelRel: number) {
  return !state[STATUS_LOW] && latestBG < lowLevelRel;  // TODO: slope is down
}

function checkForNoiseOrCompression(insulin: Insulin[], carbs: Carbs[]) {
  console.log(insulin, carbs); // tslint:disable-line:no-console
  // TODO: compression detection

  /* let latestBolus = _.findLast(_.sortBy(latestTreatments, 'date'), (treatment) => treatment.insulin > 0 );
   let noRecentBoluses = latestBolus ? (currentTimestamp - latestBolus.date > helpers.HOUR_IN_MS * 2) : true;
   let isNightTime = new Date(currentTimestamp).getHours() < 9;
   let isEnoughNoise = latestNoise >= helpers.NOISE_LEVEL_LIMIT;

   if (noRecentBoluses && isNightTime && isEnoughNoise) {
     let latestFiveEntries = _.slice(_.sortBy(latestEntries, 'date'), -5);
     if (latestFiveEntries.length < 5) {
       return false;
     }
     let containsHugeSlopes = false;
     for (let i = 0; i < 4; i++) {
       let slope = Math.abs(calculateSlope(latestFiveEntries[i], latestFiveEntries[i + 1]));
       if (slope > 2) {
         containsHugeSlopes = true;
       }
     }
     return containsHugeSlopes;
   }*/

  return false;
}
