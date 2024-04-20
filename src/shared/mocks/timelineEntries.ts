import { generateSensorEntries } from 'backend/utils/test';
import { mockNow } from 'shared/mocks/dates';
import { CarbEntry, InsulinEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import { MIN_IN_MS } from 'shared/utils/calculations';

export const mockSensorEntries: SensorEntry[] = generateSensorEntries({
  currentTimestamp: Date.now(),
  bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
});

export const mockInsulinEntries: InsulinEntry[] = [
  {
    timestamp: new Date().toISOString(),
    amount: 7,
    type: 'FAST',
  },
  {
    timestamp: new Date(Date.now() - 30 * MIN_IN_MS).toISOString(),
    amount: 1,
    type: 'FAST',
  },
];

export const mockCarbEntries: CarbEntry[] = [
  {
    timestamp: new Date(mockNow).toISOString(),
    amount: 40,
    speedFactor: 1,
  },
];

export const mockMeterEntries: MeterEntry[] = [
  {
    timestamp: new Date().toISOString(),
    bloodGlucose: 6.5,
  },
];

export const mockTimelineEntries = {
  sensorEntries: mockSensorEntries,
  insulinEntries: mockInsulinEntries,
  carbEntries: mockCarbEntries,
  meterEntries: mockMeterEntries,
};
