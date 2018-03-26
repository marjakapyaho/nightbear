import { Response, Context, createResponse, Request } from '../../models/api';
import { HOUR_IN_MS } from '../../core/calculations/calculations';

export function getEntries(request: Request, context: Context): Response {
  const { from } = request.requestParams;

  const fromTimestamp = from ? parseInt(from, 10) : context.timestamp() - 24 * HOUR_IN_MS; // default to 24 hours ago

  // TODO: use this
  // const toTimestamp = to ? parseInt(to, 10) : context.timestamp(); // default to present time

  return Promise.all([
    context.storage.loadTimelineModels(fromTimestamp), // TODO: SensorEntry
    context.storage.loadTimelineModels(fromTimestamp), // TODO: Insulin
    context.storage.loadTimelineModels(fromTimestamp), // TODO: Carbs
  ])
    .then(([ sensorEntries, insulin, carbs ]) => createResponse({
      sensorEntries,
      insulin,
      carbs,
    }));
}
