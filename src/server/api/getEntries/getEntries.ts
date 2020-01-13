import { HOUR_IN_MS } from 'core/calculations/calculations';
import { getMergedEntriesFeed } from 'core/entries/entries';
import { Context, createResponse, Request, Response } from 'core/models/api';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import { chain, union } from 'lodash';

export function getEntries(request: Request, context: Context): Response {
  const { range, rangeEnd } = request.requestParams;

  const rangeInt = range ? parseInt(range, 10) : 3 * HOUR_IN_MS;
  const rangeEndInt = rangeEnd ? parseInt(rangeEnd, 10) : context.timestamp();

  return Promise.all([
    getMergedEntriesFeed(context, rangeInt, rangeEndInt),
    context.storage.loadTimelineModels('Insulin', rangeInt, rangeEndInt),
    context.storage.loadTimelineModels('Carbs', rangeInt, rangeEndInt),
  ]).then(([sensorEntries, insulin, carbs]) => {
    const legacyResponseForWatch = chain(
      union(sensorEntries as TimelineModel[], insulin as TimelineModel[], carbs as TimelineModel[]),
    )
      .groupBy((entry: TimelineModel) => entry.timestamp)
      .map((group: TimelineModel[], timestamp: string) => {
        const carbs = group.find(is('Carbs'));
        const insulin = group.find(is('Insulin'));
        const dexcomSensorEntry = group.find(is('DexcomSensorEntry'));
        const dexcomRawSensorEntry = group.find(is('DexcomRawSensorEntry'));
        const parakeetSensorEntry = group.find(is('ParakeetSensorEntry'));
        const sensorEntry = dexcomSensorEntry || dexcomRawSensorEntry || parakeetSensorEntry;
        const isRaw = !!dexcomRawSensorEntry || !!parakeetSensorEntry;
        return {
          time: parseInt(timestamp, 10), // note: timestamp has become string as it was used as an object key in the result of the groupBy()
          carbs: carbs ? carbs.amount : undefined,
          insulin: insulin ? insulin.amount : undefined,
          sugar: sensorEntry ? sensorEntry.bloodGlucose && sensorEntry.bloodGlucose.toFixed(1) + '' : undefined,
          is_raw: isRaw,
        };
      })
      .sortBy((entry: any) => entry.time) // return in chronological order
      .value();

    return createResponse(legacyResponseForWatch);
  });
}
