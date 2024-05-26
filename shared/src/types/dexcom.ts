import { z } from 'zod'

/* eslint-disable @typescript-eslint/no-redeclare */

export const DexcomG6ShareEntry = z.object({
  id: z.string(),
  timestamp: z.string(),
  bloodGlucose: z.number(),
  signalStrength: z.number(),
  noiseLevel: z.number(),
})
export type DexcomG6ShareEntry = z.infer<typeof DexcomG6ShareEntry>
