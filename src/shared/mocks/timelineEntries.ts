import { mockNow } from 'shared/mocks/dates';
import { CarbEntry, InsulinEntry, MeterEntry, SensorEntry } from 'shared/types/timelineEntries';
import { generateSensorEntries } from 'shared/utils/test';

export const mockSensorEntries: SensorEntry[] = generateSensorEntries({
  currentTimestamp: mockNow,
  bloodGlucoseHistory: [4.6, 4.3, 3.8, 4.0, 4.4, 4.8, 5.2, 5.3, 5.5],
});

export const mockInsulinEntries: InsulinEntry[] = [
  {
    timestamp: mockNow,
    amount: 7,
    type: 'FAST',
  },
];

export const mockCarbEntries: CarbEntry[] = [
  {
    timestamp: mockNow,
    amount: 40,
    durationFactor: 1,
  },
];

export const mockMeterEntries: MeterEntry[] = [
  {
    timestamp: mockNow,
    bloodGlucose: 6.5,
  },
];

export const mockTimelineEntries = {
  sensorEntries: mockSensorEntries,
  insulinEntries: mockInsulinEntries,
  carbEntries: mockCarbEntries,
  meterEntries: mockMeterEntries,
};
