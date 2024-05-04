import { AnalyserEntry, Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { getTimeMinusTimeMs, isTimeLarger, isTimeLargerOrEqual } from 'shared/utils/time';
import { onlyActive } from 'shared/utils/alarms';
import { getInsulinOnBoard, HOUR_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import {
  checkThatThereIsNoCorrectionInsulin,
  getLatestAnalyserEntry,
  isSituationCritical,
} from 'backend/cronjobs/analyser/utils';
import { chain, filter, find } from 'lodash';

const PERSISTENT_HIGH_TIME_WINDOW = 2 * HOUR_IN_MS;
const HIGH_CLEARING_THRESHOLD = 1;
const LOW_CLEARING_THRESHOLD = 0.5;
const BAD_LOW_QUARANTINE_WINDOW = 15 * MIN_IN_MS;
const BAD_HIGH_QUARANTINE_WINDOW = 1.5 * HOUR_IN_MS;
const LOW_CORRECTION_SUPPRESSION_WINDOW = 30 * MIN_IN_MS;
const TIME_SINCE_BG_CRITICAL = 15 * MIN_IN_MS;
const ENTRIES_TO_CHECK_FOR_COMPRESSION_LOW = 4;
const RELEVANT_IOB_LIMIT = 0.5;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
};

export const detectCriticalOutdated = (
  latestEntry: AnalyserEntry,
  insulin: InsulinEntry[],
  currentTimestamp: string,
  predictedSituation: Situation | null,
) => {
  // If there is no data, it's been hours without data, so we should alarm immediately
  if (!latestEntry) {
    return true;
  }

  const insulinOnBoard = getInsulinOnBoard(currentTimestamp, insulin);

  // How long since latest entry
  const msSinceLatestEntry = getTimeMinusTimeMs(currentTimestamp, latestEntry.timestamp);

  // If we're missing at least two entries, and we're predicting critical situation,
  // alarm about data being critically outdated immediately
  return (
    msSinceLatestEntry > TIME_SINCE_BG_CRITICAL &&
    (isSituationCritical(predictedSituation) || insulinOnBoard > RELEVANT_IOB_LIMIT)
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
  insulin: InsulinEntry[],
  currentTimestamp: string,
) => {
  const noRecentInsulin = insulin.length === 0;

  const isNight = activeProfile.profileName === 'night';

  const latestEntries = chain(entries).slice(-ENTRIES_TO_CHECK_FOR_COMPRESSION_LOW).value();
  const weHaveEnoughEntries = latestEntries.length === ENTRIES_TO_CHECK_FOR_COMPRESSION_LOW;

  const lastEntriesAreFresh = isTimeLarger(
    latestEntries[0].timestamp, // check that first of the last 4 entries is max 25 min old
    getTimeMinusTimeMs(currentTimestamp, 25 * MIN_IN_MS),
  );

  const slopeIsReallyBig = Boolean(
    find(latestEntries, entry => entry.rawSlope && Math.abs(entry.rawSlope) > 2),
  );

  return (
    noRecentInsulin && isNight && weHaveEnoughEntries && lastEntriesAreFresh && slopeIsReallyBig
  );
};

export const detectLow = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  carbs: CarbEntry[],
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

  const thereAreNoCorrectionCarbs = !find(carbs, carbs =>
    isTimeLarger(
      carbs.timestamp,
      getTimeMinusTimeMs(currentTimestamp, LOW_CORRECTION_SUPPRESSION_WINDOW),
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

export const detectHigh = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  insulins: InsulinEntry[],
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
  insulins: InsulinEntry[],
  currentTimestamp: string,
) => {
  const thereIsNoCorrectionInsulin = checkThatThereIsNoCorrectionInsulin(
    insulins,
    currentTimestamp,
    activeProfile.analyserSettings.highCorrectionSuppressionMinutes,
  );
  const bloodGlucoseIsRelativeHigh =
    latestEntry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
    latestEntry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs;
  const slopeIndicatesRising = latestEntry.slope !== null && latestEntry.slope > slopeLimits.MEDIUM;

  return thereIsNoCorrectionInsulin && bloodGlucoseIsRelativeHigh && slopeIndicatesRising;
};

export const detectPersistentHigh = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulins: InsulinEntry[],
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
