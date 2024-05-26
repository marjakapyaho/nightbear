import { nullableOptional } from '../utils'
import { z } from 'zod'
import { Situation } from './analyser'

/* eslint-disable @typescript-eslint/no-redeclare */

export const AlarmState = z.object({
  id: z.string(),
  timestamp: z.string(),
  alarmLevel: z.number(),
  validAfter: z.string(),
  ackedBy: nullableOptional(z.string()),
  notificationTarget: nullableOptional(z.string()),
  notificationReceipt: nullableOptional(z.string()),
  notificationProcessedAt: nullableOptional(z.string()),
})
export type AlarmState = z.infer<typeof AlarmState>

export const Alarm = z.object({
  id: z.string(),
  situation: Situation,
  isActive: z.boolean(),
  deactivatedAt: nullableOptional(z.string()),
  alarmStates: z.array(AlarmState),
})
export type Alarm = z.infer<typeof Alarm>
