import { calculateHba1c, DAY_IN_MS } from 'shared/calculations/calculations';
import { getMergedEntriesFeed } from 'shared/entries/entries';
import { Context, createResponse, Request, Response } from 'shared/models/api';
import { generateUuid } from 'shared/utils/id';

const HBA1C_WEEKS = 4;

export function calculateHba1cForDate(request: Request, context: Context): Response {
  const { requestParams } = request;
  const dateAsMs = parseInt(requestParams.date, 10) || context.timestamp();
  const timePeriodInMs = HBA1C_WEEKS * 7 * DAY_IN_MS;

  return Promise.resolve()
    .then(() => getMergedEntriesFeed(context, timePeriodInMs, dateAsMs))
    .then(sensorEntries => calculateHba1c(sensorEntries))
    .then(hba1cValue =>
      context.storage.saveModel({
        modelType: 'Hba1c',
        modelUuid: generateUuid(),
        source: 'calculated',
        timestamp: dateAsMs,
        hba1cValue,
      }),
    )
    .then(() => Promise.resolve(createResponse()));
}
