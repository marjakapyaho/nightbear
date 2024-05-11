import { BaseGraphConfig, Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { DAY_IN_MS, HOUR_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import {
  CarbEntry,
  InsulinEntry,
  InsulinEntryType,
  TimelineEntries,
} from 'shared/types/timelineEntries';
import { highLimit, lowLimit } from 'shared/utils/config';
import {
  getTimeAsISOStr,
  getTimeInMillis,
  getTimeMinusMinutes,
  isTimeLarger,
  isTimeSmallerOrEqual,
} from 'shared/utils/time';
import { fill, groupBy, last } from 'lodash';
import { DateTime } from 'luxon';
import { getTimestampFlooredToEveryFiveMinutes } from 'shared/utils/timelineEntries';

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

export const calculateDailyAmounts = (
  entries: (InsulinEntry | CarbEntry)[],
  days: number,
  now = Date.now(),
) => {
  const countOf5MinSlots = rangeInMs / (5 * MIN_IN_MS);
  const startSlot = getTimestampFlooredToEveryFiveMinutes(getTimeAsISOStr(Date.now()));
  const slotArray = fill(Array(countOf5MinSlots), null).map((_val, i) => ({
    timestamp: getTimeMinusMinutes(startSlot, i * 5 * MIN_IN_MS),
    total: null,
  }));
  return slotArray.map(slot => ({
    timestamp: slot.timestamp,
    total:
      day.timestamp && groupedEntries[day.timestamp]
        ? getTotal(groupedEntries[day.timestamp])
        : null,
  }));
};

export const mapTimelineEntriesToGraphPoints2 = (
  timelineEntries: TimelineEntries,
  rangeInMs: number,
): Point[] => {
  const { bloodGlucoseEntries, insulinEntries, meterEntries, carbEntries } = timelineEntries;

  const countOf5MinSlots = rangeInMs / (5 * MIN_IN_MS);
  const startSlot = getTimestampFlooredToEveryFiveMinutes(getTimeAsISOStr(Date.now()));
  const slotArray = fill(Array(countOf5MinSlots), null).map((_val, i) => {
    const timestamp = startSlot && getTimeMinusMinutes(startSlot, i * 5 * MIN_IN_MS);

    const bgEntry = bloodGlucoseEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, timestamp),
    );
    const insulinEntry = insulinEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, timestamp),
    );
    const meterEntry = meterEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, timestamp),
    );
    const carbEntry = carbEntries.find(val =>
      isTimestampWithinFiveMinutes(val.timestamp, timestamp),
    );

    return {
      timestamp,
      val: bgEntry.bloodGlucose,
      color: getFillColor(bgEntry.bloodGlucose),
      insulinEntry,
      meterEntry,
      carbEntry,
    };
  });

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
      timestamp: entry.timestamp,
      val: entry.bloodGlucose,
      color: getFillColor(entry.bloodGlucose),
      insulinEntry,
      meterEntry,
      carbEntry,
    };
  });
};

export const mapTimelineEntriesToGraphPoints = (
  timelineEntries: TimelineEntries,
  rangeInMs: number,
): Point[] => {
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
      timestamp: entry.timestamp,
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

export const getNewSelectedPointWithCarbs = (basePoint: Point | null, newAmount: number) =>
  basePoint
    ? {
        ...basePoint,
        carbEntry: {
          timestamp: basePoint.timestamp,
          amount: newAmount,
          durationFactor: 1,
        },
      }
    : null;

export const getNewSelectedPointWithMeterEntry = (basePoint: Point | null, newBg: number) =>
  basePoint
    ? {
        ...basePoint,
        meterEntry: {
          timestamp: basePoint.timestamp,
          bloodGlucose: newBg,
        },
      }
    : null;

export const getNewSelectedPointWithInsulin = (basePoint: Point | null, newAmount: number) =>
  basePoint
    ? {
        ...basePoint,
        insulinEntry: {
          timestamp: basePoint.timestamp,
          amount: newAmount,
          type: 'FAST' as InsulinEntryType,
        },
      }
    : null;
