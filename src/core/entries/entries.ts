import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import {
  DexcomRawSensorEntry,
  DexcomSensorEntry,
  MeterEntry,
  ParakeetSensorEntry,
  SensorEntry,
  TimelineModel,
  DexcomG6SensorEntry,
  DexcomG6ShareEntry,
} from 'core/models/model';
import { sortBy, unionBy } from 'lodash';

export function getMergedEntriesFeed(
  context: Context,
  range: number,
  rangeEnd: number = context.timestamp(),
): Promise<SensorEntry[]> {
  return Promise.all([
    context.storage.loadTimelineModels(['DexcomG6ShareEntry'], range, rangeEnd),
    context.storage.loadTimelineModels(['DexcomG6SensorEntry'], range, rangeEnd),
    context.storage.loadTimelineModels(['DexcomSensorEntry'], range, rangeEnd),
    context.storage.loadTimelineModels(['DexcomRawSensorEntry'], range, rangeEnd),
    context.storage.loadTimelineModels(['ParakeetSensorEntry'], range, rangeEnd),
    context.storage.loadTimelineModels(['MeterEntry'], range, rangeEnd),
  ]).then(mergeEntriesFeed);
}

export function mergeEntriesFeed([
  dexcomG6ShareEntries,
  dexcomG6SensorEntries,
  dexcomSensorEntries,
  dexcomRawSensorEntries,
  parakeetSensorEntries,
  meterEntries,
]: [
  DexcomG6ShareEntry[],
  DexcomG6SensorEntry[],
  DexcomSensorEntry[],
  DexcomRawSensorEntry[],
  ParakeetSensorEntry[],
  MeterEntry[],
]) {
  return sortBy(
    unionBy(
      meterEntries as TimelineModel[],
      dexcomG6SensorEntries as TimelineModel[],
      dexcomSensorEntries as TimelineModel[],
      dexcomRawSensorEntries as TimelineModel[],
      parakeetSensorEntries as TimelineModel[],
      entry => {
        return Math.round(entry.timestamp / (5 * MIN_IN_MS));
      },
    ),
    'timestamp',
  ) as SensorEntry[];
}
