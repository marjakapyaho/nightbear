import { Context, createResponse, Request } from 'backend/utils/api';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr, getTimeMinusTime } from 'shared/utils/time';

export const getTimelineEntries = async (request: Request, context: Context) => {
  const { start, end } = request.requestParams;
  const defaultFrom = getTimeMinusTime(context.timestamp(), 3 * HOUR_IN_MS);

  const sensorEntries = await context.db.sensorEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const insulinEntries = await context.db.insulinEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const carbEntries = await context.db.carbEntries.byTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const meterEntries = await context.db.meterEntries.byTimestamp({
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

export const updateTimelineEntries = async (request: Request, context: Context) => {
  // TODO: request body is always empty
  const dataPoint = request.requestBody as Point;
  if (!dataPoint?.timestamp) {
    return createResponse('error');
  }

  const dataPointTimestamp = getTimeAsISOStr(dataPoint.timestamp);

  const [insulinEntry] = dataPoint.valTop
    ? await context.db.insulinEntries.upsertInsulinEntry({
        timestamp: dataPointTimestamp,
        amount: dataPoint.valTop,
        type: 'FAST', // TODO
      })
    : [];

  const [meterEntry] = dataPoint.valMiddle
    ? await context.db.meterEntries.upsertMeterEntry({
        timestamp: dataPointTimestamp,
        bloodGlucose: dataPoint.valMiddle,
      })
    : [];

  const [carbEntry] = dataPoint.valBottom
    ? await context.db.carbEntries.upsertCarbEntry({
        timestamp: dataPointTimestamp,
        amount: dataPoint.valBottom,
        speedFactor: 1, // TODO
      })
    : [];

  return createResponse({
    insulinEntry,
    meterEntry,
    carbEntry,
  });
};
