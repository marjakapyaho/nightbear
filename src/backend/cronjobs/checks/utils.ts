import { HOUR_IN_MS } from 'shared/utils/calculations';
import { Context } from 'backend/utils/api';
import { getTimeMinusTime } from 'shared/utils/time';

const ANALYSIS_RANGE = 3 * HOUR_IN_MS;

export const getRange = (context: Context) => ({
  from: getTimeMinusTime(context.timestamp(), ANALYSIS_RANGE),
});
