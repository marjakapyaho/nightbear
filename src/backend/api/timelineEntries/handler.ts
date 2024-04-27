import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';

export const getTimelineEntries = async (request: Request, context: Context) => {
  const { start, end } = request.requestParams;

  return createResponse(
    await context.db.sensorEntries.byTimestamp({
      from: start || getTimeAsISOStr(getTimeSubtractedFrom(context.timestamp(), 3 * HOUR_IN_MS)),
      to: end || context.timestamp(),
    }),
  );
};

export const updateTimelineEntries = (request: Request, context: Context): Response => {
  // Update carbs / insulins / meter entries for timestamp

  return createResponse(mockTimelineEntries);
};
