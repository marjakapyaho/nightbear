import { mockNowSlot } from 'shared/mocks/dates';
import {
  BloodGlucoseEntry,
  CarbEntry,
  InsulinEntry,
  MeterEntry,
} from 'shared/types/timelineEntries';
import { getTimeMinusMinutes } from 'shared/utils/time';

export const mockBloodGlucoseEntries: BloodGlucoseEntry[] = [
  { bloodGlucose: 4.6, timestamp: getTimeMinusMinutes(mockNowSlot, 40) },
  { bloodGlucose: 4.3, timestamp: getTimeMinusMinutes(mockNowSlot, 35) },
  { bloodGlucose: 3.8, timestamp: getTimeMinusMinutes(mockNowSlot, 30) },
  { bloodGlucose: 4.3, timestamp: getTimeMinusMinutes(mockNowSlot, 25) },
  { bloodGlucose: 4.7, timestamp: getTimeMinusMinutes(mockNowSlot, 20) },
  { bloodGlucose: 4.8, timestamp: getTimeMinusMinutes(mockNowSlot, 15) },
  { bloodGlucose: 5.9, timestamp: getTimeMinusMinutes(mockNowSlot, 10) },
  { bloodGlucose: 5.3, timestamp: getTimeMinusMinutes(mockNowSlot, 5) },
  { bloodGlucose: 6, timestamp: mockNowSlot },
];

export const mockInsulinEntries: InsulinEntry[] = [
  {
    timestamp: mockNowSlot,
    amount: 7,
    type: 'FAST',
  },
];

export const mockCarbEntries: CarbEntry[] = [
  {
    timestamp: getTimeMinusMinutes(mockNowSlot, 15),
    amount: 40,
    durationFactor: 1,
  },
];

export const mockMeterEntries: MeterEntry[] = [
  {
    timestamp: getTimeMinusMinutes(mockNowSlot, 25),
    bloodGlucose: 6.5,
  },
];

export const mockTimelineEntries = {
  bloodGlucoseEntries: mockBloodGlucoseEntries,
  insulinEntries: mockInsulinEntries,
  carbEntries: mockCarbEntries,
  meterEntries: mockMeterEntries,
};
