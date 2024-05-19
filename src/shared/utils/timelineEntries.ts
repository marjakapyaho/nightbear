import { chain, fill } from 'lodash';
import { DateTime } from 'luxon';
import {
  BloodGlucoseEntry,
  CarbEntry,
  InsulinEntry,
  MeterEntry,
  SensorEntry,
  TimelineEntries,
} from 'shared/types/timelineEntries';
import { calculateAverageBg, MIN_IN_MS } from 'shared/utils/calculations';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { getTimeInMillis, getTimeMinusMinutes } from 'shared/utils/time';
import { getFillColor } from 'frontend/pages/bgGraph/bgGraphUtils';
import { ProfileActivation } from 'shared/types/profiles';
import { Alarm } from 'shared/types/alarms';
import { getAlarmState, getFirstAlarmState } from 'shared/utils/alarms';

export const getTimestampFlooredToEveryFiveMinutes = (timestamp: string) => {
  const dateTime = DateTime.fromISO(timestamp);
  const minuteSlot = Math.floor(dateTime.get('minute') / 5);
  return dateTime
    .set({ minute: minuteSlot * 5, second: 0, millisecond: 0 })
    .toUTC()
    .toISO();
};

export const getMergedBgEntries = (
  sensorEntries: SensorEntry[],
  meterEntries?: MeterEntry[],
): BloodGlucoseEntry[] =>
  chain(meterEntries ? [...sensorEntries, ...meterEntries] : sensorEntries)
    .sortBy('timestamp')
    .groupBy(entry => getTimestampFlooredToEveryFiveMinutes(entry.timestamp))
    .flatMap((entries, groupTimestamp) => ({
      bloodGlucose: calculateAverageBg(entries),
      timestamp: groupTimestamp,
    }))
    .value();

const getAndValidateEntry = <T extends BloodGlucoseEntry | InsulinEntry | MeterEntry | CarbEntry>(
  entries: T[],
): T | undefined => {
  if (entries.length > 1) {
    throw new Error('Multiple entries of type in slot.');
  }
  return entries.length === 1 ? entries[0] : undefined;
};

const isEntryInThisSlot = <T extends { timestamp: string }>(entry: T, timestamp: string) =>
  getTimestampFlooredToEveryFiveMinutes(entry.timestamp) === timestamp;

const isActivationInThisSlot = (profileActivation: ProfileActivation, timestamp: string) =>
  getTimestampFlooredToEveryFiveMinutes(profileActivation.activatedAt) === timestamp;

const isAlarmInThisSlot = (alarm: Alarm, timestamp: string) =>
  getTimestampFlooredToEveryFiveMinutes(getFirstAlarmState(alarm).timestamp) === timestamp;

export const mapTimelineEntriesToGraphPoints = (
  timelineEntries: TimelineEntries,
  rangeInMs: number,
  currentTimestamp: string,
): Point[] => {
  const {
    bloodGlucoseEntries,
    insulinEntries,
    meterEntries,
    carbEntries,
    profileActivations,
    alarms,
  } = timelineEntries;

  const countOfFiveMinSlots = rangeInMs / (5 * MIN_IN_MS);
  const startSlotTimestamp = getTimestampFlooredToEveryFiveMinutes(currentTimestamp);
  const slotArray = fill(Array(countOfFiveMinSlots), null);

  return slotArray
    .map((_val, i): Point => {
      const timestamp = startSlotTimestamp && getTimeMinusMinutes(startSlotTimestamp, i * 5);

      if (!timestamp) {
        throw new Error('Could not calculate timestamp for slot');
      }

      const bgEntry = getAndValidateEntry(
        bloodGlucoseEntries.filter(entry => isEntryInThisSlot(entry, timestamp)),
      );
      const insulinEntry = getAndValidateEntry(
        insulinEntries.filter(entry => isEntryInThisSlot(entry, timestamp)),
      );
      const meterEntry = getAndValidateEntry(
        meterEntries.filter(entry => isEntryInThisSlot(entry, timestamp)),
      );
      const carbEntry = getAndValidateEntry(
        carbEntries.filter(entry => isEntryInThisSlot(entry, timestamp)),
      );

      const profileActivationsInSlot = profileActivations?.filter(activation =>
        isActivationInThisSlot(activation, timestamp),
      );
      const alarmsInSlot = alarms?.filter(alarm => isAlarmInThisSlot(alarm, timestamp));

      const val = bgEntry ? bgEntry.bloodGlucose : null;
      const color = getFillColor(val);

      return {
        isoTimestamp: timestamp,
        timestamp: getTimeInMillis(timestamp),
        val,
        color,
        ...(insulinEntry && { insulinEntry }),
        ...(meterEntry && { meterEntry }),
        ...(carbEntry && { carbEntry }),
        ...(profileActivationsInSlot && { profileActivations: profileActivationsInSlot }),
        ...(alarmsInSlot && { alarms: alarmsInSlot }),
      };
    })
    .reverse();
};
