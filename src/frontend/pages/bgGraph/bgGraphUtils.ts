import { BaseGraphConfig, Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { DAY_IN_MS, HOUR_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import { InsulinEntryType, TimelineEntries } from 'shared/types/timelineEntries';
import { highLimit, lowLimit } from 'shared/utils/config';
import {
  getTimeAsISOStr,
  getTimeInMillis,
  isTimeLarger,
  isTimeSmallerOrEqual,
} from 'shared/utils/time';

export const getFillColor = (bgSensor: number) => {
  if (bgSensor > highLimit) {
    return '#F8CC6F';
  }
  if (bgSensor < lowLimit) {
    return '#ee5a36';
  }
  return '#54c87e';
};

const isTimestampWithinFiveMinutes = (timestampToCheck: string, baseTimestamp: string) => {
  const timeToCheckInMillis = 2.5 * MIN_IN_MS;
  const upperLimit = getTimeInMillis(baseTimestamp) + timeToCheckInMillis;
  const lowerLimit = getTimeInMillis(baseTimestamp) - timeToCheckInMillis;

  // Upper limit is inclusive
  return (
    isTimeLarger(timestampToCheck, lowerLimit) && isTimeSmallerOrEqual(timestampToCheck, upperLimit)
  );
};

export const mapTimelineEntriesToGraphPoints = (timelineEntries: TimelineEntries): Point[] => {
  const { bloodGlucoseEntries, insulinEntries, meterEntries, carbEntries } = timelineEntries;
  return bloodGlucoseEntries.map(entry => {
    const insulinEntry = insulinEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp),
    );
    const meterEntry = meterEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp),
    );
    const carbEntry = carbEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp),
    );

    return {
      timestamp: getTimeInMillis(entry.timestamp),
      val: entry.bloodGlucose,
      color: getFillColor(entry.bloodGlucose),
      insulinEntry,
      meterEntry,
      carbEntry,
    };
  });
};

export const getBgGraphBaseConfig = (): BaseGraphConfig => ({
  timelineRange: 2 * DAY_IN_MS,
  timelineRangeEnd: Date.now(),
  paddingTop: 10,
  paddingBottom: 40,
  paddingLeft: 0,
  paddingRight: 30,
  outerHeight: 330,
  valMin: 0,
  valMax: 20,
  valStep: 1,
  timeStep: HOUR_IN_MS,
  dataTimeStep: 5 * MIN_IN_MS,
  pixelsPerTimeStep: 100,
  showTarget: true,
  showCurrentValue: true,
  timeFormat: 'hh:MM',
  showEveryNthTimeLabel: 1,
  decimals: 1,
});

export const getNewSelectedPointWithCarbs = (
  selectedPoint: Point | null,
  latestPoint: Point | null,
  newAmount: number,
) =>
  selectedPoint
    ? {
        ...selectedPoint,
        carbEntry: {
          timestamp: getTimeAsISOStr(selectedPoint.timestamp),
          amount: newAmount,
          durationFactor: 1,
        },
      }
    : latestPoint
      ? {
          ...latestPoint,
          carbEntry: {
            timestamp: getTimeAsISOStr(latestPoint.timestamp),
            amount: newAmount,
            durationFactor: 1,
          },
        }
      : null;

export const getNewSelectedPointWithMeterEntry = (
  selectedPoint: Point | null,
  latestPoint: Point | null,
  newBg: number,
) =>
  selectedPoint
    ? {
        ...selectedPoint,
        meterEntry: {
          timestamp: getTimeAsISOStr(selectedPoint.timestamp),
          bloodGlucose: newBg,
        },
      }
    : latestPoint
      ? {
          ...latestPoint,
          meterEntry: {
            timestamp: getTimeAsISOStr(latestPoint.timestamp),
            bloodGlucose: newBg,
          },
        }
      : null;

export const getNewSelectedPointWithInsulin = (
  selectedPoint: Point | null,
  latestPoint: Point | null,
  newAmount: number,
) =>
  selectedPoint
    ? {
        ...selectedPoint,
        insulinEntry: {
          timestamp: getTimeAsISOStr(selectedPoint.timestamp),
          amount: newAmount,
          type: 'FAST' as InsulinEntryType,
        },
      }
    : latestPoint
      ? {
          ...latestPoint,
          insulinEntry: {
            timestamp: getTimeAsISOStr(latestPoint.timestamp),
            amount: newAmount,
            type: 'FAST' as InsulinEntryType,
          },
        }
      : null;
