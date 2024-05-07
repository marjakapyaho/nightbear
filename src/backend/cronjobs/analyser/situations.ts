import { AnalyserEntry, Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { getTimeMinusTimeMs, minToMs } from 'shared/utils/time';
import { onlyActive } from 'shared/utils/alarms';
import {
  getRelevantEntries,
  isBloodGlucoseRelativeHigh,
  isBloodGlucoseRelativeLow,
  isSituationCritical,
  isSlopeFalling,
  slopeIsNegative,
  isSlopeRising,
  isPredictedSituationAnyLowOrMissing,
  getHighLimitWithPossibleAddition,
  areThereSpecificSituationsInGivenWindow,
  getLowLimitWithPossibleAddition,
} from 'backend/cronjobs/analyser/utils';
import { find } from 'lodash';
import { CarbEntry } from 'shared/types/timelineEntries';
import { getEntriesWithinTimeRange } from 'backend/cronjobs/checks/utils';

// Minutes
const PERSISTENT_HIGH_TIME_WINDOW = 120;
const COMPRESSION_LOW_TIME_WINDOW = 25;
export const BAD_HIGH_QUARANTINE_WINDOW = 60;
export const BAD_LOW_QUARANTINE_WINDOW = 15;
const TIME_SINCE_BG_CRITICAL = 15;
const LOW_CORRECTION_SUPPRESSION_WINDOW = 20;

// Other units
export const HIGH_CLEARING_THRESHOLD = 1;
export const LOW_CLEARING_THRESHOLD = 0.5;
const RELEVANT_IOB_LIMIT_FOR_LOW = 0.5;
const RELEVANT_IOB_LIMIT_FOR_HIGH = 1;

export const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
  MEGA_FAST: 2,
};

export const detectCriticalOutdated = (
  latestEntry: AnalyserEntry,
  insulinOnBoard: number,
  currentTimestamp: string,
  predictedSituation?: Situation | 'NO_SITUATION',
) => {
  // If there is no data, it's been hours without data, so we should alarm immediately
  if (!latestEntry) {
    return true;
  }

  // How long since latest entry
  const msSinceLatestEntry = getTimeMinusTimeMs(currentTimestamp, latestEntry.timestamp);

  // If we're missing at least two entries, and we're predicting critical situation or have
  // relevant amount of insulin, alarm about data being critically outdated immediately
  return (
    msSinceLatestEntry > minToMs(TIME_SINCE_BG_CRITICAL) &&
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
  return msSinceLatestEntry > minToMs(activeProfile.analyserSettings.timeSinceBgMinutes);
};

export const detectCompressionLow = (
  activeProfile: Profile,
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  currentTimestamp: string,
) => {
  const noRelevantInsulin = insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_LOW;

  const isNight = activeProfile.profileName === 'night';

  const { relevantEntries, hasEnoughData } = getRelevantEntries(
    currentTimestamp,
    entries,
    COMPRESSION_LOW_TIME_WINDOW,
  );

  const slopeIsReallyBig = Boolean(
    find(
      relevantEntries,
      entry => entry.rawSlope && Math.abs(entry.rawSlope) > slopeLimits.MEGA_FAST,
    ),
  );

  return noRelevantInsulin && isNight && hasEnoughData && slopeIsReallyBig;
};

export const detectLow = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  carbEntries: CarbEntry[],
  thereIsTooMuchInsulinForCarbs: boolean,
  currentTimestamp: string,
) => {
  const bloodGlucoseIsLow =
    latestEntry.bloodGlucose < getLowLimitWithPossibleAddition(alarms, activeProfile);

  const notComingUpFromBadLow = areThereSpecificSituationsInGivenWindow(
    currentTimestamp,
    alarms,
    'BAD_LOW',
    BAD_LOW_QUARANTINE_WINDOW,
  );

  const thereAreNotEnoughCorrectionCarbs =
    getEntriesWithinTimeRange(
      currentTimestamp,
      carbEntries,
      minToMs(LOW_CORRECTION_SUPPRESSION_WINDOW),
    ).length === 0 || thereIsTooMuchInsulinForCarbs;

  return bloodGlucoseIsLow && notComingUpFromBadLow && thereAreNotEnoughCorrectionCarbs;
};

export const detectHigh = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  alarms: Alarm[],
  insulinOnBoard: number,
  thereIsTooLittleInsulinForCarbs: boolean,
  currentTimestamp: string,
): boolean => {
  const bloodGlucoseIsHigh =
    latestEntry.bloodGlucose > getHighLimitWithPossibleAddition(alarms, activeProfile);

  const notComingDownFromBadHigh = areThereSpecificSituationsInGivenWindow(
    currentTimestamp,
    alarms,
    'BAD_HIGH',
    BAD_HIGH_QUARANTINE_WINDOW,
  );

  const thereIsNotEnoughCorrectionInsulin =
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;

  return bloodGlucoseIsHigh && notComingDownFromBadHigh && thereIsNotEnoughCorrectionInsulin;
};

export const detectFalling = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  predictedSituation?: Situation | 'NO_SITUATION',
) => {
  const bloodGlucoseIsRelativeLow = isBloodGlucoseRelativeLow(latestEntry, activeProfile);
  const slopeIsFalling = isSlopeFalling(latestEntry);
  const predictedSituationIsLowOrBadLow = isPredictedSituationAnyLowOrMissing(predictedSituation);

  return (
    bloodGlucoseIsRelativeLow &&
    (slopeIsFalling || (slopeIsNegative(latestEntry) && predictedSituationIsLowOrBadLow))
  );
};

export const detectRising = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  insulinOnBoard: number,
) => {
  const bloodGlucoseIsRelativeHigh = isBloodGlucoseRelativeHigh(latestEntry, activeProfile);
  const slopeIsRising = isSlopeRising(latestEntry);

  return (
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH && bloodGlucoseIsRelativeHigh && slopeIsRising
  );
};

export const detectPersistentHigh = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  currentTimestamp: string,
) => {
  const { relevantEntries, hasEnoughData } = getRelevantEntries(
    currentTimestamp,
    entries,
    PERSISTENT_HIGH_TIME_WINDOW,
  );

  const isAllDataRelativeHigh =
    relevantEntries.filter(entry => isBloodGlucoseRelativeHigh(entry, activeProfile)).length ===
    relevantEntries.length;

  const slopeIsNotDown = !slopeIsNegative(latestEntry);

  return (
    hasEnoughData &&
    isAllDataRelativeHigh &&
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH &&
    slopeIsNotDown
  );
};
