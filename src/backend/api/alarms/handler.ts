import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { mockAlarms } from 'shared/mocks/alarms';

export const getAlarms = (request: Request, context: Context): Response => {
  const { start, end, onlyActive } = request.requestParams;

  const startTimestamp = start ? parseInt(start, 10) : context.timestamp() - 3 * HOUR_IN_MS;
  const endTimestamp = end ? parseInt(end, 10) : context.timestamp();

  return createResponse(mockAlarms);
};

export const ackAlarm = (request: Request, context: Context): Response => {
  return createResponse(mockAlarms[0]);
};
