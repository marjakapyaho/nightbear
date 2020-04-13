import { parseAnalyserEntries } from 'core/analyser/analyser-utils';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import {
  ActiveProfile,
  Alarm,
  AnalyserEntry,
  DEFAULT_STATE,
  DeviceStatus,
  Insulin,
  SensorEntry,
  State,
} from 'core/models/model';
import { chain, filter, find, some } from 'lodash';

const ANALYSIS_TIME_WINDOW_MS = 2.5 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 1;
const LOW_CLEARING_THRESHOLD = 0.5;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.7,
  FAST: 1.3,
};

export function runAnalysis(
  currentTimestamp: number,
  activeProfile: ActiveProfile,
  sensorEntries: SensorEntry[],
  insulin: Insulin[],
  deviceStatus: DeviceStatus | undefined,
  latestAlarms: Alarm[],
): State {
  const entries: AnalyserEntry[] = parseAnalyserEntries(sensorEntries);
  const latestEntry = chain(entries)
    .sortBy('timestamp')
    .last()
    .value();
  let state = DEFAULT_STATE;

  if (deviceStatus) {
    state = {
      ...state,
      BATTERY: detectBattery(activeProfile, deviceStatus),
    };
  }

  if (!latestEntry) {
    return state;
  }

  state = {
    ...state,
    OUTDATED: detectOutdated(activeProfile, latestEntry, currentTimestamp),
  };

  if (state.OUTDATED || !latestEntry.bloodGlucose) {
    return state;
  }

  // Must be before LOW
  state = {
    ...state,
    BAD_LOW: detectBadLow(activeProfile, latestEntry),
  };

  // Must be before FALLING
  state = {
    ...state,
    LOW: detectLow(state, activeProfile, latestEntry, latestAlarms),
  };

  state = {
    ...state,
    FALLING: detectFalling(state, activeProfile, latestEntry),
  };

  state = {
    ...state,
    COMPRESSION_LOW: detectCompressionLow(activeProfile, entries, insulin),
  };

  // Must be before HIGH
  state = {
    ...state,
    BAD_HIGH: detectBadHigh(activeProfile, latestEntry),
  };

  // Must be before RISING
  state = {
    ...state,
    HIGH: detectHigh(state, activeProfile, latestEntry, latestAlarms),
  };

  state = {
    ...state,
    RISING: detectRising(state, activeProfile, latestEntry),
  };

  state = {
    ...state,
    PERSISTENT_HIGH: detectPersistentHigh(activeProfile, latestEntry, entries, currentTimestamp),
  };

  return state;
}

function detectBattery(activeProfile: ActiveProfile, deviceStatus: DeviceStatus) {
  return deviceStatus.batteryLevel < activeProfile.analyserSettings.BATTERY_LIMIT;
}

function detectOutdated(activeProfile: ActiveProfile, latestEntry: AnalyserEntry, currentTimestamp: number) {
  if (latestEntry) {
    return currentTimestamp - latestEntry.timestamp > activeProfile.analyserSettings.TIME_SINCE_BG_LIMIT * MIN_IN_MS;
  } else {
    return true;
  }
}

function detectLow(state: State, activeProfile: ActiveProfile, entry: AnalyserEntry, latestAlarms: Alarm[]) {
  const notCurrentlyBadLow = !state.BAD_LOW;
  const notComingUpFromBadLow = !find(latestAlarms, { situationType: 'BAD_LOW' });
  const correctionIfAlreadyLow = find(latestAlarms, { situationType: 'LOW', isActive: true })
    ? LOW_CLEARING_THRESHOLD
    : 0;
  return (
    notCurrentlyBadLow &&
    notComingUpFromBadLow &&
    entry.bloodGlucose < activeProfile.analyserSettings.LOW_LEVEL_ABS + correctionIfAlreadyLow
  );
}

function detectBadLow(activeProfile: ActiveProfile, latestEntry: AnalyserEntry) {
  return latestEntry.bloodGlucose < activeProfile.analyserSettings.LOW_LEVEL_BAD;
}

function detectFalling(state: State, activeProfile: ActiveProfile, entry: AnalyserEntry) {
  return (
    !state.BAD_LOW &&
    !state.LOW &&
    entry.bloodGlucose < activeProfile.analyserSettings.LOW_LEVEL_REL &&
    !!entry.slope &&
    entry.slope < -slopeLimits.MEDIUM
  );
}

function detectCompressionLow(activeProfile: ActiveProfile, entries: AnalyserEntry[], insulin: Insulin[]) {
  const recentInsulin = insulin.length;
  const isDay = activeProfile.profileName === 'day';
  const lastFiveEntries = chain(entries)
    .sortBy('timestamp')
    .slice(-5)
    .value();

  if (recentInsulin || isDay || lastFiveEntries.length < 5) {
    return false;
  }

  return !!find(entries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > 2);
}

function detectHigh(state: State, activeProfile: ActiveProfile, entry: AnalyserEntry, latestAlarms: Alarm[]): boolean {
  const notCurrentlyBadHigh = !state.BAD_HIGH;
  const notComingDownFromBadHigh = !find(latestAlarms, { situationType: 'BAD_HIGH' });
  const correctionIfAlreadyHigh = find(latestAlarms, { situationType: 'HIGH', isActive: true })
    ? HIGH_CLEARING_THRESHOLD
    : 0;
  return (
    notCurrentlyBadHigh &&
    notComingDownFromBadHigh &&
    entry.bloodGlucose > activeProfile.analyserSettings.HIGH_LEVEL_ABS - correctionIfAlreadyHigh
  );
}

function detectBadHigh(activeProfile: ActiveProfile, latestEntry: AnalyserEntry): boolean {
  return latestEntry.bloodGlucose > activeProfile.analyserSettings.HIGH_LEVEL_BAD;
}

function detectRising(state: State, activeProfile: ActiveProfile, entry: AnalyserEntry) {
  return (
    !state.BAD_HIGH &&
    !state.HIGH &&
    entry.bloodGlucose > activeProfile.analyserSettings.HIGH_LEVEL_REL &&
    !!entry.slope &&
    entry.slope > slopeLimits.MEDIUM
  );
}

function detectPersistentHigh(
  activeProfile: ActiveProfile,
  latestEntry: AnalyserEntry,
  entries: AnalyserEntry[],
  currentTimestamp: number,
) {
  const relevantTimeWindow = filter(entries, entry => entry.timestamp >= currentTimestamp - ANALYSIS_TIME_WINDOW_MS);
  const firstEntry = chain(relevantTimeWindow)
    .sortBy('timestamp')
    .first()
    .value();
  if (!firstEntry) {
    return false;
  } // TODO: this is for lodash

  const timeWindowLength = latestEntry.timestamp - firstEntry.timestamp;

  // We need 2.5 hours of data (with 10 min tolerance)
  const haveWideEnoughWindow = timeWindowLength > ANALYSIS_TIME_WINDOW_MS - MIN_IN_MS * 10;

  // Allow a few entries to be missing (2.5 hours would be 30 entries at 5 min intervals)
  const haveEnoughDataPoints = relevantTimeWindow.length > 25;

  // Reject the entire time period if even a single entry is above HIGH, below RELATIVE HIGH, or showing active change
  const hasCounterConditions = some(relevantTimeWindow, entry => {
    const isAboveHigh = entry.bloodGlucose > activeProfile.analyserSettings.HIGH_LEVEL_ABS;
    const isBelowRelativeHigh = entry.bloodGlucose < activeProfile.analyserSettings.HIGH_LEVEL_REL;
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
