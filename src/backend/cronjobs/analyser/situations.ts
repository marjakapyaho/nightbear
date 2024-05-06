import { AnalyserEntry, Situation } from 'shared/types/analyser';
import { Profile } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { getTimeMinusTimeMs, isTimeLarger, minToMs } from 'shared/utils/time';
import { onlyActive } from 'shared/utils/alarms';
import {
  getRelevantEntries,
  isSituationCritical,
  slopeIsDown,
} from 'backend/cronjobs/analyser/utils';
import { find } from 'lodash';
import { CarbEntry } from 'shared/types/timelineEntries';
import { getEntriesWithinTimeRange } from 'backend/cronjobs/checks/utils';
import { MIN_IN_MS } from 'shared/utils/calculations';

// Minutes
const PERSISTENT_HIGH_TIME_WINDOW = 120;
const COMPRESSION_LOW_TIME_WINDOW = 25;
const BAD_LOW_QUARANTINE_WINDOW = 15;
const BAD_HIGH_QUARANTINE_WINDOW = 90;
const TIME_SINCE_BG_CRITICAL = 15;
const LOW_CORRECTION_SUPPRESSION_WINDOW = 20;

// Other units
const HIGH_CLEARING_THRESHOLD = 1;
const LOW_CLEARING_THRESHOLD = 0.5;
const RELEVANT_IOB_LIMIT_FOR_LOW = 0.5;
const RELEVANT_IOB_LIMIT_FOR_HIGH = 1;
const RELEVANT_COB_LIMIT_FOR_LOW = 10;

const slopeLimits = {
  SLOW: 0.3,
  MEDIUM: 0.6,
  FAST: 1.3,
  MEGA_FAST: 2,
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
  thereIsTooMuchInsulin: boolean,
  currentTimestamp: string,
) => {
  const notComingUpFromBadLow = !find(
    alarms,
    alarm =>
      (!alarm.deactivatedAt ||
        isTimeLarger(
          alarm.deactivatedAt,
          getTimeMinusTimeMs(currentTimestamp, minToMs(BAD_LOW_QUARANTINE_WINDOW)),
        )) &&
      alarm.situation === 'BAD_LOW',
  );

  // TODO: continue this
  const thereAreNoCorrectionCarbs =
    getEntriesWithinTimeRange(
      currentTimestamp,
      carbEntries,
      minToMs(LOW_CORRECTION_SUPPRESSION_WINDOW),
    ).length === 0;

  const correctionIfAlreadyLow = find(onlyActive(alarms), { situation: 'LOW' })
    ? LOW_CLEARING_THRESHOLD
    : 0;

  return (
    notComingUpFromBadLow &&
    (thereAreNoCorrectionCarbs || thereIsTooMuchInsulin) &&
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
          getTimeMinusTimeMs(currentTimestamp, minToMs(BAD_HIGH_QUARANTINE_WINDOW)),
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
  const predictedSituationIsLowOrBadLow =
    predictedSituation === 'LOW' || predictedSituation === 'BAD_LOW';

  return (
    bloodGlucoseIsRelativeLow &&
    (slopeIndicatesFalling || (predictedSituationIsLowOrBadLow && slopeIsDown(latestEntry)))
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
    relevantEntries.filter(
      entry =>
        entry.bloodGlucose > activeProfile.analyserSettings.highLevelRel &&
        entry.bloodGlucose <= activeProfile.analyserSettings.highLevelAbs,
    ).length === relevantEntries.length;

  const slopeIsNotDown = !slopeIsDown(latestEntry);

  return (
    hasEnoughData &&
    isAllDataRelativeHigh &&
    insulinOnBoard < RELEVANT_IOB_LIMIT_FOR_HIGH &&
    slopeIsNotDown
  );
};
