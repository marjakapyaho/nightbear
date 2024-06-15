import { z } from 'zod'
import { nullableOptional } from '../utils'

/* eslint-disable @typescript-eslint/no-redeclare */

export const CronjobsJournal = z.object({
  dexcomShareLoginAttemptAt: nullableOptional(z.string()),
  dexcomShareSessionId: nullableOptional(z.string()),
  previousExecutionAt: nullableOptional(z.string()),
})
export type CronjobsJournal = z.infer<typeof CronjobsJournal>
