import { AnalyserEntry, Situation } from 'shared';
import { Profile } from 'shared';
import { Alarm } from 'shared';
import { getTimeMinusTimeMs, minToMs } from 'shared';
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
  slopeIsPositive,
  isPredictedSituationAnyHighOrMissing,
  TIME_SINCE_BG_CRITICAL,
  RELEVANT_IOB_LIMIT_FOR_LOW,
  COMPRESSION_LOW_TIME_WINDOW,
  slopeLimits,
  LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW,
  BAD_LOW_QUARANTINE_WINDOW,
  LOW_CORRECTION_SUPPRESSION_WINDOW,
  BAD_HIGH_QUARANTINE_WINDOW,
  RELEVANT_IOB_LIMIT_FOR_HIGH,
  PERSISTENT_HIGH_TIME_WINDOW,
  LOW_LEVEL_BAD,
} from './utils';
import { find } from 'lodash';
import { CarbEntry } from 'shared';
import { getEntriesWithinTimeRange } from '../checks/utils';

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

export const detectBadLow = (latestEntry: AnalyserEntry) =>
  latestEntry.bloodGlucose < LOW_LEVEL_BAD;

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

  const thereAreNotTooManyLowEntries =
    relevantEntries.filter(entry => entry.bloodGlucose < activeProfile.analyserSettings.lowLevelAbs)
      .length < LOW_COUNT_LIMIT_FOR_COMPRESSION_LOW;

  return (
    noRelevantInsulin &&
    isNight &&
    hasEnoughData &&
    slopeIsReallyBig &&
    thereAreNotTooManyLowEntries
  );
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
  carbEntries: CarbEntry[],
  currentTimestamp: string,
  thereIsTooMuchInsulinForCarbs: boolean,
  predictedSituation?: Situation | 'NO_SITUATION',
) => {
  const bloodGlucoseIsRelativeLow = isBloodGlucoseRelativeLow(latestEntry, activeProfile);
  const slopeIsFalling = isSlopeFalling(latestEntry);
  const predictedSituationIsLowOrBadLow = isPredictedSituationAnyLowOrMissing(predictedSituation);
  const thereAreNotEnoughCorrectionCarbs =
    getEntriesWithinTimeRange(
      currentTimestamp,
      carbEntries,
      minToMs(LOW_CORRECTION_SUPPRESSION_WINDOW),
    ).length === 0 || thereIsTooMuchInsulinForCarbs;

  return (
    bloodGlucoseIsRelativeLow &&
    (slopeIsFalling || (slopeIsNegative(latestEntry) && predictedSituationIsLowOrBadLow)) &&
    thereAreNotEnoughCorrectionCarbs
  );
};

export const detectRising = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  insulinOnBoard: number,
  thereIsTooLittleInsulinForCarbs: boolean,
  predictedSituation?: Situation | 'NO_SITUATION',
) => {
  const bloodGlucoseIsRelativeHigh = isBloodGlucoseRelativeHigh(latestEntry, activeProfile);
  const slopeIsRising = isSlopeRising(latestEntry);
  const predictedSituationIsHighOrBadHigh =
    isPredictedSituationAnyHighOrMissing(predictedSituation);
  const thereIsNotEnoughCorrectionInsulin =
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;

  return (
    bloodGlucoseIsRelativeHigh &&
    (slopeIsRising || (slopeIsPositive(latestEntry) && predictedSituationIsHighOrBadHigh)) &&
    thereIsNotEnoughCorrectionInsulin
  );
};

export const detectPersistentHigh = (
  activeProfile: Profile,
  latestEntry: AnalyserEntry,
  entries: AnalyserEntry[],
  insulinOnBoard: number,
  thereIsTooLittleInsulinForCarbs: boolean,
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

  const thereIsNotEnoughCorrectionInsulin =
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH || thereIsTooLittleInsulinForCarbs;

  const slopeIsNotDown = !slopeIsNegative(latestEntry);

  return (
    hasEnoughData && isAllDataRelativeHigh && thereIsNotEnoughCorrectionInsulin && slopeIsNotDown
  );
};
