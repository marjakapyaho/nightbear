import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { HOUR_IN_MS } from 'shared/utils/calculations';

export const getTimelineEntries = async (request: Request, context: Context) => {
  const { start, end } = request.requestParams;

  return createResponse(
    await context.db.sensorEntries.byTimestamp({
      from: new Date(start ? parseInt(start, 10) : context.timestamp() - 3 * HOUR_IN_MS).toISOString(),
      to: new Date(end ? parseInt(end, 10) : context.timestamp()).toISOString(),
    }),
  );
};

export const updateTimelineEntries = (request: Request, context: Context): Response => {
  // Update carbs / insulins / meter entries for timestamp

  return createResponse(mockTimelineEntries);
};
