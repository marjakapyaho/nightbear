import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { mockTimelineEntries } from 'shared/mocks/timelineEntries';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr, getTimeSubtractedFrom } from 'shared/utils/time';

export const getTimelineEntries = async (request: Request, context: Context) => {
  const { start, end } = request.requestParams;
  const defaultFrom = getTimeAsISOStr(getTimeSubtractedFrom(context.timestamp(), 3 * HOUR_IN_MS));

  const sensorEntries = await context.db.sensorEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const insulinEntries = await context.db.insulinEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const carbEntries = await context.db.insulinEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const meterEntries = await context.db.insulinEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  return createResponse({
    sensorEntries,
    insulinEntries,
    carbEntries,
    meterEntries,
  });
};

export const updateTimelineEntries = (request: Request, context: Context): Response => {
  //const dataPoint: Point = request.requestBody;

  // Update carbs / insulins / meter entries for timestamp

  return createResponse(mockTimelineEntries);
};
