import { AnalyserEntry, Situation, State } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { getTimeSubtractedFrom, isTimeAfter, isTimeAfterOrEqual } from 'shared/utils/time';
import { onlyActive } from 'shared/utils/alarms';
import { HOUR_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import {
  checkThatThereIsNoCorrectionInsulin,
  getLatestAnalyserEntry,
  isStateCritical,
} from 'backend/cronjobs/analyser/analyserUtils';
import { chain, filter, find } from 'lodash';

const PERSISTENT_HIGH_TIME_WINDOW = 2 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 1;
const LOW_CLEARING_THRESHOLD = 0.5;
const BAD_LOW_QUARANTINE_WINDOW = 15 * MIN_IN_MS;
const BAD_HIGH_QUARANTINE_WINDOW = 1.5 * HOUR_IN_MS;
const LOW_CORRECTION_SUPPRESSION_WINDOW = 30 * MIN_IN_MS;
const TIME_SINCE_BG_CRITICAL = 15 * MIN_IN_MS;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
};

export const detectOutdated = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  currentTimestamp: string,
  predictedState?: State,
) => {
  const latestEntry = getLatestAnalyserEntry(entries);

  // If there are no entries, data is outdated
  if (!latestEntry) {
    return true;
  }

  // How long since latest entry
  const msSinceLatestEntry = getTimeSubtractedFrom(currentTimestamp, latestEntry.timestamp);

  // If we're missing at least two entries, and we're predicting critical situation
  // inside timeSinceBgMinutes, alarm about data being outdated immediately
  if (msSinceLatestEntry > TIME_SINCE_BG_CRITICAL && isStateCritical(predictedState)) {
    return true;
  }

  // If situation is not predicted to be critical, follow timeSinceBgMinutes from settings
  const msSinceBgLimit = activeProfile.analyserSettings.timeSinceBgMinutes * MIN_IN_MS;
  return msSinceLatestEntry > msSinceBgLimit;
};

export const detectBadLow = (activeProfile: Profile, entries: AnalyserEntry[]) => {
  const latestEntry = getLatestAnalyserEntry(entries);
  return latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelBad;
};

export const detectCompressionLow = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulin: InsulinEntry[],
  currentTimestamp: string,
) => {
  const noRecentInsulin = insulin.length === 0;
  const isNight = activeProfile.profileName === 'night';
  const entriesToCheck = 4;
  const lastEntries = chain(entries).sortBy('timestamp').slice(-entriesToCheck).value();
  const weHaveEnoughEntries = lastEntries.length === entriesToCheck;
  const lastEntriesAreFresh = isTimeAfter(
    lastEntries[0].timestamp, // check that first of the last 4 entries is max 25 min old
    getTimeSubtractedFrom(currentTimestamp, 25 * MIN_IN_MS),
  );

  return (
    noRecentInsulin &&
    isNight &&
    weHaveEnoughEntries &&
    lastEntriesAreFresh &&
    Boolean(find(lastEntries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > 2))
  );
};

export const detectLow = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  alarms: Alarm[],
  carbs: CarbEntry[],
  currentTimestamp: string,
) => {
  const latestEntry = getLatestAnalyserEntry(entries);

  const notComingUpFromBadLow = !find(
    alarms,
    alarm =>
      (!alarm.deactivatedAt ||
        isTimeAfter(
          alarm.deactivatedAt,
          getTimeSubtractedFrom(currentTimestamp, BAD_LOW_QUARANTINE_WINDOW),
        )) &&
      alarm.situation === 'BAD_LOW',
  );

  const thereAreNoCorrectionCarbs = !find(carbs, carbs =>
    isTimeAfter(
      carbs.timestamp,
      getTimeSubtractedFrom(currentTimestamp, LOW_CORRECTION_SUPPRESSION_WINDOW),
    ),
  );

  const correctionIfAlreadyLow = find(onlyActive(alarms), { situation: 'LOW' })
    ? LOW_CLEARING_THRESHOLD
    : 0;

  return (
    notComingUpFromBadLow &&
    thereAreNoCorrectionCarbs &&
    latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelAbs + correctionIfAlreadyLow
  );
};

export const detectFalling = (activeProfile: Profile, entries: AnalyserEntry[]) => {
  const latestEntry = getLatestAnalyserEntry(entries);
  return (
    latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelRel &&
    latestEntry.bloodGlucose >= activeProfile.analyserSettings.lowLevelAbs &&
    latestEntry.slope !== null &&
    latestEntry.slope < -slopeLimits.MEDIUM
  );
};

export const detectHigh = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  alarms: Alarm[],
  insulins: InsulinEntry[],
  currentTimestamp: string,
): boolean => {
  const latestEntry = getLatestAnalyserEntry(entries);
  const notComingDownFromBadHigh = !find(
    alarms,
    alarm =>
      (!alarm.deactivatedAt ||
        isTimeAfter(
          alarm.deactivatedAt,
          getTimeSubtractedFrom(currentTimestamp, BAD_HIGH_QUARANTINE_WINDOW),
        )) &&
      alarm.situation === 'BAD_HIGH',
  );
  const correctionIfAlreadyHigh = find(onlyActive(alarms), { situation: 'HIGH' })
    ? HIGH_CLEARING_THRESHOLD
    : 0;
  const thereIsNoCorrectionInsulin = checkThatThereIsNoCorrectionInsulin(
    insulins,
    currentTimestamp,
    activeProfile.analyserSettings.highCorrectionSuppressionMinutes,
  );
  return (
    notComingDownFromBadHigh &&
    thereIsNoCorrectionInsulin &&
    latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelAbs - correctionIfAlreadyHigh
  );
};

export const detectBadHigh = (activeProfile: Profile, entries: AnalyserEntry[]): boolean => {
  const latestEntry = getLatestAnalyserEntry(entries);
  return latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelBad;
};

export const detectRising = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulins: InsulinEntry[],
  currentTimestamp: string,
) => {
  const latestEntry = getLatestAnalyserEntry(entries);
  const thereIsNoCorrectionInsulin = checkThatThereIsNoCorrectionInsulin(
    insulins,
    currentTimestamp,
    activeProfile.analyserSettings.highCorrectionSuppressionMinutes,
  );
  return (
    thereIsNoCorrectionInsulin &&
    latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
    latestEntry.slope !== null &&
    latestEntry.slope > slopeLimits.MEDIUM
  );
};

export const detectPersistentHigh = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulins: InsulinEntry[],
  currentTimestamp: string,
) => {
  const timeWindowStart = getTimeSubtractedFrom(currentTimestamp, PERSISTENT_HIGH_TIME_WINDOW);
  const relevantEntries = filter(entries, entry =>
    isTimeAfterOrEqual(entry.timestamp, timeWindowStart),
  );

  // Allow two entries to be missing, but most data should be there
  const requiredEntriesAmount = PERSISTENT_HIGH_TIME_WINDOW / (5 * MIN_IN_MS) - 2;
  const haveEnoughDataPoints = relevantEntries.length > requiredEntriesAmount;

  const isAllDataRelativeHigh =
    relevantEntries.filter(
      entry =>
        entry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
        entry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs,
    ).length === relevantEntries.length;

  const thereIsNoCorrectionInsulin = checkThatThereIsNoCorrectionInsulin(
    insulins,
    currentTimestamp,
    activeProfile.analyserSettings.highCorrectionSuppressionMinutes,
  );

  const latestEntry = getLatestAnalyserEntry(relevantEntries);
  const slopeIsNotDown = !(latestEntry?.slope && latestEntry?.slope < 0);

  return (
    haveEnoughDataPoints && isAllDataRelativeHigh && thereIsNoCorrectionInsulin && slopeIsNotDown
  );
};
