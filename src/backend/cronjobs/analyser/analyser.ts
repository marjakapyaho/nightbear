import {
  AnalyserData,
  getLatestAnalyserEntry,
  getPredictedAnalyserEntries,
  mapSensorEntriesToAnalyserEntries,
} from 'backend/cronjobs/analyser/analyserUtils';
import { CarbEntry, InsulinEntry, SensorEntry } from 'shared/types/timelineEntries';
import { AnalyserEntry, State } from 'shared/types/analyser';
import { Alarm } from 'shared/types/alarms';
import { Profile } from 'shared/types/profiles';
import { DEFAULT_STATE } from 'shared/utils/analyser';
import {
  detectBadHigh,
  detectBadLow,
  detectCompressionLow,
  detectFalling,
  detectHigh,
  detectLow,
  detectOutdated,
  detectPersistentHigh,
  detectRising,
} from './situations';

export const runAnalysis = ({
  currentTimestamp,
  activeProfile,
  sensorEntries,
  insulinEntries,
  carbEntries,
  alarms,
}: AnalyserData): State => {
  const entries = mapSensorEntriesToAnalyserEntries(sensorEntries);

  // Predict entries for the whole time we'll be without
  // data and not creating outdated alarm
  const predictedEntries = getPredictedAnalyserEntries(
    entries,
    activeProfile.analyserSettings.timeSinceBgMinutes,
  );

  // Get predicted state
  const predictedState = analyzeState(
    getLatestAnalyserEntry(predictedEntries)?.timestamp,
    activeProfile, // TODO: this might change during prediction
    predictedEntries,
    [],
    [],
    [], // TODO: what should this be - it depends on analyze before this
  );

  // Get current state
  return analyzeState(
    currentTimestamp,
    activeProfile,
    entries,
    insulinEntries,
    carbEntries,
    alarms,
    predictedState,
  );
};

export const analyzeState = (
  currentTimestamp: string,
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulin: InsulinEntry[],
  carbs: CarbEntry[],
  alarms: Alarm[],
  predictedState?: State,
): State => {
  let state = DEFAULT_STATE;

  // Must be first, checks also if we even have latestEntry
  state = {
    ...state,
    OUTDATED: detectOutdated(activeProfile, entries, currentTimestamp, predictedState),
  };

  if (state.OUTDATED) {
    return state;
  }

  // Must be before LOW
  if (detectBadLow(activeProfile, entries)) {
    return {
      ...state,
      BAD_LOW: true,
    };
  }

  // Must be before LOW and FALLING
  if (detectCompressionLow(activeProfile, entries, insulin, currentTimestamp)) {
    return {
      ...state,
      COMPRESSION_LOW: true,
    };
  }

  // Must be before FALLING
  if (detectLow(activeProfile, entries, alarms, carbs, currentTimestamp)) {
    return {
      ...state,
      LOW: true,
    };
  }

  state = {
    ...state,
    FALLING: detectFalling(state, activeProfile, entries),
  };

  // Must be before HIGH
  state = {
    ...state,
    BAD_HIGH: detectBadHigh(activeProfile, entries),
  };

  // Must be before RISING
  state = {
    ...state,
    HIGH: detectHigh(state, activeProfile, entries, alarms, insulin, currentTimestamp),
  };

  state = {
    ...state,
    RISING: detectRising(state, activeProfile, entries, insulin, currentTimestamp),
  };

  state = {
    ...state,
    PERSISTENT_HIGH: detectPersistentHigh(activeProfile, entries, currentTimestamp),
  };

  return state;
};
