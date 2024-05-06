import {
  AnalyserData,
  getLatestAnalyserEntry,
  getPredictedSituation,
  mapSensorAndMeterEntriesToAnalyserEntries,
} from 'backend/cronjobs/analyser/utils';
import { CarbEntry, InsulinEntry } from 'shared/types/timelineEntries';
import { AnalyserEntry, Situation } from 'shared/types/analyser';
import { Alarm } from 'shared/types/alarms';
import { Profile } from 'shared/types/profiles';
import {
  detectBadHigh,
  detectBadLow,
  detectCompressionLow,
  detectCriticalOutdated,
  detectFalling,
  detectHigh,
  detectLow,
  detectOutdated,
  detectPersistentHigh,
  detectRising,
} from './situations';
import {
  calculateCurrentCarbsToInsulinRatio,
  calculateRequiredCarbsToInsulinRatio,
  getCarbsOnBoard,
  getInsulinOnBoard,
} from 'shared/utils/calculations';
import { getEntriesWithinTimeRange } from 'backend/cronjobs/checks/utils';
import { hourToMs } from 'shared/utils/time';

export const runAnalysis = ({
  currentTimestamp,
  activeProfile,
  sensorEntries,
  meterEntries,
  insulinEntries,
  carbEntries,
  alarms,
}: AnalyserData): Situation | null => {
  const analyserEntries = mapSensorAndMeterEntriesToAnalyserEntries(sensorEntries, meterEntries);
  const requiredCarbsToInsulin = calculateRequiredCarbsToInsulinRatio(
    currentTimestamp,
    carbEntries,
    insulinEntries,
  );
  const relevantInsulinEntries = getEntriesWithinTimeRange(
    currentTimestamp,
    insulinEntries,
    hourToMs(6),
  );
  const relevantCarbEntries = getEntriesWithinTimeRange(currentTimestamp, carbEntries, hourToMs(6));

  const predictedSituation = getPredictedSituation(
    activeProfile,
    analyserEntries,
    relevantInsulinEntries,
    relevantCarbEntries,
    alarms,
    requiredCarbsToInsulin,
  );

  return detectSituation(
    currentTimestamp,
    activeProfile,
    analyserEntries,
    relevantInsulinEntries,
    relevantCarbEntries,
    alarms,
    requiredCarbsToInsulin,
    predictedSituation,
  );
};

export const detectSituation = (
  currentTimestamp: string,
  activeProfile: Profile,
  analyserEntries: AnalyserEntry[],
  insulinEntries: InsulinEntry[],
  carbEntries: CarbEntry[],
  alarms: Alarm[],
  requiredCarbsToInsulin: number | null,
  predictedSituation: Situation | null,
): Situation | null => {
  const latestEntry = getLatestAnalyserEntry(analyserEntries);
  const insulinOnBoard = getInsulinOnBoard(currentTimestamp, insulinEntries);
  const carbsOnBoard = getCarbsOnBoard(currentTimestamp, carbEntries);
  const currentCarbsToInsulin = calculateCurrentCarbsToInsulinRatio(carbsOnBoard, insulinOnBoard);
  const thereIsTooMuchInsulin =
    currentCarbsToInsulin !== null &&
    requiredCarbsToInsulin !== null &&
    currentCarbsToInsulin <= requiredCarbsToInsulin;

  /**
   * 1. CRITICAL_OUTDATED
   * If we have no data inside analysis range, or we've missed some data and
   * predicted state is bad, return critical outdated immediately
   */
  if (detectCriticalOutdated(latestEntry, insulinOnBoard, currentTimestamp, predictedSituation)) {
    return 'CRITICAL_OUTDATED';
  }

  /**
   * 2. BAD_LOW and BAD_HIGH
   * Most critical and simple checks, must be before low and high
   */
  if (detectBadLow(activeProfile, latestEntry)) {
    return 'BAD_LOW';
  }
  if (detectBadHigh(activeProfile, latestEntry)) {
    return 'BAD_HIGH';
  }

  /**
   * 3. OUTDATED
   * This is after the critical checks, so it will never override those. This also
   * only alarms after timeSinceBgMinutes so there is a bigger delay.
   */
  if (detectOutdated(activeProfile, latestEntry, currentTimestamp)) {
    return 'OUTDATED';
  }

  /**
   * 4. COMPRESSION_LOW
   * Must be before LOW and FALLING
   */
  if (detectCompressionLow(activeProfile, analyserEntries, insulinOnBoard, currentTimestamp)) {
    return 'COMPRESSION_LOW';
  }

  /**
   * 5. LOW and HIGH
   * Must be before FALLING and RISING
   */
  if (
    detectLow(
      activeProfile,
      latestEntry,
      alarms,
      carbEntries,
      thereIsTooMuchInsulin,
      currentTimestamp,
    )
  ) {
    return 'LOW';
  }
  if (detectHigh(activeProfile, latestEntry, alarms, insulinOnBoard, currentTimestamp)) {
    return 'HIGH';
  }

  /**
   * 5. FALLING and RISING
   * Check that we're inside relative low or high and slope is big enough.
   * Rising also checks for the presence of correction insulin.
   */
  if (detectFalling(activeProfile, latestEntry, predictedSituation)) {
    return 'FALLING';
  }
  if (detectRising(activeProfile, latestEntry, insulinOnBoard)) {
    return 'RISING';
  }

  /**
   * 6. PERSISTENT_HIGH
   * Alarms values that are only relative high, but don't seem to be going lower
   */
  if (
    detectPersistentHigh(
      activeProfile,
      latestEntry,
      analyserEntries,
      insulinOnBoard,
      currentTimestamp,
    )
  ) {
    return 'PERSISTENT_HIGH';
  }

  return null;
};
