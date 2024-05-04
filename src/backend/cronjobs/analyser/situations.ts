import { AnalyserEntry, Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import {
  getTimeAsISOStr,
  getTimeMinusTimeMs,
  isTimeLarger,
  isTimeLargerOrEqual,
} from 'shared/utils/time';
import { onlyActive } from 'shared/utils/alarms';
import { HOUR_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import { getLatestAnalyserEntry, isSituationCritical } from 'backend/cronjobs/analyser/utils';
import { chain, filter, find } from 'lodash';

const PERSISTENT_HIGH_TIME_WINDOW = 2 * HOUR_IN_MS;
const COMPRESSION_LOW_TIME_WINDOW = 25 * MIN_IN_MS;
const HIGH_CLEARING_THRESHOLD = 1;
const LOW_CLEARING_THRESHOLD = 0.5;
const BAD_LOW_QUARANTINE_WINDOW = 15 * MIN_IN_MS;
const BAD_HIGH_QUARANTINE_WINDOW = 1.5 * HOUR_IN_MS;
const TIME_SINCE_BG_CRITICAL = 15 * MIN_IN_MS;
const RELEVANT_IOB_LIMIT_FOR_LOW = 0.5;
const RELEVANT_IOB_LIMIT_FOR_HIGH = 1;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
};

export const detectCriticalOutdated = (
  latestEntry: AnalyserEntry,
  insulinOnBoard: number,
  currentTimestamp: string,
  predictedSituation: Situation | null,
) => {
  // If there is no data, it's been hours without data, so we should alarm immediately
  if (!latestEntry) {
    return true;
  }

  // How long since latest entry
  const msSinceLatestEntry = getTimeMinusTimeMs(currentTimestamp, latestEntry.timestamp);

  // If we're missing at least two entries, and we're predicting critical situation,
  // alarm about data being critically outdated immediately
  return (
    msSinceLatestEntry > TIME_SINCE_BG_CRITICAL &&
    (isSituationCritical(predictedSituation) || insulinOnBoard > RELEVANT_IOB_LIMIT_FOR_LOW)
  );
};

export const detectBadLow = (activeProfile: Profile, latestEntry: AnalyserEntry) =>
  latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelBad;

export const detectBadHigh = (activeProfile: Profile, latestEntry: AnalyserEntry) =>
  latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelBad;

export const detectOutdated = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  currentTimestamp: string,
) => {
  // How long since latest entry
  const msSinceLatestEntry = getTimeMinusTimeMs(currentTimestamp, latestEntry.timestamp);

  // Check if we're over timeSinceBgMinutes from settings
  const msSinceBgLimit = activeProfile.analyserSettings.timeSinceBgMinutes * MIN_IN_MS;
  return msSinceLatestEntry > msSinceBgLimit;
};

export const detectCompressionLow = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  currentTimestamp: string,
) => {
  const noRecentInsulin = insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_LOW;

  const isNight = activeProfile.profileName === 'night';

  const timeWindowStart = getTimeMinusTimeMs(currentTimestamp, COMPRESSION_LOW_TIME_WINDOW);
  const relevantEntries = filter(entries, entry =>
    isTimeLargerOrEqual(entry.timestamp, timeWindowStart),
  );
  const weHaveEnoughFreshEntries = relevantEntries.length >= 4;

  const slopeIsReallyBig = Boolean(
    find(relevantEntries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > 2),
  );

  return noRecentInsulin && isNight && weHaveEnoughFreshEntries && slopeIsReallyBig;
};

export const detectLow = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  carbsOnBoard: number,
  insulinToCarbsRatio: number | null,
  currentTimestamp: string,
) => {
  const notComingUpFromBadLow = !find(
    alarms,
    alarm =>
      (!alarm.deactivatedAt ||
        isTimeLarger(
          alarm.deactivatedAt,
          getTimeMinusTimeMs(currentTimestamp, BAD_LOW_QUARANTINE_WINDOW),
        )) &&
      alarm.situation === 'BAD_LOW',
  );

  const thereIsNotEnoughCarbs =
    insulinToCarbsRatio === null || carbsOnBoard < 10 || insulinToCarbsRatio > 0.3; // TODO

  const correctionIfAlreadyLow = find(onlyActive(alarms), { situation: 'LOW' })
    ? LOW_CLEARING_THRESHOLD
    : 0;

  return (
    notComingUpFromBadLow &&
    thereIsNotEnoughCarbs &&
    latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelAbs + correctionIfAlreadyLow
  );
};

export const detectHigh = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  insulinOnBoard: number,
  currentTimestamp: string,
): boolean => {
  const notComingDownFromBadHigh = !find(
    alarms,
    alarm =>
      (!alarm.deactivatedAt ||
        isTimeLarger(
          alarm.deactivatedAt,
          getTimeMinusTimeMs(currentTimestamp, BAD_HIGH_QUARANTINE_WINDOW),
        )) &&
      alarm.situation === 'BAD_HIGH',
  );
  const correctionIfAlreadyHigh = find(onlyActive(alarms), { situation: 'HIGH' })
    ? HIGH_CLEARING_THRESHOLD
    : 0;

  return (
    notComingDownFromBadHigh &&
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH &&
    latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelAbs - correctionIfAlreadyHigh
  );
};

export const detectFalling = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  predictedSituation: Situation | null,
) => {
  const bloodGlucoseIsRelativeLow =
    latestEntry.bloodGlucose < activeProfile.analyserSettings.lowLevelRel &&
    latestEntry.bloodGlucose >= activeProfile.analyserSettings.lowLevelAbs;
  const slopeIndicatesFalling =
    latestEntry.slope !== null && latestEntry.slope < -slopeLimits.MEDIUM;
  const slopeIsNegative = latestEntry.slope !== null && latestEntry.slope < 0;
  const predictedSituationIsLowOrBadLow =
    predictedSituation === 'LOW' || predictedSituation === 'BAD_LOW';

  return (
    bloodGlucoseIsRelativeLow &&
    (slopeIndicatesFalling || (predictedSituationIsLowOrBadLow && slopeIsNegative))
  );
};

export const detectRising = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  insulinOnBoard: number,
) => {
  const bloodGlucoseIsRelativeHigh =
    latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
    latestEntry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs;
  const slopeIndicatesRising = latestEntry.slope !== null && latestEntry.slope > slopeLimits.MEDIUM;

  return (
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH &&
    bloodGlucoseIsRelativeHigh &&
    slopeIndicatesRising
  );
};

export const detectPersistentHigh = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  currentTimestamp: string,
) => {
  const timeWindowStart = getTimeMinusTimeMs(currentTimestamp, PERSISTENT_HIGH_TIME_WINDOW);
  const relevantEntries = filter(entries, entry =>
    isTimeLargerOrEqual(entry.timestamp, timeWindowStart),
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

  const latestEntry = getLatestAnalyserEntry(relevantEntries);
  const slopeIsNotDown = !(latestEntry?.slope && latestEntry?.slope < 0);

  return (
    haveEnoughDataPoints &&
    isAllDataRelativeHigh &&
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH &&
    slopeIsNotDown
  );
};
