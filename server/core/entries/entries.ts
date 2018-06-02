import { Context } from 'server/models/api';
import { SensorEntry } from 'server/models/model';

export function getMergedEntriesFeed(
  context: Context,
  range: number,
  rangeEnd: number) {

  return Promise.all([
    context.storage.loadTimelineModels('DexcomSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('DexcomRawSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('ParakeetSensorEntry', range, rangeEnd),
    context.storage.loadTimelineModels('MeterEntry', range, rangeEnd),
  ])
    .then(([dexcomSensorEntries, dexcomRawSensorEntries, parakeetSensorEntries, meterEntries ]) => {
      console.log('do merger of', dexcomSensorEntries, dexcomRawSensorEntries, parakeetSensorEntries, meterEntries);
      return dexcomSensorEntries as SensorEntry[];
    });
}
