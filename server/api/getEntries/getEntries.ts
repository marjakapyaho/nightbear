import { Response, Context, createResponse, Request } from 'nightbear/server/models/api';
import { getMergedEntriesFeed } from 'nightbear/core/entries/entries';

export function getEntries(request: Request, context: Context): Response {
  const { range, rangeEnd } = request.requestParams;

  const rangeInt = parseInt(range, 10);
  const rangeEndInt = rangeEnd ? parseInt(rangeEnd, 10) : context.timestamp();

  return Promise.all([
    getMergedEntriesFeed(context, rangeInt, rangeEndInt),
    context.storage.loadTimelineModels('Insulin', rangeInt, rangeEndInt),
    context.storage.loadTimelineModels('Carbs', rangeInt, rangeEndInt),
  ])
    .then(([ sensorEntries, insulin, carbs ]) => createResponse({
      sensorEntries,
      insulin,
      carbs,
    }));
}
