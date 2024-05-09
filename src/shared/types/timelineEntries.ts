import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-redeclare */

export const SensorEntryType = z.enum([
  'DEXCOM_G4_UPLOADER',
  'DEXCOM_G4_UPLOADER_RAW',
  'DEXCOM_G6_UPLOADER',
  'DEXCOM_G6_SHARE',
  'LIBRE_3_LINK',
]);
export type SensorEntryType = z.infer<typeof SensorEntryType>;

export const InsulinEntryType = z.enum(['FAST', 'LONG']);
export type InsulinEntryType = z.infer<typeof InsulinEntryType>;

export const SensorEntry = z.object({
  timestamp: z.string(),
  bloodGlucose: z.number(),
  type: SensorEntryType,
});
export type SensorEntry = z.infer<typeof SensorEntry>;

export const InsulinEntry = z.object({
  timestamp: z.string(),
  amount: z.number(),
  type: InsulinEntryType,
});
export type InsulinEntry = z.infer<typeof InsulinEntry>;

export const CarbEntry = z.object({
  timestamp: z.string(),
  amount: z.number(),
  durationFactor: z.number(),
});
export type CarbEntry = z.infer<typeof CarbEntry>;

export const MeterEntry = z.object({
  timestamp: z.string(),
  bloodGlucose: z.number(),
});
export type MeterEntry = z.infer<typeof MeterEntry>;

export const TimelineEntries = z.object({
  sensorEntries: z.array(SensorEntry),
  insulinEntries: z.array(InsulinEntry),
  carbEntries: z.array(CarbEntry),
  meterEntries: z.array(MeterEntry),
});
export type TimelineEntries = z.infer<typeof TimelineEntries>;
