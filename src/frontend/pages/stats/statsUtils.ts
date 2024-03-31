import { Carbs, Insulin } from 'shared/models/model';
import { DAY_IN_MS } from 'shared/calculations/calculations';
import { fill, groupBy } from 'lodash';
import { DateTime } from 'luxon';

const getDateInIsoFormat = (timestamp: number) => DateTime.fromMillis(timestamp).toISODate();

const getTotal = (dailyAmounts: (Carbs | Insulin)[]) =>
  dailyAmounts.reduce((prev, current) => prev + current.amount, 0);

export const calculateDailyAmounts = (entries: (Carbs | Insulin)[], days: number) => {
  const now = Date.now();

  const dayArray = fill(Array(days), null).map((_val, i) => ({
    date: getDateInIsoFormat(now - DAY_IN_MS * i),
    total: null,
  }));
  const groupedCarbs = groupBy(entries, carbEntry => getDateInIsoFormat(carbEntry.timestamp));
  return dayArray.map(day => ({
    timestamp: day.date ? new Date(day.date).getTime() : Date.now(),
    total: day.date && groupedCarbs[day.date] ? getTotal(groupedCarbs[day.date]) : null,
  }));
};
