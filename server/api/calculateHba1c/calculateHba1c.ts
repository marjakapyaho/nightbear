import { Response, Context, createResponse, Request } from 'nightbear/core/models/api';
import { calculateHba1c, DAY_IN_MS } from 'nightbear/core/calculations/calculations';
import { getMergedEntriesFeed } from 'nightbear/core/entries/entries';

const HBA1C_WEEKS = 4;

export function calculateHba1cForDate(request: Request, context: Context): Response {
  const { requestParams } = request;
  const dateAsMs = parseInt(requestParams.date, 10) || context.timestamp();
  const timePeriodInMs = HBA1C_WEEKS * 7 * DAY_IN_MS;

  return Promise.resolve()
    .then(() => getMergedEntriesFeed(context, timePeriodInMs, dateAsMs))
    .then((sensorEntries) => calculateHba1c(sensorEntries))
    .then((hba1cValue) => context.storage.saveModel({
      modelType: 'Hba1c',
      source: 'calculated',
      timestamp: dateAsMs,
      hba1cValue,
    }))
    .then(() => Promise.resolve(createResponse()));
}
