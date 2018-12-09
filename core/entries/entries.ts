import { MIN_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { SensorEntry, TimelineModel } from 'core/models/model';
import { sortBy, unionBy } from 'lodash';

export function getMergedEntriesFeed(
  context: Context,
  range: number,
  rangeEnd: number = context.timestamp(),
): Promise<SensorEntry[]> {
  return Promise.all([
    context.storage.loadTimelineModels('DexcomSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('DexcomRawSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('ParakeetSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('MeterEntry', range, rangeEnd),
  ]).then(([dexcomSensorEntries, dexcomRawSensorEntries, parakeetSensorEntries, meterEntries]) => {
    return sortBy(
      unionBy(
        dexcomSensorEntries as TimelineModel[],
        dexcomRawSensorEntries as TimelineModel[],
        parakeetSensorEntries as TimelineModel[],
        meterEntries as TimelineModel[],
        entry => {
          return Math.round(entry.timestamp / (5 * MIN_IN_MS));
        },
      ),
      'timestamp',
    ) as SensorEntry[];
  });
}
