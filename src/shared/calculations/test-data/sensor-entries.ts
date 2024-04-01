import { MIN_IN_MS } from 'shared/calculations/calculations';
import { SensorEntry } from 'shared/types/timelineEntries';

const currentTimestamp = 1508672249758;

export const sensorEntries1: SensorEntry[] = [
  {
    timestamp: currentTimestamp - 35 * MIN_IN_MS,
    bloodGlucose: 6,
  },
  {
    timestamp: currentTimestamp - 30 * MIN_IN_MS,
    bloodGlucose: 6,
  },
  {
    timestamp: currentTimestamp - 25 * MIN_IN_MS,
    bloodGlucose: 6,
  },
  {
    timestamp: currentTimestamp - 20 * MIN_IN_MS,
    bloodGlucose: 8,
  },
  {
    timestamp: currentTimestamp - 15 * MIN_IN_MS,
    bloodGlucose: 7,
  },
  {
    timestamp: currentTimestamp - 10 * MIN_IN_MS,
    bloodGlucose: 7,
  },
  {
    timestamp: currentTimestamp - 5 * MIN_IN_MS,
    bloodGlucose: 8,
  },
];

export const sensorEntries2: SensorEntry[] = [
  {
    timestamp: currentTimestamp - 35 * MIN_IN_MS,
    bloodGlucose: 14,
  },
  {
    timestamp: currentTimestamp - 30 * MIN_IN_MS,
    bloodGlucose: 11,
  },
  {
    timestamp: currentTimestamp - 25 * MIN_IN_MS,
    bloodGlucose: 11.5,
  },
  {
    timestamp: currentTimestamp - 20 * MIN_IN_MS,
    bloodGlucose: 12.5,
  },
  {
    timestamp: currentTimestamp - 15 * MIN_IN_MS,
    bloodGlucose: 13.1,
  },
  {
    timestamp: currentTimestamp - 10 * MIN_IN_MS,
    bloodGlucose: 12,
  },
  {
    timestamp: currentTimestamp - 5 * MIN_IN_MS,
    bloodGlucose: 10,
  },
];
