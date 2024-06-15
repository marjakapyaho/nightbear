import { BloodGlucoseEntry, CarbEntry, InsulinEntry, MeterEntry, TimelineEntries } from '../types'
import { getTimeMinusMinutes } from '../utils'
import { mockAlarms } from './alarms'
import { mockNowSlot } from './dates'
import { mockProfileActivations } from './profiles'

export const mockBloodGlucoseEntries = () =>
  [
    { bloodGlucose: 4.6, timestamp: getTimeMinusMinutes(mockNowSlot, 40) },
    { bloodGlucose: 4.3, timestamp: getTimeMinusMinutes(mockNowSlot, 35) },
    { bloodGlucose: 3.8, timestamp: getTimeMinusMinutes(mockNowSlot, 30) },
    { bloodGlucose: 4.3, timestamp: getTimeMinusMinutes(mockNowSlot, 25) },
    { bloodGlucose: 4.7, timestamp: getTimeMinusMinutes(mockNowSlot, 20) },
    { bloodGlucose: 4.8, timestamp: getTimeMinusMinutes(mockNowSlot, 15) },
    { bloodGlucose: 5.9, timestamp: getTimeMinusMinutes(mockNowSlot, 10) },
    { bloodGlucose: 5.3, timestamp: getTimeMinusMinutes(mockNowSlot, 5) },
    { bloodGlucose: 6, timestamp: mockNowSlot },
  ] satisfies BloodGlucoseEntry[]

export const mockInsulinEntries = () =>
  [
    {
      timestamp: mockNowSlot,
      amount: 7,
      type: 'FAST',
    },
  ] satisfies InsulinEntry[]

export const mockCarbEntries = () =>
  [
    {
      timestamp: getTimeMinusMinutes(mockNowSlot, 15),
      amount: 40,
      durationFactor: 1,
    },
  ] satisfies CarbEntry[]

export const mockMeterEntries = () =>
  [
    {
      timestamp: getTimeMinusMinutes(mockNowSlot, 25),
      bloodGlucose: 6.5,
    },
  ] satisfies MeterEntry[]

export const mockTimelineEntries = () =>
  ({
    bloodGlucoseEntries: mockBloodGlucoseEntries(),
    insulinEntries: mockInsulinEntries(),
    carbEntries: mockCarbEntries(),
    meterEntries: mockMeterEntries(),
    profileActivations: mockProfileActivations,
    alarms: mockAlarms,
  }) satisfies TimelineEntries
