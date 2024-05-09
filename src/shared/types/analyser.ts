import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-redeclare */

export const AnalyserEntry = z.object({
  timestamp: z.string(),
  bloodGlucose: z.number(),
  slope: z.optional(z.number()),
  rawSlope: z.number(z.number()),
});
export type AnalyserEntry = z.infer<typeof AnalyserEntry>;

export const Situation = z.enum([
  'CRITICAL_OUTDATED',
  'BAD_LOW',
  'BAD_HIGH',
  'OUTDATED',
  'COMPRESSION_LOW',
  'LOW',
  'HIGH',
  'FALLING',
  'RISING',
  'PERSISTENT_HIGH',
]);
export type Situation = z.infer<typeof Situation>;
