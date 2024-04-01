import { MIN_IN_MS } from 'shared/calculations/calculations';

export type BloodGlucoseEntry = {
  timestamp: number;
  bloodGlucose: number;
};

export type InsulinEntry = {
  timestamp: number;
  amount: number;
};

export type CarbEntry = {
  timestamp: number;
  amount: number;
};

export type MeterEntry = {
  timestamp: number;
  bloodGlucose: number;
};

export type TimelineEntries = {
  bloodGlucoseEntries: BloodGlucoseEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  meterEntries: MeterEntry[];
};

export const mockBloodGlucoseEntries: BloodGlucoseEntry[] = [
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
    bloodGlucose: 4.0,
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
    bloodGlucose: 8.0,
  },
];

export const mockTimelineEntries = {
  bloodGlucoseEntries: mockBloodGlucoseEntries,
  insulinEntries: mockInsulinEntries,
  carbEntries: mockCarbEntries,
  meterEntries: mockMeterEntries,
};
