import { BaseGraphConfig, Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { DAY_IN_MS, HOUR_IN_MS, MIN_IN_MS } from 'shared/calculations/calculations';
import { TimelineEntries } from 'shared/types/timelineEntries';
import { highLimit, lowLimit } from 'shared/utils/config';

export const getFillColor = (bgSensor: number, bgMeter?: number) => {
  if (bgMeter) {
    return '#828282';
  }
  if (bgSensor > highLimit) {
    return '#F8CC6F';
  }
  if (bgSensor < lowLimit) {
    return '#ee5a36';
  }
  return '#54c87e';
};

const isTimestampWithinFiveMinutes = (timestampToCheck: number, baseTimestamp: number) => {
  const timeToCheckInMillis = 2.5 * MIN_IN_MS;
  const upperLimit = baseTimestamp + timeToCheckInMillis;
  const lowerLimit = baseTimestamp - timeToCheckInMillis;

  // Upper limit is inclusive
  return timestampToCheck > lowerLimit && timestampToCheck <= upperLimit;
};

export const mapTimelineEntriesToGraphPoints = (timelineEntries: TimelineEntries): Point[] => {
  const { sensorEntries, insulinEntries, meterEntries, carbEntries } = timelineEntries;
  return sensorEntries.map(entry => {
    const insulin = insulinEntries.find(val => isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp));
    const meterEntry = meterEntries.find(val => isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp));
    const carb = carbEntries.find(val => isTimestampWithinFiveMinutes(val.timestamp, entry.timestamp));

    return {
      timestamp: entry.timestamp,
      val: meterEntry?.bloodGlucose || entry.bloodGlucose,
      color: getFillColor(entry.bloodGlucose, meterEntry?.bloodGlucose),
      valTop: insulin?.amount,
      valMiddle: meterEntry?.bloodGlucose,
      valBottom: carb?.amount,
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
