import { Context, createResponse, Request } from 'backend/utils/api';
import { Point } from 'frontend/components/scrollableGraph/scrollableGraphUtils';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { getTimeAsISOStr, getTimeMinusTime } from 'shared/utils/time';
import { getMergedBgEntries } from 'shared/utils/timelineEntries';

export const getTimelineEntries = async (request: Request, context: Context) => {
  const { start, end } = request.requestParams;
  const defaultFrom = getTimeMinusTime(context.timestamp(), 3 * HOUR_IN_MS);

  const meterEntries = await context.db.getMeterEntriesByTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const sensorEntries = await context.db.getSensorEntriesByTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });
  const bloodGlucoseEntries = getMergedBgEntries(sensorEntries, meterEntries);

  const insulinEntries = await context.db.getInsulinEntriesByTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  const carbEntries = await context.db.getCarbEntriesByTimestamp({
    from: start || defaultFrom,
    to: end || context.timestamp(),
  });

  return createResponse({
    bloodGlucoseEntries,
    insulinEntries,
    carbEntries,
    meterEntries,
  });
};

export const updateTimelineEntries = async (request: Request, context: Context) => {
  const dataPoint = request.requestBody as Point;
  const timestamp = dataPoint?.isoTimestamp;
  if (!timestamp) {
    return createResponse('error');
  }

  const insulinEntry = dataPoint.insulinEntry
    ? await context.db.upsertInsulinEntry(dataPoint.insulinEntry)
    : await context.db.deleteInsulinEntry(timestamp);

  const meterEntry = dataPoint.meterEntry
    ? await context.db.upsertMeterEntry(dataPoint.meterEntry)
    : await context.db.deleteMeterEntry(timestamp);

  const carbEntry = dataPoint.carbEntry
    ? await context.db.upsertCarbEntry(dataPoint.carbEntry)
    : await context.db.deleteCarbEntry(timestamp);

  return createResponse({
    insulinEntry,
    meterEntry,
    carbEntry,
  });
};
