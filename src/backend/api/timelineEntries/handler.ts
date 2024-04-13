import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { HOUR_IN_MS } from 'shared/utils/calculations';

export const getTimelineEntries = (request: Request, context: Context): Response => {
  const { start, end } = request.requestParams;

  const startTimestamp = start ? parseInt(start, 10) : context.timestamp() - 3 * HOUR_IN_MS;
  const endTimestamp = end ? parseInt(end, 10) : context.timestamp();

  return createResponse(mockTimelineEntries);
};

export const updateTimelineEntries = (request: Request, context: Context): Response => {
  // Update carbs / insulins / meter entries for timestamp

  return createResponse(mockTimelineEntries);
};
