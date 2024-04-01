import { DAY_IN_MS } from 'shared/calculations/calculations';
import { fill, groupBy } from 'lodash';
import { DateTime } from 'luxon';
import { CarbEntry, InsulinEntry } from 'shared/mocks/timelineEntries';

const getDateInIsoFormat = (timestamp: number) => DateTime.fromMillis(timestamp).toISODate();

const getTotal = (dailyAmounts: (InsulinEntry | CarbEntry)[]) =>
  dailyAmounts.reduce((prev, current) => prev + current.amount, 0);

export const calculateDailyAmounts = (entries: (InsulinEntry | CarbEntry)[], days: number) => {
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
