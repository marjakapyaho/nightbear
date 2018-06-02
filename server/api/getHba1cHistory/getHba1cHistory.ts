import { Response, Context, createResponse, Request } from 'nightbear/server/models/api';
import { MONTH_IN_MS } from 'nightbear/server/core/calculations/calculations';
import { isNaN } from 'lodash';

export function getHba1cHistory(request: Request, context: Context): Response {
  const { requestParams } = request;
  const monthsAsNumber = parseInt(requestParams.months, 10);
  const timePeriodInMonths = isNaN(monthsAsNumber) ? 3 : monthsAsNumber;
  const timePeriodInMs = timePeriodInMonths * MONTH_IN_MS;

  return Promise.resolve()
    .then(() => context.storage.loadTimelineModels('Hba1c', timePeriodInMs, context.timestamp()))
    .then((hba1cHistory) => createResponse(hba1cHistory));
}
