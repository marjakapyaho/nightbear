import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-redeclare */

export const SensorEntryType = z.enum(['DEXCOM_G6_SHARE']);
export type SensorEntryType = z.infer<typeof SensorEntryType>;

export const InsulinEntryType = z.enum(['FAST', 'LONG']);
export type InsulinEntryType = z.infer<typeof InsulinEntryType>;

export type SensorEntry = z.infer<typeof SensorEntry>;
export const SensorEntry = z.object({
  timestamp: z.string(),
  bloodGlucose: z.number(),
  type: SensorEntryType,
});

// TODO: Convert rest of types

export type InsulinEntry = {
  timestamp: string;
  amount: number;
  type: InsulinEntryType;
};

export type CarbEntry = {
  timestamp: string;
  amount: number;
  durationFactor: number;
};

export type MeterEntry = {
  timestamp: string;
  bloodGlucose: number;
};

export type TimelineEntries = {
  sensorEntries: SensorEntry[];
  insulinEntries: InsulinEntry[];
  carbEntries: CarbEntry[];
  meterEntries: MeterEntry[];
};
