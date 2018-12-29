import { parseAnalyserEntries } from 'core/analyser/analyser-utils';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import {
  Alarm,
  AnalyserEntry,
  DEFAULT_STATE,
  DeviceStatus,
  Insulin,
  SensorEntry,
  Settings,
  Situation,
  State,
} from 'core/models/model';
import { chain, filter, find, some } from 'lodash';

const ANALYSIS_TIME_WINDOW_MS = 2.5 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 2;
const LOW_CLEARING_THRESHOLD = 2;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.7,
  FAST: 1.3,
};

export function runAnalysis(
  currentTimestamp: number,
  activeSettings: Settings,
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
      BATTERY: detectBattery(activeSettings, deviceStatus),
    };
  }

  if (!latestEntry) {
    return state;
  }

  state = {
    ...state,
    OUTDATED: detectOutdated(activeSettings, latestEntry, currentTimestamp),
  };

  if (state.OUTDATED || !latestEntry.bloodGlucose) {
    return state;
  }

  state = {
    ...state,
    LOW: detectLow(activeSettings, latestEntry, latestAlarms),
  };

  state = {
    ...state,
    FALLING: detectFalling(state, activeSettings, latestEntry),
  };

  state = {
    ...state,
    COMPRESSION_LOW: detectCompressionLow(activeSettings, entries, insulin),
  };

  state = {
    ...state,
    HIGH: detectHigh(activeSettings, latestEntry, latestAlarms),
  };

  state = {
    ...state,
    RISING: detectRising(state, activeSettings, latestEntry),
  };

  state = {
    ...state,
    PERSISTENT_HIGH: detectPersistentHigh(activeSettings, latestEntry, entries, currentTimestamp),
  };

  return state;
}

function detectBattery(settings: Settings, deviceStatus: DeviceStatus) {
  return deviceStatus.batteryLevel < settings.analyserSettings.BATTERY_LIMIT;
}

function detectOutdated(settings: Settings, latestEntry: AnalyserEntry, currentTimestamp: number) {
  if (latestEntry) {
    return currentTimestamp - latestEntry.timestamp > settings.analyserSettings.TIME_SINCE_BG_LIMIT * MIN_IN_MS;
  } else {
    return true;
  }
}

function detectLow(settings: Settings, latestEntry: AnalyserEntry, latestAlarms: Alarm[]) {
  const situationType: Situation = 'LOW';
  return (
    latestEntry.bloodGlucose <
    settings.analyserSettings.LOW_LEVEL_ABS + (find(latestAlarms, { situationType }) ? LOW_CLEARING_THRESHOLD : 0)
  );
}

function detectFalling(state: State, settings: Settings, entry: AnalyserEntry) {
  return (
    !state.LOW &&
    entry.bloodGlucose < settings.analyserSettings.LOW_LEVEL_REL &&
    !!entry.slope &&
    entry.slope < -slopeLimits.MEDIUM
  );
}

function detectCompressionLow(settings: Settings, entries: AnalyserEntry[], insulin: Insulin[]) {
  const recentInsulin = insulin.length;
  const isDay = settings.profileName === 'day';
  const lastFiveEntries = chain(entries)
    .sortBy('timestamp')
    .slice(-5)
    .value();

  if (recentInsulin || isDay || lastFiveEntries.length < 5) {
    return false;
  }

  return !!find(entries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > 2);
}

function detectHigh(settings: Settings, latestEntry: AnalyserEntry, latestAlarms: Alarm[]) {
  const situationType: Situation = 'HIGH';
  const correctionIfAlreadyHigh = find(latestAlarms, { situationType }) ? HIGH_CLEARING_THRESHOLD : 0;
  return latestEntry.bloodGlucose > settings.analyserSettings.HIGH_LEVEL_ABS - correctionIfAlreadyHigh;
}

function detectRising(state: State, settings: Settings, entry: AnalyserEntry) {
  return (
    !state.HIGH &&
    entry.bloodGlucose > settings.analyserSettings.HIGH_LEVEL_REL &&
    !!entry.slope &&
    entry.slope > slopeLimits.MEDIUM
  );
}

function detectPersistentHigh(
  settings: Settings,
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
    const isAboveHigh = entry.bloodGlucose > settings.analyserSettings.HIGH_LEVEL_ABS;
    const isBelowRelativeHigh = entry.bloodGlucose < settings.analyserSettings.HIGH_LEVEL_REL;
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
