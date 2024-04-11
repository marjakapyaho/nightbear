import { MIN_IN_MS } from 'shared/utils/calculations';
import { CarbEntry, InsulinEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';

export const mockSensorEntries: SensorEntry[] = [
  {
    timestamp: Date.now(),
    bloodGlucose: 5.5,
  },
  {
    timestamp: Date.now() - 5 * MIN_IN_MS,
    bloodGlucose: 5.3,
  },
  {
    timestamp: Date.now() - 10 * MIN_IN_MS,
    bloodGlucose: 5.2,
  },
  {
    timestamp: Date.now() - 15 * MIN_IN_MS,
    bloodGlucose: 4.8,
  },
  {
    timestamp: Date.now() - 20 * MIN_IN_MS,
    bloodGlucose: 4.4,
  },
  {
    timestamp: Date.now() - 25 * MIN_IN_MS,
    bloodGlucose: 4.0,
  },
  {
    timestamp: Date.now() - 30 * MIN_IN_MS,
    bloodGlucose: 3.8,
  },
  {
    timestamp: Date.now() - 35 * MIN_IN_MS,
    bloodGlucose: 4.3,
  },
  {
    timestamp: Date.now() - 40 * MIN_IN_MS,
    bloodGlucose: 4.6,
  },
];

export const mockInsulinEntries: InsulinEntry[] = [
  {
    timestamp: Date.now(),
    amount: 7,
  },
  {
    timestamp: Date.now() - 30 * MIN_IN_MS,
    amount: 1,
  },
];

export const mockCarbEntries: CarbEntry[] = [
  {
    timestamp: Date.now(),
    amount: 40,
  },
];

export const mockMeterEntries: MeterEntry[] = [
  {
    timestamp: Date.now(),
    bloodGlucose: 6.5,
  },
];

export const mockTimelineEntries = {
  sensorEntries: mockSensorEntries,
  insulinEntries: mockInsulinEntries,
  carbEntries: mockCarbEntries,
  meterEntries: mockMeterEntries,
};
