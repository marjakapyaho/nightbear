import { chain, find, filter, some } from 'lodash';
import { Alarm, AnalyserEntry, DeviceStatus, Insulin, Profile, SensorEntry } from '../../models/model';
import { HOUR_IN_MS, MIN_IN_MS } from '../calculations/calculations';
import { parseAnalyserEntries } from './analyser-utils';

export const STATUS_OUTDATED = 'outdated';
export const STATUS_HIGH = 'high';
export const STATUS_PERSISTENT_HIGH = 'persistent_high';
export const STATUS_LOW = 'low';
export const STATUS_RISING = 'rising';
export const STATUS_FALLING = 'falling';
export const STATUS_BATTERY = 'battery';
export const STATUS_COMPRESSION_LOW = 'compression';

const ANALYSIS_TIME_WINDOW_MS = 2.5 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 2;
const LOW_CLEARING_THRESHOLD = 2;

const state = {
  [STATUS_BATTERY]: false,
  [STATUS_OUTDATED]: false,
  [STATUS_LOW]: false,
  [STATUS_FALLING]: false,
  [STATUS_COMPRESSION_LOW]: false,
  [STATUS_HIGH]: false,
  [STATUS_RISING]: false,
  [STATUS_PERSISTENT_HIGH]: false,
};

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.7,
  FAST: 1.3,
};

export function runAnalysis(
  currentTimestamp: number,
  activeProfile: Profile,
  sensorEntries: SensorEntry[],
  insulin: Insulin[],
  deviceStatus: DeviceStatus,
  latestAlarms: Alarm[]) {

  const entries: AnalyserEntry[] = parseAnalyserEntries(sensorEntries);
  const latestEntry = chain(entries).sortBy('timestamp').last().value();

  state[STATUS_BATTERY] = detectBattery(
    activeProfile,
    deviceStatus,
  );

  if (!latestEntry) {
    return state;
  }

  state[STATUS_OUTDATED] = detectOutdated(
    activeProfile,
    latestEntry,
    currentTimestamp,
  );

  if (state[STATUS_OUTDATED] || !latestEntry.bloodGlucose) {
    return state;
  }

  state[STATUS_LOW] = detectLow(
    activeProfile,
    latestEntry,
    latestAlarms,
  );

  state[STATUS_FALLING] = detectFalling(
    activeProfile,
    latestEntry,
  );

  state[STATUS_COMPRESSION_LOW] = detectCompressionLow(
    activeProfile,
    entries,
    insulin,
  );

  state[STATUS_HIGH] = detectHigh(
    activeProfile,
    latestEntry,
    latestAlarms,
  );

  state[STATUS_RISING] = detectRising(
    activeProfile,
    latestEntry,
  );

  state[STATUS_PERSISTENT_HIGH] = detectPersistentHigh(
    activeProfile,
    latestEntry,
    entries,
    currentTimestamp,
  );

  return state;
}

function detectBattery(
  profile: Profile,
  deviceStatus: DeviceStatus,
) {
  return deviceStatus.batteryLevel < profile.analyserSettings.BATTERY_LIMIT;
}

function detectOutdated(
  profile: Profile,
  latestEntry: AnalyserEntry,
  currentTimestamp: number,
) {
  if (latestEntry) {
    return (currentTimestamp - latestEntry.timestamp) > profile.analyserSettings.TIME_SINCE_BG_LIMIT * MIN_IN_MS;
  }
  else {
    return true;
  }
}

function detectLow(
  profile: Profile,
  latestEntry: AnalyserEntry,
  latestAlarms: Alarm[],
) {
  return latestEntry.bloodGlucose < profile.analyserSettings.LOW_LEVEL_ABS + (find(latestAlarms, { type: STATUS_LOW }) ? LOW_CLEARING_THRESHOLD : 0);
}

function detectFalling(
  profile: Profile,
  entry: AnalyserEntry,
) {
  return !state[STATUS_LOW] && entry.bloodGlucose < profile.analyserSettings.LOW_LEVEL_REL && !!entry.slope && entry.slope < -slopeLimits.MEDIUM;
}

function detectCompressionLow(
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulin: Insulin[],
) {
  const recentInsulin = insulin.length;
  const isDay = activeProfile.profileName === 'day';
  const lastFiveEntries = chain(entries).sortBy('timestamp').slice(-5).value();

  if (recentInsulin || isDay || lastFiveEntries.length < 5) {
    return false;
  }

  return !!find(entries, (entry) => entry.rawSlope && Math.abs(entry.rawSlope) > 2);
}

function detectHigh(
  profile: Profile,
  latestEntry: AnalyserEntry,
  latestAlarms: Alarm[],
) {
  const correctionIfAlreadyHigh = find(latestAlarms, { situationType: STATUS_HIGH }) ? HIGH_CLEARING_THRESHOLD : 0;
  return latestEntry.bloodGlucose > (profile.analyserSettings.HIGH_LEVEL_ABS - correctionIfAlreadyHigh);
}

function detectRising(
  profile: Profile,
  entry: AnalyserEntry,
) {
  return !state[STATUS_HIGH] && entry.bloodGlucose > profile.analyserSettings.HIGH_LEVEL_REL && !!entry.slope && entry.slope > slopeLimits.MEDIUM;
}

function detectPersistentHigh(
  profile: Profile,
  latestEntry: AnalyserEntry,
  entries: AnalyserEntry[],
  currentTimestamp: number,
) {
  const relevantTimeWindow = filter(entries, entry => entry.timestamp >= (currentTimestamp - ANALYSIS_TIME_WINDOW_MS));
  const firstEntry = chain(relevantTimeWindow).sortBy('timestamp').first().value();
  if (!firstEntry) { return false; } // TODO: this is for lodash

  const timeWindowLength = latestEntry.timestamp - firstEntry.timestamp;

  // We need 2.5 hours of data (with 10 min tolerance)
  const haveWideEnoughWindow = timeWindowLength > (ANALYSIS_TIME_WINDOW_MS - MIN_IN_MS * 10);

  // Allow a few entries to be missing (2.5 hours would be 30 entries at 5 min intervals)
  const haveEnoughDataPoints = relevantTimeWindow.length > 25;

  // Reject the entire time period if even a single entry is above HIGH, below RELATIVE HIGH, or showing active change
  const hasCounterConditions = some(relevantTimeWindow, entry => {
    const isAboveHigh = entry.bloodGlucose > profile.analyserSettings.HIGH_LEVEL_ABS;
    const isBelowRelativeHigh = entry.bloodGlucose < profile.analyserSettings.HIGH_LEVEL_REL;
    let isFalling = false;
    let isRisingFast = false;

    // If slope is going down at all or up fast, suppress persistent high
    if (entry.slope) {
      isFalling = entry.slope < 0;
      isRisingFast = entry.slope > slopeLimits.FAST;
    }
    return isAboveHigh || isBelowRelativeHigh || isFalling || isRisingFast;
  });

  return haveWideEnoughWindow && haveEnoughDataPoints && !hasCounterConditions;
}
