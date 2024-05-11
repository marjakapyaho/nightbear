import { chain } from 'lodash';
import { DateTime } from 'luxon';
import { BloodGlucoseEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import { calculateAverageBg } from 'shared/utils/calculations';

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
